CREATE TABLE public.group_stamp_assignments
(
    id         int8           NOT NULL,
    created_at timestamptz(6) NULL,
    group_id   int8           NOT NULL,
    stamp_id   int8           NOT NULL,
    CONSTRAINT group_stamp_assignments_pkey PRIMARY KEY (id)
);


-- public.group_stamp_assignments foreign keys

ALTER TABLE public.group_stamp_assignments
    ADD CONSTRAINT fk6ap5nwx7hjx0oho3qljym09rd FOREIGN KEY (group_id) REFERENCES public."groups" (id);
ALTER TABLE public.group_stamp_assignments
    ADD CONSTRAINT fkrqx1oevf2pmj2wt275gl38wqw FOREIGN KEY (stamp_id) REFERENCES public.stamps (id);