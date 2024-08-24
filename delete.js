// delete.js

const API_URL = 'http://localhost:8090/api/collections/Movies/records'; // Adjust if needed
const AUTH_TOKEN = '120'; // Replace with a valid token

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

async function deleteMovies(moviesToDelete) {
    for (const movie of moviesToDelete) {
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

async function removeMoviesWithSpecialGenre() {
    const allMovies = await fetchAllMovies();
    
    // Filter movies where the genre contains '{'
    const moviesToDelete = allMovies.filter(movie => movie.genre && movie.genre.includes('{'));

    if (moviesToDelete.length > 0) {
        console.log(`Found ${moviesToDelete.length} movies to delete.`);
        await deleteMovies(moviesToDelete);
    } else {
        console.log('No movies with special genre found.');
    }
}

// Example function call
removeMoviesWithSpecialGenre();
