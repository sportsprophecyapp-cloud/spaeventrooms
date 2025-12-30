// Migration script to set admin referral code to "LOADING"
// Run this once to update your admin account

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

const UserSchema = new mongoose.Schema({
    uuid: String,
    username: String,
    idName: String,
    email: String,
    referralCode: String,
    role: String,
});

const User = mongoose.model('User', UserSchema);

async function setAdminReferralCode() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find admin user
        const adminEmail = 'sportsprophecyapp@gmail.com';

        const admin = await User.findOne({
            $or: [
                { role: 'admin' },
                { email: adminEmail }
            ]
        });

        if (!admin) {
            console.log('❌ Admin user not found. Creating one...');
            const newAdmin = await User.create({
                uuid: `admin-${Date.now()}`,
                username: 'Admin',
                idName: 'Admin',
                email: adminEmail,
                tokens: 1000,
                crowns: 100,
                referralCode: 'LOADING',
                role: 'admin',
                isRegistered: true,
                badges: ['👑 Admin']
            });
            console.log('✅ Admin created with referral code: LOADING');
            console.log(newAdmin);
        } else {
            // Update existing admin
            admin.referralCode = 'LOADING';
            await admin.save();
            console.log('✅ Admin referral code updated to: LOADING');
            console.log(`Admin: ${admin.email} (${admin.username})`);
        }

        await mongoose.disconnect();
        console.log('✅ Done!');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

setAdminReferralCode();
