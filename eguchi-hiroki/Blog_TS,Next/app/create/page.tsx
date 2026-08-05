import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createArticle } from '../actions';
import ArticleForm from '../ArticleForm';
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
      <ArticleForm
        formAction={createArticle}
        submitLabel="投稿する"
        userId={userId}
        imageRequired={true}
      />
    </div>
  );
}