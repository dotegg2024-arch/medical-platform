/**
 * Firebase 初期化設定
 * MediConnect - 医療コミュニケーションプラットフォーム
 * 
 * 重要: 本番環境では環境変数から設定を読み込んでください
 */

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Firebase設定
// 注意: 本番環境では環境変数を使用してください
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'your-api-key',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'your-project.firebaseapp.com',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'your-project-id',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'your-project.appspot.com',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef',
};

// Firebaseアプリ初期化
const app = initializeApp(firebaseConfig);

// 各サービスの初期化
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, 'asia-northeast1'); // 東京リージョン

// 開発環境ではエミュレータに接続
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true') {
    console.log('🔧 Firebase Emulators に接続中...');

    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
    connectFunctionsEmulator(functions, 'localhost', 5001);

    console.log('✅ Firebase Emulators 接続完了');
}

export default app;
