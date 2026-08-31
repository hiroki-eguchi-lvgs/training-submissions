# 配属前キャッチアップロードマップ

## これはなに

LTP リプレースチームに江口さんが配属されるにあたって、8月中に実施するキャッチアップのロードマップを記載します。

前提として、配属前までに記載されたキャッチアップをすべて達成するべきというものではなく、キャッチアップにあたっての方向性や優先順位を示すものとして活用してほしいです。

## キャッチアップ方針

配属後は、以下の2つのリポジトリで開発・運用・保守を行うことになります。

- **Frontend**: [ltp-frontend](https://github.com/lv-levtech/ltp-frontend)（Turborepo によるモノレポ、Next.js App Router + GraphQL(Relay)）
- **Backend**: [ltp-backend](https://github.com/lv-levtech/ltp-backend)（NestJS、モジュラーモノリス × ヘキサゴナルアーキテクチャ、Prisma、GraphQL）

いきなりこの構成のコードを読み書きしようとすると、ORM・レイヤー分離・DI・GraphQL・認証基盤・テスト階層など初見の概念が同時に大量に出てきて、キャッチアップに時間がかかることが想定されます。

そこで、7月までに課題として作成した `Blog_TS,Next` を教材として、**配属後のコードベースで実際に使われている技術や考え方を1つずつ**、小さいステップで導入していき、理解を深めてもらいます。

以下に注意しながら進めてほしいです。

1. 各ステップで「何を学べるか」を明記するので、単なる作業ではなく "なぜそうするのか" を意識しながら進めること。
2. チーム開発のサイクルに慣れるため、1ステップごとにブランチを切り、実装 → 動作確認 → PR → マージのサイクルを回すこと。
   配属後は、PR 作成の後に「レビュー」の工程があります。

---

## ロードマップ

### 目次

| Phase                  | Step | やること                                                          | 学ぶこと                                                                                                                                                                                                                  |
| ---------------------- | ---- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A. Reactの基礎         | 1    | 記事作成・編集フォームに下書き自動保存機能を追加する              | <ul><li>useState（状態を持つ）</li><li>useEffect（副作用・依存配列・クリーンアップ）</li><li>カスタムフック（ロジックの再利用）</li></ul>                                                                                 |
|                        | 2    | 記事作成・編集フォームにReact Hook Form + zodによるクライアント側バリデーションを追加する | <ul><li>React Hook Formによるフォーム状態管理</li><li>スキーマベースバリデーション（zod）の基本</li><li>クライアント側バリデーションとServer Actionへの送信タイミングの関係</li></ul>                                     |
| B. 開発環境の整備      | 3    | ローカルDBをDockerで管理する                                      | <ul><li>Docker Composeの基本（サービス定義、ボリューム、初期化スクリプトの仕組み）</li></ul>                                                                                                                              |
|                        | 4    | 環境変数によるシークレット管理                                    | <ul><li>12 Factor App的な「設定はコードから分離する」という考え方</li></ul>                                                                                                                                               |
|                        | 5    | Lintの強化とコミット前チェックの導入                              | <ul><li>Git hooksの仕組み</li><li>静的解析ツールをチームの開発フローに組み込む方法</li></ul>                                                                                                                              |
| C. バックエンドの分離  | 6    | NestJSバックエンドの導入（記事一覧取得APIを切り出す）             | <ul><li>NestJS CLIの使い方</li><li>Module/Controller/Serviceそれぞれの役割分担</li><li>DI（依存性注入）の最初の実例</li><li>DTOによる「入力/出力の型を契約として明示する」考え方</li></ul>                                |
|                        | 7    | データ層とアーキテクチャの整理（バックエンド）                    | <ul><li>ORMが生成する型とクエリの仕組み</li><li>マイグレーションという概念（スキーマ変更を差分として管理する）</li><li>controller/service/repositoryによる関心の分離と依存の向き</li><li>スキーマベースバリデーション（zod）をバックエンドのリクエスト検証に使う考え方</li></ul> |
| D. 認証・セキュリティ  | 8    | 認証まわりの強化                                                  | <ul><li>セッション管理におけるセキュリティの基本（改ざん検知・有効期限）</li><li>Next.jsの`proxy.ts`による横断的な処理の実装方法</li></ul>                                                                                |
| E. 品質保証            | 9    | テストの導入                                                      | <ul><li>モック/スタブを使ったテストの書き方</li><li>テストピラミッド（単体テストを厚く、統合テストは要点を絞る）という考え方</li></ul>                                                                                    |
|                        | 10   | CIの導入                                                          | <ul><li>CIの基本的な考え方</li><li>GitHub Actionsのワークフロー（YAML）の書き方</li></ul>                                                                                                                                 |

---

### Phase A. Reactの基礎

#### 1. 記事作成・編集フォームに下書き自動保存機能を追加する（Reactの基礎を学ぶ）

現在の記事作成・編集フォーム（`app/create/page.tsx` / `app/edit/[id]/page.tsx`）は、ただのHTMLフォームで、Reactの状態管理を一切使っていない。ここに「入力中の内容を自動でブラウザに保存し、誤って離脱しても復元できる」下書き自動保存機能を追加しながら、React Hooksの基礎（`useState` / `useEffect` / カスタムフック）を学ぶ。バックエンドやDBには一切手を入れない、フロントエンドだけで完結する変更にする。

- **1.1. フォーム部分を別コンポーネント（例: `ArticleForm`）に切り出す**
  - `app/create/page.tsx` と `app/edit/[id]/page.tsx` では、同じフォームがそれぞれのファイルに記載されているため、別ファイルに `ArticleForm` などの名称でコンポーネントを作成し、共通化する
  - create用（初期値なし）とedit用（DBの値を初期値にする）の両方から使えるように、コンポーネントがpropsとして何を受け取るか（送信先のServer Action、hidden fieldの値、各項目の初期値など）を設計してから実装する。
- **1.2. 切り出したフォームのタイトル・タグ・本文を `useState` で状態管理する（制御コンポーネント化）**
  - 1.1で切り出したコンポーネント内の各要素の状態を `useState` を使って管理する。このとき、ファイルの先頭に `'use client'` を入れてクライアントコンポーネントにする必要がある。
  - editページの初期値（DBから取得した値）を、`useState` の初期値としてどう渡すか設計する。
  - `<form action={createArticle}>` によるServer Actionへの送信自体はそのまま使えることを確認する。
- **1.3. `useEffect` を使い、入力内容が変わるたびに（デバウンスして）`localStorage` に下書きを保存する**
  - 1文字入力するたびに毎回保存すると無駄が多いため、`setTimeout` を使ったデバウンス処理を検討する。`useEffect` のクリーンアップ関数（return する関数）でタイマーをどう解除するかを確認する。
  - `localStorage` のキーは下書きごとに一意にする必要がある（新規作成用のキーと、記事編集時は対象の記事IDを含めたキーなど）。
- **1.4. ページを開いた時（マウント時）に、保存済みの下書きがあれば `useEffect` で読み込んで復元する**
  - `useEffect` はレンダリング後に実行される、というReactのレンダリングとの順序関係を理解した上で、初回表示時にどのタイミングで下書きを読みにいくか設計する。
  - 編集画面では「DBに保存されている値」と「下書きに残っている値」のどちらを優先して表示するかも決める。
- **1.5. 上記のロジック（フォームの値・保存状態・自動保存の副作用）をカスタムフック（例: `useDraftAutosave`）にまとめ、記事作成・編集の両方のフォームから使えるようにする**
  - フックの引数（下書きのキー、初期値など）と戻り値（現在の値、更新用の関数、保存状態）をどう設計するかを、実装前に決めておく。

- **学べること**: `useState`（状態を持つ）、`useEffect`（副作用・依存配列・クリーンアップ）、カスタムフック（ロジックの再利用）という、Reactの基礎となる4つの機能。
- **参考リンク**:
  - [useState（React公式）](https://react.dev/reference/react/useState) — コンポーネントに状態を持たせるHook
  - [useEffect（React公式）](https://react.dev/reference/react/useEffect) — 副作用（外部システムとの同期）を扱うHook
  - [Reusing Logic with Custom Hooks（React公式）](https://react.dev/learn/reusing-logic-with-custom-hooks) — 状態管理ロジックをカスタムフックに切り出す考え方
  - [You Might Not Need an Effect（React公式）](https://react.dev/learn/you-might-not-need-an-effect) — `useEffect` を使うべき場面・使うべきでない場面の整理

#### 2. 記事作成・編集フォームにReact Hook Form + zodによるクライアント側バリデーションを追加する（フォームライブラリの基礎を学ぶ）

配属後のコードベース（`ltp-frontend`）では、フォーム状態管理にReact Hook Formを、入力チェックにzodを使う。Step1で `useState` による制御コンポーネント化を行った `ArticleForm` を、React Hook Form管理に置き換えながら、フォームライブラリとスキーマベースバリデーションの基礎を学ぶ。このステップではクライアント側の検証のみを対象とし、サーバー側のバリデーションはPhase Cのバックエンド改善（Step7）で扱う。

- **2.1. `zod` でタイトル・タグ・本文の入力ルール（必須項目、文字数制限など）をスキーマとして定義する**
  - 現在の `app/create/page.tsx` / `app/edit/[id]/page.tsx` のフォーム項目を洗い出し、どんな制約が必要かを整理してからスキーマを書く。
  - create/editの両方から使えるよう、スキーマは専用ファイル（例: `schemas/article.ts`）に切り出し、`z.infer` で型を取り出せるようにする。
- **2.2. `react-hook-form` と `@hookform/resolvers` を導入し、`ArticleForm` を `useForm` + `zodResolver` を使った実装に置き換える**
  - Step1.2で `useState` を使って行った制御コンポーネント化と、React Hook Formの `register` による値管理の違いを比較する。
  - `defaultValues` にeditページの初期値（DBから取得した値）をどう渡すかを設計する。
- **2.3. `formState.errors` を使い、各項目の直下にバリデーションエラーメッセージを表示する**
  - 入力しながらエラーが出たり消えたりするタイミング（`mode` オプション: `onBlur`/`onChange`/`onSubmit`など）を試して、ユーザー体験としてどれが適切か考える。
- **2.4. Step1.3・1.4で作った下書き自動保存（`useDraftAutosave`）と、React Hook Formの値管理を連携させる**
  - `useState` の値を直接監視していた自動保存ロジックを、React Hook Formの `watch` から値を受け取る形に書き換える。フォームライブラリ導入前後でロジックの依存先がどう変わるかを意識する。
- **2.5. `handleSubmit` はデフォルトでネイティブなフォーム送信を止める、という挙動を踏まえ、クライアント側バリデーションを通過した場合にだけ既存のServer Action（`<form action={createArticle}>`）への送信を実行させる**
  - `handleSubmit(onValid)` の中から実際のフォーム送信をどう発火させるか（例: `formRef.current?.requestSubmit()`）を調べて実装し、バリデーションNGの場合はServer Actionが呼ばれないことを確認する。
  - Server Action側（`actions.ts`）の実装には手を入れない。

- **学べること**: フォームライブラリ（React Hook Form）による値管理の考え方、スキーマベースバリデーション（zod）の基本、クライアント側検証とServer Actionへの送信タイミングの関係。
- **参考リンク**:
  - [React Hook Form](https://react-hook-form.com/) — フォーム状態管理ライブラリ（`ltp-frontend`で使用）
  - [React Hook Form: register](https://react-hook-form.com/docs/useform/register) — 入力要素をフォーム状態に登録する仕組み
  - [@hookform/resolvers](https://github.com/react-hook-form/resolvers) — zodなど外部バリデーションライブラリをReact Hook Formに接続するアダプタ
  - [Zod](https://zod.dev/) — TypeScript向けスキーマバリデーションライブラリ

---

### Phase B. 開発環境の整備

#### 3. ローカルDBをDockerで管理する

- **3.1. `docker-compose.yml` を作成する**
  - `docker/` ディレクトリを作り、その中に配置する。
  - Docker Hubの公式 `mysql` イメージのページを見て、どのタグ（バージョン）を使うか、コンテナ起動に必要な環境変数（rootパスワード、初期データベース名など）に何があるかを確認する。
  - コンテナを再作成してもデータが消えないように、データ保存先を永続化する設定（`volumes`）が必要になる。公式ドキュメントの「Where to Store Data」を読んで、何を永続化すべきか考える。
  - ここで決めたホスト名・ポート・ユーザー名・パスワード・DB名は、後で `db.ts` の接続設定と一致させる必要がある。
- **3.2. npm スクリプト（`db:up` / `db:down`）でローカル開発用のDBを起動・停止できるようにする**
  - `package.json` の `scripts` に追加する。`docker compose` コマンドに、3.1で作成したファイルの場所を指定するオプションが必要になる（`docker compose --help` で確認する）。
  - バックグラウンドで起動する・しないの違い（`-d` オプションの有無）も確認しておく。
  - 実行後、`docker ps` でコンテナが起動していること、意図したポートが開いていることを確認する。
- **3.3. DB起動時に必要なテーブルを自動初期化する（初期化用SQLの配置）**
  - MySQL公式イメージには「コンテナの初回起動時に、特定のディレクトリに置かれたSQL/シェルスクリプトを自動実行する」仕組みがある。イメージのドキュメントで、そのディレクトリ名とマウント方法を確認する。
  - 作成するテーブルのカラムは、現在の `types.ts` の `Article` / `User` と、`actions.ts` 内で実際に使われているSQLのカラム名を突き合わせて洗い出す。
  - 一度データを永続化するボリュームを削除してコンテナを作り直さないと初期化スクリプトが再実行されない、という点に注意して動作確認する。
- **3.4. ローカル開発で必要なシードデータを用意する**
  - 画面確認用に、ユーザー数件・記事数件をあらかじめ登録しておく。
  - ユーザーのパスワードを直接平文でINSERTすると、`loginUser` 内の `bcrypt.compare` と一致しないためログインできない。事前にハッシュ化した値を用意する必要がある点に注意する。

- **学べること**: Docker Composeの基本（サービス定義、ボリューム、初期化スクリプトの仕組み）。
- **参考リンク**:
  - [Docker Compose overview](https://docs.docker.com/compose/) — 複数コンテナをまとめて定義・起動する仕組み
  - [Docker のコンセプト（Get Started）](https://docs.docker.com/get-started/) — そもそもコンテナ／イメージとは何か

#### 4. 環境変数によるシークレット管理

- **4.1. `.env.local` にDB接続情報（ホスト・ユーザー名・パスワード・DB名）をまとめる**
  - Next.js公式ドキュメントの「Environment Variables」を読み、`.env.local` がフレームワーク側で自動的に読み込まれる仕組みを理解する。その上で、`dotenv` パッケージを別途インストールする必要が本当にあるか（Next.jsアプリでは不要なケースが多い）を確認してから進める。
  - キー名（例: DBホスト用、パスワード用など）は4.3で使う名前と揃える必要があるので、先に決めておく。
- **4.2. `.env.example`（雛形）を作成してリポジトリにコミットし、`.env.local` 自体は `.gitignore` に追加する**
  - `.env.example` には値を書かず、キー名だけを書く（実際の値は書かない）。
  - 現在の `.gitignore` の中身を確認し、`.env.local` のようなファイルが既にパターンでカバーされていないかをまず確認する。
- **4.3. `db.ts` のホスト名・ユーザー名・パスワードのハードコードを `process.env.XXX` 経由に置き換える**
  - `process.env.XXX` の型は `string | undefined` になる。値が設定されていない場合にどう振る舞わせるか（起動時にエラーにする、など）を考える。
- **4.4. READMEに「`.env.example` をコピーして `.env.local` を作る」旨の環境構築手順を追記する**
  - 既存READMEの「Getting Started」節に、初回セットアップの手順として追記する。

- **学べること**: 12 Factor App的な「設定はコードから分離する」という考え方。
- **参考リンク**:
  - [dotenv (npm)](https://www.npmjs.com/package/dotenv) — `.env`ファイルから環境変数を読み込むライブラリ
  - [The Twelve-Factor App: Config](https://12factor.net/config) — 設定を環境変数に持たせるべき理由

#### 5. Lintの強化とコミット前チェックの導入

- **5.1. 現状のESLint設定を確認し、フォーマッタ（Prettier、または後続ステップと揃えるなら Biome）を導入する**
  - まず `eslint.config.mjs` の中身を読み、どのルールセット（`eslint-config-next` など）が有効か把握する。
  - Prettierを選ぶ場合、ESLintのフォーマット系ルールとPrettierが競合しないようにする設定（`eslint-config-prettier` など）が必要になる。Biomeを選ぶ場合は、ESLintとBiomeのどちらがフォーマットの責務を持つかを整理する。
  - 最終的に「これを実行すればlint/formatが完結する」というnpmスクリプトを1つ決めておく。
- **5.2. `husky` + `lint-staged` を導入し、コミット前にステージされたファイルへ自動でlint/formatを実行する**
  - huskyの初期化コマンドで `.husky/` ディレクトリとGit hookの土台を作る。
  - `pre-commit` フックの中身から `lint-staged` を呼び出すように設定する。
  - `lint-staged` の設定では、対象ファイルの拡張子ごとに実行するコマンドを指定する。
  - わざとフォーマットを崩したファイルをコミットしてみて、自動修正される（またはコミットが止まる）ことを確認する。

- **学べること**: Git hooksの仕組み、静的解析ツールをチームの開発フローに組み込む方法。
- **参考リンク**:
  - [ESLint](https://eslint.org/) — JS/TSの静的解析（Lint）ツール
  - [Prettier](https://prettier.io/) — コードフォーマッタ
  - [Husky](https://typicode.github.io/husky/) — Git hooksをプロジェクトに導入するツール
  - [lint-staged](https://github.com/lint-staged/lint-staged) — ステージされたファイルにだけlintを実行する仕組み
  - [Biome](https://biomejs.dev/) — Lint+Formatを1つのツールで行う（ESLint+Prettierの代替）

---

### Phase C. バックエンドの分離

#### このPhaseで最終的に目指すディレクトリ構成

Step6・Step7を終えると、`Blog_TS,Next` とは別のnpmプロジェクトとして、以下のようなNestJSバックエンド（`blog-backend` は仮の名称）が出来上がっている状態がゴール。`Blog_TS,Next` 側は「記事一覧の取得先をDB直アクセスからこのAPIへのfetch呼び出しに変える」以外の変更はない。

```
training-submissions/eguchi-hiroki/
├── Blog_TS,Next/                         # 既存プロジェクト（変更は最小限）
│   └── app/page.tsx                      # DB直アクセス → NestJS APIへのfetch呼び出しに変更
│
└── blog-backend/                         # ★ このPhaseで新規作成するNestJSプロジェクト
    ├── prisma/
    │   ├── schema.prisma                 # Step7.1: articles/usersテーブルの定義
    │   ├── migrations/                   # Step7.4: prisma migrateで生成
    │   └── seed.ts                       # Step7.5: シードデータ投入スクリプト
    ├── src/
    │   ├── main.ts                       # Step6.1: アプリのエントリーポイント
    │   ├── app.module.ts                 # Step6.1: ルートモジュール
    │   ├── prisma/
    │   │   └── prisma.service.ts         # Step7.2: PrismaClientをDI用にラップ
    │   └── articles/
    │       ├── articles.module.ts        # Step6.4: モジュール定義
    │       ├── articles.controller.ts    # Step6.4: ルーティング（GET /articles）
    │       ├── articles.service.ts       # Step6.6: ビジネスロジック
    │       ├── articles.repository.ts    # Step7.3: DBアクセスをここに閉じ込める
    │       ├── dto/
    │       │   └── article.dto.ts        # Step6.8: レスポンスの型（契約）
    │       └── schemas/
    │           └── articles-query.schema.ts  # Step7.6: リクエストのzodスキーマ
    ├── .env / .env.example                # Step6.7: DB接続情報（Phase Bの延長）
    └── package.json
```

- **Step6完了時点**では `articles.repository.ts` と `prisma/` はまだ存在せず、`articles.service.ts` の中に `mysql2` を使った生SQLでのDB取得処理が直接書かれている状態でよい（ゴールの中間地点）。
- **Step7完了時点**で、DBアクセスを `articles.repository.ts` に切り出し、`prisma/schema.prisma` によるORM管理に置き換えることで、上記の最終形になる。
- controller → service → repositoryという依存の向き（上位が下位を呼ぶ）と、各ファイルが1つの責務だけを持つように分かれている点に注目すること。

#### 6. NestJSバックエンドの導入（記事一覧取得APIを切り出す）

> **Note**: このステップでは、認証が不要で読み取り専用の「記事一覧取得」だけをNestJSに切り出す。DBアクセスは現状の `db.ts` と同じ生SQLのままでよい（Prisma・zodバリデーション・レイヤー分離の導入はStep7で、このNestJSバックエンドに対して直接行う）。認証の強化は、後続のPhaseでまずNext.js側から学ぶ。ここで作るNestJSアプリにその改善を反映するかどうかは、後続のPhaseを終えてから改めて検討する。

- **6.1. NestJS CLIをインストールし、新規プロジェクトを作成する**
  - `Blog_TS,Next` とは別のnpmプロジェクトとして作成する。同じマシン上で両方を同時に起動することになるので、ポート番号が衝突しないことを確認する。
  - `npm i -g @nestjs/cli` でグローバルインストールする方法と、`npx @nestjs/cli new` でその都度実行する方法の違い（バージョンが固定されるか、常に最新を使うか）を比較してどちらを使うか決める。
  - プロジェクトは `training-submissions/eguchi-hiroki/` 配下に、`Blog_TS,Next` と並ぶディレクトリ（例: `blog-backend`）として作成する。パッケージマネージャは `Blog_TS,Next` と揃えてnpmを選ぶ。
  - NestJSのデフォルトポート（3000番）はNext.jsのデフォルトポートと同じため、どちらか一方のポートを変更しないと同時起動できない。`.env` でポート番号を切り出せるようにしておくと後で楽になる。
- **6.2. 生成された雛形一式に目を通し、`main.ts` / `app.module.ts` / `app.controller.ts` / `app.service.ts` それぞれの役割を1行で説明できるようにする**
  - 実際に手を動かす前に、まず「地図」を持つ。どのファイルがアプリの起動処理を担い、どのファイルがルーティングを担い、どのファイルがロジックを担うのか整理する。
  - `main.ts`: `NestFactory.create()` でアプリを起動するエントリーポイント。ポート番号の指定や、後続ステップで使うグローバルなPipe/Interceptorの登録もここで行うことになる。
  - `app.module.ts`: `@Module({ imports, controllers, providers })` でアプリの構成要素を宣言する、ルートとなるモジュール。今後 `articles` 用のモジュールもここに登録されていく。
  - `app.controller.ts` / `app.service.ts`: それぞれ `@Controller()` / `@Injectable()` デコレータの役割と、controllerがロジックを持たずserviceに委譲する設計思想を確認する。
  - `app.controller.spec.ts` のような生成済みテストファイルも軽く見ておく（Step9で本格的に書き方を学ぶ前の予習になる）。
- **6.3. 雛形のまま `npm run start:dev` 相当のコマンドで起動し、デフォルトで用意されているエンドポイントにアクセスして動作を確認する**
  - ブラウザやcurlなど、普段使い慣れた方法でアクセスしてみる。
  - `package.json` の `start:dev` が内部で使っている `--watch` オプションの役割（ファイル変更を検知して自動でアプリを再起動する）を確認する。
  - 試しにレスポンス文字列を書き換えて保存し、watchが効いて自動的に反映されることを確認しておくと、以降の開発サイクルが速くなる。
- **6.4. `articles` 機能用のmodule・controller・serviceをNestJS CLIの生成コマンドで作成する**
  - CLIが自動で `app.module.ts` にモジュールを登録してくれる部分と、自分で書く必要がある部分を区別して理解する。
  - `nest g module articles` / `nest g controller articles` / `nest g service articles` を個別に叩く方法と、`nest g resource articles` でまとめて生成する方法の両方を調べ、後者を使う場合はCRUD一式のテンプレートが生成される点（今回は読み取り専用なので不要なメソッドをどう扱うか判断が必要）に注意する。
  - 生成後、`app.module.ts` の `imports` に `ArticlesModule` が実際に追記されていることをdiffで確認する。
- **6.5. まずはDBに繋がず、固定のダミーデータの配列を返すだけの `GET /articles` エンドポイントをcontrollerに実装し、疎通確認する**
  - 「ルーティングが正しく動いているか」を先に確認してから次のステップに進むことで、後でDB接続の問題が起きたときに切り分けやすくなる。
  - ダミーデータは `Blog_TS,Next` の `types.ts` にある `Article` 型（`id`/`title`/`tags`/`body`など）と項目を揃えた配列にしておくと、後続ステップとの差分が見やすくなる。
  - `@Controller('articles')` と `@Get()` の組み合わせでパスが `GET /articles` になる仕組みを確認し、レスポンスがJSON形式で200で返ってくることを見る。
- **6.6. ダミーデータを返すロジックをcontrollerからserviceに移し、controllerは「serviceを呼んで結果を返すだけ」にする**
  - serviceがcontrollerにどう渡されるか（コンストラクタインジェクション）を、`app.module.ts` の `providers` の記述と合わせて確認する。これがNestJSのDI（依存性注入）の最初の実例になる。
  - serviceに `findAll()` のようなメソッドを定義し、controllerの constructor で `private readonly articlesService: ArticlesService` として受け取る。
  - あえて一時的に `providers` から `ArticlesService` を外してみて、どんな起動エラーが出るかを確認すると、DIコンテナが何をしているかが体感的に理解できる。
- **6.7. serviceの中身を、ダミーデータではなく実際のDB（`blog_app`）から記事一覧を取得する実装に置き換える**
  - `Blog_TS,Next` の `db.ts` と同じように、`mysql2` を使って生SQLで取得するところから始める（Prismaはまだ使わない）。
  - コネクションプールの作成コードをどこに置くか（service内に直接書くか、専用のモジュールに切り出すか）を考える。Step7でPrismaに置き換えることを見越すと、後者の方が差し替えやすい。
  - DB接続情報は決め打ちにせず、Phase Bで学んだ環境変数の管理方法をここでも適用する。`process.env` を直接読むか、`@nestjs/config` パッケージを導入するかを比較検討する（後者はNestJS公式の環境変数管理の仕組みで、後続のPhaseでも使う可能性がある）。
- **6.8. レスポンスの型をDTO（クラス）として定義し、controllerの戻り値の型に指定する**
  - なぜ戻り値の型を `any` のままにせず、専用のクラスを定義するのか（呼び出し側との「契約」を明示する）を考える。
  - `id`/`title`/`tags`/`body`/`createdAt` などのフィールドを持つ `ArticleDto` クラスを定義し、controllerのメソッドの戻り値型を `Promise<ArticleDto[]>` のように明示する。
  - TypeScriptの型チェックで「serviceの戻り値の形」と「DTOの形」が合っているかを確認する。今回は型定義に主眼を置き、`class-transformer` によるシリアライズ制御までは踏み込まなくてよい。
- **6.9. Next.js側で記事一覧を取得している箇所（`app/page.tsx` など）を、直接DBを見にいく処理から、このNestJS APIへの `fetch` 呼び出しに置き換え、画面が同じように表示されることを確認する**
  - ブラウザ（クライアントコンポーネント）から直接呼び出す場合はCORSの設定が必要になることがある。Next.jsのServer Component/Server Actionからサーバー側で呼び出す場合は事情が異なる点も含めて調べる。
  - NestJS APIのURLは、Next.js側の環境変数として管理する（Phase Bの環境変数管理の延長）。名前は `NEST_API_URL` など分かりやすいものにする。
  - NestJSアプリが起動していない場合や、レスポンスが200以外の場合に画面がどう振る舞うか（エラー表示、フォールバックなど）も簡単に考えておく。

- **学べること**: NestJS CLIの使い方、Module/Controller/Serviceそれぞれの役割分担、DI（依存性注入）の最初の実例、DTOによる「入力/出力の型を契約として明示する」考え方。
- **参考リンク**:
  - [NestJS ドキュメント](https://docs.nestjs.com/) — フレームワーク公式ドキュメント
  - [NestJS: Providers（DIの仕組み）](https://docs.nestjs.com/providers) — サービスクラスとDependency Injectionの基本
  - [NestJS: Controllers（DTOによるRequest Payload）](https://docs.nestjs.com/controllers#request-payloads) — DTOクラスによる入力の型定義

#### 7. データ層とアーキテクチャの整理（バックエンド）

> **Note**: このステップはStep6で作成したNestJSバックエンドプロジェクトに対して作業する。`Blog_TS,Next` 側の `db.ts` / `actions.ts` には手を入れない。ORM導入・バリデーション・レイヤー分離という3つのテーマを、フロントエンド（Next.js Server Action）ではなくこのバックエンド（NestJS）の改善を通してまとめて学ぶ。

- **7.1. NestJSバックエンドプロジェクトにPrismaを導入し、`schema.prisma` に `articles` / `users` テーブルを定義する**
  - `prisma` と `@prisma/client` をインストールし、`npx prisma init` で生成される `schema.prisma` と `.env`（`DATABASE_URL`）の役割を確認する。
  - `datasource` には、Step4で学んだ環境変数管理の考え方を踏襲し、バックエンドプロジェクト用の `.env` からDB接続先を指定する。
  - フィールドは、`Blog_TS,Next` の `types.ts` の `Article` / `User` と、`docker/initdb` 配下の初期化SQLのカラムを1つずつ突き合わせ、抜け漏れがないか洗い出す。
  - MySQL側がsnake_caseのカラム名、Prisma側をcamelCaseのフィールド名にしたい場合、フィールド単位の `@map("column_name")` とテーブル単位の `@@map("table_name")` が必要になることを確認する。
- **7.2. Prisma Clientをprovider（例: `PrismaService`）としてラップし、NestJSのDIで各serviceに注入できるようにする**
  - `PrismaClient` を継承した `PrismaService` を作り、`onModuleInit`/`onModuleDestroy` でDB接続のライフサイクルを管理する仕組みを、NestJS公式の「Prisma」レシピで確認する。
  - 作成した `PrismaService` を、Step6.6でDI（依存性注入）を学んだ流れと同様に、対象moduleの `providers` に登録し、コンストラクタインジェクションでserviceに渡す。
  - `PrismaService` を専用の `PrismaModule` に切り出し、`@Global()` デコレータを付けて他のmoduleから都度 `imports` せずに使えるようにするか、それぞれのmoduleで個別に `imports` するか、NestJS公式レシピの推奨（`@Global()`）を踏まえて方針を決める。
- **7.3. DBアクセスだけを担う `ArticlesRepository` を新設し、Step6.7で実装した `mysql2` の生SQL呼び出しを `PrismaService` 経由のPrisma Client呼び出しに置き換えてこのrepositoryに閉じ込める**
  - repositoryの関数は「Prismaを呼んでデータを返すだけ」にし、バリデーションなど業務ロジックの知識を持たせない。
  - `ArticlesRepository` に `findAll()` を定義し、内部で `this.prisma.article.findMany()` を呼ぶだけの実装にする。Step6.7で書いた生SQLと並べて、コード量・型安全性がどう変わるかを比較する。
  - 既存の `ArticlesService` は `ArticlesRepository` をDIで受け取り、「repositoryを呼んで結果を返すだけ」の薄い層になるよう書き換える。controller側の呼び出し方は変えず、内部実装だけが生SQLからPrisma + repositoryに変わったことを確認する。
  - 置き換え後も `GET /articles` のレスポンス形式（Step6.8のDTO）が変わらないことを、Next.js側（Step6.9で接続済み）から確認する。切り替えが終わったら、不要になった `mysql2` 関連のコード（コネクションプール作成など）を削除する。
- **7.4. 手書きの初期化SQL（`docker/initdb` 配下）を `prisma migrate` によるマイグレーション管理に移行する**
  - `schema.prisma` から `npx prisma migrate dev --name init` でマイグレーションSQLを生成させ、`prisma/migrations/` 配下に出力されたSQLと元の手書きSQLを1行ずつ見比べて差分がないか確認する。
  - Docker起動時の初期化（Step3.3）と `prisma migrate` が両方テーブル作成を試みると衝突するため、Docker側の初期化スクリプトを空にする（または削除する）などして、どちらでテーブルを管理するかを1つに決める。
  - 以降スキーマを変更する際は「`schema.prisma` を書き換えてから `prisma migrate dev` で差分を生成する」という開発フローに切り替わることを確認する。
- **7.5. `docker/initdb` 配下のシード用SQLを `prisma db seed` に置き換える**
  - `package.json` の `"prisma": { "seed": "..." }` の設定と、専用のシードスクリプトファイル（例: `prisma/seed.ts`）の仕組みを調べ、`npx prisma db seed` で実行されることを確認する。
  - Step3.4で用意した内容（ハッシュ化済みパスワードを含む）と同等のデータを、`prisma.user.create()` のようなPrisma Client呼び出しで作成するスクリプトに書き換える。
  - 既にデータが入っている状態で再実行した場合の挙動（重複作成されないか）を確認し、`upsert` を使うか実行前に `deleteMany()` するかなど、再実行時の方針を決めておく。
- **7.6. `GET /articles` にタグによる絞り込み（`tag`）とページネーション（`limit`/`offset`）のクエリパラメータを追加し、`zod` でその入力ルール（型・範囲・デフォルト値）をスキーマとして定義する**
  - `limit` に負の数や極端に大きい値が来た場合など、どんな入力が不正かを洗い出してからスキーマを書く。
  - クエリパラメータはHTTP上では文字列として渡ってくるため、`z.coerce.number()` などで数値に変換しながら検証する方法を確認する。
  - スキーマから `z.infer` で型を取り出し、controllerの引数の型として使う。`Blog_TS,Next` の `schemas/article.ts` と考え方は同じだが、対象がクライアント入力ではなくHTTPリクエストのクエリパラメータになる点の違いを意識する。
- **7.7. controllerで受け取ったクエリパラメータを7.6のzodスキーマで検証し、不正な値はrepository/serviceに到達する前に弾く**
  - NestJSでリクエストの検証・変換を行う仕組み（Pipe）のドキュメントを読み、zodスキーマをPipeとして組み込む方法（`PipeTransform` を実装した自作Pipe、または `nestjs-zod` などのライブラリ）を比較し、どちらが学習の狙いに合うか判断してから実装する。
  - controllerのメソッド引数に `@Query()` と作成したPipeを組み合わせ、検証済みの型安全なオブジェクトとして受け取れることを確認する。
  - 検証に失敗した場合、NestJSがデフォルトでどんなレスポンス（ステータスコード・エラー形式）を返すかを確認する。必要であれば、エラーメッセージの形式を調整する。
- **7.8. `ArticlesService` / `ArticlesRepository` の引数・戻り値の型を、7.6で定義したzodスキーマ由来の型（`z.infer`）で揃え、controller → service → repositoryの各層で型がどう受け渡されるかを整理する**
  - DTO（レスポンスの型を契約として明示するもの、Step6.8）と、zodスキーマ（リクエストの入力を検証するもの）の役割の違いを言葉で説明できるようにする。
  - `ArticlesService.findAll(query: ArticlesQuery)` → `ArticlesRepository.findAll(query: ArticlesQuery)` のように、同じ型をcontroller・service・repositoryの各層で使い回すことで、層を経由するたびに型が変換・崩れることなく受け渡されることを確認する。

- **学べること**: ORMが生成する型とクエリの仕組み、マイグレーションという概念（スキーマ変更を差分として管理する）、NestJSにおけるPrismaのDI（Provider化）パターン、controller/service/repositoryによる関心の分離と依存の向き、スキーマベースバリデーション（zod）をバックエンドのリクエスト検証に使う考え方。
- **参考リンク**:
  - [Prisma ドキュメント](https://www.prisma.io/docs) — ORM本体の公式ドキュメント
  - [Prisma Migrate](https://www.prisma.io/docs/orm/prisma-migrate) — スキーマ変更をマイグレーションとして管理する機能
  - [NestJS: Prisma（Recipes）](https://docs.nestjs.com/recipes/prisma) — NestJSプロジェクトへのPrisma組み込み方
  - [NestJS: Pipes](https://docs.nestjs.com/pipes) — リクエストの検証・変換を行う仕組み
  - [Zod](https://zod.dev/) — TypeScript向けスキーマバリデーションライブラリ
  - [Separation of Concerns（Wikipedia）](https://en.wikipedia.org/wiki/Separation_of_concerns) — 関心の分離という考え方
  - [Hexagonal Architecture（Alistair Cockburn 原典）](https://alistair.cockburn.us/hexagonal-architecture/) — `ltp-backend`が採用するアーキテクチャの元となった提唱記事
  - [Dependency Inversion Principle（Wikipedia）](https://en.wikipedia.org/wiki/Dependency_inversion_principle) — 「上位層が下位層の実装ではなく抽象に依存する」原則
  - [SQLインジェクション（OWASP）](https://owasp.org/www-community/attacks/SQL_Injection) — 生SQL組み立てで起きうる脆弱性の解説

---

### Phase D. 認証・セキュリティ

#### 8. 認証まわりの強化

- **8.1. cookieに素の `user_id` を保存する現状をやめ、署名付き・改ざん検知可能なセッション（例: `jose` でJWTを発行・検証）に置き換える**
  - `jose` を導入し、ログイン成功時に `user_id` を含んだJWTを発行・署名する。署名鍵をどこで管理するか（環境変数）を決める。
  - 有効期限の設定、cookieに保存する際の属性（`httpOnly` など）を、Next.jsの `cookies()` API のドキュメントで確認する。
  - リクエストのたびにJWTを検証し、改ざんや期限切れを検出した場合にどう振る舞わせるか（ログアウト扱いにする、など）を設計する。
- **8.2. 各Server Actionにバラバラに書かれていた「ログインしているか」のチェックを、共通のヘルパー関数（あるいはNext.jsの `proxy.ts`）に集約する**
  - 現在ログイン確認が必要な処理（記事削除、プロフィール更新など）を洗い出し、それぞれで重複しているチェックを見つける。
  - `proxy.ts` に寄せるか、共通関数として各Server Actionの先頭で呼ぶ形にするか、どちらの方針にするかを決めてから実装する。

> **Note**: このプロジェクトのNext.jsバージョン(16系)では、従来 `middleware` と呼ばれていた機能が `proxy` に名称変更されている（`node_modules/next/dist/docs` 内のドキュメント参照）。ネットや書籍で「Next.js middleware」と書かれた古い情報を見かけても、このプロジェクトでは `proxy.ts` が該当すると読み替えること。

- **学べること**: セッション管理におけるセキュリティの基本（改ざん検知・有効期限）、Next.jsの`proxy.ts`による横断的な処理の実装方法。
- **参考リンク**:
  - [JSON Web Token Introduction（jwt.io）](https://www.jwt.io/introduction) — JWTとは何か
  - [jose（panva/jose）](https://github.com/panva/jose) — JWTの発行・検証を行うライブラリ
  - [Next.js: Proxy（旧middleware）](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) — リクエストを横断的に処理するファイル規約

---

### Phase E. 品質保証

#### 9. テストの導入

- **9.1. バックエンド: Jestで service / repository の単体テストを書く（repositoryはモックに差し替える）**
  - Step6・Step7で整理したservice/repository層を対象に、repositoryをテスト用のダミーに差し替えてテストする。
  - 正常系だけでなく、バリデーションエラーや存在しないIDを渡した場合などの異常系もテストケースとして考える。
- **9.2. フロントエンド: Vitest + Testing Library でコンポーネント・hookのテストを書く**
  - `DeleteButton` のようなクライアントコンポーネントや、Step1で作ったカスタムフック（`useDraftAutosave`）を対象に、レンダリング結果やクリックなどのユーザー操作をテストする。

- **学べること**: モック/スタブを使ったテストの書き方、テストピラミッド（単体テストを厚く、統合テストは要点を絞る）という考え方。
- **参考リンク**:
  - [Jest](https://jestjs.io/) — JS/TSのテストフレームワーク（`ltp-backend`で使用）
  - [Vitest](https://vitest.dev/) — Vite系プロジェクト向けの高速テストランナー（`ltp-frontend`で使用）
  - [Testing Library](https://testing-library.com/) — DOM/UIコンポーネントを「利用者視点」でテストするためのライブラリ群
  - [Test Driven Development（TDD）解説（Martin Fowler）](https://martinfowler.com/bliki/TestDrivenDevelopment.html) — テストを先に書く開発手法

#### 10. CIの導入

- **10.1. GitHub Actionsで、PR作成時にlint・型チェック（`tsc --noEmit`）・テストを自動実行するワークフローを作成する**
  - `.github/workflows/` にYAMLファイルを作成し、プルリクエスト作成時に実行されるようトリガーを設定する。
  - ジョブの中でNode.jsのセットアップ、依存関係のインストール、lint/型チェック/テストの各コマンドを順に実行するステップを定義する。
  - 手元で実行しているコマンドとCI上のコマンドがずれないよう、`package.json` の `scripts` を揃えておく。

- **学べること**: CIの基本的な考え方、GitHub Actionsのワークフロー（YAML）の書き方。
- **参考リンク**:
  - [GitHub Actions ドキュメント](https://docs.github.com/en/actions) — CI/CDワークフローの公式ドキュメント
