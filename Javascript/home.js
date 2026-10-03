//kitsu api link for the trending anime
const anime_url = "https://kitsu.io/api/edge/trending/anime";

//empty array to store the anime once they load, so other functions can use it
let trendingAnime = [];

//getting the trending anime from the kitsu api
async function getTrendingAnime() {
  try {
    //send the request and wait for the reply
    const response = await fetch(anime_url);

    //stop if the server sends back an error
    if (!response.ok) {
      throw new Error("Request failed with status " + response.status);
    }

    //turn the reply into a javascript object
    const result = await response.json();
    trendingAnime = result.data;   
    displayAnime(trendingAnime);   //show the anime on the page
  } catch (error) {
    //if anything goes wrong, show the error in the console
    console.error("Could not load trending anime:", error);
  }
}

//making a card for each anime and putting them on the page
function displayAnime(animeList) {
  const container = document.getElementById("trending-list");
  let html = "";

  //loop through every anime in the list
  for (const anime of animeList) {
    const info = anime.attributes;   //shortcut to the title, poster and rating

    //kitsu gives the rating out of 100 
    //if there's no rating available it shows as N/A instead
    const rating = info.averageRating
      ? (Number(info.averageRating) / 10).toFixed(1)
      : "N/A";

    //html for one card: poster, title, star rating and the add button
    html += `
      <div class="col-6 col-md-4 col-lg-3 mb-4">
        <div class="card h-100">
          <img src="${info.posterImage.small}" class="card-img-top" alt="${info.canonicalTitle} poster">
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

  //put all the cards on the page at once
  container.innerHTML = html;
  setupAddButtons();   //make the buttons clickable now that they're on the page
}

//adding a click event to every "Add to My List" button
function setupAddButtons() {
  const buttons = document.querySelectorAll(".add-btn");

  for (const button of buttons) {
    button.addEventListener("click", function () {
      addToList(button.dataset.id);   //send this anime's id to be saved
      button.textContent = "Added";   //change the button text
      button.disabled = true;         //stop it being clicked again
    });
  }
}

//saving an anime to the watchlist in localStorage
function addToList(id) {
  //find the anime that matches the button's id
  const anime = trendingAnime.find(item => item.id === id);
  const info = anime.attributes;

  //load the saved watchlist, or start a new empty one if there isn't one yet
  const watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

  //check if the anime is already in the list so it doesn't get added twice
  const alreadyAdded = watchlist.some(item => item.id === id);
  if (alreadyAdded) {
    alert(info.canonicalTitle + " is already in your list.");
    return;
  }

  //add the anime to the list, every new anime starts as "Plan to Watch"
  watchlist.push({
    id: id,
    title: info.canonicalTitle,
    poster: info.posterImage.small,
    rating: info.averageRating,
    status: "Plan to Watch"
  });

  //save the updated list back to localStorage 
  localStorage.setItem("watchlist", JSON.stringify(watchlist));
}

//load the trending anime as soon as the page opens
getTrendingAnime();