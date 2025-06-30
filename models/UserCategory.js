import mongoose from "mongoose";

const UserCategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    color: { type: String, enum: ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-gray-500', 'bg-orange-500', "bg-cyan-500", 'bg-teal-500'], required: true }
}, { timestamps: true });

export default mongoose.models.UserCategory ||
    mongoose.model("UserCategory", UserCategorySchema);
