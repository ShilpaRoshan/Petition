DROP TABLE IF EXISTS cities;
DROP TABLE IF EXISTS movies;
DROP TABLE IF EXISTS singers;

CREATE TABLE singers(
    id SERIAL PRIMARY KEY,
    name VARCHAR (255) NOT NULL
);

CREATE TABLE movies(
    id SERIAL PRIMARY KEY,
    movie_name VARCHAR (255) NOT NULL,
    year INTEGER NOT NULL,
    singer_id INTEGER NOT NULL REFERENCES singers (id)
);
CREATE TABLE cities(
    id SERIAL PRIMARY KEY,
    singer_id INTEGER NOT NULL REFERENCES singers (id),
    city VARCHAR
);

--SELECT * 
--from singers
-- JOIN movies
-- ON movies.singer_id = singers.id
-- JOIN cities
-- ON cities.singer_id = singers.id
-- WHERE cities.city = 'chennai';
