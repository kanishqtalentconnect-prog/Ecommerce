import mongoose from "mongoose";

const StaticPageSchema = new mongoose.Schema({
    slug: {
        type: String,
        unique: true,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const StaticPage = mongoose.model("StaticPage", StaticPageSchema);

export default StaticPage;