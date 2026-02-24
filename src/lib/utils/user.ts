export const getUserTypeIcon = (type: string | null | undefined): string => {
    switch (type) {
        case 'company': return '🏢';
        case 'ong': return '🤝';
        case 'government': return '🏛️';
        case 'professor': return '🧑‍🏫';
        case 'individual':
        default: return '👤';
    }
};
