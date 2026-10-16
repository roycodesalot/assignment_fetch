

async function fetchData() {
    try {

        const tvTitle = document.getElementById('tv_title').value;
        const response = await fetch('https://api.tvmaze.com/search/shows?q=' + encodeURIComponent(tvTitle));

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error('Error fetching search results:', error);
    }
}