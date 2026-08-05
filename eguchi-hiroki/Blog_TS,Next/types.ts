export interface Article {
  article_id: number;
  article_title: string;
  content: string;
  tag?: string;
  user_id: string;
  updated_at: Date;
  eyecatch_image?: string;
}

export interface User {
  user_id: string;
  password: string;
  email?: string;
  sns_link?: string;
  updated_at: Date;
}