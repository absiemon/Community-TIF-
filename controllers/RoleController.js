import RoleModel from "../models/RoleModel.js";
import { Snowflake } from "@theinternetfolks/snowflake";
import validator from 'validator';

export const createRole = async (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }
    try {
        // token verification is added in middleware 

        //checking if a role with same name is already there
        // we can also restrict duplicate entry by adding a compund index in mongodb
        const existingRole = await RoleModel.findOne({ name });
        if (existingRole) {
            return res.status(409).json({ error: 'Role with this name already exists' });
        }
        const id = Snowflake.generate({ timestamp: 1649156222074 })
        const role = new RoleModel({ id, name });
        await role.save();

        const response = {
            status: true,
            content: {
                data: {
                    id, name,
                    created_at: role.createdAt,
                    updated_at: role.updatedAt
                }
            }
        }
        return res.status(200).json(response)
    } catch (err) {
        return res.status(422).json({ error: "Error", details: err.message });
    }
}

export const getAllRole = async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Current page
    const perPage = parseInt(req.query.perPage) || 10; // Number of documents per page

    try {
         // token verification is added in middleware 
         
        // Calculating the number of documents to skip from start
        const skip = (page - 1) * perPage;

        const roles = await RoleModel.find({}).skip(skip).limit(perPage);

        // Counting total number of roles
        const totalRoles = await RoleModel.countDocuments();

        const response = {
            status: true,
            content: {
                meta: {
                    total: totalRoles,
                    pages: Math.ceil(totalRoles / perPage),
                    page: page,
                },
                data: roles.map(role => ({
                    id: role.id, 
                    name: role.name, 
                    created_at: role.createdAt, 
                    updated_at: role.updatedAt,
                })),
            },
        };

        res.status(200).json(response);
    } catch (error) {
        return res.status(422).json({ error: "Error", details: err.message });
    }
};