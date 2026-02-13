import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email address"]
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false // Don't return password by default in queries
    },
    role: {
        type: String,
        enum: ["participant", "organizer", "admin"],
        default: "participant",
        required: true
    }

},{ timestamps: true});

const User = mongoose.model("User", userSchema);

export default User;