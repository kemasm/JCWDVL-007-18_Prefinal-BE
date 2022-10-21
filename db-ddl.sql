-- jugggle.post definition

CREATE TABLE `post` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `post_content` varchar(255) NOT NULL,
  `post_category` int DEFAULT NULL,
  `post_created_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `post_created_by` varchar(255) NOT NULL,
  `post_number_of_reactions` int DEFAULT '0',
  `post_caption` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- jugggle.post_reaction definition

CREATE TABLE `post_reaction` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `post_id` bigint NOT NULL,
  `user_id` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- jugggle.user_account definition

CREATE TABLE `user_account` (
  `id` varchar(255) NOT NULL,
  `user_email` varchar(255) NOT NULL,
  `user_password` varchar(255) NOT NULL,
  `user_full_name` varchar(255) NOT NULL,
  `user_avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `user_username` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `user_is_verified` tinyint DEFAULT '0',
  `user_verification_code` varchar(255) DEFAULT NULL,
  `user_bio` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_account_email_unique` (`user_email`),
  UNIQUE KEY `user_account_username_unique` (`user_username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- jugggle.post_comment definition

CREATE TABLE `post_comment` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `post_id` bigint NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `comment_content` varchar(300) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `comment_created_date` timestamp NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;