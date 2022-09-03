const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
let authenticate = require("../authenticate");
const cors = require('./cors');

const Promos = require("../models/promos");

const promoRouter = express.Router();

promoRouter.use(bodyParser.json());

promoRouter.route('/:promoId')
    .options(cors.configureWithOptions, (req, res) => { res.sendStatus(200); })

    .delete(cors.configureWithOptions, authenticate.verifyUser,  (req, res, next) => {
        // res.end('Deleting promotion: ' + req.params.promoId );
        res.end('Deleting promo: ' + req.params.promoId);
        Promos.findByIdAndRemove(req.params.promoId) 
        .then((promo) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(promo);
        }, (err) => next(err))
        .catch((err) => next(err));
    })
    .put(cors.configureWithOptions, authenticate.verifyUser, (req, res, next) => {
        Promos.findByIdAndUpdate(req.params.promoId, {
            $set: req.body
        }, {new: true})
        .then((promo) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(promo);
        });
    })
    .post(cors.configureWithOptions,  authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /promos/'+ req.params.promoId);
    })
    .get( (req,res,next) => {
        // // console.log(req, res);
        // res.end('Will send details of the promo: ' + req.params.promoId +' to you!');
        Promos.findById(req.params.promoId)
        .then((dish) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish);
        }, (err) => next(err))
        .catch((err) => next(err));      
    });

promoRouter.route('/')
    .options(cors.configureWithOptions, (req, res) => { res.sendStatus(200); })

    // .all((req,res,next) => {
    //     res.statusCode = 200;
    //     res.setHeader('Content-Type', 'text/plain');
    //     next();
    // })
    .get(cors.cors, (req,res,next) => {
        // Promos.find({}).then((promos) => {
        Promos.find(res.query).then((promos) => {
            // console.log(promos);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            // res.end('Will send all the dishes to you!');

            res.json(promos);
        }, (err) => next(err))
        .catch((err) => next(err));
    })
    
    .post(cors.configureWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        // res.end('Will add the promo: ' + req.body.name + ' with details: ' + req.body.description);
        Promos.create(req.body)
        .then((promo) => {
            // console.log("Promo created", promo);
            res.status = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(promo);
        });
    })
    .put(cors.configureWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /promos');
    })
    .delete(cors.configureWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        // res.end('Deleting all promos');
        Promos.deleteMany({})
        .then((resp) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
        }, (err) => next(err));
    });



module.exports = promoRouter;