document.addEventListener('DOMContentLoaded', function () {
    const API_KEY = 'your_api_key'; // Ersetzen Sie 'your_api_key' durch Ihren tatsächlichen API-Schlüssel
    const contentDiv = document.getElementById('content');

    function fetchMovies(query) {
        const url = `http://www.omdbapi.com/?s=${query}&apikey=${API_KEY}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.Response === 'True') {
                    displayMovies(data.Search);
                } else {
                    contentDiv.innerHTML = `<p>Keine Filme oder Serien gefunden.</p>`;
                }
            })
            .catch(error => console.error('Error:', error));
    }

    function displayMovies(movies) {
        contentDiv.innerHTML = ''; // Clear previous content

        movies.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.className = 'movie-card';

            movieCard.innerHTML = `
                <img src="${movie.Poster}" alt="${movie.Title}">
                <h3>${movie.Title}</h3>
                <p>${movie.Year}</p>
            `;

            contentDiv.appendChild(movieCard);
        });
    }

    // Beispiel: Suche nach dem Begriff "Batman"
    fetchMovies('Batman');
});
