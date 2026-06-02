-- public.roles definition

-- Drop table

-- DROP TABLE public.roles;

CREATE TABLE public.roles (
	id int8 NOT NULL,
	code varchar(255) NOT NULL,
	created_at timestamptz(6) NOT NULL,
	"name" varchar(255) NULL,
	updated_at timestamptz(6) NOT NULL,
	"version" int4 NULL,
	CONSTRAINT roles_code_check CHECK (((code)::text = ANY ((ARRAY['ROLE_ADMIN'::character varying, 'ROLE_STAMP_ISSUER'::character varying, 'ROLE_REWARD_MANAGER'::character varying])::text[]))),
	CONSTRAINT roles_pkey PRIMARY KEY (id),
	CONSTRAINT ukch1113horj4qr56f91omojv8 UNIQUE (code)
);