-- CreateTable
CREATE TABLE `users` (
    `user_id` VARCHAR(20) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NULL,
    `sns_link` VARCHAR(255) NULL,
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `articles` (
    `article_id` INTEGER NOT NULL AUTO_INCREMENT,
    `article_title` VARCHAR(255) NOT NULL,
    `content` TEXT NOT NULL,
    `tag` VARCHAR(255) NULL,
    `user_id` VARCHAR(20) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `eyecatch_image` VARCHAR(255) NULL,

    PRIMARY KEY (`article_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `articles` ADD CONSTRAINT `articles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
