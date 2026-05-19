CREATE TABLE `audit_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`participant_id` integer,
	`visit_id` integer,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text,
	`field_path` text,
	`old_value` text,
	`new_value` text,
	`metadata_json` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `study_users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`participant_id`) REFERENCES `participants`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`visit_id`) REFERENCES `visits`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `audit_user_idx` ON `audit_events` (`user_id`);--> statement-breakpoint
CREATE INDEX `audit_participant_idx` ON `audit_events` (`participant_id`);--> statement-breakpoint
CREATE INDEX `audit_created_idx` ON `audit_events` (`created_at`);--> statement-breakpoint
CREATE TABLE `participants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`study_code` text NOT NULL,
	`codigo` text,
	`iniciais` text NOT NULL,
	`date_of_birth` text NOT NULL,
	`cidade` text,
	`uf` text DEFAULT 'PE',
	`convenio` text,
	`articulacao_indice` text,
	`study_status` text DEFAULT 'Em coleta T0' NOT NULL,
	`inclusion_date` text,
	`protocol_version` text DEFAULT '1.0' NOT NULL,
	`consent_recorded_at` text,
	`excluded_at` text,
	`exclusion_reason` text,
	`created_by_id` integer,
	`updated_by_id` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`created_by_id`) REFERENCES `study_users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updated_by_id`) REFERENCES `study_users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `participants_study_code_unique` ON `participants` (`study_code`);--> statement-breakpoint
CREATE INDEX `participants_status_idx` ON `participants` (`study_status`);--> statement-breakpoint
CREATE INDEX `participants_inclusion_idx` ON `participants` (`inclusion_date`);--> statement-breakpoint
CREATE TABLE `study_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value_json` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `study_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`display_name` text NOT NULL,
	`role` text DEFAULT 'investigator' NOT NULL,
	`is_active` integer DEFAULT 1 NOT NULL,
	`must_change_password` integer DEFAULT 1 NOT NULL,
	`last_login_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `study_users_email_unique` ON `study_users` (`email`);--> statement-breakpoint
CREATE INDEX `study_users_role_idx` ON `study_users` (`role`);--> statement-breakpoint
CREATE TABLE `visits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`participant_id` integer NOT NULL,
	`timepoint` text NOT NULL,
	`assessment_date` text,
	`collection_status` text DEFAULT 'draft' NOT NULL,
	`payload_json` text DEFAULT '{}' NOT NULL,
	`protocol_version` text DEFAULT '1.0' NOT NULL,
	`locked_at` text,
	`locked_by_id` integer,
	`created_by_id` integer,
	`updated_by_id` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`participant_id`) REFERENCES `participants`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`locked_by_id`) REFERENCES `study_users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by_id`) REFERENCES `study_users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updated_by_id`) REFERENCES `study_users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `visits_participant_timepoint_uidx` ON `visits` (`participant_id`,`timepoint`);--> statement-breakpoint
CREATE INDEX `visits_status_idx` ON `visits` (`collection_status`);