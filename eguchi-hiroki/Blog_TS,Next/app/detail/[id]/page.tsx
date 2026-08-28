import { cookies } from 'next/headers';
import db from '../../../db';
import { QueryError, RowDataPacket } from 'mysql2';
import { deleteArticle } from '../../actions';
import DeleteButton from '../../DeleteButton';
import '../../../public/article-1.css';
import { Article } from '../../../types';

export default async function DetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

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

  return (
    <div className="main-section">
      <div className="main-inner">
        <div className="left-container">
          <div className="author-sns-flex">
            <div className="author">
              <div className="author-meta">
                <div className="author-name">{article.user_id}</div>
                <p className="date">
                  {new Date(article.updated_at).toLocaleDateString('ja-JP')}
                </p>
              </div>
            </div>
          </div>

          <p className="meta-category">{article.tag}</p>
          <p className="article-title">{article.article_title}</p>

          <div className="eyecatch-img">
            <img
              src={`/${article.eyecatch_image}`}
              alt={article.article_title}
            />
          </div>

          <p className="article-text">{article.content}</p>

          {userId === article.user_id && (
            <>
              <a href={`/edit/${article.article_id}`} className="more-btn">
                編集する
              </a>
              <DeleteButton articleId={article.article_id} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
