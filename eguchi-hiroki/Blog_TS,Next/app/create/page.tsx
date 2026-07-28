import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createArticle } from '../actions';
import '../../public/register.css';

export default async function CreatePage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    redirect('/login');
  }

  return (
    <div className="auth-section">
      <h1>記事を投稿する</h1>

      <form action={createArticle} encType="multipart/form-data">
        <input type="hidden" name="user_id" value={userId} />
        <div className="form-group">
          <label>タイトル:</label>
          <input type="text" name="article_title" required />
        </div>
        <div className="form-group">
          <label>タグ:</label>
          <input type="text" name="tag" />
        </div>
        <div className="form-group">
          <label>本文:</label>
          <textarea name="content" rows={8} required ></textarea>
        </div>
        <div className="form-group">
          <label>画像:</label>
          <input type="file" name="eyecatch_image" accept="image/*" required />
        </div>
        <button type="submit" className="auth-submit-btn">投稿する</button>
      </form>
    </div>
  );
}
