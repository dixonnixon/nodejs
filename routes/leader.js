const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
let authenticate = require("../authenticate");
const cors = require('./cors');


const Leaders = require("../models/leaders");
const leaderRouter = express.Router();

leaderRouter.use(bodyParser.json());

leaderRouter.route('/:leaderId')
    .options(cors.configureWithOptions, (req, res) => { res.sendStatus(200); })

    .delete(cors.configureWithOptions, authenticate.verifyUser, (req, res, next) => {
        // res.end('Deleting leadertion: ' + req.params.leaderId );
        res.end('Deleting leader: ' + req.params.leaderId);
        Leaders.findByIdAndRemove(req.params.leaderId) 
        .then((leader) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(leader);
        }, (err) => next(err))
        .catch((err) => next(err));
    })
    .put(cors.configureWithOptions, authenticate.verifyUser,(req, res, next) => {
        Leaders.findByIdAndUpdate(req.params.leaderId, {
            $set: req.body
        }, {new: true})
        .then((leader) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(leader);
        });
    })
    .post(cors.configureWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /leaders/'+ req.params.leaderId);
    })
    .get(cors.cors, (req,res,next) => {
        // res.end('Will send details of the leader: ' + req.params.leaderId +' to you!');
        Leaders.findById(req.params.leaderId)
        .then((leader) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(leader);
        }, (err) => next(err))
        .catch((err) => next(err));  
    });

leaderRouter.route('/')
    .options(cors.configureWithOptions, (req, res) => { 
        console.log("leaders reached");
        res.sendStatus(200); })

    // .all((req,res,next) => {
    //     res.statusCode = 200;
    //     res.setHeader('Content-Type', 'text/plain');
    //     next();
    // })
    .get(cors.cors, (req,res,next) => {
        // Leaders.find({}).then((leaders) => {
        Leaders.find(req.query).then((leaders) => {
            // console.log(leaders);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            // res.end('Will send all the dishes to you!');

            res.json(leaders);
        }, (err) => next(err))
        .catch((err) => next(err));
    })
    
    .post(cors.configureWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Leaders.create(req.body)
        .then((leader) => {
            // console.log("Leader created", leader);
            res.status = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(leader);
        });
    })
    .put(cors.configureWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /leaders');
    })
    .delete(cors.configureWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Leaders.deleteMany({})
        .then((resp) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
        }, (err) => next(err));
    });



module.exports = leaderRouter;