CREATE TABLE `account_tokens` (
  `token_hash` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `purpose` text NOT NULL CHECK (`purpose` IN ('reset','verify')),
  `created_at` integer NOT NULL,
  `expires_at` integer NOT NULL
);
CREATE INDEX `account_tokens_user_idx` ON `account_tokens` (`user_id`, `purpose`);
CREATE INDEX `account_tokens_expiry_idx` ON `account_tokens` (`expires_at`);
CREATE TABLE `user_verifications` (
  `user_id` text PRIMARY KEY NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `verified_at` integer NOT NULL
);
CREATE TABLE `user_preferences` (
  `user_id` text PRIMARY KEY NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `language` text NOT NULL CHECK (`language` IN ('en','ka','ru'))
);
