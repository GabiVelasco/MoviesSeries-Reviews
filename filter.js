document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:8090/api/collections/Movies/records'; // Your PocketBase API URL
    const AUTH_TOKEN = '120'; // Your PocketBase API token

    const filterGenre = document.getElementById('filterGenre');
    const filterTitle = document.getElementById('filterTitle');
    const movieList = document.getElementById('movieList');

    let allMovies = [];
    let uniqueGenres = new Set();
    let uniqueTitles = new Set();

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
            allMovies = data.items;

            if (allMovies.length === 0) {
                movieList.innerHTML = '<p>No movies found.</p>';
                return;
            }

            extractGenresAndTitles();
            populateFilters();
            displayMovies(allMovies);
        } catch (error) {
            console.error('Error fetching movies:', error);
        }
    }

    function extractGenresAndTitles() {
        allMovies.forEach(movie => {
            // Handle genres
            let genres = movie.genre ? movie.genre.split(',') : [];
            if (genres.length === 0 || genres.every(g => g.trim().length < 3)) {
                uniqueGenres.add('Not Specified');
            } else {
                genres.forEach(g => {
                    const trimmedGenre = g.trim();
                    if (trimmedGenre.length < 3) {
                        uniqueGenres.add('Not Specified');
                    } else {
                        uniqueGenres.add(trimmedGenre);
                    }
                });
            }

            // Handle titles
            if (movie.title) {
                uniqueTitles.add(movie.title.trim());
            }
        });
    }

    function populateFilters() {
        // Populate genre filter
        filterGenre.innerHTML = '<option value="">All Genres</option>'; // Add "All Genres" option
        uniqueGenres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre;
            option.textContent = genre;
            filterGenre.appendChild(option);
        });

        // Populate title filter
        filterTitle.innerHTML = '<option value="">All Titles</option>'; // Add "All Titles" option
        uniqueTitles.forEach(title => {
            const option = document.createElement('option');
            option.value = title;
            option.textContent = title;
            filterTitle.appendChild(option);
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
            const genreMatch = selectedGenre 
                ? (movie.genre ? movie.genre.split(',').map(g => g.trim()).includes(selectedGenre) : selectedGenre === 'Not Specified')
                : true;
            const titleMatch = searchTitle 
                ? movie.title.toLowerCase().startsWith(searchTitle) 
                : true;
            return genreMatch && titleMatch;
        });

        displayMovies(filteredMovies);
    }

    filterGenre.addEventListener('change', filterMovies);
    filterTitle.addEventListener('input', filterMovies);

    fetchMovies();
});
