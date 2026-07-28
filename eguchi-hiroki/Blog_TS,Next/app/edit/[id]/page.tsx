import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import db from '../../../db';
import { updateArticle } from '../../actions';
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
      <form action={updateArticle} encType="multipart/form-data">
        <input type="hidden" name="article_id" value={article.article_id} />
        <input type="hidden" name="current_image" value={article.eyecatch_image ?? ''} />
        <div className="form-group">
          <label>タイトル:</label>
          <input type="text" name="article_title" defaultValue={article.article_title} required />
        </div>
        <div className="form-group">
          <label>タグ:</label>
          <input type="text" name="tag" defaultValue={article.tag ?? ''} />
        </div>
        <div className="form-group">
          <label>本文:</label>
          <textarea name="content" rows={8} defaultValue={article.content} required ></textarea>
        </div>
        <div className="form-group">
          <label>画像(変更する場合のみ、選択):</label>
          <input type="file" name="eyecatch_image" accept="image/*" />
        </div>
        <button type="submit" className="auth-submit-btn">更新する</button>
      </form>
    </div>
  );
}