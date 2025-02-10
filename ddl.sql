-- DROP SCHEMA user_document_management;

CREATE SCHEMA user_document_management AUTHORIZATION postgres;

-- DROP SEQUENCE user_document_management.document_id_seq;

CREATE SEQUENCE user_document_management.document_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE user_document_management.ingestion_process_id_seq;

CREATE SEQUENCE user_document_management.ingestion_process_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE user_document_management.role_id_seq;

CREATE SEQUENCE user_document_management.role_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE user_document_management.user_id_seq;

CREATE SEQUENCE user_document_management.user_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE user_document_management.user_token_id_seq;

CREATE SEQUENCE user_document_management.user_token_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;-- user_document_management."document" definition

-- Drop table

-- DROP TABLE user_document_management."document";

CREATE TABLE user_document_management."document" (
	id serial4 NOT NULL,
	title varchar NOT NULL,
	"filePath" varchar NULL,
	"fileName" varchar NULL,
	"mimeType" varchar NULL,
	"fileSize" int4 NULL,
	is_active bool DEFAULT true NOT NULL,
	created_by int4 NULL,
	updated_by int4 NULL,
	created_on timestamp DEFAULT now() NOT NULL,
	updated_on timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "PK_e57d3357f83f3cdc0acffc3d777" PRIMARY KEY (id)
);


-- user_document_management.ingestion_process definition

-- Drop table

-- DROP TABLE user_document_management.ingestion_process;

CREATE TABLE user_document_management.ingestion_process (
	id serial4 NOT NULL,
	"source" varchar NOT NULL,
	status varchar DEFAULT 'in-progress'::character varying NOT NULL,
	created_at timestamp DEFAULT now() NOT NULL,
	updated_at timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "PK_dce4439c02c9ad98171a37cdb67" PRIMARY KEY (id)
);


-- user_document_management."role" definition

-- Drop table

-- DROP TABLE user_document_management."role";

CREATE TABLE user_document_management."role" (
	id serial4 NOT NULL,
	"name" varchar NOT NULL,
	CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY (id),
	CONSTRAINT "UQ_ae4578dcaed5adff96595e61660" UNIQUE (name)
);


-- user_document_management."user" definition

-- Drop table

-- DROP TABLE user_document_management."user";

CREATE TABLE user_document_management."user" (
	id serial4 NOT NULL,
	username varchar NOT NULL,
	"password" varchar NOT NULL,
	"role" int4 NOT NULL,
	is_active bool DEFAULT true NOT NULL,
	created_at timestamp DEFAULT now() NOT NULL,
	updated_at timestamp DEFAULT now() NOT NULL,
	deleted_on timestamp NULL,
	CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id),
	CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE (username)
);


-- user_document_management.user_token definition

-- Drop table

-- DROP TABLE user_document_management.user_token;

CREATE TABLE user_document_management.user_token (
	id serial4 NOT NULL,
	"user" int4 NOT NULL,
	"token" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "PK_48cb6b5c20faa63157b3c1baf7f" PRIMARY KEY (id)
);