$(document).ready(function() {
    //Above: this function waits to execute the javaScript data until the html is done loading
    //Below: this is an event listening that waits for a 'click'
    //when we click on the search button it saves the value in the input box
    //into the variable 'searchValues'
  $("#search-button").on("click", function() {
      //this saves the input as a value
    var searchValue = $("#search-value").val();

    // clears the input box after you hit enter
    $("#search-value").val("");
    //This executes the function called 'searchWeather' with the value we saved
    //in the variable searchValue
    searchWeather(searchValue);
  });
  //this is an event listening that listens for a click on the cities that have been previously searched for - which is displayed in a div with a class called 'history' and has been saved in the local storage.
  $(".history").on("click", "li", function() {
      //once clicked, we take the valuc (in this) and run it through the searchWeather function to display the current temperature 
    searchWeather($(this).text());
  });
  //the function below creates a new list item and a new class to that list item called 'list-group-item list-group-item-action'
  function makeRow(text) {
    var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
    //the value above is then added to the div container that has the class 'history'
    $(".history").append(li);
  }
  //This function runs the API call with the variable searchValue, which is what we saved above in the click event.
  function searchWeather(searchValue) {
      //below is the API call, using the api 'openweathermap' and adding the city to be searched
    $.ajax({
      type: "GET",
      url: "http://api.openweathermap.org/data/2.5/weather?q=" + searchValue + "&appid=600327cb1a9160fea2ab005509d1dc6d&units=imperial",
      dataType: "json",
      //we then grab the data from the promise called 'success'
      success: function(data) {
        // create history link for this search
        if (history.indexOf(searchValue) === -1) {
        //for every search, we then push the user input (city they searched) into the array called history. This is then saved in to the local storage under the key "history"
          history.push(searchValue);
          window.localStorage.setItem("history", JSON.stringify(history));
            //this called the 'makeRow' function, and used the searchVariable data (the city name that was searched)
          makeRow(searchValue);
        }
        
        // this clears any old content that is in the today id
        $("#today").empty();

        // create html content for current weather
        //Below, we are creating the variable named title, which adds an h3 container, then adds a class called 'card-title' to that container. It then grabs the text contennt of the data name (when we called the api, the information that came back we looked at the key data and the value name) the new date then adds the date to the data.name (which is the city name)
        var title = $("<h3>").addClass("card-title").text(data.name + " (" + new Date().toLocaleDateString() + ")");
        //below creates a variable called 'card' which is a div container with a class called 'card'
        var card = $("<div>").addClass("card");
        //below creates the varaible 'wind' which is an added ptag with the class 'card-text' then the text "wind speed" and the data from the api call under the key data and value wind and subvalue speed is then converted to text and added to the string which will end with 'MPH'
        var wind = $("<p>").addClass("card-text").text("Wind Speed: " + data.wind.speed + " MPH");
        //below creates a variable named humid, which creates a p tag with the class 'card-text' and then adds the string begining with the word 'humidity' then adds the text value from the api call under the key data, and value main.humidity, then adds the string '%' at the end
        var humid = $("<p>").addClass("card-text").text("Humidity: " + data.main.humidity + "%");
        //Below creates a variable that adds a p tag with the class 'card-text' which then inputs the string starting with "Temperature" and the text from the value from the api call under data.main.temp and ends with "°F"
        var temp = $("<p>").addClass("card-text").text("Temperature: " + data.main.temp + " °F");
        //below adds the variable cardBody, which is a div tag, with the class 'card-body'
        var cardBody = $("<div>").addClass("card-body");
        //below is the variable img with adds an img tag with 'src' and the webiste added inside the carrots which will add an image to the page
        var img = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png");

        // merge and add to page
        //here we are appending the image to the title which is the h3 tag from above
        title.append(img);
        //below we are adding the title, temp, humid, and wind variables we created above and adding it to the card body container
        cardBody.append(title, temp, humid, wind);
        //below we are taking the card body contianer (which we just added all the variables to) and adding it to the card contaier
        card.append(cardBody);
        //below we are then taking all those values we added to the card continer and then adding it to the container with the id "today"
        $("#today").append(card);

        // call follow-up api endpoints
        //below calls the getForcast function using the value from the variable searchValue which was set above
        getForecast(searchValue);
        //below takes the latitude and longitude values we got from the api call and uses them in the getUVIndex function which is called below
        getUVIndex(data.coord.lat, data.coord.lon);
      }
    });
  }
  
  function getForecast(searchValue) {
      //below we are calling the api and searching for the city
    $.ajax({
      type: "GET",
      url: "http://api.openweathermap.org/data/2.5/forecast?q=" + searchValue + "&appid=600327cb1a9160fea2ab005509d1dc6d&units=imperial",
      dataType: "json",
      success: function(data) {
        //we are then using the data we got and using that data below
        // overwrite any existing content with title and empty row
        //below selects the 'forcast' id and adds a new div and
        $("#forecast").html("<h4 class=\"mt-3\">5-Day Forecast:</h4>").append("<div class=\"row\">");

        // loop over all forecasts (by 3-hour increments)
        for (var i = 0; i < data.list.length; i++) {
          // only look at forecasts around 3:00pm
          if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
            // create html elements for a bootstrap card
            //below creates three div tags with three different classes
            var col = $("<div>").addClass("col-md-2");
            var card = $("<div>").addClass("card bg-primary text-white");
            var body = $("<div>").addClass("card-body p-2");
            //below we add the variable title, then an h5 tag with the class 'card-title' it then converts the information from the api call in to text 
            var title = $("<h5>").addClass("card-title").text(new Date(data.list[i].dt_txt).toLocaleDateString());
            //below creates an image tag and adds in the 'src' and image website along with the added information from the api call
            var img = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png");
            //below creates a new p tag and adds the class 'card-text' it then inputs the string 'temp' and adds in the information from the api call converting it to text, and ending the string to 'F'
            var p1 = $("<p>").addClass("card-text").text("Temp: " + data.list[i].main.temp_max + " °F");
            //below creates the p tag with the class 'card-text' and adds the string Humdity' and the text data from the api call, then adds "%" at the end
            var p2 = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");

            // merge together and put on page
            col.append(card.append(body.append(title, img, p1, p2)));
            //this selects the id 'forcast' and the class 'row' and adds a column 
            $("#forecast .row").append(col);
          }
        }
      }
    });
  }

  function getUVIndex(lat, lon) {
      //below is an API function and we are using the longitude and latitude in the search to get our information 
    $.ajax({
      type: "GET",
      url: "http://api.openweathermap.org/data/2.5/uvi?appid=600327cb1a9160fea2ab005509d1dc6d&lat=" + lat + "&lon=" + lon,
      dataType: "json",
      success: function(data) {
          //
        var uv = $("<p>").text("UV Index: ");
        var btn = $("<span>").addClass("btn btn-sm").text(data.value);
        
        // change color depending on uv value, if the data value is less than 3 it will add the class 'btn-success' which will change the color 
        if (data.value < 3) {
          btn.addClass("btn-success");
        }
        //if the data value is less than 7, it will add the class 'btn-warning' which will change the color to yellow
        else if (data.value < 7) {
          btn.addClass("btn-warning");
        }
        else {
            //if the data value is larger than 7 it will add the class 'btn-danger' which will change the color to red
          btn.addClass("btn-danger");
        }
        //this then adds the uv infomration and the color change to the card-body in the id today
        $("#today .card-body").append(uv.append(btn));
      }
    });
  }

  // get current history, if any, and if there isn't any current history it creates and empty array
  var history = JSON.parse(window.localStorage.getItem("history")) || [];
//if the history length array is greater than zero, we call the searchWeather function 
  if (history.length > 0) {
    searchWeather(history[history.length-1]);
  }
//for every item in the history array the function makeRow will add a new row (function described above)
  for (var i = 0; i < history.length; i++) {
    makeRow(history[i]);
  }
//ADDED FEATURE: Here I added the option to clear out the local storage, which will remove all the cities that you have previouisly searched for. I added a button with the ID "clear", then added a listen event that will listen for the click then implement a local storage remvoal which will remove the key 'history' it will then reload the page and the history will no longer be there
$("#clear").on('click',function(){
    localStorage.removeItem("history");
    console.log("clear");
    location.reload();
})

});
