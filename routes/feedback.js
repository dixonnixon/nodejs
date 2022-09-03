const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('./cors');

const Feedback = require("../models/feedback");
let authenticate = require("../authenticate");


const feedbackRouter = express.Router();

feedbackRouter.use(bodyParser.json());



feedbackRouter.route('/')
    .options(cors.configureWithOptions, (req, res) => { res.sendStatus(200); })
    // .post(cors.configureWithOptions, authenticate.verifyUser, (req, res, next) => {
    .post(cors.configureWithOptions,  (req, res, next) => {
        Feedback
            .create(req.body)
        .then((feedback) => {
            res.status = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(feedback);
        }, (err) => { 
            // throw new Error(err);
            console.log("err", err);
            // return next(err);
            res.setHeader('Content-Type', 'application/json');
            if(err.code === 11000) {
                res.statusCode(500);
            res.json({code: 11000, statusText: "the field already in collection", 
                fields: Object.keys(err.keyPattern),
                values: Object.values(err.keyValue),
                status: 500
            });
            }
            

        })
        .catch((err) => next(err));
    });

module.exports = feedbackRouter;