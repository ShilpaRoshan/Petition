const express = require("express");
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
const path = require("path");
const {
    createSignature,
    getSignatures,
    getSignatureById,
    getCount,
    createUser,
    getSignatureByUserId,
    createUserProfile,
} = require("./db");

const { hashPassword, login } = require("./login.js");

const app = express();
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(express.static(path.join(__dirname, "public")));
app.use(
    express.urlencoded({
        extended: false,
    })
);
//app.use(cookieParser());
// app.use((request, response, next) => {
//     if (request.cookies.alreadySigned) {
//         response.redirect("/thankyou");
//     }
//     next();
// });

app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);
app.get("/", (request, response) => {
    response.redirect("/register");
});
//register page shows up
app.get("/register", (request, response) => {
    response.render("register", {
        title: "Register-Page",
    });
});
//register form after entering the data
app.post("/register", (request, response) => {
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
                console.log("[hi!-id]", user.id);
                request.session.user_id = user.id;
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
app.get("/profile", (request, response) => {
    response.render("profile", {
        title: "Profile-Page",
    });
});

app.post("/profile", (request, response) => {
    const { age, city, url } = request.body;
    const user_id = request.session.user_id;
    if (!age || !city || !url) {
        response.redirect("/petition");
        return;
    }
    createUserProfile({ user_id, age, city, url })
        .then(() => {
            console.log("[user-profile]");
            response.redirect("/petition");
        })
        .catch((error) => {
            console.log("[error-in-createUserProfile]", error);
            response.sendStatus(404);
        });
});

//login
app.get("/login", (request, response) => {
    response.render("login", {
        title: "Login-Page",
    });
});

app.post("/login", (request, response) => {
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
        response.redirect("/petition");
    });
});

app.post("/logout", (request, response) => {
    request.session = null;
    response.redirect("/login");
});

//petition
app.get("/petition", (request, response) => {
    getSignatureByUserId(request.session.user_id).then((signature) => {
        if (signature) {
            response.redirect("/thankyou");
            return;
        }
        response.render("petition", {
            title: "Petition-HomePage",
        });
    });
});
//petition
app.post("/petition", (request, response) => {
    const { signature } = request.body;
    const user_id = request.session.user_id;
    let error;
    if (!signature) {
        error = "Please sign here!!";
    }
    if (error) {
        response.render("petition", { error });
        return;
    }
    //success
    //save to database
    createSignature({ user_id, signature })
        .then(() => {
            response.redirect("/thankyou");
        })
        .catch((error) => {
            console.log("[error-in-createSignature]", error);
            response.sendStatus(404);
        });
});
//thank you page
app.get("/thankyou", (request, response) => {
    Promise.all([getSignatureByUserId(request.session.user_id), getCount()])
        .then(([signature, count]) => {
            console.log(count);
            response.render("thankyou", {
                signature,
                count,
            });
        })
        .catch((error) => {
            console.log("[error-in-promises]", error);
        });
});

app.get("/signatures", (request, response) => {
    getSignatures().then((signatures) => {
        console.log("[signatures]", signatures);
        response.render("signatures", {
            title: "Signatures",
            signatures,
        });
    });
});

app.listen(8080, () => {
    console.log("I am listening!!");
});
