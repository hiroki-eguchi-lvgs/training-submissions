CREATE TABLE users (
  user_id VARCHAR(20) PRIMARY KEY,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  sns_link VARCHAR(255),
  updated_at DATETIME
);

CREATE TABLE articles (
  article_id INT AUTO_INCREMENT PRIMARY KEY,
  article_title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  tag VARCHAR(255),
  user_id VARCHAR(20) NOT NULL,
  updated_at DATETIME NOT NULL,
  eyecatch_image VARCHAR(255),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);
