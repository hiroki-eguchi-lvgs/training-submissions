import { redirect } from 'next/navigation';
import { getCurrentUserId } from '../../lib/auth';
import { createArticle } from '../actions';
import ArticleForm from '../ArticleForm';
import '../../public/register.css';

export default async function CreatePage() {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect('/login');
  }
  return (
    <div className="auth-section">
      <h1>記事を投稿する</h1>
      <ArticleForm
        formAction={createArticle}
        submitLabel="投稿する"
        imageRequired={true}
      />
    </div>
  );
}
