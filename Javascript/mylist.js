//load the saved watchlist from localStorage 
function loadWatchlist() {
  return JSON.parse(localStorage.getItem("watchlist")) || [];
}

//save the watchlist back to localStorage
function saveWatchlist(watchlist) {
  localStorage.setItem("watchlist", JSON.stringify(watchlist));
}

//show the watchlist as a table on the page
function displayWatchlist() {
  const watchlist = loadWatchlist();
  const container = document.getElementById("watchlist");

  displayStats(watchlist);   //update the stats every time the list is shown

  //if the list is empty, show a message instead of an empty table
  if (watchlist.length === 0) {
    container.innerHTML = `
      <p class="text-muted">Your list is empty. Go to the <a href="index.html">Home page</a> to add some anime!</p>
    `;
    return;
  }

  //build one table row for each saved anime
  let rows = "";
  for (const anime of watchlist) {
    const rating = anime.rating
      ? (Number(anime.rating) / 10).toFixed(1)
      : "N/A";

    rows += `
      <tr>
        <td><img src="${anime.poster}" alt="${anime.title} poster" width="60"></td>
        <td>${anime.title}</td>
        <td><iconify-icon icon="mdi:star" style="color: #f5c518;"></iconify-icon> ${rating}</td>
        <td>${anime.status}</td>

        <!-- three-dot menu -->
        <td class="text-end">
          <div class="dropdown">
            <button class="btn btn-light btn-sm" data-bs-toggle="dropdown">
              <iconify-icon icon="mdi:dots-vertical"></iconify-icon>
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li><button class="dropdown-item status-option" data-id="${anime.id}" data-status="Plan to Watch">Plan to Watch</button></li>
              <li><button class="dropdown-item status-option" data-id="${anime.id}" data-status="Watching">Watching</button></li>
              <li><button class="dropdown-item status-option" data-id="${anime.id}" data-status="Completed">Completed</button></li>
              <li><hr class="dropdown-divider"></li>
              <li><button class="dropdown-item text-danger remove-option" data-id="${anime.id}">Remove</button></li>
            </ul>
          </div>
        </td>
      </tr>
    `;
  }

  //put the rows inside a full table
  container.innerHTML = `
    <table class="table table-striped align-middle">
      <thead>
        <tr>
          <th>Poster</th>
          <th>Title</th>
          <th>Rating</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;

  setupMenuOptions();
}

//count the anime in the list and show a summary
function displayStats(watchlist) {
  const statsContainer = document.getElementById("list-stats");

  //show nothing if the list is empty (the "list is empty" message covers it)
  if (watchlist.length === 0) {
    statsContainer.innerHTML = "";
    return;
  }

  //count how many anime have each status
  let planCount = 0;
  let watchingCount = 0;
  let completedCount = 0;

  for (const anime of watchlist) {
    if (anime.status === "Plan to Watch") {
      planCount++;
    } else if (anime.status === "Watching") {
      watchingCount++;
    } else if (anime.status === "Completed") {
      completedCount++;
    }
  }

  //show the totals as a line of coloured badges
  statsContainer.innerHTML = `
    <p class="mb-3">
      <strong>${watchlist.length} Saved</strong>
      <span class="badge bg-secondary ms-2">${planCount} Plan to Watch</span>
      <span class="badge bg-primary ms-1">${watchingCount} Watching</span>
      <span class="badge bg-success ms-1">${completedCount} Completed</span>
    </p>
  `;
}

//give every menu option a click event
function setupMenuOptions() {
  //status options (Plan to Watch / Watching / Completed)
  const statusButtons = document.querySelectorAll(".status-option");
  for (const button of statusButtons) {
    button.addEventListener("click", function () {
      changeStatus(button.dataset.id, button.dataset.status);
    });
  }

  //remove options
  const removeButtons = document.querySelectorAll(".remove-option");
  for (const button of removeButtons) {
    button.addEventListener("click", function () {
      removeAnime(button.dataset.id);
    });
  }
}

//change one anime's status
function changeStatus(id, newStatus) {
  const watchlist = loadWatchlist();
  const anime = watchlist.find(item => item.id === id);
  anime.status = newStatus;
  saveWatchlist(watchlist);
  displayWatchlist();   //redraw the table (and stats) so the change shows
}

//remove one anime from the list
function removeAnime(id) {
  const watchlist = loadWatchlist();
  const updatedList = watchlist.filter(item => item.id !== id);
  saveWatchlist(updatedList);
  displayWatchlist();   //redraw the table (and stats) so the anime disappears
}

//run when the page loads
displayWatchlist();