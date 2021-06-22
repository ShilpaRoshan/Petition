const cookieSession = require("cookie-session");
const express = require("express");

const app = express();

app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

app.get("/", (request, response) => {
    if (request.session.id) {
        console.log("already Signed!!");
        response.send("login" + request.session.id);
    } else {
        response.send(`<a href="/login">Please Login</a>`);
    }
});

app.get("/login", (request, response) => {
    request.session.id = 5;
    response.send('<a href="/">Back to the homepage</a>');
});

app.listen(8081, () => {
    console.log("session!!");
});
