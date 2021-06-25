const { compare } = require("bcryptjs");
const { getUserByEmail } = require("./db");

function login(email, password) {
    return getUserByEmail(email).then((foundUser) => {
        if (!foundUser) {
            return null;
        }
        return compare(password, foundUser.password_hash).then((match) => {
            if (!match) {
                return null;
            }
            return foundUser;
        });
    });
}
//for register form(converting normal password to hashed one)

module.exports = {
    login,
};
