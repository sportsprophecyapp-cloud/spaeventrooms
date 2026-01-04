const pendingRequests = new Map();

/**
 * Deduplicates concurrent requests to the same resource
 * If multiple requests come in for the same key, only one actual fetch happens
 * @param {string} key - Unique identifier for the request
 * @param {Function} fetchFn - Async function that performs the actual fetch
 * @returns {Promise} Result of the fetch function
 */
async function dedupRequest(key, fetchFn) {
    // If there's already a pending request for this key, return that promise
    if (pendingRequests.has(key)) {
        console.log(`🔄 Deduplicating request: ${key}`);
        return pendingRequests.get(key);
    }

    // Start the fetch and store the promise
    const promise = fetchFn();
    pendingRequests.set(key, promise);

    try {
        const result = await promise;
        return result;
    } catch (error) {
        throw error;
    } finally {
        // Clean up after 1 second to allow brief concurrent requests to share
        setTimeout(() => {
            pendingRequests.delete(key);
        }, 1000);
    }
}

/**
 * Get current count of pending requests (for monitoring)
 */
function getPendingCount() {
    return pendingRequests.size;
}

module.exports = { dedupRequest, getPendingCount };
