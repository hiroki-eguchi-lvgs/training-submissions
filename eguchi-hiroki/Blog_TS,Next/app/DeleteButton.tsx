'use client';

import { deleteArticle } from './actions';

export default function DeleteButton({ articleId }: { articleId: number }) {
  return (
    <form action={deleteArticle}>
      <input type="hidden" name="article_id" value={articleId} />
      <button
        type="submit"
        className="more-btn"
        onClick={(e) => {
          if (!confirm('本当に削除しますか？')) {
            e.preventDefault();
          }
        }}
      >
        削除する
      </button>
    </form>
  );
}