export const getBadgeForUser = (userId: number): { text: string; style: string; } | null => {
    if (userId >= 2 && userId <= 100) {
        return { text: 'PIONEER', style: 'pioneerBadge' };
    }
    if (userId >= 101 && userId <= 500) {
        return { text: 'SETTLER', style: 'settlerBadge' };
    }
    if (userId >= 501 && userId <= 1000) {
        return { text: 'EXPLORER', style: 'explorerBadge' };
    }
    // Add more tiers as needed
    return null;
};
