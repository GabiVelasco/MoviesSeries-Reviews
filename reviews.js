// reviews.js

const REVIEW_API_URL = 'http://localhost:8090/api/collections/Reviews/records';
const AUTH_TOKEN = '120';

export function setupReviewButton() {
    console.log('Review button setup');
    document.querySelectorAll('.add-review').forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            const movieId = this.getAttribute('data-id');
            const movieTitle = this.getAttribute('data-title');

            // Update the form with selected movie details
            document.getElementById('movieId').value = movieId;
            document.getElementById('movieTitle').textContent = movieTitle;
            document.getElementById('reviews').style.display = 'block';
        });
    });
}

export async function submitReview(reviewData) {
    try {
        const response = await fetch(REVIEW_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AUTH_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reviewData)
        });

        if (!response.ok) {
            throw new Error(`Failed to submit review: ${response.statusText}`);
        }

        alert('Review submitted successfully');
        return true;
    } catch (error) {
        console.error('Error submitting review:', error);
        alert('Failed to submit review. Please try again.');
        return false;
    }
}
