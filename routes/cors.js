const express = require("express");
const cors = require("cors");
const app = express();

const whitelist = [
    'http://localhost:3000',
    'https://localhost:443',
    'http://localhost:3005',
    'https://localhost',
    'https://confusionserver-da545.web.app/'
];
let corsOptionsDelegate = (req, callback) => {
    let corsOptions;
    // console.log("req.header('Origin')", req.header('Origin'), whitelist.indexOf(req.header('Origin')));
    if(whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true };
    }
    else {
        corsOptions = { origin: false }; 
    }
    callback(null, corsOptions);
};

exports.cors = cors();
exports.configureWithOptions = cors(corsOptionsDelegate);