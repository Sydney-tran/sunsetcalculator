let sunburst = new SunburstJS({
  clientId: '0d717d0f-158c-495d-903c-38cf56f7deeb',
  clientSecret: 'nNruV4wLJWztEcGkmG8KTI94uXPWTIoK',
  scope: ['predictions']
});

// https://github.com/sunsetwx/sunburst.js
function calculate(location, days){
  (async () => {
  try {
    const today = new Date();
    var inputs = [];
    for (var i = 0; i < days.length; i++) {
      var date = new Date();
      inputs.push({
        geo: [location.lat, location.lng],
        type: 'sunset',
        after: date.setDate(today.getDate() + days[i]),
      });
    }
    const resp = await sunburst.batchQuality(inputs);

    //window.location.href = "https://sydney-tran.github.io/sunsetcalculator/results.html";
    window.location.href = "results.html";

    var results = [];
    var dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    var descriptions = ["Little to no color, with precipitation or a thick cloud layer often blocking a direct view of the sun.", 
                        "Some color for a short time, with conditions ranging from mostly cloudy, or hazy, to clear, with little to no clouds at all levels.",
                        "A fair amount of color, often multi-colored, lasting a considerable amount of time. Often caused by scattered clouds at multiple levels.", 
                        "Extremely vibrant color lasting 30 minutes or more. Often caused by multiple arrangements of clouds at multiple levels, transitioning through multiple stages of vivid color."];
    var images = ["img/poor.jpg", "img/fair.jpg", "img/good.png", "img/great.jpg"];
    var index = 0;
    resp.forEach(({ collection, error }) => {
      if (error) {
        // Handle individual query errors separately,
        // as some queries may have still succeeded.
        return console.error(error);
      }
      var date = new Date();
      date.setDate(today.getDate() + days[index]);
      
      var properties = collection.features[0].properties;
      
      var time = properties.validAt;
      var hour = (parseInt(time.substring(11, 13)) + 7) % 12;
      hour = hour == 0 ? 12 : hour;
      var minute = parseInt(time.substring(14, 16));

      var percent  = properties.qualityPercent;
      var dimgindex = Math.floor(percent / 25);

      results.push({
        day: dayNames[date.getDay()],
        time: hour + ":" + minute + " EST",
        quality: properties.quality,
        percent: percent + "%",
        description: descriptions[dimgindex],
        image: images[dimgindex],
      });

      index++;

    });
    localStorage.setItem("results", JSON.stringify(results));
    // console.log(results);

  } catch (ex) {
    // Handle general network or parsing errors.
    return console.error(ex);
  }
})();
}

function calculateSunset(){
  var zip = document.querySelector("#zip").value;
  //https://stackoverflow.com/questions/52770661/get-latitude-and-longitude-from-zip-code-javascript
  fetch("https://maps.googleapis.com/maps/api/geocode/json?address="+zip+"&key=AIzaSyD-gd2vtXBRWD7GhFltpsBOBNxhRWORy-4")
    .then(response => response.json())
    .then(data => {
      const location = data.results[0].geometry.location;
      var days = getDays();
      calculate(location, days);
    });
}

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

  // var i = -1;
  // for(i; i <= 3; i++) {
  //   if (document.getElementById("day" + i).checked) {
  //     days.push(i);
  //   }
  // }

  return days;
}