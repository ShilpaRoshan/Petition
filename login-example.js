const express = require("express");
const cookieSession = require("cookie-session");
const { genSalt, hash, compare } = require("bcryptjs");

const app = express();

app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

app.use(express.urlencoded({ extended: false }));

const users = ["yo", "yo"];
function foundUserLogin(username, password) {
    //1.check in database users if user is present
    const foundUser = users.find((x) => {
        console.log("[x.username]", x.username);
        return x.username == username;
    });
    //NOT found return  null
    if (!foundUser) {
        return Promise.resolve(null);
    }
    //2.if found then use compare function to compare
    //with password and password_hash and if its match the  return user else return null
    return compare(password, foundUser.password_hash).then((match) => {
        if (!match) {
            return null;
        }
        return foundUser;
    });
}

function hashPassword(password) {
    return genSalt().then((salt) => {
        return hash(password, salt);
    });
}

//login get method
app.get("/login", (request, response) => {
    // renders the form for login with username password and submit
    response.send(`
        <h1>Please login</h1>
        <form action="/login" method="POST">
            <p><input type="text" name="username" required placeholder="Username"></p>
            <p><input type="password" name="password" required placeholder="password"></p>
            <button type="submit">Login</button>
            <p>Not registered? <a href="/register">Please do here!</a></p>
        </form>
    `);
});

//login after filling in the details
app.post("/login", (request, response) => {
    //1.check if there is any username
    //if not found show error
    //redirect to register
    const { username, password } = request.body;
    //2.if user is present then redirect to homepage
    foundUserLogin(username, password).then((user) => {
        console.log("[user]", user);
        if (!user) {
            response.redirect("/register");
            return;
        }
        request.session.user = user;
        console.log("[user-session]", user);
        response.redirect("/");
    });
});

app.get("/register", (request, response) => {
    response.send(`<h1>Please register</h1>
        <form action="/register" method="POST">
            <p><input type="text" name="username" required placeholder="Username"></p>
            <p><input type="password" name="password" required placeholder="password"></p>
            <button type="submit">Register</button>
            <p>Already registered? <a href="/login">Please login here!</a></p>
        </form>`);
});

app.post("/register", (request, response) => {
    //1.check the existing user or password
    //if not redirect to register page

    const { username, password } = request.body;

    if (!username || !password) {
        response.redirect("/register");
        return;
    }
    const existingUser = users.find((x) => {
        return x.username == username;
    });
    if (existingUser) {
        console.log("[existingUser]", username);
        response.redirect("/register");
        return;
    }
    //2.if user is new encrypt the password and store this in db
    //cookie session will contain this user
    //redirect to homepage!
    hashPassword(password).then((password_hash) => {
        //console.log("[password-hash]", password_hash);
        const newUser = { username, password_hash };
        console.log("[new-user]", username, password_hash);
        users.push(newUser);
        request.session.user = newUser;
        response.redirect("/");
    });
});
app.get("/", (request, response) => {
    if (!request.session.user) {
        response.redirect("/login");
        return;
    }
    response.send(`
        <p>Welcome back <strong>${request.session.user.username}<strong>!</p>
        <form action="/logout" method="POST">
            <button type="submit">Logout</button>
        </form>
    `);
});

app.listen(8081, () => {
    console.log("I am listening!!");
});
