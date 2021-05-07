// begin cited code
// https://sunburst.sunsetwx.com/v1/docs/
// Variable created using Sunburst API from SunsetWx.
let sunburst = new SunburstJS({
  clientId: '29aa58af-6d28-44ad-924f-63544b7cf63d',
  clientSecret: 'Ill8EF0KuiKWq8NSYSZrEyjlHty5R0dS',
  scope: ['predictions']
});
// end cited code

// begin cited code
// https://stackoverflow.com/questions/52770661/get-latitude-and-longitude-from-zip-code-javascript
/**
 * Uses inputted zip code to find latitude, longtitude, and time zone of location and calls 
 * calculate function.
 */
function calculateSunset(){
  var zip = document.querySelector("#zip").value;
  if (!validZip(zip)) {
    alert("please enter valid zip code");
  } else {
    fetch("https://maps.googleapis.com/maps/api/geocode/json?address="+zip
    +"&key=AIzaSyD-gd2vtXBRWD7GhFltpsBOBNxhRWORy-4")
    .then(response => response.json())
    .then(data => {
      var timezone = lookup(zip);
      if (timezone == null || data.results.length < 1) {
        alert("please enter valid zip code");
      } else {
        var location = data.results[0].geometry.location;
        calculate(location, timezone);
      }
    });
  }
}
// end cited code

/**
 * 
 * Main method of the program that calls functions to create inputs, get data from the Sunburst 
 * API, create results from the data, rank the result if the user would like to view results in
 * ranked order, and saves the results in local storage.
 * 
 * @param {object} location 
 * @param {string} timezone 
 */
function calculate(location, timezone){
  (async () => {
    try {
      const today = new Date();
      var type = await getType();
      var days = await getDays();
      var inputs = await createInputs(today, location, type, days);
      
      var data = await sunburst.batchQuality(inputs);

      window.location.href = "results.html";
      
      var results = await createResults(today, days, timezone, data);

      if (isRanked()) {
        await rank(results);
      }

      localStorage.setItem("results", JSON.stringify(results));

    } catch (ex) {
      return console.error(ex);
    }
  })();
}

/**
 * 
 * Returns boolean value containing whether or not the given zip code is in a valid format
 * (5 digits).
 * 
 * @param {string} zip 
 * @returns {boolean} isZip
 */
function validZip(zip) {
  const zipPattern = /^\d{5}$/;
  var isZip = zipPattern.test(zip);
  return isZip;
}

/**
 * 
 * Creates and returns array of the inputs, including the location, the type (either sunrise 
 * or sunset), and the dates the sunrises/sunsets occur after, given the current date, the 
 * location, the type, and the array of days.
 * 
 * @param {date} today 
 * @param {object} location 
 * @param {string} type 
 * @param {int array} days 
 * @returns {object array} inputs 
 */
function createInputs(today, location, type, days) {
  var inputs = [];
  for (var i = 0; i < days.length; i++) {
    var date = new Date();
    inputs.push({
      geo: [location.lat, location.lng],
      type: type,
      after: date.setDate(today.getDate() + days[i]),
    });
  }
  return inputs;
}

/**
 * 
 * Creates and returns array of the results, including the names of the days, the times of the 
 * sunrises/sunsets, the qualities of the sunrises/sunsets, the quality percents of the 
 * sunrises/sunsets, descriptions of the sunrises/sunsets, and the image paths for the 
 * sunrises/sunsets, given the current date, the days selected, the time zone, and the Sunburst 
 * API data.
 * 
 * @param {date} today 
 * @param {int array} days 
 * @param {string} timezone 
 * @param {sunburst batch} data 
 * @returns {object array} results
 */

function createResults(today, days, timezone, data) {
  var dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  var descriptions = ["Little to no color, with precipitation or a thick cloud layer often blocking a direct view of the sun.", 
  "Some color for a short time, with conditions ranging from mostly cloudy, or hazy, to clear, with little to no clouds at all levels.",
  "A fair amount of color, often multi-colored, lasting a considerable amount of time. Often caused by scattered clouds at multiple levels.", 
  "Extremely vibrant color lasting 30 minutes or more. Often caused by multiple arrangements of clouds at multiple levels, transitioning through multiple stages of vivid color."];
  var images = ["img/poor.jpg", "img/fair.jpg", "img/good.png", "img/great.jpg"];

  var results = [];
  var index = 0;
  data.forEach(({ collection, error }) => {
    if (error) {
      return console.error(error);
    } else {
      var day = new Date();
      day.setDate(today.getDate() + days[index]);
      
      var properties = collection.features[0].properties;
      
      var time = new Date(properties.validAt);
      time = time.toLocaleTimeString("en-US", {timeZone: timezone});

      var percent  = properties.qualityPercent;
      var dimgindex;
      if (percent < 25) {
        dimgindex = 0;
      } else if (percent < 50) {
        dimgindex = 1;
      } else if (percent < 75) {
        dimgindex = 2;
      } else {
        dimgindex = 3;
      }

      results.push({
        day: dayNames[day.getDay()],
        time: time,
        quality: properties.quality,
        percent: percent,
        description: descriptions[dimgindex],
        image: images[dimgindex],
      });
      index++;
    }
  });
  return results;
}

// begin cited code
// https://www.w3resource.com/javascript-exercises/searching-and-sorting-algorithm/searching-and-sorting-algorithm-exercise-4.php
/**
 * 
 * Uses insertion sort to order the array of results from best sunrise/sunset quality to worst 
 * sunrise/sunset quality.
 * 
 * @param {object array} results 
 */
function rank(results) {
  for (var i = 1; i < results.length; i++) {
    var temp = results[i];
    var j = i - 1;
    while (j >= 0 && temp.percent > results[j].percent) {
      results[j + 1] = results[j];
      j--;
    }
    results[j + 1] = temp;
  }
}
// end cited code

/**
 * 
 * Returns the type (sunrise or sunset) the user would like to view based on the status of the 
 * checkbox element "sunset".
 * 
 * @returns {string} type
 */
function getType() {
  if (document.getElementById("sunset").checked) {
    return 'sunset';
  }
  return 'sunrise';
}

/**
 * 
 * Returns an array of integers containing the value of the days relative to the current day that 
 * the user has selected.
 * Ex. the previous day would be stored in the array as -1, the current day as 0, two days after 
 * the current day as 2, etc.
 * 
 * @returns {int array} days
 */
function getDays() {
  var days = [];
  if (document.getElementById("day-1").checked) {
    days.push(-1);
  }
  if (document.getElementById("day").checked) {
    days.push(0);
  }
  if (document.getElementById("day1").checked) {
    days.push(1);
  }
  if (document.getElementById("day2").checked) {
    days.push(2);
  }
  if (document.getElementById("day3").checked) {
    days.push(3);
  }
  if (days.length == 0) {
    alert("please choose days");
  }
  return days;
}

/**
 * 
 * Returns a boolean value containing whether or not the user would like to view the sunrise 
 * or sunset qualities in a ranked order.
 * 
 * @returns {boolean} isRanked
 */
function isRanked() {
  var isRanked;
  if (document.getElementById("ranking").checked) {
    isRanked = true;
  } else {
    isRanked = false;
  }
  return isRanked;
}

// begin cited code
// https://www.w3schools.com/howto/howto_js_slideshow.asp
var slideIndex = 0;

/**
 * 
 * Moves results slides n spaces (forward for positive values of n and backward for negative 
 * values of n).
 * 
 * @param {int} n 
 */
function moveSlides(n) {
  slideIndex += n;
  showSlides();
}

/**
 * Displays the results slides.
 */
function showSlides() {
  var i;
  var slides = document.getElementsByClassName("slides");
  if (slideIndex >= slides.length) {
    slideIndex = 0;
  }
  if (slideIndex < 0) {
    slideIndex = slides.length - 1;
  }
  for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
  }
  slides[slideIndex].style.display = "block";
}
// end cited code