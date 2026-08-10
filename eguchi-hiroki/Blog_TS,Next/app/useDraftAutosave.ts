import { useEffect } from 'react';
import { UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { ArticleFormValues } from '../schemas/article';

export function useDraftAutosave(
  articleId: number | undefined,
  watch: UseFormWatch<ArticleFormValues>,
  setValue: UseFormSetValue<ArticleFormValues>
) {
  const draftKey = articleId ? `draft-article-${articleId}` : 'draft-new';
  const title = watch('article_title');
  const tag = watch('tag');
  const content = watch('content');

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(draftKey, JSON.stringify({ title, tag, content }));
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, [title, tag, content, draftKey]);

  useEffect(() => {
    const saved = localStorage.getItem(draftKey);
    if (saved) {
      const draft = JSON.parse(saved);
      setValue('article_title', draft.title);
      setValue('tag', draft.tag);
      setValue('content', draft.content);
    }
  }, []);

  function clearDraft() {
    localStorage.removeItem(draftKey);
  }

  return { clearDraft };
}