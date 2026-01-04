// Migration script to backfill age verification and TOS acceptance for existing users
// Run this once to update existing user accounts

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

const UserSchema = new mongoose.Schema({
    uuid: String,
    username: String,
    email: String,
    ageVerified: Boolean,
    tosAccepted: Boolean,
    privacyPolicyAccepted: Boolean,
}, { strict: false });

const User = mongoose.model('User', UserSchema);

async function backfillUserConsent() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find all users who haven't been migrated yet
        const usersToUpdate = await User.find({
            $or: [
                { ageVerified: { $ne: true } },
                { tosAccepted: { $ne: true } },
                { privacyPolicyAccepted: { $ne: true } }
            ]
        });

        console.log(`\n📊 Found ${usersToUpdate.length} users to update\n`);

        if (usersToUpdate.length === 0) {
            console.log('✅ All users already have consent fields set!');
            await mongoose.disconnect();
            return;
        }

        let updatedCount = 0;
        let errorCount = 0;

        for (const user of usersToUpdate) {
            try {
                // Update user with consent fields
                user.ageVerified = true;
                user.tosAccepted = true;
                user.tosAcceptedDate = user.tosAcceptedDate || new Date();
                user.privacyPolicyAccepted = true;
                user.privacyPolicyAcceptedDate = user.privacyPolicyAcceptedDate || new Date();

                await user.save();

                updatedCount++;
                console.log(`✅ Updated ${user.email || user.username || user.uuid}`);

            } catch (error) {
                console.error(`❌ Error updating user ${user.email || user.uuid}:`, error.message);
                errorCount++;
            }
        }

        console.log('\n📈 Migration Summary:');
        console.log(`   Total users processed: ${usersToUpdate.length}`);
        console.log(`   ✅ Successfully updated: ${updatedCount}`);
        console.log(`   ❌ Errors: ${errorCount}`);

        await mongoose.disconnect();
        console.log('\n✅ Done! Database connection closed.');

    } catch (error) {
        console.error('❌ Migration Error:', error);
        process.exit(1);
    }
}

backfillUserConsent();
