-- テーブル設計
-- ユーザーの基本設定
CREATE TABLE users(
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(20) NOT NULL,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password varchar(255) NOT NULL,  
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- ルール
    UNIQUE KEY (user_id),
    UNIQUE KEY (email)
   
);
-- 記事
CREATE TABLE articles(
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT not NULL,
    user_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- ルール
    FOREIGN KEY (user_id) REFERENCES  users(id) ON DELETE CASCADE
);
-- SNS一覧
CREATE TABLE sns_platforms(
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20),
    -- ルール
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE KEY(name)
);
-- ユーザーのSNS
CREATE TABLE sns_links(
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    sns_platform_id INT UNSIGNED NOT NULL,
    sns_url VARCHAR(255) NOT NULL,
    -- ルール
    UNIQUE KEY unique_user_sns (user_id, sns_platform_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (sns_platform_id) REFERENCES sns_platforms(id)
);
-- タグ一覧
CREATE TABLE tags(
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20),
    -- ルール
    UNIQUE KEY(name)
);
-- 記事のタグ
CREATE TABLE article_tags(
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    article_id  INT UNSIGNED NOT NULL,
    tag_id INT UNSIGNED NOT NULL,
    -- ルール
    UNIQUE KEY unique_article_tag(article_id, tag_id),
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id)
);
-- 記事の画像
CREATE TABLE article_images (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    article_id INT UNSIGNED NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    is_main BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_article_image
    FOREIGN KEY (article_id) REFERENCES articles (id)
    ON DELETE CASCADE
);



