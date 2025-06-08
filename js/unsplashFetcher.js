const UNSPLASH_ACCESS_KEY = 'OhvptpmBZK3UH9YOOk5_OA1_664ou_aOqEO2IFc3NY0';

// Cache object to store fetched images
const imageCache = new Map();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour cache duration

async function fetchUnsplashImages(query, quantity = 5) {
    // Check cache first
    const cacheKey = `${query}-${quantity}`;
    const cachedResult = imageCache.get(cacheKey);
    
    if (cachedResult && (Date.now() - cachedResult.timestamp < CACHE_DURATION)) {
        return cachedResult.images;
    }

    const perPage = Math.min(quantity, 30); // Unsplash limits per_page to 30
    const url = `https://api.unsplash.com/search/photos?page=1&per_page=${perPage}&query=${encodeURIComponent(query)}&client_id=${UNSPLASH_ACCESS_KEY}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error: ${response.statusText}`);

        const data = await response.json();
        const results = data.results.map(photo => ({
            url: photo.urls.regular,
            small: photo.urls.small,
            thumb: photo.urls.thumb,
            alt: photo.alt_description || query,
            credit: {
                name: photo.user.name,
                link: photo.user.links.html
            }
        })).slice(0, quantity);

        // Cache the results
        imageCache.set(cacheKey, {
            images: results,
            timestamp: Date.now()
        });

        return results;
    } catch (error) {
        console.error('Unsplash fetch failed:', error);
        return [];
    }
}

// Helper function to fetch multiple categories at once
async function fetchMultipleCategories(categories) {
    const results = {};
    
    for (const [category, count] of Object.entries(categories)) {
        results[category] = await fetchUnsplashImages(category, count);
    }
    
    return results;
}

// Helper function to create and append image elements
function createImageElement(imageData, size = 'regular', className = '') {
    const container = document.createElement('div');
    container.className = `image-container ${className}`;
    
    const img = document.createElement('img');
    img.src = imageData[size] || imageData.url;
    img.alt = imageData.alt;
    img.loading = 'lazy'; // Enable lazy loading
    
    const credit = document.createElement('a');
    credit.href = imageData.credit.link;
    credit.className = 'photo-credit';
    credit.textContent = `Photo by ${imageData.credit.name}`;
    credit.target = '_blank';
    credit.rel = 'noopener noreferrer';
    
    container.appendChild(img);
    container.appendChild(credit);
    
    return container;
}

export { fetchUnsplashImages, fetchMultipleCategories, createImageElement };
