// Utility functions for handling image paths consistently across the application

/**
 * Normalize image path to ensure it works correctly from any page location
 * @param {string} imagePath - The image path from the database
 * @param {string} defaultPath - Default fallback image path
 * @returns {string} - Normalized image path
 */
function normalizeImagePath(imagePath, defaultPath = '../images/profile.png') {
    if (!imagePath) {
        return defaultPath;
    }
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    if (imagePath.startsWith('/uploads')) {
        return '..' + imagePath;
    }
    
    if (imagePath.startsWith('../')) {
        return imagePath;
    }
    
    return '../' + imagePath;
}

/**
 * Set image source with error handling and fallback
 * @param {HTMLImageElement} imgElement - The image element
 * @param {string} imagePath - The image path from the database
 * @param {string} defaultPath - Default fallback image path
 */
function setImageWithFallback(imgElement, imagePath, defaultPath = '../images/profile.png') {
    if (!imgElement) {
        return;
    }
    
    const normalizedPath = normalizeImagePath(imagePath, defaultPath);
    imgElement.src = normalizedPath;
    
    // Add error handler to fallback to default image
    imgElement.onerror = function() {
        if (this.src !== defaultPath) {
            this.src = defaultPath;
            this.onerror = null; // prevenir infinite loop
        }
    };
}

/**
 * Get profile image path with fallback
 * @param {Object} user - User object
 * @param {string} defaultPath - Default fallback image path
 * @returns {string} - Profile image path
 */
function getProfileImagePath(user, defaultPath = '../images/profile.png') {
    if (!user || !user.profileImagePath) {
        return defaultPath;
    }
    return normalizeImagePath(user.profileImagePath, defaultPath);
}

