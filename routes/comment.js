const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('./cors');

const Comments = require("../models/comments");
let authenticate = require("../authenticate");


const commentRouter = express.Router();

commentRouter.route('/:commentId')
.options(cors.configureWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    // // console.log("TArget dishes", Dishes);
    Comments.findById(req.params.commentId)
    .populate("author")
    // .strictPopulate("comments:author")
    .then((comment) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(comment);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.configureWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /comments/'+ req.params.commentId);
})
.put(cors.configureWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
// .put(cors.configureWithOptions, authenticate.verifyUser, (req, res, next) => {
    Comments.findById(req.params.commentId)
    .then((comment) => {
        if (comment != null ) {

            //updates only certain fields defined by us)
            //1)what if we don`t want to update the record for a certain
            //  amount of time?
            //2) What if we don`t want to update the record or certain records
            //   at all?
            //3) What if we only want to allow update with certain
            //  user state conditions or env conditions?

            // // console.log("target comment", dish.comments, req.params.commentId,
            //     dish.comments.id(req.params.commentId));
            if(comment.author.equals(req.user._id)) {
                req.body.author = req.user._id;
                
                Comments.findByIdAndUpdate(req.params.commentId, {
                    $set: req.body
                }, {new: true} )
                .then((comment) => {
                    Comments.findById(comment._id)
                    .populate('author')
                    .then((comment) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(comment);
                    })
                }, (err) => next(err));
            }
            else {
                err = new Error('You are not authorized to perform this operation!');
                err.status = 403;
                return next(err);            
            }
        }
        
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);            
        }
        
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.configureWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
// .delete(cors.configureWithOptions, authenticate.verifyUser, (req, res, next) => {
    Comments.findById(req.params.commentId)
    .then((comment) => {

        if (comment != null ) {
            if(comment.author.equals(req.user._id)) {
                req.body.author = req.user._id;
                Comments.findByIdAndRemove(req.params.commentId)
                .then((resp) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(resp);   
                }, (err) => next(err))
                .catch((err) => next(err));
            }
            else {
                let err = new Error('You are not authorized to perform this operation!');
                err.status = 403;
                return next(err);            
            }
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

commentRouter.route('/')
    .options(cors.configureWithOptions, (req, res) => { res.sendStatus(200); })

    .get(cors.cors, (req, res, next) => {
        Comments.find(req.query)
        .populate('author')
        .then((comments) => {
            if ( comments != null) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(comments);
            }
            else {
                err = new Error('Comment ' + req.query + ' not found');
                err.status = 404;
                return next(err);
            }
        }, (err) => next(err))
        .catch((err) => next(err));
    })
    .post(cors.configureWithOptions, authenticate.verifyUser,  (req, res, next) => {
        // // console.log(req.body);
        if(req.body != null) {
            req.body.author = req.user._id;
            Comments.create(req.body)
            .then((comment) => {
                Comments.findById(comment._id)
                .populate('author')
                .then((comment) => {
            
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(comment);
                })
            }, (err) => next(err))
            .catch((err) => next(err));
        }
        else {
            let err = new Error('Comment not found in the req body');
            err.status = 404;
            return next(err);
        }
        
    })
    .put(cors.configureWithOptions, authenticate.verifyUser,  (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /comments/');
    })
    .delete(cors.configureWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Comments.remove({})
        then((response) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(response);
        }, (err) => next(err))
        .catch((err) => next(err));  
    });

commentRouter.use(bodyParser.json());

module.exports = commentRouter;