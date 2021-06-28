const express = require("express");
const hb = require("express-handlebars");
const userRoutes = require("./routers/users");
const cookieSession = require("cookie-session");
const csurf = require("csurf");
const path = require("path");
const {
    createSignature,
    getSignatures,
    getCount,

    getSignatureByUserId,

    getSignaturesByCity,
    getUserInfoById,
    updateUser,
    upsertUserProfile,
    deleteSignature,
} = require("./db");

// const { login } = require("./login.js");
// const { hashPassword } = require("./hashPassword.js");

const { checkLogin, checkIfAlreadySigned } = require("./middleware");

const app = express();
app.use(userRoutes);
app.engine("handlebars", hb());
app.set("view engine", "handlebars");
app.locals.helpers = {
    lower: function (arg) {
        return arg.toLowerCase();
    },
};

app.use(express.static(path.join(__dirname, "public")));
app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

app.use(
    express.urlencoded({
        extended: false,
    })
);
//csurf
app.use(csurf());
app.use(function (req, res, next) {
    res.set("x-frame-options", "deny");
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.get("/", (request, response) => {
    response.redirect("/register");
});

//petition
app.get("/petition", checkLogin, checkIfAlreadySigned, (request, response) => {
    response.render("petition", {
        title: "Petition-HomePage",
    });
});

//petition
app.post("/petition", checkLogin, (request, response) => {
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
            response.locals.csrfToken = request.csrfToken();
            response.redirect("/thankyou");
        })
        .catch((error) => {
            console.log("[error-in-createSignature]", error);
            response.sendStatus(404);
        });
});
//thank you page
app.get("/thankyou", checkLogin, (request, response) => {
    Promise.all([getSignatureByUserId(request.session.user_id), getCount()])
        .then(([signature, count]) => {
            console.log("[signature]", signature);
            response.render("thankyou", {
                signature,
                count,
            });
        })
        .catch((error) => {
            console.log("[error-in-promises]", error);
        });
});
//updating user profile
app.get("/profile/edit", checkLogin, (request, response) => {
    const user_id = request.session.user_id;
    getUserInfoById(user_id).then((user) => {
        console.log("[user]", user);
        response.render("profileEdit", {
            title: "Edit-Profile",
            ...user,
        });
    });
});

app.post("/profile/edit", checkLogin, (request, response) => {
    const user_id = request.session.user_id;
    let editLine = "Edit-successful!!";
    Promise.all([
        updateUser({ ...request.body, user_id }),
        upsertUserProfile({ ...request.body, user_id }),
        getUserInfoById(user_id),
    ])
        .then(() => {
            response.render("profileEdit", {
                title: "EDIT Success",
                editLine,
            });
        })
        .catch((error) => {
            console.log("[error-while-editing-profile]", error);
        });
});

app.post("/signature/delete", checkLogin, (request, response) => {
    const user_id = request.session.user_id;
    const { signature } = request.body;
    console.log("[signature-delete-id]", user_id);
    console.log("[signature]", signature);
    deleteSignature(user_id)
        .then((result) => {
            console.log("[result]", result);
            //result.signature = "";
            //request.session.user_id = null;
            response.redirect("/petition");
        })
        .catch((error) => {
            console.log("[error-delete-signature]", error);
        });
});

app.get("/signatures", checkLogin, (request, response) => {
    getSignatures().then((signatures) => {
        // console.log("[signatures]", signatures);
        response.render("signatures", {
            title: "Signatures",
            signatures,
        });
    });
});

app.get("/signatures/:city", checkLogin, (request, response) => {
    const city = request.params.city;
    console.log("[city-parameter]", request.params.city);
    getSignaturesByCity(city).then((result) => {
        console.log("[signatures-city]", result);
        response.render("signatureCity", { result });
    });
});

app.listen(8080, () => {
    console.log("I am listening!!");
});
