const { genSalt, hash } = require("bcryptjs");

//for register form(converting normal password to hashed one)
function hashPassword(password) {
    return genSalt().then((salt) => {
        return hash(password, salt);
    });
}

module.exports = {
    hashPassword,
};
