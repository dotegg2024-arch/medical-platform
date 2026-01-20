/**
 * MediConnect Cloud Functions
 * 3省2ガイドライン準拠 - 監査ログ・バックアップ機能
 * 
 * リージョン: asia-northeast1 (東京)
 */

const functions = require('firebase-functions/v2');
const admin = require('firebase-admin');

// Firebaseアプリ初期化
admin.initializeApp();

const db = admin.firestore();
const REGION = 'asia-northeast1';

// ========================================
// 監査ログ記録用ヘルパー関数
// ========================================

/**
 * 監査ログをFirestoreに記録
 * @param {Object} logData - ログデータ
 */
async function writeAuditLog(logData) {
    try {
        await db.collection('audit_logs').add({
            ...logData,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            serverTimestamp: new Date().toISOString(),
        });
        console.log('Audit log written:', logData.operation, logData.collection, logData.documentId);
    } catch (error) {
        console.error('Failed to write audit log:', error);
    }
}

/**
 * ユーザー情報を安全に取得
 * @param {Object} context - Firebaseコンテキスト
 */
function extractUserInfo(context) {
    return {
        userId: context.auth?.uid || 'system',
        userEmail: context.auth?.token?.email || 'unknown',
    };
}

// ========================================
// 健康記録の監査ログ
// ========================================

exports.auditHealthRecordsCreate = functions.firestore
    .onDocumentCreated({
        document: 'healthRecords/{recordId}',
        region: REGION,
    }, async (event) => {
        const data = event.data?.data();
        await writeAuditLog({
            operation: 'create',
            collection: 'healthRecords',
            documentId: event.params.recordId,
            userId: data?.createdBy || 'unknown',
            patientId: data?.patientId,
            after: data,
        });
    });

exports.auditHealthRecordsUpdate = functions.firestore
    .onDocumentUpdated({
        document: 'healthRecords/{recordId}',
        region: REGION,
    }, async (event) => {
        const before = event.data?.before.data();
        const after = event.data?.after.data();
        await writeAuditLog({
            operation: 'update',
            collection: 'healthRecords',
            documentId: event.params.recordId,
            userId: after?.updatedBy || 'unknown',
            patientId: after?.patientId,
            before: before,
            after: after,
            changedFields: Object.keys(after).filter(key => JSON.stringify(before[key]) !== JSON.stringify(after[key])),
        });
    });

exports.auditHealthRecordsDelete = functions.firestore
    .onDocumentDeleted({
        document: 'healthRecords/{recordId}',
        region: REGION,
    }, async (event) => {
        const data = event.data?.data();
        await writeAuditLog({
            operation: 'delete',
            collection: 'healthRecords',
            documentId: event.params.recordId,
            userId: 'unknown', // 削除時はコンテキストから取得できない
            patientId: data?.patientId,
            before: data,
        });
    });

// ========================================
// 予約の監査ログ
// ========================================

exports.auditAppointmentsCreate = functions.firestore
    .onDocumentCreated({
        document: 'appointments/{appointmentId}',
        region: REGION,
    }, async (event) => {
        const data = event.data?.data();
        await writeAuditLog({
            operation: 'create',
            collection: 'appointments',
            documentId: event.params.appointmentId,
            userId: data?.createdBy || 'unknown',
            patientId: data?.patientId,
            staffId: data?.staffId,
            after: data,
        });
    });

exports.auditAppointmentsUpdate = functions.firestore
    .onDocumentUpdated({
        document: 'appointments/{appointmentId}',
        region: REGION,
    }, async (event) => {
        const before = event.data?.before.data();
        const after = event.data?.after.data();
        await writeAuditLog({
            operation: 'update',
            collection: 'appointments',
            documentId: event.params.appointmentId,
            userId: after?.updatedBy || 'unknown',
            patientId: after?.patientId,
            staffId: after?.staffId,
            before: before,
            after: after,
        });
    });

// ========================================
// メッセージの監査ログ
// ========================================

exports.auditMessagesCreate = functions.firestore
    .onDocumentCreated({
        document: 'messages/{messageId}',
        region: REGION,
    }, async (event) => {
        const data = event.data?.data();
        await writeAuditLog({
            operation: 'create',
            collection: 'messages',
            documentId: event.params.messageId,
            userId: data?.senderId,
            senderId: data?.senderId,
            receiverId: data?.receiverId,
            // メッセージ内容はプライバシー保護のため記録しない
            contentLength: data?.content?.length || 0,
        });
    });

// ========================================
// ユーザーの監査ログ
// ========================================

exports.auditUsersUpdate = functions.firestore
    .onDocumentUpdated({
        document: 'users/{userId}',
        region: REGION,
    }, async (event) => {
        const before = event.data?.before.data();
        const after = event.data?.after.data();

        // パスワードやセンシティブ情報は除外
        const sanitizedBefore = { ...before };
        const sanitizedAfter = { ...after };
        delete sanitizedBefore.passwordHash;
        delete sanitizedAfter.passwordHash;

        await writeAuditLog({
            operation: 'update',
            collection: 'users',
            documentId: event.params.userId,
            userId: event.params.userId,
            before: sanitizedBefore,
            after: sanitizedAfter,
        });
    });

// ========================================
// 自動バックアップ（毎日午前3時 JST）
// ========================================

exports.scheduledBackup = functions.scheduler
    .onSchedule({
        schedule: '0 3 * * *', // 毎日午前3時（UTC+9のためUTCでは午後6時）
        timeZone: 'Asia/Tokyo',
        region: REGION,
    }, async (event) => {
        const projectId = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT;
        const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const bucketName = `${projectId}-backups`;
        const outputUri = `gs://${bucketName}/firestore/${timestamp}`;

        console.log(`Starting scheduled backup to ${outputUri}`);

        try {
            const client = new admin.firestore.v1.FirestoreAdminClient();
            const databaseName = client.databasePath(projectId, '(default)');

            const [operation] = await client.exportDocuments({
                name: databaseName,
                outputUriPrefix: outputUri,
                collectionIds: [], // 空配列 = 全コレクション
            });

            console.log(`Backup started: ${operation.name}`);

            // バックアップ開始をログに記録
            await writeAuditLog({
                operation: 'backup_started',
                collection: 'system',
                documentId: timestamp,
                userId: 'system',
                backupLocation: outputUri,
            });

        } catch (error) {
            console.error('Backup failed:', error);

            await writeAuditLog({
                operation: 'backup_failed',
                collection: 'system',
                documentId: timestamp,
                userId: 'system',
                error: error.message,
            });
        }
    });

// ========================================
// 古い監査ログのクリーンアップ（90日以上前）
// ========================================

exports.cleanupOldAuditLogs = functions.scheduler
    .onSchedule({
        schedule: '0 4 * * 0', // 毎週日曜午前4時
        timeZone: 'Asia/Tokyo',
        region: REGION,
    }, async (event) => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 90);

        console.log(`Cleaning up audit logs older than ${cutoffDate.toISOString()}`);

        try {
            const logsRef = db.collection('audit_logs');
            const oldLogs = await logsRef
                .where('timestamp', '<', cutoffDate)
                .limit(500) // バッチサイズ制限
                .get();

            if (oldLogs.empty) {
                console.log('No old logs to clean up');
                return;
            }

            const batch = db.batch();
            oldLogs.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();

            console.log(`Deleted ${oldLogs.size} old audit logs`);

        } catch (error) {
            console.error('Cleanup failed:', error);
        }
    });

// ========================================
// ユーザー作成時の初期化処理
// ========================================

exports.onUserCreated = functions.auth
    .user()
    .onCreate({
        region: REGION,
    }, async (user) => {
        // Firestoreにユーザードキュメントを作成
        await db.collection('users').doc(user.uid).set({
            email: user.email,
            displayName: user.displayName || '',
            role: 'patient', // デフォルトは患者
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            team: [],
            patients: [],
        });

        await writeAuditLog({
            operation: 'user_created',
            collection: 'users',
            documentId: user.uid,
            userId: user.uid,
            email: user.email,
        });

        console.log(`User document created for ${user.uid}`);
    });

// ========================================
// ユーザー削除時のクリーンアップ
// ========================================

exports.onUserDeleted = functions.auth
    .user()
    .onDelete({
        region: REGION,
    }, async (user) => {
        // ユーザードキュメントを削除（または無効化）
        await db.collection('users').doc(user.uid).update({
            deleted: true,
            deletedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        await writeAuditLog({
            operation: 'user_deleted',
            collection: 'users',
            documentId: user.uid,
            userId: 'system',
            email: user.email,
        });

        console.log(`User marked as deleted: ${user.uid}`);
    });
