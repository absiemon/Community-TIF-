import UserModel from "../models/UserModel.js";
import jwt from 'jsonwebtoken';
const jwt_secret = process.env.JWT_SECRET;

const verifyToken = (req, res, next)=>{
    const {token} = req.cookies;
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized. Token is missing.' });
    }
    try {
        jwt.verify(token, jwt_secret, {}, async (err, data) => {
            if (err) {
                return res.status(498).json({ error: "Error in verifying token. Invalid token" });
            }
            //Finding the user with the id embedded in token
            const user = await UserModel.findOne({id: data.id}, { password: 0 });
            if (!user) {
                return res.status(404).json({ error: 'User not found! Try login in again' });
            }
            req.user = user;
            next();
        })
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Unauthorized. Token has expired.' });
        }
        return res.status(422).json({ error: "Cannot get the user", details: err.message });
    }
    
}

export default verifyToken;