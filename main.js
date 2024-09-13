

document.addEventListener('DOMContentLoaded', () => {
    // Constants
    const API_URL = 'http://localhost:8090/api/collections/Movies/records'; // Your PocketBase API URL
    const REVIEW_API_URL = 'http://localhost:8090/api/collections/Reviews/records';
    const AUTH_TOKEN = '120'; // Your PocketBase API token

    const filterGenre = document.getElementById('filterGenre');
    const filterTitle = document.getElementById('filterTitle');
    const movieList = document.getElementById('movieList');

    const reviewSection = document.getElementById('reviews');
    const reviewForm = document.getElementById('reviewForm');
    const reviewPopup = document.getElementById('reviewPopup');
    const closePopupButton = document.getElementById('closePopup');
    const reviewTextArea = document.getElementById('reviewText');
    const movieTitleInput = document.getElementById('movieTitle');
    const movieTitleSpan = document.getElementById('movieTitleSpan');
    const reviewTitleInput = document.getElementById('review-title');

    let allMovies = [];
    let uniqueGenres = new Set();
    let uniqueTitles = new Set();
    let currentSort = { column: 'title', direction: 'asc' };

    function calculateAverageRanking(reviews, movieId) {
        const movieReviews = reviews.filter(review => review.movie_id === movieId);
        console.log('Reviews for movie ID:', movieId, movieReviews); // Debugging: Log reviews for the movie
    
        if (movieReviews.length === 0) return 0; // Return 0 if no reviews
    
        const totalRanking = movieReviews.reduce((sum, review) => sum + parseFloat(review.ranking || 0), 0);
        const averageRanking = totalRanking / movieReviews.length;
        console.log('Total ranking:', totalRanking, 'Average ranking:', averageRanking); // Debugging: Log totals and average
    
        return averageRanking;
    }
    
    
    function getStarRatingHtml(averageRanking) {
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            const starClass = i <= averageRanking ? 'fa-solid fa-star rated' : 'fa-solid fa-star';
            starsHtml += `<i class="${starClass}"></i>`;
        }
        return starsHtml;
    }
    
    

//   REVIEWS

async function fetchReviews() {
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
        console.log('Fetched reviews:', result.items); // Debugging: Log fetched reviews
        return result.items;

    } catch (error) {
        console.error('Failed to fetch reviews:', error);
        return [];
    }
}




// EDITING REVIEWS

// END EDITING REIEWS 

// GETTING REVIEWS
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
        displayReviews(result.items); // Pass the reviews to the display function
    } catch (error) {
        console.error('Failed to fetch reviews:', error);
    }
}
// GETTING REVIEWS ENDE



// Function to display reviews inside the #reviews section

function displayReviews(reviews) {
    const reviewsSection = document.getElementById('reviews');
    
    // Clear existing content
    reviewsSection.innerHTML = '';

    // Create a container for the table
    const tableContainer = document.createElement('div');
    tableContainer.classList.add('reviews-table-container');

    // Create a table
    const table = document.createElement('table');
    table.classList.add('reviews-table');

    // Create table headers
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const titleHeader = document.createElement('th');
    titleHeader.textContent = 'Title';
    
    const reviewHeader = document.createElement('th');
    reviewHeader.textContent = 'Review';
    
    const starsHeader = document.createElement('th');
    starsHeader.textContent = 'Stars';

    const actionsHeader = document.createElement('th');
    actionsHeader.textContent = 'Actions'; // New header for actions

    headerRow.appendChild(titleHeader);
    headerRow.appendChild(reviewHeader);
    headerRow.appendChild(starsHeader);
    headerRow.appendChild(actionsHeader); // Add actions header to delete and update
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create tbody for review entries
    const tbody = document.createElement('tbody');
    reviews.forEach(review => {
        const row = document.createElement('tr');

        // Create cell for the title
        const titleCell = document.createElement('td','titelTd');
        titleCell.textContent = review.title || 'No Title'; // Fallback if title is missing
        row.appendChild(titleCell);

        // Create cell for the review text
        const reviewTextCell = document.createElement('td');
        reviewTextCell.textContent = review.review_text || 'No review text available.';
        row.appendChild(reviewTextCell);

        // Create cell for star ratings
        const starsCell = document.createElement('td');
        const starsContainer = document.createElement('div');
        starsContainer.classList.add('stars', 'left');
        const rating = review.ranking || 0;
        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('i');
            star.classList.add('fa-solid', 'fa-star');
            if (i <= rating) {
                star.classList.add('rated');
            }
            starsContainer.appendChild(star);
        }
        starsCell.appendChild(starsContainer);
        row.appendChild(starsCell);

        // Create cell for actions (delete button)
        const actionsCell = document.createElement('td');

        // Edit Button
        
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.classList.add('edit-button', 'hide');
        editButton.dataset.reviewId = review.id; // Add review ID to the button's data attributes
        editButton.addEventListener('click', (e) => {
            const reviewId = e.target.dataset.reviewId; // Retrieve the review ID
            openEditPopup(reviewTitle); // Call the function with the review ID
        });

        
        // Delete Button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete-button');
        deleteButton.addEventListener('click', () => deleteReview(review.id)); // Assume each review has a unique 'id'

        actionsCell.appendChild(editButton);
        actionsCell.appendChild(deleteButton);
        row.appendChild(actionsCell);

        // Append the row to tbody
        tbody.appendChild(row);
    });

    // Append tbody to table
    table.appendChild(tbody);

    // Append table to container
    tableContainer.appendChild(table);

    // Append container to reviews section
    reviewsSection.appendChild(tableContainer);


    
}

getAllReviews();
 //


// Function to delete a review
function deleteReview(reviewId) {
    // Perform DELETE request to backend API to remove the review
    fetch(`${REVIEW_API_URL}/${reviewId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to delete review');
        }
        // Refresh reviews after deletion
        getAllReviews();
    })
    .catch(error => {
        console.error('Error deleting review:', error);
    });
}


// Example usage: Fetch and display reviews when the page loads
getAllReviews();

// Function to open the review popup/form
function openReviewPopup(movieTitle) {
    document.getElementById('reviewPopup').style.display = 'block'; // Show the popup
    document.getElementById('movieTitleSpan').textContent = movieTitle; // Set movie title in popup
    reviewTitleInput.value = movieTitle; // Set the movie title in the input field
}
// CLOSE POPUP // Function to close the review popup
    function closeReviewPopup() {
        reviewPopup.style.display = 'none'; // Hide the popup
    }

    // Event listener for the close button
    closePopupButton.addEventListener('click', (e) => {
        e.preventDefault();
        closeReviewPopup();
    });

// CLOSE POPUP ENDE

// REVIEWSSUBMISSION
// Handle form submission
document.getElementById('add-review-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const movieId = document.getElementById('movie-id').value;
    const reviewTitle = document.getElementById('review-title').value;
    const reviewText = document.getElementById('review-text').value;
    // const ranking = document.getElementById('ranking').value;
    // Get the selected star rating
    const ranking = document.querySelector('input[name="ranking"]:checked').value;

    await addReview(movieId, reviewTitle, reviewText, ranking);
});



// Function to add a review via POST request
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

        document.getElementById('add-review-form').reset(); // Clear the form

        // Optionally hide the form after submission
        document.getElementById('add-review-form').style.display = 'none';

        // Optionally refresh the reviews section
        await getAllReviews();
    } catch (error) {
        console.error('Failed to add review:', error);
    }
    closeReviewPopup();
}
// // REVIEWSSUBMISSION END

// END Reviews


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

    async function displayMovies(movies) {
        
        const reviews = await fetchReviews(); // Fetch all reviews
        movieList.innerHTML = '';
        if (movies.length === 0) {
            movieList.innerHTML = '<tr><td colspan="5">No movies found.</td></tr>';
            return;
        }

        movies.forEach(movie => {
            const formattedDate = movie.release_date ? formatReleaseDate(movie.release_date) : '';
            const averageRanking = calculateAverageRanking(reviews, movie.id); // Calculate average ranking for the movie
            const starRatingHtml = getStarRatingHtml(averageRanking); // Get star rating HTML


            const movieRow = document.createElement('tr');
            const overview = movie.overview || '';
            const genre = movie.genre || '';

            movieRow.innerHTML = `
                <td class="movie-title"><strong>${movie.title || ''}</strong></td>
                <td class="movie-genre_"><span class="movie-genre">${genre}</span>
                    <a class="more-genres">More...</a></td>
                <td>
                    <span class="movie-overview">${overview}</span>
                    <a class="read-more">Read More</a>
                </td>
                <td class="movie-lan">${movie.original_language || ''}</td>
                <td class="movie-year">${formattedDate}</td>
                <td class="movie-min">${movie.minutes || ''}</td>
                <td class="movie-ranking">${starRatingHtml} (${averageRanking.toFixed(1)})</td> <!-- Display average ranking as stars -->
                 
                 
   
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
// REVIEW
            movieRow.querySelector('.add-review').addEventListener('click', function (e) {
                e.preventDefault();
                const movieTitle = this.getAttribute('data-title');
                openReviewPopup(movieTitle);
            });
          
        });
// END REVIEW

             // Calculate total pages for filtered results
     resultsInfo.innerHTML = `Showing ${movies.length} results`;
    }
    
    // REVIEW
    // Show the review form with the selected movie's title
    function showReviewForm(movieTitle, movieId) {
        const reviewForm = document.getElementById('add-review-form');
        const titleElement = document.getElementById('movie-title');
        const movieIdInput = document.getElementById('movie-id');

        // Set the movie title and ID in the form
        titleElement.textContent = movieTitle;
        movieIdInput.value = movieId;

        // Show the form
        reviewForm.style.display = 'block';
    }
  // END REVIEW

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

