// Migration script to backfill referral codes for users who don't have one
// Run this once to update existing user accounts

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
}, { strict: false });

const User = mongoose.model('User', UserSchema);

async function backfillReferralCodes() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find all users without a referral code
        const usersWithoutCode = await User.find({
            $or: [
                { referralCode: { $exists: false } },
                { referralCode: null },
                { referralCode: '' }
            ]
        });

        console.log(`\n📊 Found ${usersWithoutCode.length} users without referral codes\n`);

        if (usersWithoutCode.length === 0) {
            console.log('✅ All users already have referral codes!');
            await mongoose.disconnect();
            return;
        }

        let updatedCount = 0;
        let errorCount = 0;

        for (const user of usersWithoutCode) {
            try {
                // Generate unique 6-character referral code
                let newReferralCode;
                let isUnique = false;
                let attempts = 0;
                const maxAttempts = 10;

                while (!isUnique && attempts < maxAttempts) {
                    newReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
                    const existing = await User.findOne({ referralCode: newReferralCode });
                    if (!existing) {
                        isUnique = true;
                    }
                    attempts++;
                }

                if (!isUnique) {
                    console.error(`❌ Failed to generate unique code for user ${user.email} after ${maxAttempts} attempts`);
                    errorCount++;
                    continue;
                }

                // Update user with new referral code
                user.referralCode = newReferralCode;
                await user.save();

                updatedCount++;
                console.log(`✅ Updated ${user.email || user.username || user.uuid}: ${newReferralCode}`);

            } catch (error) {
                console.error(`❌ Error updating user ${user.email || user.uuid}:`, error.message);
                errorCount++;
            }
        }

        console.log('\n📈 Migration Summary:');
        console.log(`   Total users processed: ${usersWithoutCode.length}`);
        console.log(`   ✅ Successfully updated: ${updatedCount}`);
        console.log(`   ❌ Errors: ${errorCount}`);

        await mongoose.disconnect();
        console.log('\n✅ Done! Database connection closed.');

    } catch (error) {
        console.error('❌ Migration Error:', error);
        process.exit(1);
    }
}

backfillReferralCodes();
