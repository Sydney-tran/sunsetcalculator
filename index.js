let sunburst = new SunburstJS({
  clientId: '4adb33b3-ae84-4c90-b9e9-92ddc5eb27af',
  clientSecret: 'arugvbnbvqlowkTHAwzcMTGIa767EqzQ',
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