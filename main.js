

document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:8090/api/collections/Movies/records'; // Your PocketBase API URL
    const REVIEW_API_URL = 'http://localhost:8090/api/collections/Reviews/records';
    const AUTH_TOKEN = '120'; // Your PocketBase API token

    const filterGenre = document.getElementById('filterGenre');
    const filterTitle = document.getElementById('filterTitle');
    const movieList = document.getElementById('movieList');

    const reviewSection = document.getElementById('reviews');
    const reviewForm = document.getElementById('reviewForm');
    const reviewPopup = document.getElementById('reviewPopup');
    const closePopup = document.getElementById('closePopup');
    const reviewTextArea = document.getElementById('reviewText');
    const movieTitleInput = document.getElementById('movieTitle');
    const movieTitleSpan = document.getElementById('movieTitleSpan');

    let allMovies = [];
    let uniqueGenres = new Set();
    let uniqueTitles = new Set();
    let currentSort = { column: 'title', direction: 'asc' };

   
    async function fetchMovies() {
        let page = 1;
        let totalPages = 1;

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
                    throw new Error(`Failed to fetch movies: ${response.statusText}`);
                }

                const data = await response.json();
                allMovies = allMovies.concat(data.items);

                if (page === 1) {
                    totalPages = data.totalPages;
                }

                page++;
            } catch (error) {
                console.error('Error fetching movies:', error);
                break;
            }
        }

        console.log('All movies:', allMovies);
        if (allMovies.length === 0) {
            movieList.innerHTML = '<tr><td colspan="7">No movies found.</td></tr>';
            return;
        }

        extractGenresAndTitles();
        populateFilters();
        filterMovies();
  
    }

  

    function extractGenresAndTitles() {
        allMovies.forEach(movie => {
            let genres = movie.genre ? movie.genre.split(',').map(g => g.trim()) : [];

            if (genres.length === 0 || genres.every(g => g.length < 3)) {
                movie.genre = 'Not Specified';
                uniqueGenres.add('Not Specified');
            } else {
                genres = genres.map(g => g.length < 3 ? 'Not Specified' : g);
                movie.genre = genres.join(', ');
                genres.forEach(g => {
                    if (g.length > 0) {
                        uniqueGenres.add(g);
                    }
                });
            }

            if (movie.title) {
                uniqueTitles.add(movie.title.trim());
            }
        });
    }

    function populateFilters() {
        filterGenre.innerHTML = '<option value="">All Genres</option>';
        uniqueGenres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre;
            option.textContent = genre;
            filterGenre.appendChild(option);
        });

        filterTitle.innerHTML = '<option value="">All Titles</option>';
        uniqueTitles.forEach(title => {
            const option = document.createElement('option');
            option.value = title;
            option.textContent = title;
            filterTitle.appendChild(option);
        });
    }

    function displayMovies(movies) {
        movieList.innerHTML = '';
        if (movies.length === 0) {
            movieList.innerHTML = '<tr><td colspan="5">No movies found.</td></tr>';
            return;
        }

        movies.forEach(movie => {
            const formattedDate = movie.release_date ? formatReleaseDate(movie.release_date) : '';

            const movieRow = document.createElement('tr');
            const overview = movie.overview || '';
            const genre = movie.genre || '';

            movieRow.innerHTML = `
                <td><strong>${movie.title || ''}</strong></td>
                <td><span class="movie-genre">${genre}</span>
                    <a class="more-genres">More...</a></td>
                <td>
                    <span class="movie-overview">${overview}</span>
                    <a class="read-more">Read More</a>
                </td>
                <td class="movie-lan">${movie.original_language || ''}</td>
                <td class="movie-year">${formattedDate}</td>
                <td class="movie-min">${movie.minutes || ''}</td>
                 <td><a href="${movie.homepage || '#'}">${movie.homepage ? 'Link' : ''}</a></td>
                <td><a href="#" class="add-review" data-title="${movie.title}">Add Review</a></td>
            `;
            movieList.appendChild(movieRow);

            movieRow.querySelector('.read-more').addEventListener('click', function () {
                const overviewSpan = movieRow.querySelector('.movie-overview');

                if (overviewSpan.classList.contains('full')) {
                    overviewSpan.classList.remove('full');
                    this.textContent = 'Read More';
                } else {
                    overviewSpan.classList.add('full');
                    this.textContent = 'Read Less';
                }
            });

            movieRow.querySelector('.more-genres').addEventListener('click', function () {
                const overviewSpanGenre = movieRow.querySelector('.movie-genre');
                if (overviewSpanGenre.classList.contains('full')) {
                    overviewSpanGenre.classList.remove('full');
                    this.textContent = 'More...';
                } else {
                    overviewSpanGenre.classList.add('full');
                    this.textContent = 'Read Less';
                }
            });

            movieRow.querySelector('.add-review').addEventListener('click', function (e) {
                e.preventDefault();
                const movieTitle = this.getAttribute('data-title');
                openReviewPopup(movieTitle);
            });
        });

             // Calculate total pages for filtered results
     resultsInfo.innerHTML = `Showing ${movies.length} results`;
    }
    



    function formatReleaseDate(dateString) {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return '';
        }
        const year = date.getFullYear();
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

