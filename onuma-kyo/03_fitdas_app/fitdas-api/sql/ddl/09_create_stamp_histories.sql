-- public.stamp_histories definition

-- Drop table

-- DROP TABLE public.stamp_histories;

CREATE TABLE public.stamp_histories (
	id int8 NOT NULL,
	created_at timestamptz(6) NULL,
	card_id int8 NOT NULL,
	stamp_id int8 NOT NULL,
	CONSTRAINT stamp_histories_pkey PRIMARY KEY (id)
);


-- public.stamp_histories foreign keys

ALTER TABLE public.stamp_histories ADD CONSTRAINT fk2mdrert31b3q49f55t6w18a4l FOREIGN KEY (card_id) REFERENCES public.cards(id);
ALTER TABLE public.stamp_histories ADD CONSTRAINT fkjmlmo1qlw9fyu8sv1ywx7arda FOREIGN KEY (stamp_id) REFERENCES public.stamps(id);