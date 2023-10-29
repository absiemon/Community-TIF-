import mongoose from 'mongoose';

const CommunitySchema = new mongoose.Schema({
    id:{type: String, require:true},
    name:{ type: String, require: true},
    slug:{ type: String, require: true, unique: true},
    owner:{type: String, require: true}
}, {timestamps: true,})

// Defining a compound unique index on the 'community' and 'user' fields
CommunitySchema.index({ slug:1 }, { unique: true });

const CommunityModel = mongoose.model('Community', CommunitySchema);

export default CommunityModel