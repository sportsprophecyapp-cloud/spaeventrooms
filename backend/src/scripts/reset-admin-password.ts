import bcrypt from 'bcryptjs';
import pool from '../shared/database';

const resetAdminPassword = async () => {
    const client = await pool.connect();
    try {
        console.log('🚀 Resetting admin password...');

        // IMPORTANT: Replace with the actual password you want to set
        const newPassword = 'your_secure_password_here'; // Replace this line

        const emailToUpdate = 'sportsprophecyapp@gmail.com';

        if (newPassword === 'your_secure_password_here') {
            console.error('❌ ERROR: Please edit the script to set a real password in `reset-admin-password.ts`.');
            process.exit(1);
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const result = await client.query(
            'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id, email',
            [hashedPassword, emailToUpdate]
        );

        if (result.rowCount === 0) {
            console.log(`⚠️  Warning: No user found with email '${emailToUpdate}'. Password was not reset.`);
        } else {
            console.log(`✅ Password for '${emailToUpdate}' has been successfully reset.`);
        }

    } catch (err) {
        console.error('❌ Password reset failed:', err);
    } finally {
        client.release();
        process.exit(0);
    }
};

resetAdminPassword();
