import express from "express";
import {createRole, getAllRole} from '../controllers/RoleController.js'

//Middleware to very token and add user id to the req object if the user is valid
import verifyToken from "../middleware/tokenVerify.js";
const router = express.Router();


router.post("/role", verifyToken, createRole)
router.get("/role", verifyToken, getAllRole)

export default router;