import { useEffect } from 'react';

export function useDraftAutosave(
  articleId: number | undefined,
  title: string,
  tag: string,
  content: string,
  setTitle: (value: string) => void,
  setTag: (value: string) => void,
  setContent: (value: string) => void
) {
  const draftKey = articleId ? `draft-article-${articleId}` : 'draft-new';

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
      setTitle(draft.title);
      setTag(draft.tag);
      setContent(draft.content);
    }
  }, []);
}