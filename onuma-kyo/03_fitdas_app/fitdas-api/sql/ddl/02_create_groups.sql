-- public."groups" definition

-- Drop table

-- DROP TABLE public."groups";

CREATE TABLE public."groups" (
	id int8 NOT NULL,
	created_at timestamptz(6) NOT NULL,
	"name" varchar(255) NULL,
	scheduled_start_at time(0) NULL,
	slack_channel_url varchar(255) NULL,
	stamps_to_reward int4 NOT NULL,
	updated_at timestamptz(6) NOT NULL,
	"version" int4 NULL,
	CONSTRAINT groups_pkey PRIMARY KEY (id)
);