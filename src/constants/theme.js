// Professional Sports Prophecy Design System
// Based on modern sports analytics platforms

export const COLORS = {
    // Primary Background Colors
    background: {
        primary: '#0a1628',      // Deep navy - main background
        secondary: '#1a2332',    // Slightly lighter navy
        tertiary: '#0f172a',     // Slate dark
        card: '#1e293b',         // Card background
        overlay: 'rgba(0, 0, 0, 0.95)', // Modal overlay
    },

    // Accent Colors
    accent: {
        cyan: '#00d4ff',         // Primary cyan
        cyanLight: '#1bc5e8',    // Lighter cyan
        cyanDark: '#00a8cc',     // Darker cyan
        gold: '#FFD700',         // Gold - Primary
        goldLight: '#FFE55C',    // Gold Light
        goldDark: '#B8860B',     // Gold Dark
        purple: '#8b5cf6',       // Purple accent
        purpleLight: '#a78bfa',  // Light purple
        lime: '#c0ff00',         // Lime green
        limeAlt: '#a3e635',      // Alternative lime
    },

    // Text Colors
    text: {
        primary: '#ffffff',      // White
        secondary: '#94a3b8',    // Gray
        tertiary: '#64748b',     // Darker gray
        muted: '#475569',        // Very muted
        inverse: '#000000',      // Black (for light backgrounds)
    },

    // Border Colors
    border: {
        primary: '#00d4ff',      // Cyan border
        secondary: '#334155',    // Gray border
        tertiary: '#1e293b',     // Subtle border
    },

    // Status Colors
    status: {
        success: '#10b981',      // Green
        error: '#ef4444',        // Red
        warning: '#f59e0b',      // Orange
        info: '#3b82f6',         // Blue
    },
    // Alias for status (fix for potential typos/legacy code causing crashes)
    state: {
        success: '#10b981',      // Green
        error: '#ef4444',        // Red
        warning: '#f59e0b',      // Orange
        info: '#3b82f6',         // Blue
    },

    // Gradient Combinations
    gradients: {
        primary: ['#00d4ff', '#2979ff'],      // Cyan to blue
        secondary: ['#8b5cf6', '#a78bfa'],    // Purple gradient
        gold: ['#FFD700', '#FFAB00'],         // Gold gradient
        dark: ['#1e293b', '#0f172a'],         // Dark gradient
        lime: ['#c0ff00', '#a3e635'],         // Lime gradient
        disabled: ['#334155', '#334155'],     // Gray (no gradient)
        card: ['#1e293b', '#334155'],         // Card gradient
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
