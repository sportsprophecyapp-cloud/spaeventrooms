/**
 * Script to clear all test winners from the database
 * Run with: node backend/scripts/clearTestWinners.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const WinnerSchema = new mongoose.Schema({
    userId: String,
    username: String,
    userAvatar: String,
    prizeName: String,
    quote: String,
    drawId: String,
    isFeatured: Boolean,
    wonAt: Date
});

const Winner = mongoose.models.Winner || mongoose.model('Winner', WinnerSchema);

async function clearTestWinners() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Delete all winners
        const result = await Winner.deleteMany({});
        console.log(`🗑️  Deleted ${result.deletedCount} test winners`);

        console.log('✅ All test winners cleared successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error clearing test winners:', error);
        process.exit(1);
    }
}

clearTestWinners();
