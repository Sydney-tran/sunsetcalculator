let sunburst = new SunburstJS({
  clientId: '8e89c6b9-b491-4071-b669-1a990fae1d19',
  clientSecret: 'IKTxQv9ztTR54Ty23pfjNOgTKkw4Dv1y',
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
    resp.forEach(({ collection, error }) => {
      if (error) {
        // Handle individual query errors separately,
        // as some queries may have still succeeded.
        return console.error(error);
      }
      var properties = collection.features[0].properties;
      var time = properties.validAt;
      var hour = (parseInt(time.substring(11, 13)) + 7) % 12;
      hour = hour == 0 ? 12 : hour;
      var minute = parseInt(time.substring(14, 16));
      results.push({
        quality: properties.quality,
        percent: properties.qualityPercent,
        time: hour + ":" + minute + "EST",
      });
    });
    localStorage.setItem("results", results);
 
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
      var days = getDays;
      calculate(location, days);
    });
}

function getDays() {
  // var days = [];

  // if (document.getElementById("day-1").checked) {
  //   days.push(-1);
  // }
  // if (document.getElementById("day").checked) {
  //   days.push(0);
  // }
  // if (document.getElementById("day1").checked) {
  //   days.push(1);
  // }
  // if (document.getElementById("day2").checked) {
  //   days.push(2);
  // }
  // if (document.getElementById("day3").checked) {
  //   days.push(3);
  // }

  var i = -1;
  for(i; i <= 3; i++) {
    if (document.getElementById("day" + i).checked) {
      days.push(i);
    }
  }

  return days;
}