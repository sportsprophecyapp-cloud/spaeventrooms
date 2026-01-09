import nodemailer from 'nodemailer';

// NOTE: For production, use environment variables and a dedicated email service like SendGrid or AWS SES.
// For Gmail, you must generate an "App Password" if you have 2-Factor Auth enabled.
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'YOUR_EMAIL@gmail.com', // Placeholder
        pass: process.env.EMAIL_PASS || 'YOUR_APP_PASSWORD'       // Placeholder
    }
});

interface EmailOptions {
    to: string;
    subject: string;
    text: string;
    html: string;
}

export const sendEmail = async (options: EmailOptions) => {
    try {
        const info = await transporter.sendMail({
            from: `"Events Arena" <${process.env.EMAIL_USER}>`,
            ...options
        });
        console.log(`[EMAIL SENT] Message sent: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error("[FATAL] Email could not be sent:", error);
        return false;
    }
};
