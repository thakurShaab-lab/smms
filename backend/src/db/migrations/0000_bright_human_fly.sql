CREATE TABLE `permissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `permissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `permissions_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `role_permissions` (
	`role_id` int NOT NULL,
	`permission_id` int NOT NULL,
	CONSTRAINT `role_permissions_role_id_permission_id_pk` PRIMARY KEY(`role_id`,`permission_id`)
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(50) NOT NULL,
	`description` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `roles_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`email` varchar(190) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`role_id` int NOT NULL,
	`status` enum('active','suspended','invited') NOT NULL DEFAULT 'active',
	`must_change_password` boolean NOT NULL DEFAULT false,
	`last_login_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `refresh_tokens` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`user_id` bigint NOT NULL,
	`session_id` bigint NOT NULL,
	`token_hash` varchar(128) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`revoked_at` timestamp,
	`replaced_by_token_hash` varchar(128),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `refresh_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `refresh_tokens_token_hash_unique` UNIQUE(`token_hash`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`user_id` bigint NOT NULL,
	`ip_address` varchar(64),
	`user_agent` varchar(255),
	`is_active` boolean NOT NULL DEFAULT true,
	`last_seen_at` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `teachers` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`user_id` bigint NOT NULL,
	`employee_code` varchar(50) NOT NULL,
	`full_name` varchar(150) NOT NULL,
	`phone` varchar(20),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `teachers_id` PRIMARY KEY(`id`),
	CONSTRAINT `teachers_user_id_unique` UNIQUE(`user_id`),
	CONSTRAINT `teachers_employee_code_unique` UNIQUE(`employee_code`)
);
--> statement-breakpoint
CREATE TABLE `parents` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`user_id` bigint,
	`full_name` varchar(150) NOT NULL,
	`phone` varchar(20),
	`email` varchar(190),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `parents_id` PRIMARY KEY(`id`),
	CONSTRAINT `parents_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `student_parents` (
	`student_id` bigint NOT NULL,
	`parent_id` bigint NOT NULL,
	`relationship` enum('father','mother','guardian') NOT NULL,
	CONSTRAINT `student_parents_student_id_parent_id_pk` PRIMARY KEY(`student_id`,`parent_id`)
);
--> statement-breakpoint
CREATE TABLE `classes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(50) NOT NULL,
	`display_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `classes_id` PRIMARY KEY(`id`),
	CONSTRAINT `classes_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `sections` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`class_id` int NOT NULL,
	`name` varchar(50) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sections_id` PRIMARY KEY(`id`),
	CONSTRAINT `class_section_unique` UNIQUE(`class_id`,`name`)
);
--> statement-breakpoint
CREATE TABLE `students` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`admission_number` varchar(50) NOT NULL,
	`roll_number` varchar(20),
	`full_name` varchar(150) NOT NULL,
	`date_of_birth` date,
	`gender` enum('male','female','other'),
	`class_id` int NOT NULL,
	`section_id` bigint NOT NULL,
	`status` enum('active','graduated','transferred','inactive') NOT NULL DEFAULT 'active',
	`profile_photo_key` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `students_id` PRIMARY KEY(`id`),
	CONSTRAINT `students_admission_number_unique` UNIQUE(`admission_number`)
);
--> statement-breakpoint
CREATE TABLE `face_embeddings` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`student_id` bigint NOT NULL,
	`faiss_label` bigint,
	`source_image_key` varchar(500) NOT NULL,
	`quality_score` float,
	`detection_bbox` json,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `face_embeddings_id` PRIMARY KEY(`id`),
	CONSTRAINT `face_embeddings_faiss_label_unique` UNIQUE(`faiss_label`)
);
--> statement-breakpoint
CREATE TABLE `media` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`uploaded_by_teacher_id` bigint NOT NULL,
	`media_type` enum('photo','video','document','audio') NOT NULL,
	`status` enum('uploaded','processing','completed','failed') NOT NULL DEFAULT 'uploaded',
	`processing_error` varchar(500),
	`original_storage_key` varchar(500) NOT NULL,
	`original_filename` varchar(255) NOT NULL,
	`mime_type` varchar(100) NOT NULL,
	`size_bytes` bigint NOT NULL,
	`class_id` int,
	`section_id` bigint,
	`captured_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `media_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `media_files` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`media_id` bigint NOT NULL,
	`file_role` enum('original','thumbnail','preview','converted','ocr_page') NOT NULL,
	`storage_key` varchar(500) NOT NULL,
	`mime_type` varchar(100) NOT NULL,
	`size_bytes` bigint,
	`width` int,
	`height` int,
	`duration_seconds` float,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `media_files_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `media_mapping` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`media_id` bigint NOT NULL,
	`student_id` bigint NOT NULL,
	`match_confidence` float,
	`matched_by` enum('ai','manual') NOT NULL DEFAULT 'ai',
	`face_bbox` json,
	`frame_timestamp` float,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `media_mapping_id` PRIMARY KEY(`id`),
	CONSTRAINT `media_student_unique` UNIQUE(`media_id`,`student_id`)
);
--> statement-breakpoint
CREATE TABLE `media_metadata` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`media_id` bigint NOT NULL,
	`width` int,
	`height` int,
	`duration_seconds` float,
	`codec` varchar(50),
	`fps` float,
	`frame_count` int,
	`extra` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `media_metadata_id` PRIMARY KEY(`id`),
	CONSTRAINT `media_metadata_media_id_unique` UNIQUE(`media_id`)
);
--> statement-breakpoint
CREATE TABLE `ocr_results` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`media_id` bigint NOT NULL,
	`raw_text` text,
	`extracted_student_name` varchar(150),
	`extracted_admission_number` varchar(50),
	`extracted_roll_number` varchar(20),
	`extracted_class_name` varchar(50),
	`extracted_section_name` varchar(50),
	`matched_student_id` bigint,
	`confidence` float,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ocr_results_id` PRIMARY KEY(`id`),
	CONSTRAINT `ocr_results_media_id_unique` UNIQUE(`media_id`)
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`user_id` bigint,
	`action` varchar(100) NOT NULL,
	`entity_type` varchar(50) NOT NULL,
	`entity_id` varchar(50),
	`metadata` json,
	`ip_address` varchar(64),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_permission_id_permissions_id_fk` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_session_id_sessions_id_fk` FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `teachers` ADD CONSTRAINT `teachers_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `parents` ADD CONSTRAINT `parents_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_parents` ADD CONSTRAINT `student_parents_student_id_students_id_fk` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_parents` ADD CONSTRAINT `student_parents_parent_id_parents_id_fk` FOREIGN KEY (`parent_id`) REFERENCES `parents`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sections` ADD CONSTRAINT `sections_class_id_classes_id_fk` FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `students` ADD CONSTRAINT `students_class_id_classes_id_fk` FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `students` ADD CONSTRAINT `students_section_id_sections_id_fk` FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `face_embeddings` ADD CONSTRAINT `face_embeddings_student_id_students_id_fk` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media` ADD CONSTRAINT `media_uploaded_by_teacher_id_teachers_id_fk` FOREIGN KEY (`uploaded_by_teacher_id`) REFERENCES `teachers`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media` ADD CONSTRAINT `media_class_id_classes_id_fk` FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media` ADD CONSTRAINT `media_section_id_sections_id_fk` FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media_files` ADD CONSTRAINT `media_files_media_id_media_id_fk` FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media_mapping` ADD CONSTRAINT `media_mapping_media_id_media_id_fk` FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media_mapping` ADD CONSTRAINT `media_mapping_student_id_students_id_fk` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media_metadata` ADD CONSTRAINT `media_metadata_media_id_media_id_fk` FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ocr_results` ADD CONSTRAINT `ocr_results_media_id_media_id_fk` FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ocr_results` ADD CONSTRAINT `ocr_results_matched_student_id_students_id_fk` FOREIGN KEY (`matched_student_id`) REFERENCES `students`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;