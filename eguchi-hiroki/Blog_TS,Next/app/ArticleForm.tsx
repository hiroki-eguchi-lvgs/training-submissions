'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { articleSchema, ArticleFormValues } from '../schemas/article';
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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      article_title: initialTitle ?? '',
      tag: initialTag ?? '',
      content: initialContent ?? '',
    },
  });

  return (
    <form action={formAction} encType="multipart/form-data">
      {userId && <input type="hidden" name="user_id" value={userId} />}
      {articleId && <input type="hidden" name="article_id" value={articleId} />}
      {currentImage && <input type="hidden" name="current_image" value={currentImage} />}

      <div className="form-group">
        <label>タイトル:</label>
        <input type="text" {...register('article_title')} />
      </div>

      <div className="form-group">
        <label>タグ:</label>
        <input type="text" {...register('tag')} />
      </div>

      <div className="form-group">
        <label>本文:</label>
        <textarea rows={8} {...register('content')}></textarea>
      </div>

      <div className="form-group">
        <label>画像:</label>
        <input type="file" name="eyecatch_image" accept="image/*" required={imageRequired} />
      </div>

      <button type="submit" className="auth-submit-btn">{submitLabel}</button>
    </form>
  );
}