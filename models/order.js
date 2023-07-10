const mongoose = require('mongoose');

const restaurantOrderSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'restaurants' },
  items: [{
    name: {type: String, require: true},
    price: {type: Number, require: true},
    quantity: {type: Number, require: true},
  }],
  totalPrice: {type: Number, require: true},
  deliveryAddress: {
    street: {type: String, require: true},
    city: {type: String, require: true},
    state: {type: String, require: true},
    country: {type: String, require: true},
    zip: {type: String, require: true},
  },
  status: {type: String, require: true},
})

const restaurantOrderModel = mongoose.model('order', restaurantOrderSchema);

module.exports = { restaurantOrderModel };