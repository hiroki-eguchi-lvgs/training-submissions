これは、[`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) で作成された、[Next.js](https://nextjs.org) プロジェクトです。

## 使い方

### 環境構築

1. `.env.example` をコピーして `.env.local` を作成する

```bash
   cp .env.example .env.local
```

2. `.env.local` の各項目に、実際の値を設定する

3. ローカルDBを起動する

```bash
   npm run db:up
```

4. 開発サーバーを起動する

```bash
   npm run dev
```

[http://localhost:3000](http://localhost:3000) をブラウザで開くと、結果が確認できます。

`app/page.tsx` を編集すると、ページの内容を変更できます。ファイルを編集すると、自動的に、画面が更新されます。

このプロジェクトは、[`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) を使い、Vercelの新しいフォントファミリーである [Geist](https://vercel.com/font) を、自動的に最適化して読み込んでいます。

## 詳しく学ぶ

Next.jsについて詳しく知りたい場合は、以下のリソースを参照してください。

- [Next.js Documentation](https://nextjs.org/docs) - Next.jsの機能とAPIについて学べます。
- [Learn Next.js](https://nextjs.org/learn) - インタラクティブなNext.jsのチュートリアルです。

[Next.jsのGitHubリポジトリ](https://github.com/vercel/next.js) も、ぜひご覧ください。フィードバックや貢献も歓迎しています。

## Vercelへのデプロイ

Next.jsアプリを、デプロイする一番簡単な方法は、Next.jsの開発元による、[Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) を使うことです。

詳しくは、[Next.jsのデプロイに関するドキュメント](https://nextjs.org/docs/app/building-your-application/deploying) を参照してください。
