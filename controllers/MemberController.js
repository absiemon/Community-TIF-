import MemberModel from "../models/MemberModel.js";
import CommunityModel from "../models/CommunityModel.js";
import { Snowflake } from "@theinternetfolks/snowflake";
import jwt from "jsonwebtoken";
import RoleModel from "../models/RoleModel.js";
const jwt_secret = process.env.JWT_SECRET;

export const addMember = async (req, res) => {
    const { community, user, role } = req.body;
    const { token } = req.cookies;

    if (!community || !user || !role) {
        return res.status(400).json({ error: 'Fields are required' });
    }
    try {
        // For a unique member entry i have added compund index (MemberModel.js)

        //getting the user from req object embedded by middleware after verification of token
        const user = req.user;
        const owner = user.id; // getting the logged in user id who is adding the member
        // checking whether logged in user is having Community Admin role or not
        const member = await MemberModel.findOne({ user: owner, community });

        if (!member) {
            return res.status(404).json({ error: "Non member are not authorized" });
        }
        //If it is a member of the given community then its role in that community should be Community Admin. finding role of the member
        const myRole = await RoleModel.findOne({ id: member.role });
        if (myRole.name !== "Community Admin") {
            return res.status(403).json({ error: "NOT_ALLOWED_ACCESS" });
        }

        // creating id
        const id = Snowflake.generate({ timestamp: 1649156222074 })

        const newMember = new MemberModel({ id, community, user, role });
        //catching error of mongodb while saving the document
        try {
            await newMember.save();
        } catch (error) {
            if (error.code === 11000) {
                return res.status(409).json({ error: 'Member with this credentials already exists' });
            }
        }

        const response = {
            status: true,
            content: {
                data: newMember
            }
        }
        return res.status(200).json(response);

    } catch (err) {
        return res.status(422).json({ error: "Error", details: err.message });
    }
}

export const removeMember = async (req, res) => {
    const { id } = req.params;
    try {
        //getting the user from req object embedded by middleware after verification of token
        const user = req.user;

        const owner = user.id; // getting the logged in user id who is removing the member
        // checking whether logged in user is having Community Admin role or Community Moderator
        const member = await MemberModel.findOne({ user: owner });
        if (!member) {
            return res.status(404).json({ error: "Non member are not authorized" });
        }
        //finding role of the member only Community Admin and Community Moderator can remove member
        const myRole = await RoleModel.findOne({ id: member.role });
        if (myRole.name === "Community Admin" || myRole.name === "Community Moderator") {
            // removing member
            const isDeleted = await MemberModel.findOneAndDelete({ id })
            if (!isDeleted) {
                return res.status(404).json({ error: "Member not found" });
            }
            return res.status(200).json({ status: true });
        }

        return res.status(403).json({ error: "NOT_ALLOWED_ACCESS" });

    } catch (error) {
        return res.status(422).json({ error: "Error", details: error.message });
    }
};