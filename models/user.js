let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let passportLocalMongoose = require("passport-local-mongoose");


// let User = new Schema({
//     username: {
//         type: String,
//         required: true,
//         unique: true
//     },
//     password: {
//         type: String,
//         required: true
//     },
//     isAdmin: {
//         type: Boolean,
//         default: false
//     }
// });
let User = new Schema({
    username: { type: String, required: true },
    nickname: { type: String, default: '' },
    lastname: { type: String, default: '' },

    admin: {
        type: Boolean,
        default: false
    },
    facebookId: String
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", User);