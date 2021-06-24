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
            .then((id) => {
                console.log("[hi!-id]", id);
                request.session.id = id;
                response.redirect("/petition");
            })
            .catch((error) => {
                if (error.constraint === "users_email_key") {
                    response.render("register", { info });
                }
            });
    });
});

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
    }
    login(request.body.email, request.body.password).then((user) => {
        if (!user) {
            response.render("login", { noUser });
            return;
        }
        request.session.user = user;
        response.redirect("/petition");
    });
});

//homepage
app.get("/petition", (request, response) => {
    if (request.session.signature_id) {
        response.redirect("/thankyou");
        return;
    }
    response.render("petition", {
        title: "Petition-HomePage",
        //db,
    });
});
//Submit form
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
        .then((id) => {
            request.session.signature_id = id;
            response.redirect("/thankyou");
        })
        .catch((error) => {
            console.log("[error-in-createSignature]", error);
            response.sendStatus(404);
        });
});
//thank you page
app.get("/thankyou", (request, response) => {
    const signature_id = request.session.signature_id;
    if (!signature_id) {
        response.redirect("/petition");
        return;
    }

    // getSignatureById(signature_id).then((signature) => {
    //     response.render("thankyou", {
    //         title: "Thank-You",
    //         signature,
    //         //count: getCount(),
    //     });
    // });
    Promise.all([getSignatureByUserId(signature_id), getCount()])
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
        response.render("signatures", {
            title: "Signatures",
            signatures,
        });
    });
});

app.listen(8080, () => {
    console.log("I am listening!!");
});
