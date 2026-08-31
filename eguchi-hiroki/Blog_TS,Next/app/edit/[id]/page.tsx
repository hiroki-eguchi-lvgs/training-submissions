import { getCurrentUserId } from '../../../lib/auth';
import { redirect } from 'next/navigation';
import db from '../../../db';
import { QueryError, RowDataPacket } from 'mysql2';
import { updateArticle } from '../../actions';
import ArticleForm from '../../ArticleForm';
import { Article } from '../../../types';
import '../../../public/register.css';

export default async function EditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect('/login');
  }
  const articles = await new Promise<Article[]>((resolve, reject) => {
    db.query<(Article & RowDataPacket)[]>(
      'SELECT * FROM articles WHERE article_id = ?',
      [id],
      (err: QueryError | null, results: Article[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      },
    );
  });
  const article = articles[0];
  if (article.user_id !== userId) {
    redirect('/');
  }
  return (
    <div className="auth-section">
      <h1>記事を編集する</h1>
      <ArticleForm
        formAction={updateArticle}
        submitLabel="更新する"
        articleId={article.article_id}
        currentImage={article.eyecatch_image ?? ''}
        initialTitle={article.article_title}
        initialTag={article.tag ?? ''}
        initialContent={article.content}
        imageRequired={false}
      />
    </div>
  );
}
