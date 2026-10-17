// script.js
let form = document.getElementById("tv_form");
let searchButton = document.getElementById("searchButton");
// Add an event listener to the search button to trigger the form submission
searchButton.addEventListener("click", function () {
    form.dispatchEvent(new Event("submit"));
});
// Add an event listener to the form submission
form.addEventListener("submit", function (event) {
    event.preventDefault();

    const limit = 10; // Limit the number of results to 10

    let tvTitle = document.getElementById("tv_title").value;
    let result = tvTitle.trim();
    //empty search check
    if (result == "") {
        document.getElementById("error_message").textContent = "Enter TV Show";

        return null;
    }

    fetch(
        `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(tvTitle)}`,
    )
        // Handle the response from the API
        .then((response) => {
            // Check if the response is ok
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then((data) => {
            //error message if nothing is enter
            if (data.length == 0) {
                document.getElementById("error_message").textContent =
                    "No Show Found";

                return null;
            }
            let tvList = document.getElementById("tv_list");
            tvList.innerHTML = "";
            data.slice(0, limit).forEach((item) => {
                // Create a list item for each TV show and append it to the list
                let li = document.createElement("li");
                li.textContent = item.show.name;
                tvList.appendChild(li);
                // Check if the show has an image and append it to the list item
                if (item.show.image && item.show.image.medium) {
                    let img = document.createElement("img");
                    img.src = item.show.image.medium;
                    img.alt = item.show.name + " poster";
                    li.appendChild(img);
                }
                //chekcing summary
                if (item.show && item.show.summary) {
                    let text = item.show.summary;
                    let result = text.replace(/<[^>]*>/g, "");

                    const para = document.createElement("p");
                    para.textContent = result;
                    li.appendChild(para);
                } else {
                    const para = document.createElement("p");
                    para.textContent = "Not Available";
                    li.appendChild(para);
                }
                //premiere block
                if (item.show.premiered) {
                    const para = document.createElement("p");
                    para.textContent = item.show.premiered;
                    li.appendChild(para);
                } else {
                    const para = document.createElement("p");
                    para.textContent = "Not Available";
                    li.appendChild(para);
                }
                //setting the date anf time
                if (item.show.updated) {
                    let milsec = item.show.updated * 1000;
                    const time = new Date(milsec);
                    let sec = time.toLocaleString();

                     const para = document.createElement("p");
                    para.textContent = sec;
                    li.appendChild(para);
                } else {
                    const para = document.createElement("p");
                    para.textContent = "Not Available";
                    li.appendChild(para);
                }

                //genres
                const genrePara = document.createElement("p");
                if (item.show.genres && item.show.genres.length > 0) {
                    genrePara.textContent = item.show.genres.join(", ");
                } else {
                    genrePara.textContent = "Not Available";
                }
                li.appendChild(genrePara);

                //average rating
                const ratePara = document.createElement('p');
                if (item.show.rating && item.show.rating.average){
                    ratePara.textContent = item.show.rating.average;
                } else {
                    ratePara.textContent = "Not Available"
                }
                li.appendChild(ratePara);

                //tvmaze link
                const hreflink = document.createElement("a");
                if (item.show.url) {
                    hreflink.href = item.show.url;
                    hreflink.textContent = "View on TVMaze";
                    hreflink.target = "_blank";
                    hreflink.rel = "noopener noreferrer";
                    li.appendChild(hreflink);
                } else {
                    const para = document.createElement("p");
                    para.textContent = "Not Available";
                    li.appendChild(para);
                }

                //For the search cast api
                fetch(`https://api.tvmaze.com/shows/${item.show.id}/cast`)
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error("Network response was not ok");
                        }
                        return response.json();
                    })
                    .then((cast) => {
                        if (cast.length > 0) {
                            let castList = document.createElement("ul");
                            cast.slice(0, 5).forEach((member) => {
                                let castItem = document.createElement("li");
                                castItem.textContent = member.person.name;
                                castList.appendChild(castItem);
                            });
                            li.appendChild(castList);
                        } else {
                            const card = document.createElement("p");
                            card.textContent = "Not Available";
                            li.appendChild(card);
                        }
                    });
            });
        })
        .catch((error) => {
            console.error("Error:", error);
            document.getElementById("error_message").textContent =
                "An error occurred while fetching TV show data.";
        });
});

// Function to initialize the search input and trigger the search on page load
function initialize() {
    let searchInput = document.getElementById("tv_title");
    // Set the default value of the search input to a specific URL
    searchInput.value = "Horror"; // You can change this to any default search term you want
    // Trigger the search when the page loads
    form.dispatchEvent(new Event("submit"));
}
// Add an event listener to the search input to clear the error message when the user starts typing
let searchInput = document.getElementById("tv_title");
searchInput.addEventListener("input", function () {
    // Clear the error message when the user starts typing
    document.getElementById("error_message").textContent = "";
});
