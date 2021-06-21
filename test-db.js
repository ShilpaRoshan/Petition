const { createSignature, getSignature } = require("./db");

createSignature({
    first_name: "shilpa",
    last_name: "roshan",
    signatures: "something",
})
    .then(() => {
        console.log("saved!");
    })
    .then(() => {
        getSignature().then((signatures) => {
            // should contain the signature you just created
            console.log(signatures);
        });
    });
