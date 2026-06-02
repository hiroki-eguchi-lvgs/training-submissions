-- public.stamps definition

-- Drop table

-- DROP TABLE public.stamps;

CREATE TABLE public.stamps (
	id int8 NOT NULL,
	created_at timestamptz(6) NULL,
	image_path varchar(255) NULL,
	updated_at timestamptz(6) NULL,
	"version" int4 NULL,
	CONSTRAINT stamps_pkey PRIMARY KEY (id)
);