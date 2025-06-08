// Utility function to generate a random number within a range
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate a random timestamp within the last 24 hours
function getRandomRecentTimestamp() {
    const now = new Date();
    const hoursAgo = getRandomInt(1, 24);
    const timestamp = new Date(now - hoursAgo * 60 * 60 * 1000);
    return timestamp.toISOString();
}

export const DEFAULT_POSTS = [
    {
        id: 'post1',
        author: 'Sarah Chen',
        authorId: 'user123',
        avatar: 'https://avatar.iran.liara.run/public/job/teacher/female',
        content: 'Just finished my research paper on quantum computing! 🎉 Anyone else interested in quantum mechanics?',
        timestamp: getRandomRecentTimestamp(),
        likes: 42,
        likedBy: ['user456', 'user789'],
        comments: [
            { 
                id: 'comment1',
                authorId: 'user456',
                author: 'Alex Kim', 
                content: 'Congratulations! Would love to read it', 
                likes: 5,
                timestamp: getRandomRecentTimestamp(),
                likedBy: []
            },
            { 
                id: 'comment2',
                authorId: 'user789',
                author: 'Maria Garcia', 
                content: 'Quantum computing is fascinating! Let\'s discuss over coffee', 
                likes: 3,
                timestamp: getRandomRecentTimestamp(),
                likedBy: []
            }
        ]
    },
    {
        id: 'post2',
        author: 'James Wilson',
        authorId: 'user456',
        avatar: 'https://avatar.iran.liara.run/public/job/lawyer/male',
        content: '🏀 Big game this weekend! Come support our basketball team against State University! #CampusSpirit',
        timestamp: getRandomRecentTimestamp(),
        likes: 89,
        likedBy: ['user123'],
        comments: [
            { 
                id: 'comment3',
                authorId: 'user234',
                author: 'Emma Thompson', 
                content: 'Can\'t wait! Go team! 🎉', 
                likes: 8,
                timestamp: getRandomRecentTimestamp(),
                likedBy: []
            }
        ]
    },
    {
        id: 'post3',
        author: 'Emily Rodriguez',
        authorId: 'user789',
        avatar: 'https://avatar.iran.liara.run/public/job/designer/female',
        content: 'Just launched the new art exhibition in the Student Center! Open all week, featuring works from our talented students! 🎨',
        timestamp: getRandomRecentTimestamp(),
        likes: 156,
        likedBy: ['user123', 'user456'],
        comments: [
            { 
                id: 'comment4',
                authorId: 'user123',
                author: 'David Lee', 
                content: 'The installations look amazing!', 
                likes: 15,
                timestamp: getRandomRecentTimestamp(),
                likedBy: []
            }
        ]
    },
    {
        id: 'post4',
        author: 'Michael Chang',
        authorId: 'user234',
        avatar: 'https://avatar.iran.liara.run/public/job/programmer/male',
        content: '💻 Just finished building my first machine learning model! The results are promising. Anyone interested in collaborating on AI projects?',
        timestamp: getRandomRecentTimestamp(),
        likes: 73,
        likedBy: [],
        comments: []
    }
];

// Array of fake users for generating engagement
const FAKE_USERS = [
    { id: 'bot1', name: 'Alex Thompson', avatar: 'https://avatar.iran.liara.run/public/boy' },
    { id: 'bot2', name: 'Emma Wilson', avatar: 'https://avatar.iran.liara.run/public/girl' },
    { id: 'bot3', name: 'James Chen', avatar: 'https://avatar.iran.liara.run/public/man' },
    { id: 'bot4', name: 'Sofia Rodriguez', avatar: 'https://avatar.iran.liara.run/public/woman' },
    { id: 'bot5', name: 'Marcus Johnson', avatar: 'https://avatar.iran.liara.run/public/boy' },
    { id: 'bot6', name: 'Lily Zhang', avatar: 'https://avatar.iran.liara.run/public/girl' }
];

const ENGAGEMENT_COMMENTS = [
    "This is amazing! 🎉",
    "Great point! Totally agree with you.",
    "Thanks for sharing this! 👏",
    "Really interesting perspective 🤔",
    "Can't wait to learn more about this!",
    "This is exactly what I needed to hear today 💯",
    "You always share the best content!",
    "This is going to help so many people",
    "Love how you explained this 👌",
    "Count me in! This sounds fantastic",
    "Such an important topic to discuss",
    "This deserves more attention 🚀",
    "Brilliant insights as always!",
    "This made my day! Thank you for sharing",
    "Looking forward to more content like this"
];

// Function to generate random engagement for a new post
function generateFakeEngagement() {
    const numLikes = getRandomInt(5, 25);
    const numComments = getRandomInt(1, 4);
    const likedBy = [];
    const comments = [];

    // Generate likes
    const shuffledUsers = [...FAKE_USERS].sort(() => Math.random() - 0.5);
    for (let i = 0; i < numLikes; i++) {
        if (i < shuffledUsers.length) {
            likedBy.push(shuffledUsers[i].id);
        }
    }

    // Generate comments
    const shuffledComments = [...ENGAGEMENT_COMMENTS].sort(() => Math.random() - 0.5);
    for (let i = 0; i < numComments; i++) {
        const user = FAKE_USERS[getRandomInt(0, FAKE_USERS.length - 1)];
        comments.push({
            id: 'comment' + Date.now() + i,
            author: user.name,
            authorId: user.id,
            content: shuffledComments[i],
            timestamp: getRandomRecentTimestamp(),
            likes: getRandomInt(1, 8),
            likedBy: []
        });
    }

    return {
        likes: numLikes,
        likedBy,
        comments
    };
}

// Function to get user's posts and comments
export function getUserContent(userId) {
    const posts = JSON.parse(localStorage.getItem('posts')) || DEFAULT_POSTS;
    
    return {
        posts: posts.filter(post => post.authorId === userId),
        comments: posts.flatMap(post => 
            post.comments.filter(comment => comment.authorId === userId)
                .map(comment => ({
                    ...comment,
                    postId: post.id,
                    postContent: post.content.substring(0, 50) + '...',
                    postAuthor: post.author
                }))
        )
    };
}

// Function to format timestamp
export function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
}

// Update the addPost function to include fake engagement
export function addPost(postData) {
    const posts = JSON.parse(localStorage.getItem('posts')) || DEFAULT_POSTS;
    
    // Generate fake engagement after a short delay
    setTimeout(() => {
        const engagement = generateFakeEngagement();
        postData.likes = engagement.likes;
        postData.likedBy = engagement.likedBy;
        postData.comments = engagement.comments;
        
        // Update the post in storage
        const updatedPosts = posts.map(p => p.id === postData.id ? postData : p);
        localStorage.setItem('posts', JSON.stringify(updatedPosts));
        
        // Dispatch an event to notify that posts have been updated
        window.dispatchEvent(new CustomEvent('postsUpdated'));
    }, 2000); // Delay for 2 seconds to make it feel more natural
    
    // Initially add the post with no engagement
    posts.unshift(postData);
    localStorage.setItem('posts', JSON.stringify(posts));
    return posts;
}

// Function to add a comment
export function addComment(postId, commentData) {
    const posts = JSON.parse(localStorage.getItem('posts')) || DEFAULT_POSTS;
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.comments.push(commentData);
        localStorage.setItem('posts', JSON.stringify(posts));
    }
    return posts;
}

// Function to toggle like on post
export function togglePostLike(postId, userId) {
    const posts = JSON.parse(localStorage.getItem('posts')) || DEFAULT_POSTS;
    const post = posts.find(p => p.id === postId);
    if (post) {
        const likedIndex = post.likedBy.indexOf(userId);
        if (likedIndex === -1) {
            post.likedBy.push(userId);
            post.likes++;
        } else {
            post.likedBy.splice(likedIndex, 1);
            post.likes--;
        }
        localStorage.setItem('posts', JSON.stringify(posts));
    }
    return posts;
}

// Function to toggle like on comment
export function toggleCommentLike(postId, commentId, userId) {
    const posts = JSON.parse(localStorage.getItem('posts')) || DEFAULT_POSTS;
    const post = posts.find(p => p.id === postId);
    if (post) {
        const comment = post.comments.find(c => c.id === commentId);
        if (comment) {
            const likedIndex = comment.likedBy.indexOf(userId);
            if (likedIndex === -1) {
                comment.likedBy.push(userId);
                comment.likes++;
            } else {
                comment.likedBy.splice(likedIndex, 1);
                comment.likes--;
            }
            localStorage.setItem('posts', JSON.stringify(posts));
        }
    }
    return posts;
} 