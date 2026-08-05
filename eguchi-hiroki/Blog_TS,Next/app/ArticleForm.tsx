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
  return (
    <form action={formAction} encType="multipart/form-data">
      {userId && <input type="hidden" name="user_id" value={userId} />}
      {articleId && <input type="hidden" name="article_id" value={articleId} />}
      {currentImage && <input type="hidden" name="current_image" value={currentImage} />}

      <div className="form-group">
        <label>タイトル:</label>
        <input type="text" name="article_title" defaultValue={initialTitle} required />
      </div>

      <div className="form-group">
        <label>タグ:</label>
        <input type="text" name="tag" defaultValue={initialTag} />
      </div>

      <div className="form-group">
        <label>本文:</label>
        <textarea name="content" rows={8} defaultValue={initialContent} required></textarea>
      </div>

      <div className="form-group">
        <label>画像:</label>
        <input type="file" name="eyecatch_image" accept="image/*" required={imageRequired} />
      </div>

      <button type="submit" className="auth-submit-btn">{submitLabel}</button>
    </form>
  );
}