'use client';
import { useState } from 'react';
import { useDraftAutosave } from './useDraftAutosave';

export default function ArticleForm({
  formAction,
  submitLabel,
  userId,
  articleId,
  currentImage,
  initialTitle,
  initialTag,
  initialContent,
  imageRequired,
}: {
  formAction: (formData: FormData) => void;
  submitLabel: string;
  userId?: string;
  articleId?: number;
  currentImage?: string;
  initialTitle?: string;
  initialTag?: string;
  initialContent?: string;
  imageRequired: boolean;
}) {
  const [title, setTitle] = useState(initialTitle ?? '');
  const [tag, setTag] = useState(initialTag ?? '');
  const [content, setContent] = useState(initialContent ?? '');

  useDraftAutosave(articleId, title, tag, content, setTitle, setTag, setContent);


  return (
    <form action={formAction} encType="multipart/form-data">
      {userId && <input type="hidden" name="user_id" value={userId} />}
      {articleId && <input type="hidden" name="article_id" value={articleId} />}
      {currentImage && <input type="hidden" name="current_image" value={currentImage} />}

      <div className="form-group">
        <label>タイトル:</label>
        <input
          type="text"
          name="article_title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>タグ:</label>
        <input
          type="text"
          name="tag"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>本文:</label>
        <textarea
          name="content"
          rows={8}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        ></textarea>
      </div>

      <div className="form-group">
        <label>画像:</label>
        <input type="file" name="eyecatch_image" accept="image/*" required={imageRequired} />
      </div>

      <button type="submit" className="auth-submit-btn">{submitLabel}</button>
    </form>
  );
}