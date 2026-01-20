/**
 * Firestore データサービス
 * MediConnect - 医療コミュニケーションプラットフォーム
 * 
 * 各コレクションへのCRUD操作を提供
 */

import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    onSnapshot,
} from 'firebase/firestore';
import { db } from './config';
import { auth } from './auth';

// ========================================
// ヘルパー関数
// ========================================

/**
 * 現在のユーザーIDを取得
 */
function getCurrentUserId() {
    const user = auth.currentUser;
    if (!user) throw new Error('認証が必要です');
    return user.uid;
}

/**
 * ドキュメントにメタデータを追加
 */
function withMetadata(data, isCreate = false) {
    const userId = auth.currentUser?.uid || 'unknown';
    const metadata = {
        updatedAt: serverTimestamp(),
        updatedBy: userId,
    };

    if (isCreate) {
        metadata.createdAt = serverTimestamp();
        metadata.createdBy = userId;
    }

    return { ...data, ...metadata };
}

// ========================================
// 健康記録
// ========================================

export async function addHealthRecord(data) {
    const userId = getCurrentUserId();
    const record = withMetadata({
        ...data,
        patientId: userId,
    }, true);

    const docRef = await addDoc(collection(db, 'healthRecords'), record);
    return docRef.id;
}

export async function getHealthRecords(patientId = null) {
    const userId = patientId || getCurrentUserId();
    const q = query(
        collection(db, 'healthRecords'),
        where('patientId', '==', userId),
        orderBy('date', 'desc'),
        limit(100)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export function subscribeToHealthRecords(patientId, callback) {
    const q = query(
        collection(db, 'healthRecords'),
        where('patientId', '==', patientId),
        orderBy('date', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(records);
    });
}

export async function updateHealthRecord(recordId, data) {
    const docRef = doc(db, 'healthRecords', recordId);
    await updateDoc(docRef, withMetadata(data));
}

// ========================================
// 予約管理
// ========================================

export async function addAppointment(data) {
    const userId = getCurrentUserId();
    const appointment = withMetadata({
        ...data,
        status: 'scheduled',
        createdBy: userId,
    }, true);

    const docRef = await addDoc(collection(db, 'appointments'), appointment);
    return docRef.id;
}

export async function getAppointments(userId = null) {
    const currentUser = userId || getCurrentUserId();

    // 患者または医療従事者として関係する予約を取得
    const patientQuery = query(
        collection(db, 'appointments'),
        where('patientId', '==', currentUser),
        orderBy('date', 'desc')
    );

    const staffQuery = query(
        collection(db, 'appointments'),
        where('staffId', '==', currentUser),
        orderBy('date', 'desc')
    );

    const [patientSnap, staffSnap] = await Promise.all([
        getDocs(patientQuery),
        getDocs(staffQuery),
    ]);

    const appointments = new Map();
    patientSnap.docs.forEach(doc => appointments.set(doc.id, { id: doc.id, ...doc.data() }));
    staffSnap.docs.forEach(doc => appointments.set(doc.id, { id: doc.id, ...doc.data() }));

    return Array.from(appointments.values());
}

export async function updateAppointment(appointmentId, data) {
    const docRef = doc(db, 'appointments', appointmentId);
    await updateDoc(docRef, withMetadata(data));
}

// ========================================
// メッセージ
// ========================================

export async function sendMessage(receiverId, content) {
    const senderId = getCurrentUserId();
    const message = withMetadata({
        senderId,
        receiverId,
        content,
        read: false,
    }, true);

    const docRef = await addDoc(collection(db, 'messages'), message);
    return docRef.id;
}

export async function getMessages(contactId) {
    const userId = getCurrentUserId();

    // 双方向のメッセージを取得
    const sentQuery = query(
        collection(db, 'messages'),
        where('senderId', '==', userId),
        where('receiverId', '==', contactId),
        orderBy('createdAt', 'asc')
    );

    const receivedQuery = query(
        collection(db, 'messages'),
        where('senderId', '==', contactId),
        where('receiverId', '==', userId),
        orderBy('createdAt', 'asc')
    );

    const [sentSnap, receivedSnap] = await Promise.all([
        getDocs(sentQuery),
        getDocs(receivedQuery),
    ]);

    const messages = [
        ...sentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        ...receivedSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
    ].sort((a, b) => a.createdAt?.toMillis() - b.createdAt?.toMillis());

    return messages;
}

export function subscribeToMessages(contactId, callback) {
    const userId = getCurrentUserId();

    // 受信メッセージをリアルタイム監視
    const q = query(
        collection(db, 'messages'),
        where('senderId', '==', contactId),
        where('receiverId', '==', userId),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, async () => {
        const messages = await getMessages(contactId);
        callback(messages);
    });
}

export async function markMessageAsRead(messageId) {
    const docRef = doc(db, 'messages', messageId);
    await updateDoc(docRef, { read: true });
}

// ========================================
// リハビリメニュー
// ========================================

export async function addRehabMenu(data) {
    const userId = getCurrentUserId();
    const menu = withMetadata({
        ...data,
        createdBy: userId,
        progress: [],
    }, true);

    const docRef = await addDoc(collection(db, 'rehabMenus'), menu);
    return docRef.id;
}

export async function getRehabMenus(patientId = null) {
    const userId = patientId || getCurrentUserId();
    const q = query(
        collection(db, 'rehabMenus'),
        where('patientId', '==', userId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function updateRehabProgress(menuId, progressEntry) {
    const docRef = doc(db, 'rehabMenus', menuId);
    const menuDoc = await getDoc(docRef);

    if (!menuDoc.exists()) throw new Error('メニューが見つかりません');

    const currentProgress = menuDoc.data().progress || [];
    const existingIndex = currentProgress.findIndex(p => p.date === progressEntry.date);

    if (existingIndex >= 0) {
        currentProgress[existingIndex] = progressEntry;
    } else {
        currentProgress.push(progressEntry);
    }

    await updateDoc(docRef, withMetadata({ progress: currentProgress }));
}

// ========================================
// ユーザー・チーム管理
// ========================================

export async function getTeamMembers() {
    const userId = getCurrentUserId();
    const userDoc = await getDoc(doc(db, 'users', userId));

    if (!userDoc.exists()) return [];

    const userData = userDoc.data();
    const teamIds = userData.role === 'patient' ? userData.team : userData.patients;

    if (!teamIds || teamIds.length === 0) return [];

    const members = await Promise.all(
        teamIds.map(async (id) => {
            const memberDoc = await getDoc(doc(db, 'users', id));
            return memberDoc.exists() ? { id: memberDoc.id, ...memberDoc.data() } : null;
        })
    );

    return members.filter(Boolean);
}

export async function updateUserProfile(data) {
    const userId = getCurrentUserId();
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, withMetadata(data));
}
