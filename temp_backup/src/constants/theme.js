// Professional Sports Prophecy Design System
// Based on modern sports analytics platforms

export const COLORS = {
    // Primary Backgrounds (Midnight Navy)
    background: {
        primary: '#0a1628',    // Deep base (Landing/App background)
        secondary: '#111827',  // Card/Container background
        tertiary: '#1f2937',   // Inactive inputs/Headers
        card: '#111827',
        overlay: 'rgba(0, 0, 0, 0.7)',
    },

    // Brand Accents
    accent: {
        gold: '#FACC15',       // Crowns, Winners, Trophies (The "Reward" color)
        cyan: '#38bdf8',       // Active selections, Buttons, Primary actions
        lime: '#a3e635',       // Positive stats, Token costs
    },

    // UI Status
    status: {
        success: '#10b981',    // Predicted/Locked
        error: '#ef4444',      // Failed/Alert
        warning: '#f59e0b',    // Live/Soon
        info: '#3b82f6',
    },

    // Typography
    text: {
        primary: '#ffffff',    // Main headings
        secondary: '#94a3b8',  // Subtext/Labels
        tertiary: '#64748b',   // Disabled/Placeholder
        dark: '#0f172a',       // For text sitting on Gold/Cyan buttons
        inverse: '#ffffff',
    },

    // Borders
    border: {
        primary: '#1e293b',
        secondary: '#334155',
        tertiary: '#475569',
        glow: 'rgba(56, 189, 248, 0.5)', // Cyan glow for selection
    },

    // Gradient Combinations
    gradients: {
        primary: ['#38bdf8', '#0ea5e9'],      // Cyan gradient
        gold: ['#FACC15', '#EAB308'],         // Gold gradient
        dark: ['#1F2937', '#111827'],         // Dark gradient
        lime: ['#a3e635', '#84cc16'],         // Lime gradient
    },
};

export const TYPOGRAPHY = {
    weights: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900', // For team names and "VS"
    },
    sizes: {
        xs: 10,
        sm: 12,
        base: 14,
        md: 16,
        lg: 18,
        xl: 20,
        xxl: 24,
        giant: 32,
        display: 40,
    },
    lineHeights: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
    },
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    xxxl: 48,
};

export const BORDER_RADIUS = {
    sm: 4,
    md: 8,
    lg: 16, // Perfect for Game Cards
    xl: 24,
    full: 9999,
};

// Tactical Glow Effect for selected teams
export const SHADOWS = {
    glow: {
        shadowColor: COLORS.accent.cyan,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 5,
    },
    card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.37,
        shadowRadius: 7.49,
        elevation: 8,
    },
};

export const LAYOUT = {
    headerHeight: 60,
    tabBarHeight: 70,
    maxContentWidth: 1200,
    cardMinHeight: 120,
};

// Sport Categories
export const SPORTS = [
    { id: 'all', name: 'All', icon: 'apps' },
    { id: 'nhl', name: 'NHL', icon: 'hockey-puck' },
    { id: 'nfl', name: 'NFL', icon: 'football' },
    { id: 'mlb', name: 'MLB', icon: 'baseball' },
    { id: 'nba', name: 'NBA', icon: 'basketball' },
    { id: 'soccer', name: 'Soccer', icon: 'football-outline' },
    { id: 'mma', name: 'MMA', icon: 'hand-right' },
];

export default {
    COLORS,
    TYPOGRAPHY,
    SPACING,
    BORDER_RADIUS,
    SHADOWS,
    LAYOUT,
    SPORTS,
};
