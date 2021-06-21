DROP TABLE IF EXISTS petitions;

CREATE TABLE petitions(
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    signatures TEXT NOT NULL CHECK (signatures !='')
);