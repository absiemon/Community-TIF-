import mongoose from 'mongoose';

const MemberSchema = new mongoose.Schema({
    id:{type: String, require:true},
    community:{ type: String, require: true},
    user:{ type: String, require: true},
    role:{ type: String, require: true},
    
}, {timestamps: true,})

// Defining a compound unique index on the 'community' and 'user' fields
MemberSchema.index({ community: 1, user: 1 }, { unique: true });

const MemberModel = mongoose.model('Member', MemberSchema);

export default MemberModel