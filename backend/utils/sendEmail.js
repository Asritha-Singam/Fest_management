import nodemailer from 'nodemailer';

// Create transporter function (lazy initialization)
const getTransporter = () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error('Email credentials not configured. Please set EMAIL_USER and EMAIL_PASS in .env file');
    }
    
    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false
        },
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 10000,
        socketTimeout: 10000,
        family: 4 // Force IPv4 instead of IPv6
    });
};

export const sendEmail = async (to, subject, htmlContent, attachments = [], headers = {}) => {
    const transporter = getTransporter();
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html: htmlContent,
        attachments,
        headers,
    });
};