-- public.memberships definition

-- Drop table

-- DROP TABLE public.memberships;

CREATE TABLE public.memberships (
	id int8 NOT NULL,
	created_at timestamptz(6) NULL,
	updated_at timestamptz(6) NULL,
	"version" int4 NULL,
	group_id int8 NOT NULL,
	user_id int8 NOT NULL,
	CONSTRAINT memberships_pkey PRIMARY KEY (id)
);


-- public.memberships foreign keys

ALTER TABLE public.memberships ADD CONSTRAINT fkdjormybfoo7f4i4d4r803qohb FOREIGN KEY (user_id) REFERENCES public.users(id);
ALTER TABLE public.memberships ADD CONSTRAINT fkpt6r69tdax6f92k7p7a4w8m6 FOREIGN KEY (group_id) REFERENCES public."groups"(id);