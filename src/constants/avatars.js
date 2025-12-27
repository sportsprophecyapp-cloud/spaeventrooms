export const AVATAR_CATEGORIES = ['Sports', 'People', 'Flags', 'Animals', 'Teams', 'Badges'];

export const PRESET_AVATARS = {
    Sports: [
        require('../../assets/avatars/sports/premium_1.png'),
        require('../../assets/avatars/sports/premium_2.png'),
        require('../../assets/avatars/sports/premium_3.png'),
        require('../../assets/avatars/sports/premium_4.png'),
        require('../../assets/avatars/sports/sport_1.png'),
        require('../../assets/avatars/sports/sport_2.png'),
        require('../../assets/avatars/sports/sport_3.png'),
        require('../../assets/avatars/sports/sport_4.png'),
        require('../../assets/avatars/sports/sport_5.png'),
        require('../../assets/avatars/sports/sport_6.png'),
        require('../../assets/avatars/sports/sport_7.png'),
        require('../../assets/avatars/sports/sport_8.png'),
        require('../../assets/avatars/sports/sport_9.png'),
    ],
    People: [
        require('../../assets/avatars/people/person_1.png'),
        require('../../assets/avatars/people/person_2.png'),
        require('../../assets/avatars/people/person_3.png'),
        require('../../assets/avatars/people/person_4.png'),
        require('../../assets/avatars/people/person_5.png'),
        require('../../assets/avatars/people/person_6.png'),
        require('../../assets/avatars/people/person_7.png'),
        require('../../assets/avatars/people/person_8.png'),
        require('../../assets/avatars/people/person_9.png'),
    ],
    Flags: [],
    Animals: [],
    Teams: [],
};

export const BADGE_AVATARS = [
    {
        id: 'rookie',
        name: 'Rookie Predictor',
        description: 'Complete your first prediction.',
        icon: 'star',
        color: '#4ADE80',
        secondaryColor: '#166534',
        glowColor: 'rgba(74, 222, 128, 0.4)',
        unlockType: 'predictions',
        unlockThreshold: 1
    },
    {
        id: 'winner',
        name: 'Game Winner',
        description: 'Win your first prediction.',
        icon: 'trophy',
        color: '#FACC15',
        secondaryColor: '#854d0e',
        glowColor: 'rgba(250, 204, 21, 0.4)',
        unlockType: 'wins',
        unlockThreshold: 1
    },
    {
        id: 'expert',
        name: 'Expert Analyst',
        description: 'Win 10 predictions.',
        icon: 'ribbon',
        color: '#38BDF8',
        secondaryColor: '#075985',
        glowColor: 'rgba(56, 189, 248, 0.4)',
        unlockType: 'wins',
        unlockThreshold: 10
    },
    {
        id: 'legend',
        name: 'Prediction Legend',
        description: 'Win 50 predictions.',
        icon: 'diamond',
        color: '#E879F9',
        secondaryColor: '#86198f',
        glowColor: 'rgba(232, 121, 249, 0.4)',
        unlockType: 'wins',
        unlockThreshold: 50
    },
    {
        id: 'architect',
        name: 'Room Architect',
        description: 'Create your first chat room.',
        icon: 'construct',
        color: '#FB923C',
        secondaryColor: '#9a3412',
        glowColor: 'rgba(251, 146, 60, 0.4)',
        unlockType: 'roomsCreated',
        unlockThreshold: 1
    },
    {
        id: 'social',
        name: 'Social Star',
        description: 'Invite 5 friends using your code.',
        icon: 'people',
        color: '#818CF8',
        secondaryColor: '#3730a3',
        glowColor: 'rgba(129, 140, 248, 0.4)',
        unlockType: 'referrals',
        unlockThreshold: 5
    },
    {
        id: 'crown_king',
        name: 'Crown King',
        description: 'Earn 1,000 Crowns total.',
        icon: 'medal',
        color: '#FCD34D',
        secondaryColor: '#92400e',
        glowColor: 'rgba(252, 211, 77, 0.4)',
        unlockType: 'crowns',
        unlockThreshold: 1000
    }
];

export const getAvatarSource = (profilePicture) => {
    if (!profilePicture) return null;

    // Handle badge avatars with prefix
    if (typeof profilePicture === 'string' && profilePicture.startsWith('badge_')) {
        const badgeId = profilePicture.replace('badge_', '');
        return BADGE_AVATARS.find(b => b.id === badgeId);
    }

    // Handle preset avatars
    if (typeof profilePicture === 'string' && profilePicture.startsWith('preset_')) {
        const parts = profilePicture.split('_');
        const category = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
        const index = parseInt(parts[2]) - 1;

        const catKey = category === 'Sports' ? 'Sports' :
            category === 'People' ? 'People' :
                category === 'Flags' ? 'Flags' :
                    category === 'Animals' ? 'Animals' : 'Teams';

        return PRESET_AVATARS[catKey] ? PRESET_AVATARS[catKey][index] : null;
    }

    // Handle raw badge IDs (often used for selectedBadge)
    if (typeof profilePicture === 'string') {
        const badge = BADGE_AVATARS.find(b => b.id === profilePicture);
        if (badge) return badge;

        // SAFETY: Only treat as URI if it looks like a valid URL or base64 image
        // This prevents creating fake URI objects for invalid badge IDs
        if (profilePicture.startsWith('http') || profilePicture.startsWith('data:')) {
            return { uri: profilePicture };
        }

        // Return null for invalid strings instead of creating a fake URI object
        return null;
    }

    // If it's already a require number or object with uri
    return profilePicture;
};
