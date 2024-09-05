const API_URL = 'http://localhost:8090/api/collections/Movies/records';
const AUTH_TOKEN = '120'; // Replace with a valid token

// Function to fetch all movies from the database
async function fetchAllMovies() {
    let movies = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
        try {
            const response = await fetch(`${API_URL}?page=${page}&perPage=50`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${AUTH_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch movies: ${response.status}`);
            }

            const data = await response.json();
            movies = movies.concat(data.items);
            hasMore = data.items.length > 0;
            page++;
        } catch (error) {
            console.error('Error fetching movies:', error);
            hasMore = false;
        }
    }

    return movies;
}

// Function to delete all movies from the database
async function deleteAllMovies() {
    const movies = await fetchAllMovies();
    console.log(`Found ${movies.length} movies to delete.`);

    for (const movie of movies) {
        try {
            const response = await fetch(`${API_URL}/${movie.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${AUTH_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to delete movie ${movie.id}: ${response.status}`);
            }

            console.log(`Deleted movie: ${movie.title}`);
        } catch (error) {
            console.error('Error deleting movie:', error);
        }
    }
}

// Execute the deletion
deleteAllMovies();
