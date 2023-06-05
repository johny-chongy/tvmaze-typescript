import axios from "axios";
import * as $ from 'jquery';

const BASE_URL = "https://api.tvmaze.com";
const DEFAULT_IMG_URL = "https://as2.ftcdn.net/v2/jpg/04/60/03/13/1000_F_460031310_ObbCLA1tKrqjsHa7je6G6BSa7iAYBANP.jpg"

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const $episodesList = $("#episodesList")

interface ShowInterface {
  id: number,
  name: string,
  summary: string,
  image: string
};

interface ShowFromApiInterface {
  id: number,
  name: string,
  summary: string,
  image: {medium: string} | null
};

interface EpisodeInterface {
  id: number,
  name: string,
  season: string,
  number: string
};

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term: string): Promise<ShowInterface[]> {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  const showResponses = await axios.get(
    `${BASE_URL}/search/shows?q=${term}`
  );
  console.log("getrequest result: ", showResponses.data);

  const ShowInterfaces: ShowInterface[] = showResponses.data.map(
    (result: {show: ShowFromApiInterface}) => ({
        id: result.show.id,
        name: result.show.name,
        summary: result.show.summary,
        image: result.show.image?.medium || DEFAULT_IMG_URL
  }))

  return ShowInterfaces;
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows: ShowInterface[]) {
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

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay(): Promise<void> {
  const term = $("#searchForm-term").val() as string;
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt: JQuery.SubmitEvent) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id: number): Promise<EpisodeInterface[]> {
  const episodeResponses = await axios.get(
    `${BASE_URL}/shows/${id}/episodes`
  );
  // console.log("getrequestepisode result: ", episodeResponses.data);

  const EpisodeInterfaces: EpisodeInterface[] = episodeResponses.data.map(
    (episode: EpisodeInterface)=> ({
        id: episode.id,
        name: episode.name,
        season: episode.season,
        number: episode.number
  }))

  return EpisodeInterfaces;
}

/** populateEpisodes takes in an array of episodes, empties the episodesList
 *  container and iterates through the episodes array and appends an <li>
 *  element to the episodesList <ul>
 *
 *  input: episodes ([{id, name, season, number}, ...])
 *  output: <li>...tv show episode info here...</li>
 */
function populateEpisodes(episodes: EpisodeInterface[]) {
  $episodesList.empty();
  for (let episode of episodes) {
    const $episode = $(
      `<li>
          <span>
            ${episode.name} (season ${episode.season}, episode ${episode.number})
          </span>
        </li>
      `);

    $episodesList.append($episode);
  }
}

async function clickedAndShowEpisodes(evt: JQuery.ClickEvent) {
  $episodesArea.show();
  const showId: number = $(evt.target).closest(".Show").data("show-id");
  // console.log("showId type:", typeof showId);
  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);

}

$showsList.on("click",".Show-getEpisodes", clickedAndShowEpisodes);