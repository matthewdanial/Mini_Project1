//stores the search results so the buttons can look them up later
let searchResults = [];

//run a search when the form is submitted
const form = document.getElementById("search-form");

form.addEventListener("submit", function (event) {
  event.preventDefault();   //stop the page from reloading

  const searchTerm = document.getElementById("search-input").value.trim();
  searchAnime(searchTerm);
});

//fetch anime from the API that match what the user typed
async function searchAnime(searchTerm) {
  const container = document.getElementById("search-results");
  container.innerHTML = `<p class="text-muted">Searching...</p>`;   //loading message

  try {
    const url = "https://kitsu.io/api/edge/anime?filter[text]=" + encodeURIComponent(searchTerm);
    const response = await fetch(url);

    //stops if server replies with an error
    if (!response.ok) {
      throw new Error("Request failed with status " + response.status);
    }
    const result = await response.json();
    searchResults = result.data;

    //show a message if nothing matched
    if (searchResults.length === 0) {
      container.innerHTML = `<p class="text-muted">No anime found for "${searchTerm}". Try another search.</p>`;
      return;
    }

    displayAnime(searchResults);
  } catch (error) {
    console.error("Could not search anime:", error);
    container.innerHTML = `<p class="text-danger">Something went wrong. Please try again.</p>`;
  }
}

//building a card for each anime to put on the page
function displayAnime(animeList) {
  const container = document.getElementById("search-results");
  let html = "";

  for (const anime of animeList) {
    const info = anime.attributes;

    const rating = info.averageRating
      ? (Number(info.averageRating) / 10).toFixed(1)
      : "N/A";

    //some anime have no posters, so use a placeholder image instead
    const poster = info.posterImage
      ? info.posterImage.small
      : "https://placehold.co/225x320?text=No+Image";

    html += `
      <div class="col-6 col-md-4 col-lg-3 mb-4">
        <div class="card h-100">
          <img src="${poster}" class="card-img-top" alt="${info.canonicalTitle} poster">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${info.canonicalTitle}</h5>
            <p class="card-text">
              <iconify-icon icon="mdi:star" style="color: #f5c518;"></iconify-icon> ${rating} / 10
            </p>
            <button class="btn btn-primary btn-sm mt-auto add-btn" data-id="${anime.id}">
              Add to My List
            </button>
          </div>
        </div>
      </div>
    `;
  }

  container.innerHTML = html;
  setupAddButtons();
}

//give every "Add to My List" button a click event
function setupAddButtons() {
  const buttons = document.querySelectorAll(".add-btn");

  for (const button of buttons) {
    button.addEventListener("click", function () {
      addToList(button.dataset.id);
      button.textContent = "Added";
      button.disabled = true;
    });
  }
}

//save one anime to the watchlist in localStorage
function addToList(id) {
  const anime = searchResults.find(item => item.id === id);   //searchResults instead of trendingAnime
  const info = anime.attributes;

  const watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

  const alreadyAdded = watchlist.some(item => item.id === id);
  if (alreadyAdded) {
    alert(info.canonicalTitle + " is already in your list.");
    return;
  }

  watchlist.push({
    id: id,
    title: info.canonicalTitle,
    poster: info.posterImage ? info.posterImage.small : "https://placehold.co/225x320?text=No+Image",
    rating: info.averageRating,
    status: "Plan to Watch"
  });

  localStorage.setItem("watchlist", JSON.stringify(watchlist));
}