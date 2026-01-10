import crypto from 'crypto';

/**
 * Generates a unique referral code.
 * Format: 8 characters, alphanumeric, uppercase.
 */
export const generateReferralCode = (): string => {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
};
