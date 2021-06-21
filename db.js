const spicedPg = require("spiced-pg");
const { username, password } = require("./secrets.json");
const database = "petitions";

const db = spicedPg(
    `postgres:${username}:${password}@localhost:5432/${database}`
);

console.log(`[db] Connecting to ,${database}`);

function createSignature({ first_name, last_name, signatures }) {
    return db.query(
        "INSERT INTO petitions (first_name,last_name,signatures)VALUES ($1,$2,$3"
    )[(first_name, last_name, signatures)];
}

function getSignature() {
    return db.query("SELECT * FROM petitions").then((results) => {
        return results.rows;
    });
}
module.exports = { createSignature, getSignature };
