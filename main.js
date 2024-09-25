

document.addEventListener('DOMContentLoaded', () => {
    // Constants
    const API_URL = 'http://localhost:8090/api/collections/Movies/records'; // Your PocketBase API URL
    const REVIEW_API_URL = 'http://localhost:8090/api/collections/Reviews/records';
    const AUTH_TOKEN = '120'; // Your PocketBase API token

    const filterGenre = document.getElementById('filterGenre');
    const filterTitle = document.getElementById('filterTitle');
    const movieList = document.getElementById('movieList');

    const reviewPopup = document.getElementById('review-popup-container');
    const closePopupButton = document.getElementById('closePopup');
    const reviewSection = document.getElementById('reviews');
    const reviewForm = document.getElementById('reviewForm');
    const reviewTextArea = document.getElementById('reviewText');
    const movieTitleInput = document.getElementById('movieTitle');
    const movieTitleSpan = document.getElementById('movieTitleSpan');
    const reviewTitleInput = document.getElementById('review-title');
        // Other constants

        const titleInputId = 'edit-review-title';
        const editReviewTextId = 'edit-review-text';
        const formId = 'edit-review-form';
        // const popupId = 'editReviewPopup';


    let allMovies = [];
    let uniqueGenres = new Set();
    let uniqueTitles = new Set();
    let currentSort = { column: 'title', direction: 'asc' };

    console.log('Document ready');

// LOGIN POPUP
// LOGIN POPUP

document.getElementById('loginLink').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent the default anchor behavior
    document.getElementById('loginPopup').style.display = 'block'; // Show the popup
});

document.querySelector('.login-close').addEventListener('click', function() {
    document.getElementById('loginPopup').style.display = 'none'; // Hide the popup
});

// Close the popup if the user clicks anywhere outside of it
window.onclick = function(event) {
    const popup = document.getElementById('loginPopup');
    if (event.target === popup) {
        popup.style.display = 'none';
    }
};

// Check login status on page load
async function checkLoginStatus() {
    const token = localStorage.getItem('pb_auth_token');
    if (token) {
        await fetchUserInfo(token); // Fetch user info if logged in
    }
}

// Fetch user info to get the avatar and name
async function fetchUserInfo(token) {
    try {
        const response = await fetch('http://localhost:8090/api/collections/users/auth', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok) {
            // Display the user's avatar
            const avatarUrl = data.avatar ? data.avatar[0].url : 'default-avatar.png'; // Adjust based on your avatar response structure
            document.getElementById('userAvatar').src = avatarUrl; // Set the user's avatar
            document.getElementById('welcomeMessage').innerText = `Welcome ${data.name || ''}! You are logged in.`;
            document.getElementById('welcomeMessage').style.display = 'inline';
        } else {
            console.error('Failed to fetch user info:', data);
        }
    } catch (error) {
        console.error('Error fetching user info:', error);
    }
}

document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the default form submission

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const messageDiv = document.getElementById('message');

    try {
        const response = await fetch('http://localhost:8090/api/collections/users/auth-with-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ identity: email, password: password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        // Handle successful login
        console.log('Login successful', data);
        messageDiv.innerText = 'Login successful!';
        messageDiv.style.color = 'green';

        // Store the token
        localStorage.setItem('pb_auth_token', data.token);

        // Fetch user info to display avatar
        await fetchUserInfo(data.token);

        // Display welcome message
        const username = email.split('@')[0]; // Extract username from email
        const welcomeMessage = document.getElementById('welcomeMessage');
        welcomeMessage.innerText = `Welcome ${username}! You are logged in.`;
        welcomeMessage.style.color = 'green'; 
        welcomeMessage.style.textDecoration = 'none'; 
        welcomeMessage.style.display = 'inline'; // Show welcome message
        alert(`Welcome ${username}! You are logged in.`);

        // Show logout link and hide login link
        document.getElementById('logoutLink').style.display = 'inline';
        document.getElementById('loginLink').style.display = 'none';

        // Close the popup
        document.getElementById('loginPopup').style.display = 'none';

    } catch (error) {
        console.error('Error during login:', error);
        messageDiv.innerText = error.message;
    }
});

// Logout functionality
document.getElementById('logoutLink').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent the default anchor behavior

    // Clear user data from local storage
    localStorage.removeItem('pb_auth_token');

    // Update UI to show login link again and hide welcome message and logout link
    const loginLink = document.getElementById('loginLink');
    document.getElementById('welcomeMessage').style.display = 'none';
    document.getElementById('logoutLink').style.display = 'none';
    loginLink.style.display = 'inline';
    console.log('Logged out successfully');
    alert("Logged out successfully");
});

// Check login status on page load
checkLoginStatus();

// LOGIN POPUP ENDE

// ROUTES

showSection("home");

const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener("click", function(e) {
        e.preventDefault();
        const target = this.getAttribute('data-target');
        showSection(target);
    });
});

function showSection(sectionId) {
    const sections = document.querySelectorAll(".content-section");
    sections.forEach(section => {
        section.style.display = "none";
    });
    document.getElementById(sectionId).style.display = "block";
}

// ROUTES ENDE

//   REVIEWS
// FETCH REVIEWS
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

// FETCH REVIEWS ENDE


// REVIEW POPUP

function openReviewPopup(movieId, movieTitle) {
    document.getElementById('review-popup-container').style.display = 'block'; // Show the popup
    document.getElementById('movieTitleSpan').textContent = movieTitle; // Set movie title in popup
    document.getElementById('movie-id').value = movieId; // Set the movie ID in the hidden input field
    reviewTitleInput.value = movieTitle; // Set the movie title in the input field
}
// OPEN REVIEW POPUP ENDE

// Close the popup if the user clicks anywhere outside of it
window.onclick = function(event) {
    const popup = document.getElementById('review-popup-container');
    if (event.target === popup) {
        popup.style.display = 'none';
    }
};


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
// REVIEW POPUP ENDE

// REVIEWSSUBMISSION
// Handle form submission
document.getElementById('add-review-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const movieId = document.getElementById('movie-id').value;
    const reviewTitle = document.getElementById('review-title').value;
    const reviewText = document.getElementById('review-text').value;
    //const ranking = document.getElementById('ranking').value;
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
        ranking: ranking,
        created: new Date().toISOString(),
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



    // AVARAGE RANKING NEEEDS TO WORK
    // Calculate average ranking for a specific movie
     function calculateAverageRanking(reviews, movieId) {
        const movieReviews = reviews.filter(review => review.movie_id === movieId);
        console.log('1. Reviews for Movie ID', movieId, ':', movieReviews); // Log reviews for the movie
        
        if (movieReviews.length === 0) return 0; // No reviews for this movie
    
        const totalRanking = movieReviews.reduce((sum, review) => {
            console.log('Review Ranking:', review.ranking); // Log each review ranking
            return sum + review.ranking;
        }, 0);
    
        const average = totalRanking / movieReviews.length;
        console.log('1. Average Ranking for Movie ID', movieId, ':', average); // Log the average
        return average;
    }
    

        
    function getStarRatingHtml(averageRanking) {
        let starHtml = '';
        const maxStars = 5;
    
        for (let i = 1; i <= maxStars; i++) {
            if (i <= Math.floor(averageRanking)) {
                // Full star
                starHtml += '<i class="fa fa-star checked"></i>';
            } else if (i - averageRanking <= 0.5 && i - averageRanking > 0) {
                // Half star
                starHtml += '<i class="fa fa-star-half-alt checked"></i>';
            } else {
                // Empty star
                starHtml += '<i class="fa fa-star"></i>';
            }
        }
    
        return starHtml;
    }
    

        
// Fetch and calculate average rankings for each movie_id
const calculateAverageRankings = (reviews) => {
    const averageRatings = {};

    reviews.forEach(review => {
        const movieId = review.movie_id;  // Assumes reviews have a movie_id field
        const ranking = review.ranking;   // Assumes reviews have a ranking field

        if (!averageRatings[movieId]) {
            averageRatings[movieId] = { total: 0, count: 0 };
        }
        averageRatings[movieId].total += ranking;
        averageRatings[movieId].count += 1;
    });

    // Compute the average ranking for each movie_id
    Object.keys(averageRatings).forEach(movieId => {
        averageRatings[movieId] = (averageRatings[movieId].total / averageRatings[movieId].count).toFixed(1);
    });

    return averageRatings;
};

// AVARAGE RANKING ENDE


// DISPLAY MOVIES WITH ADD REVIEW
    async function displayMovies(movies) {
        
        const reviews = await fetchReviews(); // Fetch all reviews
        const averageRankings = calculateAverageRankings(reviews);  // Store the average rankings in a constant

        console.log("1. Average Rankings:", averageRankings);

        movieList.innerHTML = '';
        if (movies.length === 0) {
            movieList.innerHTML = '<tr><td colspan="5">No movies found.</td></tr>';
            return;
        }

        movies.forEach(movie => {
            const formattedDate = movie.release_date ? formatReleaseDate(movie.release_date) : '';
            const averageRanking = averageRankings[movie.movie_id] || 0; // Get the average ranking for this movie
            const starRatingHtml = getStarRatingHtml(averageRanking); // Get star rating HTML


            const movieRow = document.createElement('tr');
            const overview = movie.overview || '';
            const genre = movie.genre || '';

            

            console.log("2. Average Ranking:", averageRanking, starRatingHtml);
            console.log('Fetched Reviews:', reviews); // Check the structure here

            movieRow.innerHTML = `
                <td class="movie-title"><strong>${movie.title || ''}</strong></td>
                <td class="movie-genre_"><span class="movie-genre">${genre}</span>
                    <a class="more-genres">More...</a></td>
                <td class="td-movie-overview">
                    <span class="movie-overview">${overview}</span>
                    <a class="read-more">Read More</a>
                </td>
                <td class="movie-lan">${movie.original_language || ''}</td>
                <td class="movie-year">${formattedDate}</td>
                <td class="movie-min">${movie.minutes || ''}</td>
                <td class="movie-ranking">${starRatingHtml} <p>${averageRanking}/5</p></td>
                <td><a href="#" class="add-review" data-id="${movie.movie_id}" data-title="${movie.title}">Add Review</a></td>
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
// DISPLAY MOVIES WITH ADD REVIEW ENDE
// REVIEW ARGUMENTS FOR OPENREVIEW POPUP
        movieRow.querySelector('.add-review').addEventListener('click', function (e) {
            e.preventDefault();
        
            // Get both movieId and movieTitle from data attributes
            const movieId = this.getAttribute('data-id');
            const movieTitle = this.getAttribute('data-title');
        
            // Pass both movieId and movieTitle to the function
            openReviewPopup(movieId, movieTitle);
        });
    });  
    
// REVIEW ARGUMENTS FOR OPENREVIEW POPUP ENDE


// END REVIEW

// RESULT INFOS LENGTH
             // Calculate total pages for filtered results
     resultsInfo.innerHTML = `Showing ${movies.length} results`;
    }
// RESULT INFOS LENGTH ENDE
    
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




const API_URL = 'http://localhost:8090/api/collections/Reviews/records';
const AUTH_TOKEN = '120'; // Your PocketBase API token

function getHeaders() {
    return {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
    };
}

async function fetchReviews() {
    try {
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: getHeaders()
        });
        const data = await response.json();
        const reviews = data.items || [];

        const reviewsForm = document.getElementById('reviews-form');
        reviewsForm.innerHTML = ''; // Clear previous content

        reviews.forEach(review => {
            const reviewRow = document.createElement('tr');
reviewRow.innerHTML = `
   <!-- <td><input class="review-title" type="text" value="${review.title}" readonly /></td> -->
    <td>
    <input class="review-title" type="text" value="${review.title}" readonly /> <br>
    <textarea class="review-textarea" readonly>${review.review_text}</textarea></td>
    <td>
           
        <div class="star-rating readonly" data-id="${review.id}" data-rating="${review.ranking}">
            ${[1, 2, 3, 4, 5].map(star => `
                <i class="fa fa-star ${star <= review.ranking ? 'checked' : ''}" data-star="${star}"></i>
            `).join('')}
        </div>
 <div class="buttons-container">
         <button type="button" class="edit-btn">Edit</button>
        <button type="button" class="save-btn" style="display: none;">Save</button>
        <br><br><button type="button" class="delete-btn">Delete</button>
 </div>
    </td>
    <!-- <td class="buttons-column">
        <div class="buttons-container">
            <button type="button" class="edit-btn">Edit</button>
            <button type="button" class="save-btn" style="display: none;">Save</button>
            <br> <br><button type="button" class="delete-btn">Delete</button>
        </div>
    </td> -->
`;
reviewsForm.appendChild(reviewRow);
            // Add event listener to the "Edit" button
            const editButton = reviewRow.querySelector('.edit-btn');
            editButton.addEventListener('click', () => {
                toggleEditMode(reviewRow, true);
                editButton.style.display = 'none';
                reviewRow.querySelector('.save-btn').style.display = 'inline'; // Show save button
            });

            // Add event listener to the "Save" button
            const saveButton = reviewRow.querySelector('.save-btn');
            saveButton.addEventListener('click', async () => {
                const id = reviewRow.querySelector('.star-rating').dataset.id;
                const title = reviewRow.querySelector('input').value;
                const reviewText = reviewRow.querySelector('textarea').value;
                const ranking = reviewRow.querySelector('.star-rating').dataset.rating;

                try {
                    await fetch(`${API_URL}/${id}`, {
                        method: 'PATCH',
                        headers: getHeaders(),
                        body: JSON.stringify({
                            title,
                            review_text: reviewText,
                            ranking
                        })
                    });
                    alert('Review updated successfully!');
                    fetchReviews(); // Refresh the reviews list
                } catch (error) {
                    console.error('Error updating review:', error);
                }
            });

            const deleteButton = reviewRow.querySelector('.delete-btn');
            deleteButton.addEventListener('click', () => deleteReview(review.id));

            // Setup star rating for this review
            const starRating = reviewRow.querySelector('.star-rating');
            setupStarRating(starRating);
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
    }
}


// FETCH REVIEWS ENDE

function toggleEditMode(container, isEditing) {
    const inputs = container.querySelectorAll('input, textarea');
    const starRating = container.querySelector('.star-rating');
    const editButton = container.querySelector('.edit-btn');
    const saveButton = container.querySelector('.save-btn');

    inputs.forEach(input => {
        input.readOnly = !isEditing;
    });

    starRating.classList.toggle('readonly', !isEditing);

    editButton.style.display = isEditing ? 'none' : 'inline';
    saveButton.style.display = isEditing ? 'inline' : 'none';
}

function setupStarRating(starRating) {
    starRating.addEventListener('click', (event) => {
        const star = event.target;
        if (star.classList.contains('fa-star') && !starRating.classList.contains('readonly')) {
            const rating = parseInt(star.dataset.star);
            starRating.querySelectorAll('.fa-star').forEach(star => {
                star.classList.toggle('checked', parseInt(star.dataset.star) <= rating);
            });
            starRating.dataset.rating = rating;
        }
    });
}

// Function to delete a review
async function deleteReview(reviewId) {
    if (confirm('Are you sure you want to delete this review?')) {
        try {
            const response = await fetch(`${API_URL}/${reviewId}`, {
                method: 'DELETE',
                headers: getHeaders(),
            });

            if (response.ok) {
                alert('Review deleted successfully!');
                fetchReviews(); // Refresh the reviews list
            } else {
                alert('Failed to delete the review. Please try again.');
            }
        } catch (error) {
            console.error('Error deleting review:', error);
        }
    }
}


// Initial fetch of reviews when the page loads
document.addEventListener('DOMContentLoaded', fetchReviews);


