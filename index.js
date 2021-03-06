let sunburst = new SunburstJS({
  clientId: '8e89c6b9-b491-4071-b669-1a990fae1d19',
  clientSecret: 'IKTxQv9ztTR54Ty23pfjNOgTKkw4Dv1y',
  scope: ['predictions']
});

// https://github.com/sunsetwx/sunburst.js
function calculate(location){
  (async () => {
  try {
    const now = new Date();
    const thisTimeTomorrow = now.setDate(now.getDate() + 1);

    const resp = await sunburst.batchQuality([
      {
        geo: [location.lat, location.lng],
        type: 'sunset'
      },
      // {
      //   geo: [40.7933949, -77.8600012],
      //   type: 'sunset'
      // },
      // {
      //   geo: [40.7933949, -77.8600012],
      //   type: 'sunrise',
      //   after: thisTimeTomorrow
      // },
      // {
      //   geo: [40.7933949, -77.8600012],
      //   type: 'sunset',
      //   after: thisTimeTomorrow
      // }
    ]);

    resp.forEach(({ collection, error }) => {
      if (error) {
        // Handle individual query errors separately,
        // as some queries may have still succeeded.
        return console.error(error);
      }
      //window.location.href = "https://sydney-tran.github.io/sunsetcalculator/results.html";
      window.location.href = "results.html";
      // collection.features.forEach(({ properties }) => {
      //   console.log(properties);
      // });
      var properties = collection.features[0].properties;
      localStorage.setItem("quality", properties.quality);
      localStorage.setItem("percent", properties.qualityPercent);
      var time = properties.validAt;
      var hour = (parseInt(time.substring(11, 13)) - 5) % 12;
      hour = hour == 0 ? 12 : hour;
      var minute = parseInt(time.substring(14, 16));
      localStorage.setItem("time", hour+":"+minute);

    });
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
      //console.log({latitude:location.lat, longitude:location.lng})
      calculate(location);
    });
}