# Firebase セットアップ手順

## 1. Firebaseプロジェクト作成

### コンソールでの設定
1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例: `mediconnect-prod`）
4. **重要**: ロケーションを `asia-northeast1 (東京)` に設定

### リージョン設定の確認ポイント
- Firestore: 東京 (`asia-northeast1`)
- Cloud Functions: 東京 (`asia-northeast1`)
- Cloud Storage: 東京 (`asia-northeast1`)

---

## 2. Firebase CLIのインストール

```bash
npm install -g firebase-tools
firebase login
firebase init
```

### 初期化時の選択
- [x] Firestore
- [x] Functions
- [x] Hosting
- [x] Storage
- [x] Emulators

---

## 3. 環境変数の設定

`.env.example` をコピーして `.env.local` を作成:

```bash
cp .env.example .env.local
```

Firebase Console から取得した値を設定してください。

---

## 4. セキュリティルールのデプロイ

```bash
# ルールのみデプロイ
firebase deploy --only firestore:rules,storage

# 全てデプロイ
firebase deploy
```

---

## 5. Cloud Functionsのデプロイ

```bash
cd firebase/functions
npm install
cd ..
firebase deploy --only functions
```

---

## 6. バックアップ用ストレージの作成

Google Cloud Console で作成:
```bash
gsutil mb -l asia-northeast1 gs://[PROJECT_ID]-backups
```

---

## 7. ローカル開発（エミュレータ）

```bash
# エミュレータ起動
firebase emulators:start

# UIにアクセス
# http://localhost:4000
```

`.env.local` に以下を設定:
```
VITE_USE_EMULATORS=true
```

---

## 8. 本番デプロイ

```bash
# ビルド
npm run build

# デプロイ
firebase deploy
```

---

## セキュリティチェックリスト

- [ ] Firestoreルールが正しく設定されている
- [ ] 匿名認証が無効になっている
- [ ] パスワードポリシーが設定されている
- [ ] 監査ログが有効になっている
- [ ] 自動バックアップが設定されている
- [ ] HTTPSが有効になっている

---

## トラブルシューティング

### エミュレータが起動しない
```bash
firebase emulators:start --debug
```

### ルールのテスト
```bash
firebase emulators:exec --only firestore "npm test"
```
