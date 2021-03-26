let sunburst = new SunburstJS({
  clientId: 'c3818fb9-d07a-4f6b-99b8-e7ecb726e2e2',
  clientSecret: 'Rf71W9Vndd3mjO8WfkJFvwwiydlxw0WG',
  scope: ['predictions']
});

function calculateSunset(){
  var zip = document.querySelector("#zip").value;
  if (zip.length == 0) {
    alert("please enter zip code");
  } else {
  fetch("https://maps.googleapis.com/maps/api/geocode/json?address="+zip+"&key=AIzaSyD-gd2vtXBRWD7GhFltpsBOBNxhRWORy-4")
    .then(response => response.json())
    .then(data => {
      var location = data.results[0].geometry.location;
      var timezone = lookup(zip);
      calculate(location, timezone);
    });
  }
}

function calculate(location, timezone){
  (async () => {
  try {
    const today = new Date();
    var type = await getType();
    var days = await getDays();
    var inputs = await createInputs(today, location, type, days);
    
    const resp = await sunburst.batchQuality(inputs);

    window.location.href = "results.html";
    
    var results = await createResults(today, days, timezone, resp);

    if (isRanked()) {
      await rank(results);
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

function createResults(today, days, timezone, resp) {
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
    var day = new Date();
    day.setDate(today.getDate() + days[index]);
    
    var properties = collection.features[0].properties;
    
    var time = new Date(properties.validAt);
    time = time.toLocaleTimeString("en-US", {timeZone: timezone});

    var percent  = properties.qualityPercent;
    var dimgindex = Math.floor(percent / 25);

    results.push({
      day: dayNames[day.getDay()],
      time: time,
      quality: properties.quality,
      percent: percent,
      description: descriptions[dimgindex],
      image: images[dimgindex],
    });
    index++;
  });
  return results;
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
}

function getType() {
  if (document.getElementById("sunset").checked) {
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
  if (days.length == 0) {
    alert("please choose days");
  }
  return days;
}

function isRanked() {
  if (document.getElementById("ranking").checked) {
    return true;
  }
  return false;
}