const spicedPg = require("spiced-pg");
const { username, password } = require("./secrets.json");
const database = "petitions";

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
    return db.query("SELECT * FROM signatures").then((result) => {
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
module.exports = {
    createSignature,
    getSignatures,
    getSignatureById,
    getCount,
    createUser,
    getUserByEmail,
    getSignatureByUserId,
};
