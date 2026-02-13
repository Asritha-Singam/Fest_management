//Is the user logged in? → Authentication
/*
Purpose:
 Verify JWT
 Identify user
 Attach user info to req
*/
import dotenv from "dotenv";

dotenv.config();
import jwt from "jsonwebtoken";


const authMiddleware =(req, res, next)=>{
    try{
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        const token = authHeader.split(" ")[1];

        //Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            id: decoded.userId,
            role: decoded.role
        };
        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized: Invalid token" });    
    }
};
export default authMiddleware;