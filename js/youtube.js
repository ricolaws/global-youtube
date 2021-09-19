"use strict";
//  ++++++++++++++++  load Google api client  ++++++++++++++++
gapi.load("client", loadClient);

function loadClient() {
  gapi.client.setApiKey("API_KEY");
  return gapi.client
    .load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
    .then(
      function () {
        console.log("GAPI client loaded for API");
      },
      function (err) {
        console.error("Error loading GAPI client for API", err);
      }
    );
}

// getting the input values from a Form and storing them in variables.
const ytForm = document.getElementById("yt-form");
const keywordInput = document.getElementById("keyword-input");
const maxresultInput = document.getElementById("maxresult-input");
const orderInput = document.getElementById("order-input");
const videoList = document.getElementById("videoListContainer");
var pageToken = "";

// form submission calls the execute function
ytForm.addEventListener("submit", (e) => {
  e.preventDefault();
  execute();
});

// page nav buttons call the execute function
function paginate(e, obj) {
  e.preventDefault();
  pageToken = obj.getAttribute("data-id");
  execute();
}

// ++++++++++++++++  The execute function  ++++++++++++++++
// Make sure the client is loaded before calling this method.
function execute() {
  const searchString = keywordInput.value;
  const maxresult = maxresultInput.value;
  const orderby = orderInput.value;

  var arr_search = {
    part: "snippet",
    type: "video",
    order: orderby,
    maxResults: 20,
    // q: searchString,
    // topicId: "/m/04rlf",
    location: "36.21804, 139.30181",
    locationRadius: "200km",
  };

  if (pageToken != "") {
    arr_search.pageToken = pageToken;
  }

  // call YouTube search API and display the result in the HTML
  return gapi.client.youtube.search.list(arr_search).then(
    function (response) {
      // Handle the results here (response.result has the parsed body).
      const listItems = response.result.items;
      const videoIdArray = [];

      if (listItems) {
        let output = "<h4>Videos</h4><ul>";

        listItems.forEach((item) => {
          const videoId = item.id.videoId;
          const videoTitle = item.snippet.title;

          videoIdArray.push(videoId);

          output += `
                    <li><a data-fancybox href="https://www.youtube.com/watch?v=${videoId}"><img src="http://i3.ytimg.com/vi/${videoId}/hqdefault.jpg" /></a><p>${videoTitle}</p></li>
                `;
        });
        output += "</ul>";

        if (response.result.prevPageToken) {
          output += `<br><a class="paginate" href="#" data-id="${response.result.prevPageToken}" onclick="paginate(event, this)">Prev</a>`;
        }

        if (response.result.nextPageToken) {
          output += `<a href="#" class="paginate" data-id="${response.result.nextPageToken}" onclick="paginate(event, this)">Next</a>`;
        }

        // Output list
        videoList.innerHTML = output;
      }
      return gapi.client.youtube.videos
        .list({
          part: ["contentDetails", "statistics"],
          id: videoIdArray,
        })
        .then(
          function (response) {
            // Handle the results here (response.result has the parsed body).
            // loop over response.result.items to get the view count of each video
            console.log(response.result);
            response.result.items.map((vid) =>
              console.log(vid.statistics.viewCount)
            );
          },
          function (err) {
            console.error("Execute error", err);
          }
        );
    },
    function (err) {
      console.error("Execute error", err);
    }
  );
}
