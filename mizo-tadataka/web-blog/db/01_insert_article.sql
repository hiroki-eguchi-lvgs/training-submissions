-- 記事データの投入
INSERT INTO articles (title, content, user_id, created_at) VALUES 
('記事タイトル記事タイトル記事タイトル記事タイトル記事タイトル', '本文の一部を表示本文の一部を表示本文の...','1', '2022-04-29 10:00:00'), 
('The taste of Bang Embul''s soto betawi', 'Each region has its own speciality food.', '1','2023-04-25 14:30:00'), 
('Seeing the Beauty of Bali,Which has many statues in temples', 'Talking about Bali is never boring to tell...', '1','2024-04-29 12:00:00');

INSERT INTO articles (title, content, user_id, created_at) VALUES 
('Delisious and cheap Semarang street food','There''s a lot of street food in Semarang..','1','2022-06-05 10:00:00'),
('Karang Bebai beach Lampung for summer vacation','Talking about Bali is never boring to tell..','1','2022-06-05 10:00:00'),
('The upside-down mysticdal forest in Banyuwangi','This place is most often used as a photo..','1','2022-06-13 10:00:00');

-- 画像データの投入
INSERT INTO article_images (article_id, file_name, is_main) VALUES 
(1, 'travel-1.png', 1),
(2, 'image_14.png', 1),
(3, 'image15.png', 1),
(4, 'image19.png', 1),
(5, 'image16.png', 1),
(6, 'image17.png', 1);

-- ユーザーのテストデータを挿入
INSERT INTO users (id, user_id, username, email, password) 
VALUES (1, 'test_user', 'テスト太郎', 'test@example.com', '$argon2id$v=19$m=65536,t=3,p=4$UFOLBanEZ1wGwTVnjjs6vA$CP119MyFeanW6GhuPWHohFDwIEz0fjqktEgjGFKdxYc');