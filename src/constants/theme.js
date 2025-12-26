// Professional Sports Prophecy Design System
// Based on modern sports analytics platforms

export const COLORS = {
    // Primary Background Colors (Light Mode)
    background: {
        primary: '#F9FAFB',      // Light Gray - main background
        secondary: '#FFFFFF',    // White - Secondary/Surfaces
        tertiary: '#F3F4F6',     // Gray-100 - Subtle dark
        card: '#FFFFFF',         // Card background (White)
        overlay: 'rgba(0, 0, 0, 0.5)', // Modal overlay
    },

    // Accent Colors
    accent: {
        cyan: '#0ea5e9',         // Sky-500 (Darker for light mode contrast)
        cyanLight: '#38bdf8',    // Sky-400
        cyanDark: '#0284c7',     // Sky-600
        gold: '#d97706',         // Amber-600 (Darker for light mode)
        goldLight: '#fbbf24',    // Amber-400
        goldDark: '#b45309',     // Amber-700
        purple: '#7c3aed',       // Violet-600
        purpleLight: '#a78bfa',  // Violet-400
        lime: '#65a30d',         // Lime-600
        limeAlt: '#84cc16',      // Lime-500
    },

    // Text Colors (Inverted for Light Mode)
    text: {
        primary: '#111827',      // Gray-900 (Nearly Black)
        secondary: '#4B5563',    // Gray-600
        tertiary: '#9CA3AF',     // Gray-400
        muted: '#D1D5DB',        // Gray-300
        inverse: '#FFFFFF',      // White (for dark buttons/badges)
    },

    // Border Colors
    border: {
        primary: '#0ea5e9',      // Cyan border
        secondary: '#E5E7EB',    // Gray-200 (Light border)
        tertiary: '#F3F4F6',     // Gray-100 (Subtle border)
    },

    // Status Colors
    status: {
        success: '#10b981',      // Emerald-500
        error: '#ef4444',        // Red-500
        warning: '#f59e0b',      // Amber-500
        info: '#3b82f6',         // Blue-500
    },
    // Alias for status
    state: {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',
    },

    // Gradient Combinations
    gradients: {
        primary: ['#0ea5e9', '#2563eb'],      // Sky to Blue
        secondary: ['#7c3aed', '#8b5cf6'],    // Violet gradient
        gold: ['#d97706', '#fbbf24'],         // Gold gradient
        dark: ['#1f2937', '#111827'],         // Dark gradient (for inverse elements)
        lime: ['#65a30d', '#84cc16'],         // Lime gradient
        disabled: ['#9CA3AF', '#D1D5DB'],     // Gray
        card: ['#FFFFFF', '#F9FAFB'],         // Card gradient (Subtle)
    },
};

export const TYPOGRAPHY = {
    sizes: {
        xs: 10,
        sm: 12,
        base: 14,
        md: 16,
        lg: 18,
        xl: 20,
        xxl: 24,
        xxxl: 32,
        display: 40,
    },

    weights: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
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
    xxxl: 40,
    huge: 48,
};

export const BORDER_RADIUS = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
};

export const SHADOWS = {
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
    cyan: {
        shadowColor: '#00d4ff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
        elevation: 6,
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
