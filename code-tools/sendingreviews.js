const REVIEW_API_URL = 'http://localhost:8090/api/collections/Reviews/records';
const AUTH_TOKEN = '120'; // Your PocketBase API token

async function addReview(movieId, title, reviewText, ranking) {
    const reviewData = {
        movie_id: movieId,
        title: title,
        review_text: reviewText,
        ranking: ranking
    };

    try {
        const response = await fetch(REVIEW_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': AUTH_TOKEN
            },
            body: JSON.stringify(reviewData)
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Review added:', result);
    } catch (error) {
        console.error('Failed to add review:', error);
    }
}

// Example usage:
addReview(123, 'Great Movie!', 'I really enjoyed this movie.', 5);
