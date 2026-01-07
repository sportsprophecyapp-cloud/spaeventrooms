// HIGH-PRIORITY ADMIN ALERTS (Render Log System)
const ADMIN_EMAIL = 'partnerships@sportsprophecyapp.com';

/**
 * NOTIFICATION SERVICE
 * Currently logs alerts to the Render Console for admin visibility.
 * Can be upgraded to SMTP/Resend once credentials are provided.
 */
export const notifyNewSponsorActivity = async (type: 'APPLICATION' | 'PURCHASE' | 'AD_BUILD', data: any) => {
    console.log('---------------------------------------');
    console.log(`📧 [ADMIN ALERT] ${type} RECEIVED`);
    console.log(`📍 TARGET: ${ADMIN_EMAIL}`);
    console.log(`🏢 BRAND: ${data.brand_name || data.company_name || 'Unknown'}`);
    console.log(`👤 CONTACT: ${data.contact_email || data.email}`);
    console.log('📝 DATA DUMP:', JSON.stringify(data, null, 2));
    console.log('---------------------------------------');
    
    // Logic: In a production environment with nodemailer installed, 
    // we would call transporter.sendMail() here.
};
