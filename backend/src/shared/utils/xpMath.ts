/**
 * XP SCALING UTILITY
 * Handles the logic for level progression.
 */

const BASE_XP = 500;

export const getXpForLevel = (level: number): number => {
    // Linear progression: Each level adds 500 more XP than the last
    return level * BASE_XP;
};

export const getLevelFromXp = (totalXp: number): { level: number, progressXp: number, nextLevelXp: number } => {
    let currentLevel = 1;
    let xpCounter = totalXp;
    
    while (xpCounter >= getXpForLevel(currentLevel)) {
        xpCounter -= getXpForLevel(currentLevel);
        currentLevel++;
    }

    return {
        level: currentLevel,
        progressXp: xpCounter,
        nextLevelXp: getXpForLevel(currentLevel)
    };
};
