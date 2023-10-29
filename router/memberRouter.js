import express from "express";
import {addMember, removeMember} from '../controllers/MemberController.js'

//Middleware to very token and add user id to the req object if the user is valid
import verifyToken from "../middleware/tokenVerify.js";
const router = express.Router();


router.post("/member", verifyToken, addMember)
router.delete("/member/:id", verifyToken, removeMember)

export default router;