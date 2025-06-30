import mongoose from 'mongoose'

const GmailAccountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    accessToken: {
        type: String,
        required: true,
    },
    refreshToken: {
        type: String,
    },
    tokenExpiryDate: {
        type: Date,
    },
    name: {
        type: String,
        trim: true,
    },
    picture: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
})


export default mongoose.models.GmailAccount || mongoose.model('GmailAccount', GmailAccountSchema)
