const express = require("express");
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
const path = require("path");
const {
    createSignature,
    getSignatures,
    getSignatureById,
    getCount,
} = require("./db");

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
    const { first_name, last_name, signature } = request.body;
    let error;
    if (!first_name || !last_name || !signature) {
        error = "Please fill in the details required!!";
    }
    if (error) {
        response.render("petition", { error });
        return;
    }
    //success
    //save to database
    createSignature(request.body)
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
    Promise.all([getSignatureById(signature_id), getCount()])
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
