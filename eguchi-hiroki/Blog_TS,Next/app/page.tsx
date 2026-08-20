import '../public/top.css';
import { Article } from '../types';

export default async function Home() {
  const nestApiUrl = process.env.NEST_API_URL;
  const response = await fetch(`${nestApiUrl}/articles`);

  if (!response.ok) {
    throw new Error('記事一覧の取得に失敗しました');
  }

  const articles: Article[] = await response.json();

  return (
    <div>
      <div className="hero-section">
        <div className="main-inner">
          <h1>Share your holiday stories.</h1>
          <p className="text">
            Write about your experiences while on holiday in various parts of
            Indonesia, and reach a wide readership.
          </p>
        </div>
      </div>
      <div className="news-section">
        <div className="main-inner">
          <div className="left-container">
            <h2>一覧（新着順）</h2>
            <div className="news-list">
              {articles.map((article) => (
                <a
                  href={`/detail/${article.article_id}`}
                  className="news-item"
                  key={article.article_id}
                >
                  <div className="news-img">
                    <img
                      src={`/${article.eyecatch_image}`}
                      alt={article.article_title}
                    />
                  </div>
                  <div className="reviews-item-date">
                    <span className="meta-category">{article.tag}</span>
                    <span className="meta-pipe">|</span>
                    <span className="meta-date">
                      {new Date(article.updated_at).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                  <h3>{article.article_title}</h3>
                  <p className="text">{article.content}</p>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
