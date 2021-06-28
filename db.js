const spicedPg = require("spiced-pg");
const { username, password } = require("./secrets.json");
const database = "petitions";
const { hashPassword } = require("./hashPassword.js");

const db = spicedPg(
    `postgres:${username}:${password}@localhost:5432/${database}`
);

console.log(`[db] Connecting to ,${database}`);

function createSignature({ user_id, signature }) {
    return db
        .query(
            "INSERT INTO signatures (user_id, signature) VALUES ($1, $2) RETURNING *",
            [user_id, signature]
        )
        .then((result) => {
            return result.rows[0];
        });
}

function getSignatures() {
    return db
        .query(
            "SELECT first_name, last_name, user_profiles.age, user_profiles.city ,user_profiles.url FROM users JOIN signatures ON signatures.user_id = users.id LEFT JOIN user_profiles ON user_profiles.user_id = users.id WHERE signatures.signature IS NOT NULL"
        )
        .then((result) => {
            return result.rows;
        });
}
function getSignatureById(id) {
    return db
        .query("SELECT * FROM signatures WHERE id = $1", [id])
        .then((result) => {
            return result.rows[0];
        });
}
function getSignatureByUserId(id) {
    return db
        .query("SELECT signature FROM signatures WHERE user_id = $1", [id])
        .then((result) => {
            return result.rows[0];
        });
}
function getCount() {
    return db.query("SELECT count(*) FROM signatures").then((result) => {
        return result.rows[0].count;
    });
}
function createUser({ first_name, last_name, email, password_hash }) {
    return db
        .query(
            "INSERT INTO users (first_name, last_name, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING *",
            [first_name, last_name, email, password_hash]
        )
        .then((result) => {
            return result.rows[0];
        });
}
function getUserByEmail(email) {
    return db
        .query("SELECT * FROM users WHERE email = $1", [email])
        .then((result) => {
            return result.rows[0];
        });
}
function createUserProfile({ user_id, age, city, url }) {
    return db
        .query(
            "INSERT INTO user_profiles (user_id, age, city, url) VALUES($1, $2, $3, $4) RETURNING *",
            [user_id, age || null, city, url]
        )
        .then((result) => {
            return result.rows[0];
        });
}
function getSignaturesByCity(city) {
    return db
        .query(
            "SELECT first_name, last_name, user_profiles.age, user_profiles.url FROM users LEFT JOIN signatures ON signatures.user_id = users.id LEFT JOIN user_profiles ON user_profiles.user_id = users.id WHERE signatures.signature IS NOT NULL AND user_profiles.city ILIKE $1",
            [city]
        )
        .then((result) => {
            return result.rows;
        });
}

function getUserInfoById(id) {
    return db
        .query(
            `SELECT *, user_profiles.*
                    FROM users
                    FULL OUTER JOIN user_profiles
                    ON user_profiles.user_id = users.id
                    WHERE user_profiles.user_id = $1
                    `,
            [id]
        )
        .then((result) => {
            return result.rows[0];
        });
}
function updateUser({ first_name, last_name, email, password, id }) {
    if (password) {
        return hashPassword(password).then((password_hash) => {
            return db
                .query(
                    `UPDATE users 
            SET first_name = $1, last_name = $2, email = $3, password_hash = $4
            WHERE id = $5
            RETURNING *`,
                    [first_name, last_name, email, password_hash, id]
                )
                .then((result) => {
                    return result.rows[0];
                });
        });
    }
    return db
        .query(
            `UPDATE users
        SET first_name = $1, last_name = $2, email = $3
        WHERE id = $4
        RETURNING *
    `,
            [first_name, last_name, email, id]
        )
        .then((result) => {
            return result.rows[0];
        });
}

function upsertUserProfile({ user_id, age, city, url }) {
    if (!age && !city && !url) {
        return;
    }
    return db
        .query(
            `INSERT INTO user_profiles(user_id, age, city, url)
                    VALUES ($1, $2, $3, $4)
                    ON CONFLICT(user_id)
                    DO UPDATE SET age = $2, city = $3, url = $4 RETURNING *`,
            [user_id, age || null, city, url]
        )
        .then((result) => {
            return result.rows[0];
        });
}

function deleteSignature(id) {
    return db
        .query(`DELETE FROM signatures WHERE user_id = $1 `, [id])
        .then((result) => {
            return result.rows[0];
        });
}
module.exports = {
    createSignature,
    getSignatures,
    getSignatureById,
    getCount,
    createUser,
    getUserByEmail,
    getSignatureByUserId,
    createUserProfile,
    getSignaturesByCity,
    getUserInfoById,
    updateUser,
    upsertUserProfile,
    deleteSignature,
};
