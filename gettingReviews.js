const REVIEW_API_URL = 'http://localhost:8090/api/collections/Reviews/records';
const AUTH_TOKEN = '120'; // Your PocketBase API token

async function getAllReviews() {
    try {
        const response = await fetch(REVIEW_API_URL, {
            method: 'GET',
            headers: {
                'Authorization': AUTH_TOKEN
            }
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const result = await response.json();
        console.log('All reviews:', result.items);
        return result.items;
    } catch (error) {
        console.error('Failed to fetch reviews:', error);
    }
}

// Example usage:
getAllReviews();
