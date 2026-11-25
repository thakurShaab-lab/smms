CREATE TABLE `speaker_embeddings` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`student_id` bigint NOT NULL,
	`faiss_label` bigint,
	`source_audio_key` varchar(500) NOT NULL,
	`quality_score` float,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `speaker_embeddings_id` PRIMARY KEY(`id`),
	CONSTRAINT `speaker_embeddings_faiss_label_unique` UNIQUE(`faiss_label`)
);
--> statement-breakpoint
ALTER TABLE `speaker_embeddings` ADD CONSTRAINT `speaker_embeddings_student_id_students_id_fk` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE cascade ON UPDATE no action;