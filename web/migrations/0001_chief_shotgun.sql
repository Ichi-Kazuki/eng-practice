ALTER TABLE `mock_sessions` ADD `result_snapshot` text;--> statement-breakpoint
ALTER TABLE `mock_sessions` ADD `revision` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX `mock_sessions_user_status_completed_at_idx` ON `mock_sessions` (`user_id`,`status`,`completed_at`);--> statement-breakpoint
CREATE INDEX `mock_sessions_user_created_at_idx` ON `mock_sessions` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `attempts_user_created_at_idx` ON `attempts` (`user_id`,`created_at`);--> statement-breakpoint
DELETE FROM `attempts`
WHERE `mock_session_id` IS NOT NULL
  AND `rowid` NOT IN (
    SELECT MAX(`rowid`)
    FROM `attempts`
    WHERE `mock_session_id` IS NOT NULL
    GROUP BY `mock_session_id`, `question_id`
  );--> statement-breakpoint
CREATE UNIQUE INDEX `attempts_mock_session_question_unique` ON `attempts` (`mock_session_id`,`question_id`);
