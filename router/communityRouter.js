import express from "express";
import {createCommunity, getAllCommunity, getAllCommunityMembers, getMyJoinedCommunity, getMyOwnedCommunity, } from '../controllers/CommunityController.js'

//Middleware to very token and add user id to the req object if the user is valid
import verifyToken from "../middleware/tokenVerify.js";

const router = express.Router();


router.post("/community", verifyToken, createCommunity)
router.get("/community", verifyToken, getAllCommunity)
router.get("/community/:id/members", verifyToken, getAllCommunityMembers)
router.get("/community/me/owner", verifyToken, getMyOwnedCommunity)
router.get("/community/me/member", verifyToken, getMyJoinedCommunity)

export default router;