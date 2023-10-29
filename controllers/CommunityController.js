import CommunityModel from "../models/CommunityModel.js";
import { Snowflake } from "@theinternetfolks/snowflake";
import jwt from "jsonwebtoken";
import MemberModel from "../models/MemberModel.js";
import UserModel from "../models/UserModel.js";
import RoleModel from "../models/RoleModel.js";
const jwt_secret = process.env.JWT_SECRET;

export const createCommunity = async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }
    try {
        // For a unique community entry i have added compund index (CommunityModel.js)

        //getting the user from req object embedded by middleware after verification of token
        const user = req.user;
        
        const CommId = Snowflake.generate({ timestamp: 1649156222074 })
        const slug = name.toLowerCase().split(" ").join('-');  // creating slug
        const ownerId = user.id // owner is the curretly logged in user
        const community = new CommunityModel({ id: CommId, name, slug, owner: ownerId });
        //catching error of mongodb while saving the document
        try {
            await community.save();
        } catch (error) {
            if (error.code === 11000) {
                return res.status(409).json({ error: 'Community with this name already exists' });
            }
        }
        const response = {
            status: true,
            content: {
                data: community
            }
        }
        // Logged in user is being made a member with role as Community Admin

        //Finding a role as Community Admin and if it does not exits then creating it 
        let role = await RoleModel.findOne({ name: "Community Admin" });
        if (!role) {
            // If the role doesn't exist, create it
            const id = Snowflake.generate({ timestamp: 1649156222074 })
            role = await RoleModel.create({ id, name: "Community Admin" });
        }
        // creating member
        const memId = Snowflake.generate({ timestamp: 1649156222074 })
        const member = await MemberModel.create({ id: memId, community: CommId, user: ownerId, role: role.id })
        member.save();

        return res.status(200).json(response)


    } catch (err) {
        return res.status(422).json({ error: "Error", details: err.message });
    }
}

export const getAllCommunity = async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Current page
    const perPage = parseInt(req.query.perPage) || 10; // Number of documents per page

    try {
        // Calculating the number of documents to skip from start
        const skip = (page - 1) * perPage;

        const allCommunity = await CommunityModel.find({}).skip(skip).limit(perPage);

        // Counting total number of documents
        const totalDoc = await CommunityModel.countDocuments();

        // Generating response format as required
        const response = {
            status: true,
            content: {
                meta: {
                    total: totalDoc,
                    pages: Math.ceil(totalDoc / perPage),
                    page: page,
                },
                data: await Promise.all(allCommunity.map(async (community) => {
                    // Manually fetching the owner's details based on the owner ID 
                    // we could have populated it but owner is not the mongo _id
                    const owner = await UserModel.findOne({ id: community.owner });

                    return {
                        id: community.id,
                        name: community.name,
                        slug: community.slug,
                        owner: {
                            id: owner.id,
                            name: owner.name,
                        },
                        created_at: community.createdAt,
                        updated_at: community.updatedAt,
                    };
                })),
            },
        };

        res.status(200).json(response);
    } catch (error) {
        return res.status(422).json({ error: "Error", details: err.message });
    }
};

// API to get all members of a particular community
export const getAllCommunityMembers = async (req, res) => {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1; // Current page
    const perPage = parseInt(req.query.perPage) || 10; // Number of documents per page

    try {
        // Calculating the number of documents to skip from the start
        const skip = (page - 1) * perPage;

        // Getting all the members of a community with pagination
        const allMembers = await MemberModel.find({ community: id }).skip(skip).limit(perPage);

        // Counting the total number of documents
        const totalDoc = await MemberModel.countDocuments({ community: id });

        // Constructing the response object, we could have used mongoose populate if we have used mongo 
        // _id to refer a particular role and user
        const response = {
            status: true,
            content: {
                meta: {
                    total: totalDoc,
                    pages: Math.ceil(totalDoc / perPage),
                    page: page,
                },
                data: await Promise.all(allMembers.map(async (member) => {
                    // Manually fetching the user and role details based on the IDs
                    const [user, role] = await Promise.all([
                        UserModel.findOne({ id: member.user }),
                        RoleModel.findOne({ id: member.role }),
                    ]);
                    return {
                        id: member.id,
                        community: member.community,
                        user: {
                            id: user.id,
                            name: user.name,
                        },
                        role: {
                            id: role.id,
                            name: role.name,
                        },
                        created_at: member.createdAt,
                    };
                })),
            },
        };

        res.status(200).json(response);
    } catch (error) {
        return res.status(422).json({ error: "Error", details: error.message });
    }
};

// API to get all owned community by logged in user
export const getMyOwnedCommunity = async (req, res) => {
    const { token } = req.cookies;
    const page = parseInt(req.query.page) || 1; // Current page
    const perPage = parseInt(req.query.perPage) || 10; // Number of documents per page

    try {
        // Calculating the number of documents to skip from start
        const skip = (page - 1) * perPage;

        //getting the user from req object embedded by middleware after verification of token
        const user = req.user;
        const userId = user.id;

        // Getting all the community owned by a particular user with pagination
        const allCommunity = await CommunityModel.find({ owner: userId }).skip(skip).limit(perPage)
        // Counting the total number of community of a owned by particular user
        const totalDoc = await CommunityModel.countDocuments({ owner: userId });

        const response = {
            status: true,
            content: {
                meta: {
                    total: totalDoc,
                    pages: Math.ceil(totalDoc / perPage),
                    page: page,
                },
                data: allCommunity
            },
        }
        return res.status(200).json(response)


    } catch (error) {
        return res.status(422).json({ error: "Error", details: error.message });
    }
};

// API to get all joined community by logged in user (Hardest one!!)
export const getMyJoinedCommunity = async (req, res) => {
    const { token } = req.cookies;
    const page = parseInt(req.query.page) || 1; // Current page
    const perPage = parseInt(req.query.perPage) || 10; // Number of documents per page

    try {
        // Calculating the number of documents to skip from start
        const skip = (page - 1) * perPage;

        //getting the user from req object embedded by middleware after verification of token
        const user = req.user;
        const userId = user.id;

        // Getting all the community ids joined by a particular user
        const allCommunityIds = await MemberModel.distinct('community', { user: userId });

        // Implementing manual pagination coz distinct does not support skip limit
        const startIndex = skip;
        const endIndex = Math.min(startIndex + perPage, allCommunityIds.length);
        const communityIdsForPage = allCommunityIds.slice(startIndex, endIndex);

        // Getting communities based on the paginated community IDs
        const communities = await CommunityModel.find({ id: { $in: communityIdsForPage } });

        const response = {
            status: true,
            content: {
                meta: {
                    total: allCommunityIds.length,
                    pages: Math.ceil(allCommunityIds.length / perPage),
                    page: page,
                },
                data: await Promise.all(communities.map(async (community) => {
                    // Manually fetching the owner's details based on the owner ID 
                    // we could have populated it but owner is not the mongo _id
                    const owner = await UserModel.findOne({ id: community.owner });

                    return {
                        id: community.id,
                        name: community.name,
                        slug: community.slug,
                        owner: {
                            id: owner.id,
                            name: owner.name,
                        },
                        created_at: community.createdAt,
                        updated_at: community.updatedAt,
                    };
                })),
            },
        };
        return res.status(200).json(response)


    } catch (error) {
        return res.status(422).json({ error: "Error", details: error.message });
    }
};