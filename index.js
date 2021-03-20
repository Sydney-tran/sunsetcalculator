let sunburst = new SunburstJS({
  clientId: 'c3818fb9-d07a-4f6b-99b8-e7ecb726e2e2',
  clientSecret: 'Rf71W9Vndd3mjO8WfkJFvwwiydlxw0WG',
  scope: ['predictions']
});

function calculateSunset(){
  var zip = document.querySelector("#zip").value;
  fetch("https://maps.googleapis.com/maps/api/geocode/json?address="+zip+"&key=AIzaSyD-gd2vtXBRWD7GhFltpsBOBNxhRWORy-4")
    .then(response => response.json())
    .then(data => {
      var location = data.results[0].geometry.location;
      calculate(location);
    });
}

function calculate(location){
  (async () => {
  try {
    const today = new Date();
    var type = getType();
    var days = getDays();
    var inputs = createInputs(today, location, type, days);
    const resp = await sunburst.batchQuality(inputs);

    window.location.href = "results.html";

    var dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    var descriptions = ["Little to no color, with precipitation or a thick cloud layer often blocking a direct view of the sun.", 
                        "Some color for a short time, with conditions ranging from mostly cloudy, or hazy, to clear, with little to no clouds at all levels.",
                        "A fair amount of color, often multi-colored, lasting a considerable amount of time. Often caused by scattered clouds at multiple levels.", 
                        "Extremely vibrant color lasting 30 minutes or more. Often caused by multiple arrangements of clouds at multiple levels, transitioning through multiple stages of vivid color."];
    var images = ["img/poor.jpg", "img/fair.jpg", "img/good.png", "img/great.jpg"];
    
    var results = [];
    var index = 0;
    resp.forEach(({ collection, error }) => {
      if (error) {
        return console.error(error);
      }
      
      var date = new Date();
      date.setDate(today.getDate() + days[index]);
      
      var properties = collection.features[0].properties;
      
      var time = properties.validAt;
      var hour = (parseInt(time.substring(11, 13)) + 8) % 12;
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

    if (isRanked()) {
      results = rank(results);
    }

    localStorage.setItem("results", JSON.stringify(results));

  } catch (ex) {
    return console.error(ex);
  }
})();
}

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
  return results;
}

function getType() {
  if (document.getElementById("isSunset").checked) {
    return 'sunset';
  }
  return 'sunrise';
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
  return days;
}

function isRanked() {
  if (document.getElementById("ranking").checked) {
    return true;
  }
  return false;
}