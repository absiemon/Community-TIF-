import mongoose from 'mongoose';

const RoleSchema = new mongoose.Schema({
    id:{type: String, require:true},
    name:{ type: String, require: true, unique: true},
}, {timestamps: true,})

const RoleModel = mongoose.model('Role', RoleSchema);

export default RoleModel