
CREATE TABLE stores (
  id            INT          NOT NULL AUTO_INCREMENT,
  store_name    VARCHAR(100) NOT NULL,
  address       VARCHAR(255) NOT NULL,
  latitude      DECIMAL(9,6) NOT NULL,
  longitude     DECIMAL(9,6) NOT NULL,
  serves_lunch  BOOLEAN      NOT NULL,
  serves_dinner BOOLEAN      NOT NULL,
  deleted_at    TIMESTAMP    NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE users (
  id         INT          NOT NULL AUTO_INCREMENT,
  login_id   VARCHAR(255) NOT NULL,
  password   VARCHAR(255) NOT NULL,
  user_name  VARCHAR(50)  NOT NULL,
  role       VARCHAR(20)  NOT NULL DEFAULT 'user',
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_login_id (login_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE store_hours (
  id         INT  NOT NULL AUTO_INCREMENT,
  store_id   INT  NOT NULL,
  open_time  TIME NOT NULL,
  close_time TIME NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_store_hours_store FOREIGN KEY (store_id) REFERENCES stores(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE reviews (
  id         BIGINT        NOT NULL AUTO_INCREMENT,
  user_id    INT           NOT NULL,
  store_id   INT           NOT NULL,
  rating     TINYINT       NOT NULL,
  content    VARCHAR(1000) NOT NULL,
  created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP     NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_reviews_user  FOREIGN KEY (user_id)  REFERENCES users(id),
  CONSTRAINT fk_reviews_store FOREIGN KEY (store_id) REFERENCES stores(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
