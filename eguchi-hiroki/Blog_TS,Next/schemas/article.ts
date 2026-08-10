import { z } from 'zod';

export const articleSchema = z.object({
  article_title: z
    .string()
    .min(1, 'タイトルは必須です')
    .max(100, 'タイトルは100文字以内で入力してください'),
  tag: z.string().optional(),
  content: z
    .string()
    .min(50, '本文は50文字以上で入力してください'),
    eyecatch_image: z.instanceof(FileList).optional(),
});

export type ArticleFormValues = z.infer<typeof articleSchema>;