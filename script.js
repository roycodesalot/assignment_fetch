// script.js
let form = document.getElementById("tv_form");
let searchButton = document.getElementById("searchButton");

// clear the error and submit the form when clicking search button
searchButton.addEventListener("click", function () {
    form.dispatchEvent(new Event("submit"));
});

// handle what happens when the form is submitted
form.addEventListener("submit", function (event) {
    event.preventDefault();

    // global cleanup: clear old cards and old errors right away
    let tvList = document.getElementById("tv_list");
    let errorDisplay = document.getElementById("error_message");
    tvList.innerHTML = "";
    errorDisplay.textContent = "";

    const limit = 10; // limit the number of results to 10

    let tvTitle = document.getElementById("tv_title").value;
    let result = tvTitle.trim();

    // empty search check
    if (result == "") {
        errorDisplay.textContent = "Enter TV Show";
        return null;
    }

    // fetch the show data from tvmaze api
    fetch(
        `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(tvTitle)}`,
    )
        // handle the response from the API
        .then((response) => {
            // handle too many requests rate limit error specifically
            if (response.status === 429) {
                throw new Error("Rate limit exceeded. Please wait and try again later.");
            }
            // check if the response is ok
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then((data) => {
            // error message if nothing is found from the search
            if (data.length == 0) {
                errorDisplay.textContent = "No Show Found";
                return null;
            }

            data.slice(0, limit).forEach((item) => {
                // create a list item for each TV show and append it to the list
                let li = document.createElement("li");
                li.textContent = item.show.name;
                tvList.appendChild(li);

                // check if the show has an image and append it to the list item
                if (item.show.image && item.show.image.medium) {
                    let img = document.createElement("img");
                    img.src = item.show.image.medium;
                    img.alt = item.show.name + " poster";
                    li.appendChild(img);
                }

                // checking summary
                if (item.show && item.show.summary) {
                    let text = item.show.summary;
                    let result = text.replace(/<[^>]*>/g, ""); // strip html tags out of summary

                    const para = document.createElement("p");
                    para.textContent = result;
                    li.appendChild(para);
                } else {
                    const para = document.createElement("p");
                    para.textContent = "Not Available";
                    li.appendChild(para);
                }

                // premiere block
                if (item.show.premiered) {
                    const para = document.createElement("p");
                    para.textContent = item.show.premiered;
                    li.appendChild(para);
                } else {
                    const para = document.createElement("p");
                    para.textContent = "Not Available";
                    li.appendChild(para);
                }

                // setting the date and time
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

                // genres block
                const genrePara = document.createElement("p");
                if (item.show.genres && item.show.genres.length > 0) {
                    genrePara.textContent = item.show.genres.join(", ");
                } else {
                    genrePara.textContent = "Not Available";
                }
                li.appendChild(genrePara);

                // average rating block
                const ratePara = document.createElement('p');
                if (item.show.rating && item.show.rating.average){
                    ratePara.textContent = item.show.rating.average;
                } else {
                    ratePara.textContent = "Not Available"
                }
                li.appendChild(ratePara);

                // tvmaze link block
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

                // fetch the cast details for the current show card
                fetch(`https://api.tvmaze.com/shows/${item.show.id}/cast`)
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error("Network response was not ok");
                        }
                        return response.json();
                    })
                    .then((cast) => {
                        // checking if cast list exists and limit to top 5 members
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
                    })
                    .catch((castError) => {
                        // catch standalone failures for cast fetch
                        console.error("Cast Error:", castError);
                        const card = document.createElement("p");
                        card.textContent = "Cast Not Available";
                        li.appendChild(card);
                    });
            });
        })
        .catch((error) => {
            // display connection errors or custom messages like 429
            console.error("Error:", error);
            document.getElementById("error_message").textContent = error.message;
        });
});

// function to initialize the search input and trigger the search on page load
function initialize() {
    let searchInput = document.getElementById("tv_title");
    // set default search value to Horror when page first loads
    searchInput.value = "Horror"; 
    form.dispatchEvent(new Event("submit"));
}

// clear the error message as soon as the user begins typing something new
let searchInput = document.getElementById("tv_title");
searchInput.addEventListener("input", function () {
    document.getElementById("error_message").textContent = "";
});
