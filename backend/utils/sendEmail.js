import nodemailer from 'nodemailer';

// Create transporter function (lazy initialization)
const getTransporter = () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error('Email credentials not configured. Please set EMAIL_USER and EMAIL_PASS in .env file');
    }
    
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
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