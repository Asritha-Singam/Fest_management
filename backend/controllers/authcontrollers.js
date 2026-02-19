/*
1. Read data from req.body
2. Check required fields
3. If participantType == IIIT → validate email domain
4. Check if user already exists
5. Hash password using bcrypt
6. Create User document
7. Create Participant document
8. Send success response*/

/* JWT Login Flow:
1. Read email & password from req.body
2. Check if user exists (by email)
3. Compare passwords using bcrypt
4. If invalid → error
5. Generate JWT
6. Send JWT + role in response
*/

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import axios from "axios";
import User from "../models/User.js";
import Participant from "../models/participant.js";
import { logSecurityEvent, trackFailedLogin } from "../middleware/securityMiddleware.js";

export const registerParticipant = async (req, res) => {
    try {
        const { firstName, lastName, email, password, participantType, collegeOrOrg, contactNumber, interests, captchaToken } = req.body;

        // Validate captcha token
        if (!captchaToken) {
            return res.status(400).json({ message: "Captcha verification required" });
        }

        // Verify captcha with Google
        const verify = await axios.post(
            "https://www.google.com/recaptcha/api/siteverify",
            `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`
        );

        if (!verify.data.success) {
            console.error('Captcha verification failed:', verify.data);
            return res.status(400).json({ message: "Captcha failed. Please try again." });
        }
        if (!firstName || !lastName || !email || !password || !participantType || !collegeOrOrg || !contactNumber) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (participantType === "IIIT") {
            const iiitEmailPattern = /@.+\.iiit\.ac\.in$/;
            if (!iiitEmailPattern.test(email)) {
                return res.status(400).json({ message: "IIIT participants must have an @[something].iiit.ac.in email" });
            }
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }
        const saltrounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltrounds);

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: "participant"
        });

        await Participant.create({
            userId: user._id,
            participantType,
            collegeOrOrg,
            contactNumber,
            interests
        });

        return res.status(201).json({ message: "Participant registered successfully" });
    } catch (error) {
        console.error("Error registering participant:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
export const loginUser = async (req, res) => {
    try {
        const { email, password, captchaToken } = req.body;

        // Validate captcha token
        if (!captchaToken) {
            return res.status(400).json({ message: "Captcha verification required" });
        }

        // Verify captcha with Google
        const verify = await axios.post(
            "https://www.google.com/recaptcha/api/siteverify",
            `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`
        );

        if (!verify.data.success) {
            console.error('Captcha verification failed:', verify.data);
            return res.status(400).json({ message: "Captcha failed. Please try again." });
        }

        // email, password, captchaToken already extracted above

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            // Track failed login attempt
            await trackFailedLogin(req, res, () => {});
            return res.status(400).json({ message: "Invalid email or password" });
        }
        if(user.isActive === false){
            await logSecurityEvent('SUSPICIOUS_ACTIVITY', req, {
                email,
                details: 'Attempt to login to disabled account',
                severity: 'MEDIUM'
            });
            return res.status(403).json({ message: "Your account has been disabled. Please contact support." });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // Track failed login attempt
            await trackFailedLogin(req, res, () => {});
            return res.status(400).json({ message: "Invalid email or password" });
        }
        
        // Log successful login
        await logSecurityEvent('SUCCESSFUL_LOGIN', req, {
            email,
            details: 'Successful login',
            severity: 'LOW'
        });
        
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        //send response
        return res.status(200).json({
            message: "Login successful",
            token,
            role: user.role,
         });
    } catch (error) {
        console.error("Error logging in:", error);
        return res.status(500).json({ message: "Server error" });
    }
    
};
