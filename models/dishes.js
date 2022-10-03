const mongoose = require('mongoose');
require('mongoose-currency').loadType(mongoose);

const Currency = mongoose.Types.Currency;
const Schema = mongoose.Schema;

console.log("Dishes model");

const dishSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    label: {
        type: String,
        required: [true, 'label required'],
    },
    price: {
        type: Currency,
        required: true,
        min: 0
    },
    featured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

var Dishes = mongoose.model('Dish', dishSchema);
module.exports = Dishes;
