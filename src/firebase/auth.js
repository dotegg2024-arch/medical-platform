/**
 * Firebase Authentication サービス
 * MediConnect - 医療コミュニケーションプラットフォーム
 * 
 * 3省2ガイドライン準拠:
 * - 匿名ログイン禁止
 * - 強固なパスワードポリシー
 * - MFA対応準備
 */

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    onAuthStateChanged,
    reauthenticateWithCredential,
    EmailAuthProvider,
    updatePassword,
    multiFactor,
    PhoneAuthProvider,
    PhoneMultiFactorGenerator,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';

/**
 * パスワードポリシー検証
 * - 最低8文字
 * - 大文字・小文字・数字を含む
 * - 特殊文字を1つ以上含む
 */
export function validatePassword(password) {
    const errors = [];

    if (password.length < 8) {
        errors.push('パスワードは8文字以上で入力してください');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('小文字を含めてください');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('大文字を含めてください');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('数字を含めてください');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('特殊文字（!@#$%^&*など）を含めてください');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * 新規ユーザー登録
 */
export async function registerUser(email, password, displayName, role = 'patient') {
    // パスワードポリシー検証
    const validation = validatePassword(password);
    if (!validation.isValid) {
        throw new Error(validation.errors.join('\n'));
    }

    // Firebase Authでユーザー作成
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // プロフィール更新
    await updateProfile(user, { displayName });

    // Firestoreにユーザードキュメント作成
    await setDoc(doc(db, 'users', user.uid), {
        email,
        displayName,
        role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        team: [],
        patients: [],
        isActive: true,
    });

    return user;
}

/**
 * ログイン
 */
export async function loginUser(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // ログイン履歴を更新
    await updateDoc(doc(db, 'users', user.uid), {
        lastLoginAt: serverTimestamp(),
    });

    return user;
}

/**
 * ログアウト
 */
export async function logoutUser() {
    await signOut(auth);
}

/**
 * パスワードリセットメール送信
 */
export async function sendResetEmail(email) {
    await sendPasswordResetEmail(auth, email);
}

/**
 * パスワード変更
 */
export async function changePassword(currentPassword, newPassword) {
    const user = auth.currentUser;
    if (!user) throw new Error('ログインしてください');

    // 新パスワードのポリシー検証
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
        throw new Error(validation.errors.join('\n'));
    }

    // 現在のパスワードで再認証
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // パスワード更新
    await updatePassword(user, newPassword);

    // 更新日時を記録
    await updateDoc(doc(db, 'users', user.uid), {
        passwordChangedAt: serverTimestamp(),
    });
}

/**
 * ユーザーのロールを取得
 */
export async function getUserRole(uid) {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists() ? userDoc.data().role : null;
}

/**
 * ユーザープロフィールを取得
 */
export async function getUserProfile(uid) {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
}

/**
 * 認証状態の監視
 */
export function onAuthChange(callback) {
    return onAuthStateChanged(auth, async (user) => {
        if (user) {
            const profile = await getUserProfile(user.uid);
            callback({ user, profile });
        } else {
            callback({ user: null, profile: null });
        }
    });
}

/**
 * MFA設定（電話番号）
 * 注意: 本番環境ではreCAPTCHA設定が必要
 */
export async function enrollMFA(phoneNumber, recaptchaVerifier) {
    const user = auth.currentUser;
    if (!user) throw new Error('ログインしてください');

    const multiFactorSession = await multiFactor(user).getSession();
    const phoneInfoOptions = {
        phoneNumber,
        session: multiFactorSession,
    };

    const phoneAuthProvider = new PhoneAuthProvider(auth);
    const verificationId = await phoneAuthProvider.verifyPhoneNumber(
        phoneInfoOptions,
        recaptchaVerifier
    );

    return verificationId;
}

/**
 * MFA登録完了
 */
export async function completeMFAEnrollment(verificationId, verificationCode, displayName = '電話認証') {
    const user = auth.currentUser;
    if (!user) throw new Error('ログインしてください');

    const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
    const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(credential);

    await multiFactor(user).enroll(multiFactorAssertion, displayName);

    // MFA設定を記録
    await updateDoc(doc(db, 'users', user.uid), {
        mfaEnabled: true,
        mfaEnabledAt: serverTimestamp(),
    });
}

export { auth };
