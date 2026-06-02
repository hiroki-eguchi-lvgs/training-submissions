-- public.role_assignments definition

-- Drop table

-- DROP TABLE public.role_assignments;

CREATE TABLE public.role_assignments (
	id int8 NOT NULL,
	created_at timestamptz(6) NULL,
	updated_at timestamptz(6) NULL,
	"version" int4 NULL,
	membership_id int8 NOT NULL,
	role_id int8 NOT NULL,
	CONSTRAINT role_assignments_pkey PRIMARY KEY (id)
);


-- public.role_assignments foreign keys

ALTER TABLE public.role_assignments ADD CONSTRAINT fka6ro7sbrq450y06020bpok3fm FOREIGN KEY (membership_id) REFERENCES public.memberships(id);
ALTER TABLE public.role_assignments ADD CONSTRAINT fkd5rc04ay33vbwdkfbnln8bdi1 FOREIGN KEY (role_id) REFERENCES public.roles(id);