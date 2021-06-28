const express = require("express");
const router = express.Router();
const { createUser, createUserProfile } = require("../db");
const { login } = require("../login.js");
const { hashPassword } = require("../hashPassword.js");
const { checkLogin } = require("../middleware");

//register page shows up
router.get("/register", (request, response) => {
    response.render("register", {
        title: "Register-Page",
    });
});
//register form after entering the data
router.post("/register", (request, response) => {
    //if all the values are not present
    let info = "This email is taken.Please try again!!";
    const { first_name, last_name, email, password } = request.body;
    let error;
    if (!first_name || !last_name || !email || !password) {
        error = `Please fill in the details`;
    }
    if (error) {
        response.render("register", { error });
        return;
    }
    //if present
    hashPassword(request.body.password).then((password_hash) => {
        console.log("[password-hash]", password_hash);
        return createUser({
            first_name,
            last_name,
            email,
            password_hash,
        })
            .then((user) => {
                //console.log("[hi!-id]", user.id);
                request.session.user_id = user.id;
                //set csurf
                response.locals.csrfToken = request.csrfToken();
                response.redirect("/profile");
            })
            .catch((error) => {
                if (error.constraint === "users_email_key") {
                    response.render("register", { info });
                }
            });
    });
});

//userprofile
router.get("/profile", (request, response) => {
    response.render("profile", {
        title: "Profile-Page",
    });
});

router.post("/profile", (request, response) => {
    const { age, city, url } = request.body;
    const user_id = request.session.user_id;
    if (!age && !city && !url) {
        response.redirect("/petition");
        return;
    }
    createUserProfile({ user_id, age, city, url })
        .then(() => {
            response.locals.csrfToken = request.csrfToken();
            response.redirect("/petition");
        })
        .catch((error) => {
            console.log("[error-in-createUserProfile]", error);
            response.sendStatus(400);
        });
});

//login
router.get("/login", (request, response) => {
    response.render("login", {
        title: "Login-Page",
    });
});

router.post("/login", (request, response) => {
    const { email, password } = request.body;
    let error;
    let noUser = "Please enter valid details!!";
    if (!email || !password) {
        error = `Please fill in the details`;
    }
    if (error) {
        response.render("login", { error });
        return;
    }
    login(request.body.email, request.body.password).then((user) => {
        if (!user) {
            response.render("login", { noUser });
            return;
        }
        request.session.user_id = user.id;
        response.locals.csrfToken = request.csrfToken();
        response.redirect("/petition");
    });
});

router.post("/logout", checkLogin, (request, response) => {
    request.session = null;
    response.redirect("/login");
});

module.exports = router;
