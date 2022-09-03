const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
let authenticate = require("../authenticate");
const cors = require('./cors');



const Favorites = require("../models/favorites");
const Dishes = require("../models/dishes");
const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
    .options(cors.configureWithOptions, (req, res) => { res.sendStatus(200); })
    .delete(cors.configureWithOptions, authenticate.verifyUser, (req, res, next) => {
        // console.log("delete many handled");
        Favorites.deleteMany({user: req.user._id})
        .then((resp) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
        }, (err) => next(err));
    })
    .get(cors.cors, authenticate.verifyUser, (req,res,next) => {
        // // console.log("TArget dishes", Dishes);
        if(!req.user) {
            let err = new Error("no favorites without User");
            err.status = 403;
            return next(err);
        }
        Favorites.findOne({user: req.user._id})
        .populate("user")
        .populate("dishes")
        // .strictPopulate("comments:author")
        .then((favorites) => {
            // console.log("favorites", favorites);
            if (!favorites) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                // let err = new Error("FAvorites not Exists!");
                // err.status = 403;
                 
                // return next(err);
                return res.json({"exists": false, "favorites": favorites}); 
            }
            else {
                if (favorites.dishes.indexOf(req.params.dishId) < 0) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    return res.json({"exists": false, "favorites": favorites});
                }
                else {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    return res.json({"exists": true, "favorites": favorites});
                }
            }
        }, (err) => next(err))
        .catch((err) => next(err));
    })
    .post(cors.configureWithOptions, authenticate.verifyUser,  (req, res, next) => {
        
        let values = req.body.map(el => el._id);
        let duplicates = values.filter((el, i, arr) => {
            return arr.indexOf(el) !== i;
        });


        // console.log(values, duplicates);
        let distinct = values
            .filter(x => !duplicates.includes(x)).concat(duplicates);
        // console.log(distinct);

        Favorites.findOne({ user: req.user._id}) //check again if any favorites belongs to the <User>
            .then((favorite) => {
                if(favorite !== null ) {
                    favorite.dishes = distinct
                        .filter(x => !favorite.dishes.includes(x))
                        .concat(favorite.dishes.filter(x => !distinct.includes(x)));
                    // console.log("is the dish in the list?", favorite.dishes);
                    favorite.save()
                        .then((favorite) => {
                            Favorites.findById(favorite._id)
                            .populate('user')
                            .populate('dishes')
                            .then((favorite) => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(favorite);                
        
                            }); 
                        })
                        .catch((err) => {
                            return next(err);
                        });
                }
                else { //if no records for this <User>
                    Favorites.create({ user: req.user._id, dishes: distinct})
                    .then((favorite) => {
                        // console.log(favorite);
                        res.json(favorite);
                    });

                }
            });
        // res.json(distinct);
    });

favoriteRouter.route('/:dishId')
    .options(cors.configureWithOptions, (req, res) => { res.sendStatus(200); })

    .delete(cors.configureWithOptions, authenticate.verifyUser,  (req, res, next) => {
        // console.log('Deleting fav: ' ,  req.params, req.query, req.user, req.body);
        Favorites.findOne({ user: req.user._id, }) //check again if any favorites belongs to the <User>
        .then((favorite) => {
            // console.log("delete favorite: ", favorite, favorite.dishes.indexOf(req.params.dishId));
            if(favorite.dishes.length === 0) {
                let err = new Error("now at: " + Date() + " here were not any dishes!");
                err.status = 403;
                next(err);
            }
            else if(favorite.dishes.indexOf(req.params.dishId) !== -1 ) {
                favorite.dishes = favorite.dishes.filter(el => !el.equals(req.params.dishId));
                // console.log("removed dish ", favorite);
                favorite.save().then((favorite) => {
                    Favorites.findById(favorite._id)
                    .populate('user')
                    .populate('dishes')
                    // .populate('comments.author')
                    .then((favorite) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);                

                    }); 
                }, (err) => next(err));
                
            } else return next();
        }, (err) => next(err))
        .catch((err) => next(err));
    })
    .put(cors.configureWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        
        // Dishes.findByIdAndUpdate(req.params.dishId, {
        //     $set: req.body
        // }, {new: true})

        // .then((dish) => {
        //     res.statusCode = 200;
        //     res.setHeader('Content-Type', 'application/json');
        //     res.json(dish);
        // });
    })
    .post(cors.configureWithOptions, authenticate.verifyUser,  (req, res, next) => {

        Favorites.findOne({ user: req.user._id}) //check the favorites dishes belongs to <User>
            .then((favorite) => {
                // console.log("favorites", favorite);
                if(favorite !== null ) {
                    // console.log("is the dish in the list?", favorite.dishes.indexOf(req.params.dishId));
                    if(favorite.dishes.indexOf(req.params.dishId) == -1) {//check duplication of dishesList//!! 
                        favorite.dishes.push(req.params.dishId);
                        favorite.save()
                        .then((favorite) => {
                            Favorites.findById(favorite._id)
                            .populate('user')
                            .populate('dishes')
                            // .populate('comments.author')
                            .then((favorite) => {
                                res.statusCode = 200;
                                
                                res.setHeader('Content-Type', 'application/json');
                                res.json(favorite);                
                                
                            }); 
                        }, (err) => next(err));
                    }
                    else {
                        let err = new Error("dish is already in a list");
                        err.status = 403;
                        next(err);
                    }
                }
                else { //if no records for this <User>
                    Favorites.create({ user: req.user._id, dishes: [req.params.dishId]})
                    .then((favorite) => {
                        // console.log(favorite);
                        res.json(favorite);
                    });

                }
            }, (err) => next(err));
        
    })
    .get(cors.cors, authenticate.verifyUser, (req,res,next) => {
        //Tells If dish is a part of my favorites

        // res.end('Will send details of the dish: ' + req.params.dishId +' to you!');
        Favorites.findOne({user: req.user._id})
        // .populate('comments.author') 
        .then((favorites) => {
            if(!favorites) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({ "exists": false, "favorites": favorites});
            }
            else {
                if(favorites.dishes.indexOf(req.params.dishId) < 0) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    return res.json({ "exists": false, "favorites": favorites});
                }
                else {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    return res.json({ "exists": true, "favorites": favorites});
                }
            }
            // res.statusCode = 200;
            // res.setHeader('Content-Type', 'application/json');
            // res.json(favorites);
        }, (err) => next(err))
        .catch((err) => next(err));                     
    });

module.exports = favoriteRouter;