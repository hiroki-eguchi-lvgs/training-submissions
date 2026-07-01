INSERT INTO roles (id, name, code, created_at, updated_at, version)
VALUES (nextval('roles_seq'), '管理者', 'ROLE_ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0),
       (nextval('roles_seq'), 'スタンプ係', 'ROLE_STAMP_ISSUER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0),
       (nextval('roles_seq'), 'ご褒美の係', 'ROLE_REWARD_MANAGER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0);