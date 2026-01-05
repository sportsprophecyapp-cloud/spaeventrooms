import { Request, Response } from 'express';
import { query as dbQuery } from '../database';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-12-15.clover',
});

interface AuthRequest extends Request {
    user?: {
        id: number;
        email: string;
    };
}

// Submit sponsor application
export const submitApplication = async (req: Request, res: Response) => {
    try {
        const {
            company_name,
            contact_email,
            contact_name,
            phone,
            website_url,
            product_description,
            logo_url,
            promo_code,
            discount_description,
            sponsor_type, // 'subscription' or 'commission'
            tier, // 'starter', 'growth', 'premium' (for subscription)
            placements, // ['homepage', 'login', 'footer']
            message
        } = req.body;

        // Validation
        if (!company_name || !contact_email || !sponsor_type) {
            return res.status(400).json({
                success: false,
                error: 'Company name, contact email, and sponsor type are required'
            });
        }

        if (sponsor_type === 'subscription' && !tier) {
            return res.status(400).json({
                success: false,
                error: 'Tier is required for subscription sponsors'
            });
        }

        if (sponsor_type === 'commission' && !promo_code) {
            return res.status(400).json({
                success: false,
                error: 'Promo code is required for commission sponsors'
            });
        }

        // Insert application
        const result = await dbQuery(
            `INSERT INTO sponsor_applications 
       (company_name, contact_email, contact_name, phone, website_url, 
        product_description, logo_url, promo_code, discount_description, 
        sponsor_type, tier, placements, message, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'pending', NOW(), NOW())
       RETURNING id`,
            [
                company_name,
                contact_email,
                contact_name,
                phone,
                website_url,
                product_description,
                logo_url,
                promo_code,
                discount_description,
                sponsor_type,
                tier,
                placements || [],
                message
            ]
        );

        res.json({
            success: true,
            message: 'Application submitted successfully. We\'ll contact you within 24 hours.',
            application_id: result.rows[0].id
        });
    } catch (error) {
        console.error('Error submitting sponsor application:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to submit application'
        });
    }
};

// Get all applications (admin only)
export const getApplications = async (req: AuthRequest, res: Response) => {
    try {
        const { status } = req.query;

        let query = 'SELECT * FROM sponsor_applications';
        const params: any[] = [];

        if (status) {
            query += ' WHERE status = $1';
            params.push(status);
        }

        query += ' ORDER BY created_at DESC';

        const result = await dbQuery(query, params);

        res.json({
            success: true,
            applications: result.rows
        });
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch applications'
        });
    }
};

// Approve application and create sponsor (admin only)
export const approveApplication = async (req: AuthRequest, res: Response) => {
    try {
        const { applicationId } = req.params;
        const { notes } = req.body;

        // Get application
        const appResult = await dbQuery(
            'SELECT * FROM sponsor_applications WHERE id = $1',
            [applicationId]
        );

        if (appResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Application not found'
            });
        }

        const app = appResult.rows[0];

        // Determine monthly fee based on tier
        let monthly_fee = null;
        if (app.sponsor_type === 'subscription') {
            const fees: Record<string, number> = {
                starter: 99,
                growth: 299,
                premium: 599
            };
            monthly_fee = fees[app.tier] || 0;
        }

        // Create sponsor
        const sponsorResult = await dbQuery(
            `INSERT INTO sponsors 
       (application_id, company_name, contact_email, logo_url, website_url, 
        promo_code, discount_description, sponsor_type, tier, placements, 
        monthly_fee, commission_rate, status, is_active, notes, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 2.00, 'active', true, $12, NOW(), NOW())
       RETURNING id`,
            [
                applicationId,
                app.company_name,
                app.contact_email,
                app.logo_url,
                app.website_url,
                app.promo_code,
                app.discount_description,
                app.sponsor_type,
                app.tier,
                app.placements || [],
                monthly_fee,
                notes
            ]
        );

        // Update application status
        await dbQuery(
            'UPDATE sponsor_applications SET status = $1, updated_at = NOW() WHERE id = $2',
            ['approved', applicationId]
        );

        res.json({
            success: true,
            message: 'Application approved and sponsor created',
            sponsor_id: sponsorResult.rows[0].id
        });
    } catch (error) {
        console.error('Error approving application:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to approve application'
        });
    }
};

// Get all sponsors (admin only)
export const getAllSponsors = async (req: AuthRequest, res: Response) => {
    try {
        const { type, status } = req.query;

        let query = 'SELECT * FROM sponsors WHERE 1=1';
        const params: any[] = [];
        let paramIndex = 1;

        if (type) {
            query += ` AND sponsor_type = $${paramIndex}`;
            params.push(type);
            paramIndex++;
        }

        if (status) {
            query += ` AND status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        query += ' ORDER BY created_at DESC';

        const result = await dbQuery(query, params);

        res.json({
            success: true,
            sponsors: result.rows
        });
    } catch (error) {
        console.error('Error fetching sponsors:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch sponsors'
        });
    }
};

// Generate Stripe invoice for sponsor (admin only)
export const generateInvoice = async (req: AuthRequest, res: Response) => {
    try {
        const { sponsorId } = req.params;
        const { month_year, sales_amount } = req.body; // e.g., '2026-01', 500

        // Get sponsor
        const sponsorResult = await dbQuery(
            'SELECT * FROM sponsors WHERE id = $1',
            [sponsorId]
        );

        if (sponsorResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Sponsor not found'
            });
        }

        const sponsor = sponsorResult.rows[0];

        // Calculate commission
        const commission_rate = sponsor.commission_rate || 2.00;
        const commission_amount = (sales_amount * commission_rate) / 100;
        const total_amount = sponsor.sponsor_type === 'subscription'
            ? sponsor.monthly_fee
            : commission_amount;

        // Create Stripe payment link
        const paymentLink = await stripe.paymentLinks.create({
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: sponsor.sponsor_type === 'subscription'
                                ? `${sponsor.tier} Tier Sponsorship - ${month_year}`
                                : `Commission Payment - ${month_year}`,
                            description: sponsor.sponsor_type === 'commission'
                                ? `Sales: $${sales_amount}, Commission: ${commission_rate}%`
                                : undefined,
                        },
                        unit_amount: Math.round(total_amount * 100), // Convert to cents
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                sponsor_id: sponsorId,
                month_year,
                payment_type: sponsor.sponsor_type,
            },
        });

        // Record payment
        await dbQuery(
            `INSERT INTO sponsor_payments 
       (sponsor_id, month_year, payment_type, sales_amount, commission_amount, 
        subscription_amount, total_amount, payment_status, stripe_payment_link, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8, NOW(), NOW())
       RETURNING id`,
            [
                sponsorId,
                month_year,
                sponsor.sponsor_type,
                sales_amount || null,
                commission_amount || null,
                sponsor.sponsor_type === 'subscription' ? sponsor.monthly_fee : null,
                total_amount,
                paymentLink.url
            ]
        );

        res.json({
            success: true,
            payment_link: paymentLink.url,
            total_amount,
            commission_amount: sponsor.sponsor_type === 'commission' ? commission_amount : null
        });
    } catch (error) {
        console.error('Error generating invoice:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate invoice'
        });
    }
};

// Mark payment as paid (admin only)
export const markPaymentPaid = async (req: AuthRequest, res: Response) => {
    try {
        const { paymentId } = req.params;

        await dbQuery(
            `UPDATE sponsor_payments 
       SET payment_status = 'paid', payment_date = NOW(), updated_at = NOW()
       WHERE id = $1`,
            [paymentId]
        );

        res.json({
            success: true,
            message: 'Payment marked as paid'
        });
    } catch (error) {
        console.error('Error marking payment as paid:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to mark payment as paid'
        });
    }
};

// Get active sponsors for placement (public)
export const getActiveSponsors = async (req: Request, res: Response) => {
    try {
        const { placement } = req.query; // 'homepage', 'login', 'footer'

        let query = `
      SELECT id, company_name, logo_url, website_url, promo_code, discount_description, placements
      FROM sponsors
      WHERE is_active = true AND status = 'active'
    `;

        const params: any[] = [];

        if (placement) {
            query += ` AND $1 = ANY(placements)`;
            params.push(placement);
        }

        query += ' ORDER BY created_at ASC';

        const result = await dbQuery(query, params);

        res.json({
            success: true,
            sponsors: result.rows
        });
    } catch (error) {
        console.error('Error fetching active sponsors:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch sponsors'
        });
    }
};
