// Categories and their associated search terms for Unsplash
const CATEGORIES = {
    'Academic': ['study', 'library', 'university', 'education', 'research'],
    'Sports': ['sports', 'athletics', 'fitness', 'training', 'team'],
    'Arts': ['art', 'painting', 'music', 'theater', 'dance'],
    'Technology': ['technology', 'coding', 'computer', 'robotics', 'innovation'],
    'Cultural': ['culture', 'diversity', 'international', 'heritage', 'tradition'],
    'Science': ['science', 'laboratory', 'experiment', 'research', 'chemistry'],
    'Business': ['business', 'entrepreneurship', 'startup', 'finance', 'marketing'],
    'Language': ['language', 'communication', 'international', 'writing', 'speaking'],
    'Environmental': ['environment', 'nature', 'sustainability', 'eco', 'green'],
    'Gaming': ['gaming', 'esports', 'video games', 'competition', 'digital']
};

// Group name templates
const GROUP_TEMPLATES = {
    'Academic': [
        'Study Group', 'Research Society', 'Academic Club', 'Learning Network',
        'Scholars Association', 'Honor Society', 'Tutorial Group', 'Study Circle',
        'Academic Excellence', 'Knowledge Hub'
    ],
    'Sports': [
        'Sports Club', 'Athletics Team', 'Fitness Group', 'Training Club',
        'Sports Society', 'Athletic Association', 'Fitness Community', 'Sports League',
        'Training Academy', 'Sports Network'
    ],
    // ... similar templates for other categories
};

// Generate group descriptions
function generateDescription(category) {
    const descriptions = {
        'Academic': [
            'A community dedicated to academic excellence and collaborative learning.',
            'Supporting students through shared knowledge and study resources.',
            'Fostering academic growth through peer-to-peer learning.',
            'Building strong foundations for academic success together.'
        ],
        'Sports': [
            'Join us for regular training sessions and friendly competitions.',
            'Stay fit and healthy while making new friends.',
            'Develop your athletic skills in a supportive environment.',
            'Compete, train, and grow with fellow sports enthusiasts.'
        ],
        // Add more descriptions for other categories
    };
    
    const defaultDescriptions = [
        'A vibrant community of like-minded individuals.',
        'Join us to learn, share, and grow together.',
        'Connect with others who share your interests.',
        'A supportive space for collaboration and growth.'
    ];

    const categoryDescriptions = descriptions[category] || defaultDescriptions;
    return categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)];
}

// Generate member counts
function generateMemberCount() {
    const bases = [50, 100, 150, 200, 250, 300];
    const variation = Math.floor(Math.random() * 50);
    return bases[Math.floor(Math.random() * bases.length)] + variation;
}

// Generate all groups
function generateGroups() {
    const groups = [];
    let id = 1;

    Object.entries(CATEGORIES).forEach(([category, searchTerms]) => {
        const templates = GROUP_TEMPLATES[category] || ['Group', 'Club', 'Society', 'Community', 'Network'];
        
        // Generate 20-30 groups per category
        const count = 20 + Math.floor(Math.random() * 11);
        
        for (let i = 0; i < count; i++) {
            const template = templates[Math.floor(Math.random() * templates.length)];
            const searchTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
            
            groups.push({
                id: id++,
                name: `${category} ${template} ${String.fromCharCode(65 + (i % 26))}`,
                category: category,
                description: generateDescription(category),
                members: generateMemberCount(),
                searchTerm: searchTerm
            });
        }
    });

    return groups;
}

export const groups = generateGroups();
export { CATEGORIES }; 