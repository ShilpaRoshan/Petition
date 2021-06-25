--drop existing table
DROP TABLE IF EXISTS user_profiles;
--drop existing table
DROP TABLE IF EXISTS signatures;
--drop existing table
DROP TABLE IF EXISTS users;

CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE signatures(
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users (id),
    signature TEXT NOT NULL CHECK (signature !='')
);

CREATE TABLE user_profiles(
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users (id),
    age INTEGER,
    city VARCHAR (255),
    url VARCHAR (255)
);



SELECT *, user_profiles.*
FROM users
FULL JOIN user_profiles
ON user_profiles.user_id = users.id;



