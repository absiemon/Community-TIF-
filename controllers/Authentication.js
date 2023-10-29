import UserModel from "../models/UserModel.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Snowflake } from "@theinternetfolks/snowflake";
import validator from 'validator';
const jwt_secret = process.env.JWT_SECRET;
import genResponseFromat from '../middleware/resFromat.js'

//API to register user
export const register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All inputs are required' });
        }
        // Validating email using validator.js
        if (!validator.isEmail(email)) {
            return res.status(400).json({ error: 'Please give a valid email' });
        }
        //checking if a user with same email address is already there
        // we can also restrict duplicate entry by adding a compund index in mongodb
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'User with this email already exists' });
        }

        // checking if a password is strong or not (altough it is a frontend task)
        //criteria pasword sould be 6 char long contains one lowercase, uppercase, number and special char
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).*$/
        if (password.length >= 6 && regex.test(password)) {
            // hashing password
            const salt = await bcrypt.genSalt(10);
            const secPassword = await bcrypt.hash(password, salt);
            //generating id using snowflake
            const id = Snowflake.generate({ timestamp: 1649156222074 })
            const user = new UserModel({ id, name, email, password: secPassword });
            await user.save();

            //creating jwt token
            jwt.sign({ id, name, email }, process.env.JWT_SECRET, {}, (err, token) => {
                if (err) {
                    res.status(500).json({ error: "Error in creating token" });
                }
                const created_at = user.createdAt;
                //generating response format as required
                const response = genResponseFromat(id, name, email, created_at, token)
                return res.cookie('token', token, { sameSite: 'none', secure: true }).json(response);
            })
        }
        else {
            res.status(400).json({ error: "Use strong password" });
        }
    }
    catch (err) {
        res.status(422).json({ error: "Registration failed", details: err.message });
    }
}

// API to login the user
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Validating email using validator.js
        if (!validator.isEmail(email)) {
            return res.status(400).json({ error: 'Please give a valid email' });
        }
        const user = await UserModel.findOne({ email });
        if (user) {
            //Comapring given password by user password by dcrypting it
            const passwordCompare = await bcrypt.compare(password, user.password);
            if (passwordCompare) {
                //Creating jwt token with 1 day as expiry
                jwt.sign(
                    { id: user.id, email: user.email, name: user.name, }, process.env.JWT_SECRET,
                    { expiresIn: '1d' }, (err, token) => {
                        if (err) {
                            res.status(500).json({ error: "Error in creating token" });
                        }
                        const created_at = user.createdAt;

                        //generating response format as required
                        const response = genResponseFromat(user.id, user.name, user.email, created_at, token)
                        //sending token in secure cookies with expiration time as 1 day
                        return res.cookie('token', token, {
                            sameSite: 'none',
                            secure: true,
                            maxAge: 24 * 60 * 60 * 1000
                        });
                    })
            }
            else {
                return res.status(400).json({ error: "Invalid credentials" });
            }
        }
        else {
            return res.status(404).json({ error: "User not found" });
        }
    }
    catch (err) {
        res.status(422).json({ error: "Login failed", details: err.message });
    }
}

// get single user
export const getProfile = async (req, res) => {

    try {
        // getting the user from req object embedded by middleware after verification of token
        const user = req.user;
        const response = {
            status: true,
            content: {
                data: {
                    id: user.id, name: user.name, email: user.email,
                    created_at: user.createdAt
                }
            }
        }
        return res.status(200).json(response)
    }
    catch (err) {
        return res.status(422).json({ error: "Cannot get the user", details: err.message });
    }
}
