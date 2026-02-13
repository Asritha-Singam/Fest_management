import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDB } from "./config/db.js"

import bcrypt from "bcrypt";
import User from "./models/User.js";

const PORT = process.env.PORT;

const createAdminIfNotExists = async ()=>{
    const adminEmail = process.env.ADMIN_EMAIL;
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
        const adminUser = new User({
            firstName: "System",
            lastName: "Admin",
            email: adminEmail,
            password: hashedPassword,
            role: "admin"
        });
        await adminUser.save();
        console.log("Admin user created with email:", adminEmail);
    }
}

connectDB();
createAdminIfNotExists();
app.listen(PORT, () => {
    console.log(`Server started on PORT ${PORT}!`);
});
// app.put();
// app.post();
// app.delete();
