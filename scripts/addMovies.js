document.getElementById('uploadButton').addEventListener('click', function() {
    const input = document.getElementById('csvFileInput');
    const statusMessage = document.getElementById('statusMessage');
    
    if (!input.files.length) {
        alert('Please select a CSV file first.');
        return;
    }

    const file = input.files[0];
    Papa.parse(file, {
        header: true,
        complete: function(results) {
            const data = results.data;
            uploadToPocketBase(data, statusMessage);
        },
        error: function(error) {
            console.error('Error parsing CSV file:', error);
            statusMessage.textContent = 'Error parsing CSV file. Please check the console for details.';
        }
    });
});

async function uploadToPocketBase(data, statusMessage) {
    const filteredData = data.map(row => {
        // Parse the genre field to extract only the genre names
        let genreNames = [];
        try {
            const genresArray = JSON.parse(row.genres);  // Adjust this if the field name is different in your CSV
            genreNames = genresArray.map(genre => genre.name).join(', '); // Join multiple genres into a string
        } catch (error) {
            console.error('Error parsing genre JSON:', error);
        }

        return {
            movie_id: row.id,  // Adjust this if the CSV header is different
            title: row.title,
            genre: genreNames, // Use the parsed genre names
            overview: row.overview,
            original_language: row.original_language,
            release_date: row.release_date,
            minutes: row.runtime,
            homepage: row.homepage

        };
    });

    statusMessage.textContent = 'Uploading data...';

    for (const item of filteredData) {
        try {
            const response = await fetch('http://localhost:8090/api/collections/Movies/records', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer 120' // Replace with a valid token
                },
                body: JSON.stringify(item)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            console.log(`Uploaded: ${item.title}`);
        } catch (error) {
            console.error('Error uploading to PocketBase:', error);
            statusMessage.textContent = `Error uploading some data. Please check the console for details.`;
            return;
        }
    }

    statusMessage.textContent = 'All data uploaded successfully!';
}
