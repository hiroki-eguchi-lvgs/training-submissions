export class ArticleDto {
  article_id: number;
  article_title: string;
  content: string;
  tag?: string;
  user_id: string;
  updated_at: Date;
  eyecatch_image?: string;
}
