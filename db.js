const spicedPg = require("spiced-pg");
const { username, password } = require("./secrets.json");
const database = "petitions";

const db = spicedPg(
    `postgres:${username}:${password}@localhost:5432/${database}`
);

console.log(`[db] Connecting to ,${database}`);

function createSignature({ first_name, last_name, signature }) {
    return db
        .query(
            "INSERT INTO signatures (first_name, last_name, signature) VALUES ($1, $2, $3) RETURNING *",
            [first_name, last_name, signature]
        )
        .then((result) => {
            return result.rows[0].id;
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
function getCount() {
    return db.query("SELECT count(*) FROM signatures").then((result) => {
        return result.rows[0].count;
    });
}
module.exports = { createSignature, getSignatures, getSignatureById, getCount };
