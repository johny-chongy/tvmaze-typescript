import axios from "axios";
import * as $ from 'jquery';

const BASE_URL = "https://api.tvmaze.com";
const DEFAULT_IMG_URL = "https://as2.ftcdn.net/v2/jpg/04/60/03/13/1000_F_460031310_ObbCLA1tKrqjsHa7je6G6BSa7iAYBANP.jpg"

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");

interface ShowInterface {
  id: number,
  name: string,
  summary: string,
  image: string
};

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term): Promise<ShowInterface[]> {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  const showResponses = await axios.get(
    `${BASE_URL}/search/shows?q=${term}`
  );
  console.log("getrequest result: ", showResponses.data);

  const ShowInterfaces: ShowInterface[] = showResponses.data.map(result => ({
    id:result.show.id,
    name: result.show.name,
    summary: result.show.summary,
    image: result.show.image?.medium || DEFAULT_IMG_URL
  }))

  return ShowInterfaces;
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src=${show.image}
              alt=${show.name}
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

// async function getEpisodesOfShow(id) { }

/** Write a clear docstring for this function... */

// function populateEpisodes(episodes) { }