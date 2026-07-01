-- public.users definition

-- Drop table

-- DROP TABLE public.users;

CREATE TABLE public.users (
	id int8 NOT NULL,
	created_at timestamptz(6) NOT NULL,
	google_sub_id numeric(38) NULL,
	migrating_stamps int4 NULL,
	migrating_status varchar(255) NULL,
	"name" varchar(255) NULL,
	updated_at timestamptz(6) NOT NULL,
	"version" int4 NULL,
	CONSTRAINT users_migrating_status_check CHECK (((migrating_status)::text = ANY ((ARRAY['PENDING'::character varying, 'MIGRATING'::character varying, 'MIGRATED'::character varying])::text[]))),
	CONSTRAINT users_pkey PRIMARY KEY (id)
);