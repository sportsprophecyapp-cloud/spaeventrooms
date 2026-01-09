import nodemailer from 'nodemailer';

// Production: Use environment variables for SMTP (SendGrid, AWS, Google Workspace, or Custom Domain)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com', // Default to Gmail if not set (legacy support)
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

interface EmailOptions {
    to: string;
    subject: string;
    text: string;
    html: string;
}

export const sendEmail = async (options: EmailOptions) => {
    // FALLBACK: If authentication is missing/default, Log to Console (Dev Mode)
    const isConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASS;

    if (!isConfigured) {
        console.log('\n🔵 ================= [DEV MODE: MOCK EMAIL] =================');
        console.log(`📨  To: ${options.to}`);
        console.log(`📝  Subject: ${options.subject}`);
        console.log(`🔗  Body Preview: ${options.text || options.html}`);
        console.log('🔵 ==========================================================\n');
        return true;
    }

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
