const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('./cors');

const Dishes = require("../models/dishes");
let authenticate = require("../authenticate");


const dishRouter = express.Router();

dishRouter.use(bodyParser.json());



dishRouter.route('/:dishId')
    .options(cors.configureWithOptions, (req, res) => { res.sendStatus(200); })

    .delete(cors.configureWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.end('Deleting dish: ' + req.params.dishId);
        Dishes.findByIdAndRemove(req.params.dishId) 
        .then((dish) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish);
        }, (err) => next(err))
        .catch((err) => next(err));
    })
    .put(cors.configureWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        // res.write('Updating the dish: ' + req.params.dishId + '\n');
        // res.end('Will update the dish: ' + req.body.name + 
        // ' with details: ' + req.body.description);
        Dishes.findByIdAndUpdate(req.params.dishId, {
            $set: req.body
        }, {new: true})

        .then((dish) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish);
        });
    })
    .post(cors.configureWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /dishes/'+ req.params.dishId);
        
    })
    .get(cors.cors, (req,res,next) => {
        // res.end('Will send details of the dish: ' + req.params.dishId +' to you!');
        Dishes.findById(req.params.dishId)
        .populate('comments.author') 
        .then((dish) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish);
        }, (err) => next(err))
        .catch((err) => next(err));                     
    });

dishRouter.route('/')
    .options(cors.configureWithOptions, (req, res) => { res.sendStatus(200); })

    // .all((req,res,next) => {
    //     res.statusCode = 200;
    //     res.setHeader('Content-Type', 'text/plain');
    //     next();
    // })
    // .get(authenticate.verifyUser, (req,res,next) => {
    .get(cors.cors, (req,res,next) => {
        // if(!req.user) {
        //     let err = new Error("you are not logged in!");
        //     err.status = 403;
        //     next(err);
        //     return;
        //   }
        // Dishes.find({})
        Dishes.find(req.query)
            // .populate('comments.author')
        .then((dishes) => {
                // console.log(dishes);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                // res.end('Will send all the dishes to you!');

                res.json(dishes);
        }, (err) => next(err))
        .catch((err) => next(err));
    })
    
    .post(cors.configureWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        // res.end('Will add the dish: ' + req.body.name + ' with details: ' + req.body.description);
        // Dishes;
        // if(!req.body.price) { //how to validate all fields here OR should it be somewhere else???
        //     err = new Error('Dish <price> not found');
        //     err.status = 404;
        //     return next(err);
        // }
        let dish = new Dishes(req.body);
        const error = dish.validateSync();
        // console.log("DishpostError: ", error.errors);
        if(error) {
            // let err = new Error(JSON.stringify(error.errors));
            // err.status = 403;
            // return next(err);
            res.statusCode = 403;
            res.setHeader('Content-Type', 'application/json');
            res.json(JSON.stringify(error.errors));
            return;
        }

        dish.save()
        .then((dish) => {
            // console.log("Dish created", dish);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish);
        });
    })
    .put(cors.configureWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /dishes');
    })
    .delete(cors.configureWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    // .delete(authenticate.verifyUser,  (req, res, next) => {
        // res.end('Deleting all dishes');
        Dishes.deleteMany({})
        .then((resp) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
        }, (err) => next(err));
    });



module.exports = dishRouter;