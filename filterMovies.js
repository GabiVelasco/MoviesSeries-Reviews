document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:8090/api/collections/Movies/records'; // Your PocketBase API URL
    const AUTH_TOKEN = '120'; // Your PocketBase API token

    const filterGenre = document.getElementById('filterGenre');
    const filterTitle = document.getElementById('filterTitle');
    const movieList = document.getElementById('movieList');
    const resultsInfo = document.getElementById('resultsInfo'); // Element to display pagination info

    let allMovies = [];
    let uniqueGenres = new Set();
    let uniqueTitles = new Set();
    const itemsPerPage = 30; // Number of items per page

    let currentSort = {column: 'title', direction: 'acs' };

    async function fetchMovies() {
        let page = 1;
        let totalPages = 1; // Set a default value for totalPages

        // Fetch all pages of movies
        while (page <= totalPages) {
            try {
                const response = await fetch(`${API_URL}?page=${page}`, {
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
                allMovies = allMovies.concat(data.items);

                if (page === 1) { // Set totalPages only on the first request
                    totalPages = data.totalPages;
                }

                page++; // Increment page number
            } catch (error) {
                console.error('Error fetching movies:', error);
                break; // Exit loop if there is an error fetching data
            }
        }

        console.log('All movies:', allMovies); // Log to see all movies

        if (allMovies.length === 0) {
            movieList.innerHTML = '<tr><td colspan="7">No movies found.</td></tr>';
            resultsInfo.innerHTML = 'No results found.';
            return;
        }

        extractGenresAndTitles();
        populateFilters();
        filterMovies(); // Apply filters after fetching all movies
    }
    function extractGenresAndTitles() {
        allMovies.forEach(movie => {
            // Handle genres
            let genres = movie.genre ? movie.genre.split(',').map(g => g.trim()) : [];
            
            // Check if genres are empty or any genre has fewer than 3 characters
            if (genres.length === 0 || genres.every(g => g.length < 3)) {
                movie.genre = 'Not Specified'; // Replace with "Not Specified"
                uniqueGenres.add('Not Specified');
            } else {
                // Replace genres with "Not Specified" if any genre is invalid
                genres = genres.map(g => g.length < 3 ? 'Not Specified' : g);
                movie.genre = genres.join(', '); // Update movie.genre with new genres
                genres.forEach(g => {
                    if (g.length > 0) {
                        uniqueGenres.add(g);
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
        filterGenre.innerHTML = '<option style="color:white !important" value="">All Genres</option>'; // Add "All Genres" option
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
        resultsInfo.innerHTML = ''; // Clear any previous results info
    
        if (movies.length === 0) {
            movieList.innerHTML = '<tr><td colspan="5">No movies found.</td></tr>';
            resultsInfo.innerHTML = 'No results found.';
            return;
        }
    
        movies.forEach(movie => {
            // Format the release date
            const formattedDate = movie.release_date ? formatReleaseDate(movie.release_date) : '';
    
            const movieRow = document.createElement('tr');
            movieRow.innerHTML = `
                <td><strong>${movie.title || ''}</strong></td>
                <td>${movie.genre || ''}</td>
                <td class="justify" >${movie.overview || ''}</td>
                <td>${movie.original_language || ''}</td>
                <td>${formattedDate}</td>
                <td>${movie.minutes || ''}</td>
                <td><a href="${movie.homepage || '#'}">${movie.homepage ? 'Link' : ''}</a></td>
            `;
            movieList.appendChild(movieRow);
        });
    
        // Calculate total pages for filtered results
        const totalFilteredPages = Math.ceil(movies.length / itemsPerPage);
        resultsInfo.innerHTML = `Showing ${movies.length} results. Total pages: ${totalFilteredPages}.`;
    }
    
    // Function to format the release date
    function formatReleaseDate(dateString) {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return ''; // Return an empty string if the date is invalid
        }
        // Format the date to YYYY-MM-DD
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}`;
    }


    function sortMovies(movies, column, direction) {
        return movies.slice().sort((a,b) => {
            const aValue = a[column];
            const bValue = b[column];
            if (direction === 'asc' ) {
                return compareValues(aValue, bValue); }
                 else {
                    return compareValues(bValue, aValue);
                 }
            });
        }
    
        function compareValues(a, b) {
            if (typeof a === 'string') {
                return a.localeCompare(b, undefined, { sensitivity: 'base' });
            }
            if (typeof a === 'number') {
                return a-b;
            }
            return 0;
        }

        function handleSort(event) {
            const column = event.target.getAttribute('data-sort');
            const newDirection = currentSort.direction === 'asc' ? 'desc' : 'asc';
            currentSort = {column, direction: newDirection};

            const sortedMovies = sortMovies(allMovies, column, newDirection);
            displayMovies(sortedMovies);
        }

    function filterByGenre(movies, selectedGenre) {
        if (!selectedGenre || selectedGenre === "") {
            return movies;
        }
    
        if (selectedGenre === 'Not Specified') {
            return movies.filter(movie => {
                // Check if the genre is "Not Specified"
                return movie.genre === 'Not Specified';
            });
        }
    
        // Normalize selected genre
        const normalizedGenre = selectedGenre.toLowerCase().trim();
    
        return movies.filter(movie => {
            if (!movie.genre) {
                return false;
            }
    
            // Normalize movie genre string
            const normalizedMovieGenres = movie.genre.split(',').map(g => g.trim().toLowerCase());
    
            // Check if the normalized movie genres contain the selected genre
            return normalizedMovieGenres.some(genre => genre.includes(normalizedGenre));
        });
    }
    
    function filterByTitle(movies, searchTitle) {
        if (!searchTitle) {
            return movies;
        }

        // Normalize search title
        const normalizedTitle = searchTitle.toLowerCase().trim();
        console.log('Search title:', normalizedTitle);

        return movies.filter(movie => {
            // Check if the movie title starts with the search title
            return movie.title?.toLowerCase().startsWith(normalizedTitle);
        });
    }

    async function filterMovies() {
        const selectedGenre = document.getElementById('filterGenre').value;
        const searchTitle = document.getElementById('filterTitle').value.toLowerCase();

        let filteredMovies = allMovies;

        // Apply genre filter
        filteredMovies = filterByGenre(filteredMovies, selectedGenre);
        console.log('Movies after genre filter:', filteredMovies); // Debugging log

        // Apply title filter
        filteredMovies = filterByTitle(filteredMovies, searchTitle);
        console.log('Movies after title filter:', filteredMovies); // Debugging log

        // Display the filtered movies
        displayMovies(filteredMovies);
    }
    
    filterGenre.addEventListener('change', filterMovies);
    filterTitle.addEventListener('input', filterMovies);

    document.querySelectorAll('th[data-sort]').forEach(header => {
        header.addEventListener('click', handleSort);
    });

    fetchMovies(); // Initial fetch
});
