CREATE TABLE public.cards (
                              id int8 NOT NULL,
                              created_at timestamptz(6) NOT NULL,
                              generation int4 NOT NULL,
                              updated_at timestamptz(6) NOT NULL,
                              "version" int4 NULL,
                              membership_id int8 NOT NULL,
                              CONSTRAINT cards_pkey PRIMARY KEY (id)
);


-- public.cards foreign keys

ALTER TABLE public.cards ADD CONSTRAINT fks0jrreialfcc2vabjhlxttgns FOREIGN KEY (membership_id) REFERENCES public.memberships(id);