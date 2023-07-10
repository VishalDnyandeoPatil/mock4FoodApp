const mongoose = require('mongoose');

const restaurantSchema = mongoose.Schema({
    name: {type: String, require: true},
    address: {
        street: {type: String, require: true},
        city: {type: String, require: true},
        state: {type: String, require: true},
        country: {type: String, require: true},
        zip: {type: String, require: true},
    },
    menu: [{
        name: {type: String, require: true},
        description: {type: String, require: true},
        price: {type: Number, require: true},
        image: {type: String, require: true},
    }],
})

const restaurantModel = mongoose.model('restaurants', restaurantSchema);

module.exports = { restaurantModel };