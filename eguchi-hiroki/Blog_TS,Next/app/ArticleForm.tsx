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
    watch,
    setValue,
    formState: { errors },
  } = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    mode: 'onBlur',
    defaultValues: {
      article_title: initialTitle ?? '',
      tag: initialTag ?? '',
      content: initialContent ?? '',
    },
  });
  
  useDraftAutosave(articleId, watch, setValue);

  return (
    <form action={formAction} encType="multipart/form-data">
      {userId && <input type="hidden" name="user_id" value={userId} />}
      {articleId && <input type="hidden" name="article_id" value={articleId} />}
      {currentImage && <input type="hidden" name="current_image" value={currentImage} />}

      <div className="form-group">
        <label>タイトル:</label>
        <input type="text" {...register('article_title')} />
        {errors.article_title && <p className="error">{errors.article_title.message}</p>}
      </div>

      <div className="form-group">
        <label>タグ:</label>
        <input type="text" {...register('tag')} />
        {errors.tag && <p className="error">{errors.tag.message}</p>}
      </div>

      <div className="form-group">
        <label>本文:</label>
        <textarea rows={8} {...register('content')}></textarea>
        {errors.content && <p className="error">{errors.content.message}</p>}
      </div>

      <div className="form-group">
        <label>画像:</label>
        <input type="file" name="eyecatch_image" accept="image/*" />
      </div>

      <button type="submit" className="auth-submit-btn">{submitLabel}</button>
    </form>
  );
}