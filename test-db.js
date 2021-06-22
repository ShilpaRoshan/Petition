//const { response } = require("express");
const {
    createSignature,
    getSignatures,
    getSignatureById,
    getCount,
} = require("./db");

// createSignature({
//     first_name: "shilpa",
//     last_name: "roshan",
//     signature: "something",
// })
//     .then(() => {
//         console.log("saved!");
//         response.cookie("alreadySigned", true);
//         response.redirect("thankyou page");
//     })
//     .then(() => {
//         getSignatures().then((signatures) => {
//             // should contain the signature you just created
//             console.log(signatures);
//         });
//     });
Promise.all([getSignatureById(1), getCount()]).then(([signature, count]) => {
    console.log(signature, count);
});
//
