var idToTitle, titleToId // declare here so it has global scope
const TOTAL_NUM_OF_USERS = 610  // number of users in the rating data
submitForm()  // Submit form to immediately generate viz upon webpage load

/*
 * ============================================================================
 * ================== Begin Data Processing Functions =====================
 * ============================================================================
 */


/*
 * ============================================================================
 * ================== End Data Processing Functions =====================
 * ============================================================================
 */

/*
 * ============================================================================
 * ================== Begin Form Event Handling Functions =====================
 * ============================================================================
 */

function submitForm(centerPerson=0){
  // Fetch data from the server and render visualization
  // fetch('http://localhost:8080/').then(function(response) { 
  //   response.json()
  //   .then(dataDict => {
  //     renderMapViz()
  //   })
  //   .catch(e => console.log(e))
  // })
  renderMapViz()
}

function getSelectedMovieIDs(){
  let selectedMovieIDs = []
  for (let listItem of document.getElementsByClassName('selected-movie')){
    selectedMovieIDs.push(titleToId[listItem.innerHTML])
  }
  return selectedMovieIDs
}

function starSliderChange(value){
  let span = document.getElementById('ratingStars')
  span.innerHTML = ""
  let star_count = 0
  if (value > 0){
    let i = 0.5
    for (i=0; i<Math.floor(value); i++){
      let full_star = document.createElement("span")
      full_star.setAttribute('class', 'fa fa-star my-star-icon')
      span.appendChild(full_star)
      star_count++
    }
    if (value > Math.floor(value)){
      let half_star = document.createElement("span")
      half_star.setAttribute('class', 'fa fa-star-half-full my-star-icon')
      span.appendChild(half_star)
      star_count++
    }
  }
  while (star_count < 5){
      let empty_star = document.createElement("span")
      empty_star.setAttribute('class', 'fa fa-star-o my-star-icon')
      span.appendChild(empty_star)
      star_count++
  }
}

function displayNumUsers(value) {
  document.getElementById('numUsersDisplay').innerHTML = value
}

// =================== code for auto-complete movie search ====================
var movieInput = document.getElementById("autocomplete-movieInput")
var results, movies_to_show = []
var autocomplete_results = document.getElementById("autocomplete-results")

function autocomplete(val) {
  var movies_returned = []
  for (let key in idToTitle) {
    let movieTitle = idToTitle[key].title
    // if matches movie title 
    if (movieTitle.toLowerCase().includes(val.toLowerCase())) { 
      movies_returned.push(movieTitle)
    }
  }
  return movies_returned
}

// events
movieInput.onkeyup = function(e) {
  input_val = this.value

  if (input_val.length >= 3  && input_val !== "the" && input_val !== "the ") {
    autocomplete_results.innerHTML = ""
    movies_to_show = autocomplete(input_val)

    for (i = 0; i < movies_to_show.length; i++) {
      autocomplete_results.innerHTML +=
        '<li class="list-item">' + movies_to_show[i] + '</li>'
    }
    autocomplete_results.style.display = "block"
  } else {
    movies_to_show = []
    autocomplete_results.innerHTML = ""
  }
}

// Add a click listener to auto-compete results list
autocomplete_results.addEventListener("click", function(e) {
    // e.target is the clicked element
    let selectedTitle = e.target.innerHTML
    if (e.target && e.target.nodeName == "LI") { // If it was a list item
      // List item found!  Output the value and add it to selected movies!
      let listItemToAdd = '<li class="selected-movie">' + selectedTitle + '</li>'
      let selectedMovies = document.getElementById('selectedMovies')
      if (!selectedMovies.innerHTML.includes(selectedTitle)) {
        selectedMovies.innerHTML = listItemToAdd + selectedMovies.innerHTML
      }
      movieInput.value = ""
      autocomplete_results.innerHTML = "" // empty the dropdown menu
    }
})

// Add a mouseleave listener to auto-compete results list
autocomplete_results.addEventListener("mouseleave", function(e) {
  autocomplete_results.style.display = "none"
})

/*
 * ============================================================================
 * ================== End Form Event Handling Functions =======================
 * ============================================================================
 */

/*
 * ============================================================================
 * ======================= Begin Utility Functions ============================
 * ============================================================================
 */

function isNeighborLink(node, link) {
  return link.target.id === node.id || link.source.id === node.id
}

function getLinkColor(node, link) {
  return isNeighborLink(node, link) ? 'green' : '#E5E5E5'
}

/**
 * ============================================================================
 * ========================= End Utility Functions ============================
 * ============================================================================
 */

/**============================================================================
 * ============================= Main Function ================================
 * ============================================================================
 */
function renderMapViz() {
  // Remove potential pre-existing chart
  document.getElementById("viz").innerHTML = "";

  // Define width and height for SVG/visualization
  var width = window.innerWidth/1.1 * 0.75
  var height = window.innerHeight/1.15
  
  // Select svg from DOM
  var svg = d3.select('#viz')
  
  // Set width and height of SVG
  svg.attr('width', width).attr('height', height)

  // D3 Projection
  var projection = d3.geoAlbersUsa()
            .translate([width/2, height/2])    // translate to center of screen
            .scale([1000]);          // scale things down so see entire US
          
  // Define path generator
  var path = d3.geoPath()               // path generator that will convert GeoJSON to SVG paths
          .projection(projection);  // tell path generator to use albersUsa projection

      
  // Define linear scale for output
  var color = d3.scaleLinear()
          .range(["rgb(213,222,217)","rgb(69,173,168)","rgb(84,36,55)","rgb(217,91,67)"]);

  var legendText = ["Cities Lived", "States Lived", "States Visited", "Nada"];
          
  // Append Div for tooltip to SVG
  var div = d3.select("body")
          .append("div")   
          .attr("class", "tooltip")               
          .style("opacity", 0);

  // Load in my states data!
  d3.csv("data/stateslived.csv", function(data) {
  color.domain([0,1,2,3]); // setting the range of the input data

  // Load GeoJSON data and merge with states data
  d3.json("https://raw.githubusercontent.com/shawnbot/topogram/master/data/us-states.geojson", function(json) {

  // Loop through each state data value in the .csv file
  for (var i = 0; i < data.length; i++) {

    // Grab State Name
    var dataState = data[i].state;

    // Grab data value 
    var dataValue = data[i].visited;

    // Find the corresponding state inside the GeoJSON
    for (var j = 0; j < json.features.length; j++)  {
      var jsonState = json.features[j].properties.name;

      if (dataState == jsonState) {

      // Copy the data value into the JSON
      json.features[j].properties.visited = dataValue; 

      // Stop looking through the JSON
      break;
      }
    }
  }
      
  // Bind the data to the SVG and create one path per GeoJSON feature
  svg.selectAll("path")
    .data(json.features)
    .enter()
    .append("path")
    .attr("d", path)
    .style("stroke", "#fff")
    .style("stroke-width", "1")
    .style("fill", function(d) {

    // Get data value
    var value = d.properties.visited;

    if (value) {
    //If value exists…
    return color(value);
    } else {
    //If value is undefined…
    return "rgb(213,222,217)";
    }
  });

      
  // Map the cities I have lived in!
  d3.csv("../../data/cities-lived.csv", function(data) {

  svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", function(d) {
      return projection([d.lon, d.lat])[0];
    })
    .attr("cy", function(d) {
      return projection([d.lon, d.lat])[1];
    })
    .attr("r", function(d) {
      return Math.sqrt(d.years) * 4;
    })
      .style("fill", "rgb(217,91,67)")	
      .style("opacity", 0.85)	

    // Modification of custom tooltip code provided by Malcolm Maclean, "D3 Tips and Tricks" 
    // http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html
    .on("mouseover", function(d) {      
        div.transition()        
            .duration(200)      
            .style("opacity", .9);      
            div.text(d.place)
            .style("left", (d3.event.pageX) + "px")     
            .style("top", (d3.event.pageY - 28) + "px");    
    })   

      // fade out tooltip on mouse out               
      .on("mouseout", function(d) {       
          div.transition()        
            .duration(500)      
            .style("opacity", 0);   
      });
  });  
          
  // Modified Legend Code from Mike Bostock: http://bl.ocks.org/mbostock/3888852
  var legend = d3.select("body").append("svg")
              .attr("class", "legend")
            .attr("width", 140)
            .attr("height", 200)
            .selectAll("g")
            .data(color.domain().slice().reverse())
            .enter()
            .append("g")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

      legend.append("rect")
          .attr("width", 18)
          .attr("height", 18)
          .style("fill", color);

      legend.append("text")
          .data(legendText)
            .attr("x", 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .text(function(d) { return d; });
    });

  });
}