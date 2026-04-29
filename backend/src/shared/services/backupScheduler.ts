import cron from 'node-cron';
import { exec } from 'child_process';
import path from 'path';

export const initBackupScheduler = () => {
    // Run every day at 3:00 AM server time
    cron.schedule('0 3 * * *', () => {
        console.log('⏰ [CRON] Triggering automated nightly backup...');
        
        // Execute the standalone backup script so it runs in a separate process
        // and its process.exit(0) does not kill the main express server.
        const scriptPath = path.join(__dirname, '..', '..', '..', 'scripts', 'node-backup.ts');
        
        // Use ts-node in development, or node with compiled JS in production
        const isProd = process.env.NODE_ENV === 'production';
        const command = isProd 
            ? `node ${path.join(__dirname, '..', '..', '..', 'dist', 'scripts', 'node-backup.js')}`
            : `npx ts-node ${scriptPath}`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ [CRON] Backup execution error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`❌ [CRON] Backup stderr: ${stderr}`);
                return;
            }
            console.log(`✅ [CRON] Backup successfully executed:\n${stdout}`);
        });
    });

    console.log('✅ Automated backup scheduler initialized (Runs daily at 3:00 AM).');
};
