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

  const { clearDraft } = useDraftAutosave(articleId, watch, setValue);

  function onSubmit(data: ArticleFormValues) {
    const formData = new FormData();
    formData.append('article_title', data.article_title);
    formData.append('tag', data.tag ?? '');
    formData.append('content', data.content);

    if (userId) {
      formData.append('user_id', userId);
    }
    if (articleId) {
      formData.append('article_id', String(articleId));
    }
    if (currentImage) {
      formData.append('current_image', currentImage);
    }

    if (data.eyecatch_image && data.eyecatch_image.length > 0) {
      formData.append('eyecatch_image', data.eyecatch_image[0]);
    }

    clearDraft();
    formAction(formData);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
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
        <input type="file" {...register('eyecatch_image')} accept="image/*" />
      </div>

      <button type="submit" className="auth-submit-btn">{submitLabel}</button>
    </form>
  );
}