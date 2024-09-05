document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:8090/api/collections/Movies/records'; // Update with your API URL
    const AUTH_TOKEN = '120'; // Replace with a valid token

    const filterGenre = document.getElementById('filterGenre');
    const filterTitle = document.getElementById('filterTitle');
    // const movieList = document.getElementById('movieList');
    
    let allMovies = [];

    async function fetchMovies() {
        try {
            const response = await fetch(API_URL, {
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
            console.log(data);  // Log the entire response for debugging
            allMovies = data.items;  // Adjust according to your API structure

            populateGenreFilter();
            displayMovies(allMovies);
        } catch (error) {
            console.error('Error fetching movies:', error);
        }
    }

    function populateGenreFilter() {
        // Clear existing options
        filterGenre.innerHTML = '<option value="">All Genres</option>';

        const genres = new Set();
        allMovies.forEach(movie => {
            if (movie.genre) {
                const genreList = movie.genre.split(',').map(genre => genre.trim());
                genreList.forEach(genre => {
                    if (genre.length >= 3) {
                        genres.add(genre);
                    } else {
                        genres.add('Not Specified');
                    }
                });
            } else {
                genres.add('Not Specified');
            }
        });

        genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre;
            option.textContent = genre;
            filterGenre.appendChild(option);
        });
    }

    function displayMovies(movies) {
        movieList.innerHTML = ''; // Clear current movies

        if (movies.length === 0) {
            movieList.innerHTML = '<p>No movies found.</p>';
            return;
        }

        movies.forEach(movie => {
            const movieItem = document.createElement('div');
            movieItem.className = 'movie-item';
            movieItem.innerHTML = `
                <h2>${movie.title}</h2>
                <p><strong>Movie ID:</strong> ${movie.movie_id}</p>
                <p><strong>ID:</strong> ${movie.id}</p>
                <p><strong>Genre:</strong> ${movie.genre || 'Not Specified'}</p>
                <p><strong>Overview:</strong> ${movie.overview}</p>
            `;
            movieList.appendChild(movieItem);
        });
    }

    function filterMovies() {
        const selectedGenre = filterGenre.value;
        const searchTitle = filterTitle.value.toLowerCase();

        const filteredMovies = allMovies.filter(movie => {
            const genreList = movie.genre ? movie.genre.split(',').map(genre => genre.trim()) : [];
            const genreMatch = selectedGenre ? genreList.includes(selectedGenre) : true;
            const titleMatch = movie.title.toLowerCase().includes(searchTitle);
            return genreMatch && titleMatch;
        });

        displayMovies(filteredMovies);
    }

    filterGenre.addEventListener('change', filterMovies);
    filterTitle.addEventListener('input', filterMovies);

    fetchMovies();
});
