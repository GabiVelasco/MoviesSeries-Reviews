document.getElementById('uploadButton').addEventListener('click', function() {
    const input = document.getElementById('csvFileInput');
    if (!input.files.length) {
        alert('Please select a CSV file first.');
        return;
    }

    const file = input.files[0];
    Papa.parse(file, {
        header: true, // Uses the first row of the CSV as the headers
        complete: function(results) {
            const data = results.data;
            uploadToPocketBase(data);
        },
        error: function(error) {
            console.error('Error parsing CSV file:', error);
        }
    });
});

async function uploadToPocketBase(data) {
    const filteredData = data.map(row => {
        return {
            id: row.id,
            title: row.title,
            genre: row.genres,
            overview: row.overview
        };
    });

    for (const item of filteredData) {
        try {
            await fetch('http://localhost:8090/api/collections/Movies/records', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer YOUR_API_TOKEN'
                },
                body: JSON.stringify(item)
            });
            console.log(`Uploaded: ${item.title}`);
        } catch (error) {
            console.error('Error uploading to PocketBase:', error);
        }
    }
}
