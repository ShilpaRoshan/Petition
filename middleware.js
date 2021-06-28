const { getSignatureByUserId } = require("./db");
const checkLogin = (request, response, next) => {
    if (!request.session.user_id) {
        response.redirect("/login");
        return;
    }
    next();
};
const checkIfAlreadySigned = (request, response, next) => {
    getSignatureByUserId(request.session.user_id).then((signature) => {
        if (signature) {
            response.redirect("/thankyou");
            return;
        }
        next();
    });
};

module.exports = {
    checkLogin,
    checkIfAlreadySigned,
};
