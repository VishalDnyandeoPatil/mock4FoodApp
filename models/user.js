const mongoose = require('mongoose');

const restaurantUserSchema = mongoose.Schema({
    name: {type: String, require: true},
    email: {type: String, require: true},
    password: {type: String, require: true},
    address: {
        street: {type: String, require: true},
        city: {type: String, require: true},
        state: {type: String, require: true},
        country: {type: String, require: true},
        zip: {type: String, require: true},
    },
})

const restaurantUserModel = mongoose.model('users', restaurantUserSchema);

module.exports = { restaurantUserModel };