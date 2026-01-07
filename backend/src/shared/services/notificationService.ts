import nodemailer from 'nodemailer';

// HIGH-PRIORITY ADMIN ALERTS
const ADMIN_EMAIL = 'partnerships@sportsprophecyapp.com';

// Setup Mock Transporter (Update with real SMTP credentials later)
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // Placeholder
    port: 587,
    secure: false,
    auth: {
        user: process.env.SYSTEM_EMAIL,
        pass: process.env.SYSTEM_EMAIL_PASS
    }
});

export const notifyNewSponsorActivity = async (type: 'APPLICATION' | 'PURCHASE' | 'AD_BUILD', data: any) => {
    console.log(`📧 [ALERT] New Sponsor Activity: ${type}`, data);

    const mailOptions = {
        from: '"Arena System" <no-reply@sportsprophecyapp.com>',
        to: ADMIN_EMAIL,
        subject: `🚨 SPONSOR ALERT: ${type} - ${data.brand_name || data.name}`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #0070f3;">New Sponsor Action Detected</h2>
                <p><strong>Type:</strong> ${type}</p>
                <p><strong>Brand:</strong> ${data.brand_name || data.name}</p>
                <p><strong>Email:</strong> ${data.contact_email || data.email}</p>
                <hr />
                <p><strong>Details:</strong></p>
                <pre style="background: #f4f4f4; padding: 10px; border-radius: 5px;">
                    ${JSON.stringify(data, null, 2)}
                </pre>
                <p>Login to the Command Center to review this action.</p>
            </div>
        `
    };

    try {
        // Log to console for now so we see it in Render logs
        console.log(`✅ Notification Sent to ${ADMIN_EMAIL}`);
        // await transporter.sendMail(mailOptions); // Uncomment when SMTP is ready
    } catch (err) {
        console.error('❌ Failed to send admin notification:', err);
    }
};
