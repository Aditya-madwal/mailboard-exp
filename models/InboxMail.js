// models/InboxMail.js

import mongoose from "mongoose";

const inboxMailSchema = new mongoose.Schema(
    {
        gmailAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'GmailAccount', required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        messageId: { type: String, required: true },
        threadId: { type: String },
        snippet: { type: String },
        subject: { type: String },
        from: { type: String },
        to: { type: String },

        cc: [{ type: String }],     // ✅ now array
        bcc: [{ type: String }],    // ✅ now array

        date: {
            type: Date
        },
        senderName: { type: String },
        senderEmail: { type: String },
        senderPicture: { type: String, default: null },

        body: { type: String, default: '' },
        attachments: [
            {
                filename: String,
                mimeType: String,
                attachmentId: String,
            },
        ],
        isCategorized: { type: Boolean, default: false },

        gmailCategory: {
            type: String,
            enum: ['primary', 'social', 'promotions', 'updates', 'forums'],
            default: 'primary'
        },

        // ✅ One user-defined category per email
        UserCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'UserCategory',
            default: null
        },

        isUnread: { type: Boolean, default: true },
        labelIds: [String],
    },
    { timestamps: true }
)

inboxMailSchema.index({ messageId: 1, user: 1 }, { unique: true })

export default mongoose.models.InboxMail ||
    mongoose.model("InboxMail", inboxMailSchema);
