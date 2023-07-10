const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { restaurantUserModel } = require('../models/user')
const { restaurantModel } = require('../models/restaurant')
const { restaurantOrderModel } = require('../models/order')

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { name, email, password, address } = req.body;

        const hashedPassword = await bcrypt.hash(password, 8);

        const user = new restaurantUserModel({
            name,
            email,
            password: hashedPassword,
            address,
        });

        await user.save();

        res.status(201).json({ message: 'Registered successfully' });
    }
    catch (error) {
        console.error('Error in registering :', error);
        res.status(500).json({ error: 'server error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await restaurantUserModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: 'User is not found' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.secret);

        res.status(200).json({ token });
    }
    catch (error) {
        console.error('Error in logging :', error);
        res.status(500).json({ error: 'server error' });
    }
});

router.put('/user/:id/reset', async (req, res) => {
    try {
        const { id } = req.params;
        const { currPass, newPass } = req.body;

        const user = await restaurantUserModel.findById(id);

        if (!user) {
            return res.status(404).json({ error: 'User is not found' });
        }

        const passwordMatch = await bcrypt.compare(currPass, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Wrong password' });
        }

        const hashedPassword = await bcrypt.hash(newPass, 8);

        await restaurantUserModel.findByIdAndUpdate(id, { password: hashedPassword });

        res.status(204).end();
    }
    catch (error) {
        console.error('Error to reset password:', error);
        res.status(500).json({ error: 'server error' })
    }
});


router.get('/restaurants', async (req, res) => {
    try {
        const restaurants = await restaurantModel.find();
        res.status(200).json(restaurants);
    }
    catch (error) {
        console.error('Error to fetch restaurants:', error);
        res.status(500).json({ error: 'server error' });
    }
});

router.get('/restaurants/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const restaurant = await restaurantModel.findById(id);
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant is not found' });
        }
        res.status(200).json(restaurant);
    }
    catch (error) {
        console.error('Error to fetch restaurants:', error);
        res.status(500).json({ error: 'server error' });
    }
});

router.get('/restaurants/:id/menu', async (req, res) => {
    try {
        const { id } = req.params;
        const restaurant = await restaurantModel.findById(id);
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant is not found' });
        }
        res.status(200).json(restaurant.menu);
    }
    catch (error) {
        console.error('Error to fetch restaurants:', error);
        res.status(500).json({ error: 'server error' });
    }
});

router.post('/restaurants/:id/menu', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, image } = req.body;

        const restaurant = await restaurantModel.findById(id);
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant is not found' });
        }

        const newItemMenu = {
            name,
            description,
            price,
            image,
        };

        restaurant.menu.push(newItemMenu);
        await restaurant.save();

        res.status(201).json({ message: 'Item added successfully' });

    }
    catch (error) {
        console.error('Error to fetch restaurants:', error);
        res.status(500).json({ error: 'server error' });
    }
});

router.delete('/restaurants/:restaurantId/menu/:itemId', async (req, res) => {
    try {

        const { restaurantId, itemId } = req.params;

        const restaurant = await restaurantModel.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant is not found' });
        }

        const menuId = restaurant.menu.findIndex((item) => item._id.toString() === itemId);
        if (menuId === -1) {
            return res.status(404).json({ error: 'Menu item not found' });
        }

        restaurant.menu.splice(menuId, 1);
        await restaurant.save();

        res.status(202).json({ message: 'Item deleted successfully' });

    }
    catch (error) {
        console.error('Error to fetch restaurants:', error);
        res.status(500).json({ error: 'server error' });
    }
});


router.post('/orders', async (req, res) => {
    try {
        const { userId, restaurantId, items, deliveryAddress } = req.body;

        
        const user = await restaurantUserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User is not found' });
        }

        
        const restaurant = await restaurantModel.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant is not found' });
        }

        
        let totalPrice = 0;
        items.forEach((item) => {
            const menuItem = restaurant.menu.find((menu) => menu._id.toString() === item.menuItemId);
            if (menuItem) {
                totalPrice += menuItem.price * item.quantity;
            }
        });

       
        const order = new restaurantOrderModel({
            user: userId,
            restaurant: restaurantId,
            items,
            totalPrice,
            deliveryAddress,
            status: 'placed',
        });

        await order.save();

        res.status(201).json({ message: 'Order placed successfully' });
    }
    catch (error) {
        console.error('Error to place order:', error);
        res.status(500).json({ error: 'server error' });
    }
});

router.get('/orders/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const order = await restaurantOrderModel.findById(id).populate('user restaurant');
        if (!order) {
            return res.status(404).json({ error: 'Order is not found' });
        }
        res.status(200).json(order);
    }
    catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.patch('/orders/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const order = await restaurantOrderModel.findById(id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        order.status = status;
        await order.save();

        res.status(204).end();
    }
    catch (error) {
        console.error('Error to updating order status:', error);
        res.status(500).json({ error: 'server error' });
    }
});

module.exports = { router };
