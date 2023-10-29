import express from "express";
import {register, login, getProfile} from '../controllers/Authentication.js'

//Middleware to very token and add user id to the req object if the user is valid
import verifyToken from "../middleware/tokenVerify.js";
const router = express.Router();


router.post("/auth/signup", register)
router.post("/auth/signin", login)
router.get("/auth/me", verifyToken, getProfile)

export default router;