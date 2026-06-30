# 沖縄そばファインダー

地図上でそば屋を探せる学習用の Web アプリケーションです。ユーザー登録・ログインの上で、地図と一覧から店舗を探し、店舗詳細（営業時間・レビュー）を閲覧できます。管理者は店舗の登録・編集・削除と、ユーザーの権限管理ができます。

## 主な機能

- ユーザー登録・ログイン・ログアウト（Cookie セッション）
- トップ：地図表示＋店舗一覧カード＋時間帯（昼／夜）フィルター
- 店舗詳細：基本情報・営業時間・レビュー表示
- 店舗管理（管理者のみ）：登録・編集・削除（住所からジオコーディングで座標付与）
- ユーザー管理（管理者のみ）：一覧表示・権限変更（admin ⇄ user）
- RBAC：管理系 API は認証（401）と認可（403）の二段で保護

## アーキテクチャ

バックエンドは責務ごとに 3 層に分けています。

```
route（プレゼン層）          … HTTP の入出力・ステータス制御
  ↓
service（ビジネスロジック層）  … 段取り・成否判定
  ↓
repository（データアクセス層）  … DB アクセス（SQL）
  ＋ gateway … 外部 API（ジオコーディング）
```

フロントエンドは MPA（ページごとに HTML）。`public/js/common.js` に共通処理（ログアウト）を切り出しています。

## ディレクトリ構成

```
src/
  routes/        ルート定義（auth / store / user / health）
  services/      ビジネスロジック
  repositories/  DB アクセス・外部 API
  utils/         認証ガード（requireAuth / requireAdmin）・env
  db/            コネクションプール
  types/         型拡張（セッション）
  server.ts      組み立て・起動
public/          フロントエンド（HTML / CSS / JS）
docker/mysql/init/schema.sql   テーブル定義（初回起動時に自動実行）
```

## セットアップ

### 前提

- Node.js（v20 系）
- Docker（Rancher Desktop など）

### 1. 環境変数

ルートに `.env` を作成します（値は各自で設定）。

```
MYSQL_ROOT_PASSWORD=（rootパスワード）
MYSQL_DATABASE=oki_soba
MYSQL_USER=soba_user
MYSQL_PASSWORD=（アプリ用ユーザーのパスワード）
DB_HOST=127.0.0.1
DB_PORT=3306
SESSION_SECRET=（32文字以上のランダム文字列）
PORT=3000
```

### 2. データベース起動

```
docker compose up -d
```

初回起動時に `docker/mysql/init/schema.sql` が自動実行され、テーブル（stores / users / store_hours / reviews）が作成されます。

### 3. 依存関係インストール・ビルド・起動

```
npm install
npm run build
npm run start
```

開発時はファイル監視を 2 つ並行で起動すると自動反映されます。

```
npm run dev        # TypeScript を監視してビルド
npm run start:dev  # ビルド結果を監視してサーバー再起動
```

サーバーは `http://localhost:3000` で起動します。

## 使い方

1. `http://localhost:3000/register.html` でユーザー登録
2. `http://localhost:3000/login.html` でログイン → トップ（地図）へ
3. 地図のピンまたは一覧カードをクリックで店舗詳細へ
4. 管理者は `http://localhost:3000/admin.html` で店舗登録・ユーザー管理

### 最初の管理者を作る

登録した時点では全員 `role=user` です。管理画面に入るには、最初の 1 人を手動で管理者に変更します。

```
docker compose exec db mysql -u<MYSQL_USER> -p <MYSQL_DATABASE> \
  -e "UPDATE users SET role='admin' WHERE login_id='<あなたのログインID>';"
```

変更後はログインし直すと、セッションに新しい権限が反映されます。

## 補足

- 初期データ（seed）は含まれていません。店舗は管理画面から登録してください。
- 本アプリは研修用であり、セッションはメモリ保存のためサーバー再起動でログアウトされます。
