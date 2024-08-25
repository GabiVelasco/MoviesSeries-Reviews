function filterMovies() {
    const selectedGenre = filterGenre.value.toLowerCase().trim();
    const searchTitle = filterTitle.value.toLowerCase().trim();

    console.log('Selected Genre:', selectedGenre);
    console.log('Search Title:', searchTitle);

    const filteredMovies = allMovies.filter(movie => {
        // Normalize movie genres and check for substring match
        const movieGenres = movie.genre ? movie.genre.toLowerCase().split(',').map(g => g.trim()) : [];
        
        console.log('Movie Genres:', movieGenres);
        const genreMatch = selectedGenre
            ? movieGenres.some(genre => {
                const match = genre.includes(selectedGenre);
                console.log(`Checking genre "${genre}" against "${selectedGenre}": ${match}`);
                return match;
            })
            : true;

        // Check if the movie title starts with the search title
        const titleMatch = searchTitle
            ? movie.title?.toLowerCase().startsWith(searchTitle)
            : true;

        return genreMatch && titleMatch;
    });

    console.log('Filtered Movies:', filteredMovies);
    displayMovies(filteredMovies);
}
