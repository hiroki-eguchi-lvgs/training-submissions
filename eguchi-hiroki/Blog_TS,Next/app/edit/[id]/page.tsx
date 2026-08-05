import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import db from '../../../db';
import { updateArticle } from '../../actions';
import ArticleForm from '../../ArticleForm';
import '../../../public/register.css';

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) {
    redirect('/login');
  }
  const articles = await new Promise<any[]>((resolve, reject) => {
    db.query('SELECT * FROM articles WHERE article_id = ?', [id], (err: any, results: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
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