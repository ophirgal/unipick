var margin = {top: 50, right: 50, bottom: 50, left: 100},
  width = 1500 - margin.left - margin.right,
  height = 750 - margin.top - margin.bottom;

var ordered;

// this code manages the click event on the page
// you should not have to modify this code

getData()

function getData() {
  // TODO: replace with proper code to fetch data from the server
  // and transform into JSON format


  var attribute_types = [];

  //clear the canvas
  d3.selectAll("svg > *").remove();

  var table = document.getElementById("r_table");

  while(table.rows.length > 1){
    table.deleteRow(1);
  }

  document.getElementById('r_table').style.visibility = 'hidden';
  document.getElementById('t1').style.visibility = 'hidden';

  d3.json("http://localhost:8080/").then(function(data){

    renderVisualization(data);
  });

  //Original code for the table
  return new Promise((resolve,reject) => {
    var rand = () => Math.random() * 100;
    var data = [];
    for(var i = 0; i < 10; i++) {
      data.push({a:rand(),b:rand()});
      d3.json("http://localhost:8080/").then(function(data) {
        console.log(data[0]);
      });
    }
    resolve(data);
  });
}

function renderVisualization(jsonTuples) {

  // console.log("vis tups");
  // console.log(jsonTuples);

  create_bar_chart(jsonTuples);
}

// returns true if the data value is numeric
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}


function create_bar_chart(jsonTuples, attribute_types_array, id1, id2){
  // console.log("bar chart tups");
  // console.log(jsonTuples);

  var i = 0;
  //track the states that should be added to the table
  var array = [];
  //track the selected states
  var states_selected = [];

  //obtain all the attributes of the data (Population, age, etc.)
  var data_attributes = Object.keys(jsonTuples[0])
    .filter(function(d){
      i++;
      // console.log(i);
      // console.log("d = ");
      // console.log(d);
      return ((d != "Gini") & (d != "State") & (d != "Pop Density") & (d != "Pollution")& (d != "Age 0-25") & (d != "Age 26-54") & (d != "Age 55+")  &
          (d != "Temperature")  & (d != "GDP")  & (d != "School Closure Date") & (d != "Urban")&&(d != "Smoking Rate") &&(d != "Sex Ratio") && (d != "Unemployment") ); //remove the attributes we are not observing
    });


  d3.select(".chart")
	.attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
	.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  //make a chart selection to select which data to show in the bar graph
  var selection = data_attributes[0];

  //y-axis description
  var description = "temp";
  switch (selection) {
    case "ICU Beds":
          description = "Number of ICU beds";
      break;
      case "Physicians":
            description = "Number of primary and specialty care active physicians";
        break;
      case "Med-Large Airports":
              description = "Number of medium and large airports";
          break;
          case "Infected":
                description = "Number of COVID19 infections";
            break;
            case  "Tested":
                  description = "Number of COVID19 tests";
              break;
              case  "Income":
                    description = "Income per capita ($)";
                break;
                case "Population":
                      description = "Population Estimates";
                  break;
                  case "Deaths":
                        description = "Number of COVID19 deaths";
                    break;
                    case "Hospitals":
                          description = "Number of hospitals";
                      break;
                      case "Respiratory Deaths":
                            description = "Chronic lower respiratory disease rate per 100,000 people";
                        break;
                          case "Health Spending":
                                description = "Spending for all health services ($)";
                            break;
                            case  "Respiratory Deaths":
                                  description = "Chronic lower respiratory disease rate per 100,000 people";
                              break;
                              case  "Flu Deaths":
                                    description = "Influenza and Pneumonia death rate per 100,000 people";
                                break;
    default:
      description = selection ;

  }


  //add y axis
    d3.select(".chart").append("text")
      .attr("class", "y axis")
      .attr("text-anchor", "end")
      .attr("y", 20)
      .attr("transform", "translate(1000000,-100)")
      .attr("transform", "rotate(-90)")
      .text(description);

      //put the state names in ascending order
      jsonTuples.sort(function(a, b) {
        return d3.ascending(a.State, b.State)
      })

    var xBand = d3.scaleBand()
        .domain(jsonTuples.map(d => d.State)) //gets the first value of the jsonTuples
        .range([100, width])
        .paddingInner(0.1);

    var hScale = d3.scaleLinear()
        .domain([0, d3.max(jsonTuples, function(d){
          return +d[selection];
        })])
        .range([600, 0]);

//for the toop tip Implementing in order to get started I referenced this resource: http://bl.ocks.org/biovisualize/1016860
        var tooltip = d3.select(".hov")
        	.append("div")
        	.style("position", "absolute")
        	.style("y-index", "10")
        	.style("visibility", "hidden")
          .style("background", "black")
          .style("color", "white")
        	.text("temp");

        d3.select(".chart").selectAll("rect")
          .data(d3.values(jsonTuples))
          .enter()
          .append("rect")
          .attr("width", xBand.bandwidth())
          .attr("height", d => 600 - hScale(d[selection]))
          .attr("x", d => xBand(d.State) + "px")
          .attr("y", d => 50 + hScale(d[selection]) + "px")
          .attr("fill", "green")
          .on("mouseover", function(d){
            if(!states_selected.includes(d.State)){
              d3.select(this)
                .attr('fill', 'red');
              tooltip.text(d.State + ", " + selection + " = " + d[selection] );
              return tooltip.style("visibility", "visible");
            }
            })
          .on("mousemove", function(d){

            tooltip.text(d.State + ", " + selection + " = " + d[selection] );
            return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})

          .on("mouseout", function(d){
            if(!states_selected.includes(d.State)){
              d3.select(this)
                .attr('fill', 'green');
              tooltip.text(d.State + ", " + selection + " = " + d[selection] );
              return tooltip.style("visibility", "hidden");
            }
            })

          .on('click', function(d) {
            //if the bar is unselected
            if(!states_selected.includes(d.State)){
              d3.select(this)
                .attr('fill', 'yellow');
                states_selected.push(d.State);
                array.push(d.State);
                create_table(jsonTuples, selection, array);
                return tooltip.style("visibility", "visible");
            }else{
              d3.select(this)
                .attr('fill', 'green');
                //remove the state from the Summary chart
                array = array.filter(e => e !== d.State);
                states_selected = states_selected.filter(e => e !== d.State);
                create_table(jsonTuples, selection, array);
            }
          });


      //in order to rotate the axis labels to make the graph more readable --> used this source: https://bl.ocks.org/d3noob/3c040800ff6457717cca586ae9547dbf
      d3.select(".chart").append("g")
          .attr("transform", "translate(0,650)")
          .call(d3.axisBottom(xBand))
          .selectAll("text")
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", ".15em")
          .attr("transform", "rotate(-65)");
      d3.select(".chart").append("g")
          .attr("transform", "translate(100,50)")
          .call(d3.axisLeft(hScale));


	var selector = d3.select("#drop")
    	.append("select")
    	.attr("id","dropdown")
    	.on("change", function(d){
        selection = document.getElementById("dropdown");

        update_bar_chart(jsonTuples, selection.value);
        document.getElementById('r_table').style.visibility = 'hidden';

         });

    selector.selectAll("option")
      .data(data_attributes)
      .enter().append("option")
      .attr("value", function(d){
        return d;
      })
      .text(function(d){
        return d;
      })

      var button1_ascending = document.getElementById("but")
        .addEventListener("click", function(event) {
          update_order(jsonTuples, "ascending", selection);
        });

        var button2_decending = document.getElementById("but2")
          .addEventListener("click", function(event) {
            update_order(jsonTuples, "descending", selection);
          });

          var button1_byState= document.getElementById("but3")
            .addEventListener("click", function(event) {
              update_order(jsonTuples, "byState", selection);
            });


}

function update_order(jsonTuples, order, selection){

switch (order) {
  case "ascending":
      //put the state names in ascending order
      jsonTuples.sort(function(a, b) {
        return d3.ascending(a[selection], b[selection])
      })

      var xBand = d3.scaleBand()
        .domain(jsonTuples.map(d => d[selection])) //gets the first value of the jsonTuples
        .range([100, width])
        .paddingInner(0.1);

    break;
    case "descending":
        //put the state names in ascending order
        jsonTuples.sort(function(a, b) {
          return d3.descending(a[selection], b[selection])
        })

        var xBand = d3.scaleBand()
          .domain(jsonTuples.map(d => d[selection])) //gets the first value of the jsonTuples
          .range([100, width])
          .paddingInner(0.1);

      break;
      case "byState":
          //put the state names in ascending order
          jsonTuples.sort(function(a, b) {
            return d3.ascending(a.State, b.State)
          })

          var xBand = d3.scaleBand()
            .domain(jsonTuples.map(d => d.State)) //gets the first value of the jsonTuples
            .range([100, width])
            .paddingInner(0.1);

        break;
  default:

}



  //y-axis description
  var description = "temp";
  switch (selection) {
    case "ICU Beds":
          description = "Number of ICU beds";
      break;
      case "Physicians":
            description = "Number of primary and specialty care active physicians";
        break;
      case "Med-Large Airports":
              description = "Number of medium and large airports";
          break;
          case "Infected":
                description = "Number of COVID19 infections";
            break;
            case  "Tested":
                  description = "Number of COVID19 tests";
              break;
              case  "Income":
                    description = "Income per capita ($)";
                break;
                case "Population":
                      description = "Population Estimates";
                  break;
                  case "Deaths":
                        description = "Number of COVID19 deaths";
                    break;
                    case "Hospitals":
                          description = "Number of hospitals";
                      break;
                      case "Respiratory Deaths":
                            description = "Chronic lower respiratory disease rate per 100,000 people";
                        break;
                          case "Health Spending":
                                description = "Spending for all health services ($)";
                            break;
                            case  "Respiratory Deaths":
                                  description = "Chronic lower respiratory disease rate per 100,000 people";
                              break;
                              case  "Flu Deaths":
                                    description = "Influenza and Pneumonia death rate per 100,000 people";
                                break;
    default:
      description = selection ;

  }


  //clear the canvas
  d3.selectAll("svg > *").remove();
  console.log("updated*******************S");

  console.log(selection);

  var i = 0;
  //track the states that should be added to the table
  var array = [];
  //track the selected states
  var states_selected = [];

  //obtain all the attributes of the data (Population, age, etc.)
  var data_attributes = Object.keys(jsonTuples[0])
    .filter(function(d){
      i++;
      // console.log(i);
      // console.log("d = ");
      // console.log(d);
      return ((d != "Gini") & (d != "State")  & (d != "Age 26-54")& (d != "Age 0-25")& (d != "Pop Density") & (d != "Pollution")& (d != "State") &
          (d != "Temperature")  & (d != "GDP")  & (d != "School Closure Date") & (d != "Urban")  & (d != "Smoking Rate")); //remove the attributes we are not observing
    });


  d3.select(".chart")
	.attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
	.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  //make a chart selection to select which data to show in the bar graph
  // var selection = data_attributes[0];

    var xBand = d3.scaleBand()
        .domain(d3.values(jsonTuples).map(d => d.State)) //gets the first value of the jsonTuples
        .range([100, width])
        .paddingInner(0.1);

    var hScale = d3.scaleLinear()
        .domain([0, d3.max(jsonTuples, function(d){
          return +d[selection];
        })])
        .range([600, 0]);

        var tooltip = d3.select(".hov")
          .append("div")
          .style("position", "absolute")
          .style("y-index", "10")
          .style("visibility", "hidden")
          .style("background", "black")
          .style("color", "white")
          .text("a simple tooltip");

        d3.select(".chart").selectAll("rect")
          .data(d3.values(jsonTuples))
          .enter()
          .append("rect")
          .attr("width", xBand.bandwidth())
          .attr("height", d => 600 - hScale(d[selection]))
          .attr("x", d => xBand(d.State) + "px")
          .attr("y", d => 50 + hScale(d[selection]) + "px")
          .attr('fill', 'green')
          .on("mouseover", function(d){
            if(!states_selected.includes(d.State)){
              d3.select(this)
                .attr('fill', 'red');
              tooltip.text(d.State + " " + selection + " = " + d[selection] );
              return tooltip.style("visibility", "visible");
            }
            })
          .on("mousemove", function(d){

            tooltip.text(d.State + " " + selection + " = " + d[selection] );
            return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})

          .on("mouseout", function(d){
            if(!states_selected.includes(d.State)){
              d3.select(this)
                .attr('fill', 'green');
              tooltip.text(d.State + " " + selection + " = " + d[selection] );
              return tooltip.style("visibility", "hidden");
            }
            })

          .on('click', function(d) {
            //if the bar is unselected
            if(!states_selected.includes(d.State)){
              d3.select(this)
                .attr('fill', 'yellow');
                states_selected.push(d.State);
                array.push(d.State);
                create_table(jsonTuples, selection, array);
                return tooltip.style("visibility", "visible");
            }else{
              d3.select(this)
                .attr('fill', 'green');
                //remove the state from the Summary chart
                array = array.filter(e => e !== d.State);
                states_selected = states_selected.filter(e => e !== d.State);
                create_table(jsonTuples, selection, array);
            }
          });

      //in order to rotate the axis labels to make the graph more readable --> used this source: https://bl.ocks.org/d3noob/3c040800ff6457717cca586ae9547dbf
      d3.select(".chart").append("g")
          .attr("transform", "translate(0,650)")
          .call(d3.axisBottom(xBand))
          .selectAll("text")
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", ".15em")
          .attr("transform", "rotate(-65)");
      d3.select(".chart").append("g")
          .attr("transform", "translate(100,50)")
          .call(d3.axisLeft(hScale));

          //add y axis
            d3.select(".chart").append("text")
              .attr("class", "y axis")
              .attr("text-anchor", "end")
              .attr("y", 20)
              .attr("transform", "translate(0,-100)")
              .attr("transform", "rotate(-90)")
              .text(description);


}


function update_bar_chart(jsonTuples, selection){

  //y-axis description
  var description = "temp";
  switch (selection) {
    case "ICU Beds":
          description = "Number of ICU beds";
      break;
      case "Physicians":
            description = "Number of primary and specialty care active physicians";
        break;
      case "Med-Large Airports":
              description = "Number of medium and large airports";
          break;
          case "Infected":
                description = "Number of COVID19 infections";
            break;
            case  "Tested":
                  description = "Number of COVID19 tests";
              break;
              case  "Income":
                    description = "Income per capita ($)";
                break;
                case "Population":
                      description = "Population Estimates";
                  break;
                  case "Deaths":
                        description = "Number of COVID19 deaths";
                    break;
                    case "Hospitals":
                          description = "Number of hospitals";
                      break;
                      case "Respiratory Deaths":
                            description = "Chronic lower respiratory disease rate per 100,000 people";
                        break;
                          case "Health Spending":
                                description = "Spending for all health services ($)";
                            break;
                            case  "Respiratory Deaths":
                                  description = "Chronic lower respiratory disease rate per 100,000 people";
                              break;
                              case  "Flu Deaths":
                                    description = "Influenza and Pneumonia death rate per 100,000 people";
                                break;
    default:
      description = selection ;

  }


  //clear the canvas
  d3.selectAll("svg > *").remove();
  console.log("updated*******************S");

  console.log(selection);

  var i = 0;
  //track the states that should be added to the table
  var array = [];
  //track the selected states
  var states_selected = [];

  //obtain all the attributes of the data (Population, age, etc.)
  var data_attributes = Object.keys(jsonTuples[0])
    .filter(function(d){
      i++;
      // console.log(i);
      // console.log("d = ");
      // console.log(d);
      return ((d != "Gini") & (d != "State")  & (d != "Age 26-54")& (d != "Age 0-25")& (d != "Pop Density") & (d != "Pollution")& (d != "State") &
          (d != "Temperature")  & (d != "GDP")  & (d != "School Closure Date") & (d != "Urban")  & (d != "Smoking Rate")); //remove the attributes we are not observing
    });


  d3.select(".chart")
	.attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
	.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  //make a chart selection to select which data to show in the bar graph
  // var selection = data_attributes[0];

    var xBand = d3.scaleBand()
        .domain(d3.values(jsonTuples).map(d => d.State)) //gets the first value of the jsonTuples
        .range([100, width])
        .paddingInner(0.1);

    var hScale = d3.scaleLinear()
        .domain([0, d3.max(jsonTuples, function(d){
          return +d[selection];
        })])
        .range([600, 0]);

        var tooltip = d3.select(".hov")
          .append("div")
          .style("position", "absolute")
          .style("y-index", "10")
          .style("visibility", "hidden")
          .style("background", "black")
          .style("color", "white")
          .text("a simple tooltip");

        d3.select(".chart").selectAll("rect")
          .data(d3.values(jsonTuples))
          .enter()
          .append("rect")
          .attr("width", xBand.bandwidth())
          .attr("height", d => 600 - hScale(d[selection]))
          .attr("x", d => xBand(d.State) + "px")
          .attr("y", d => 50 + hScale(d[selection]) + "px")
          .attr('fill', 'green')
          .on("mouseover", function(d){
            if(!states_selected.includes(d.State)){
              d3.select(this)
                .attr('fill', 'red');
              tooltip.text(d.State + " " + selection + " = " + d[selection] );
              return tooltip.style("visibility", "visible");
            }
            })
          .on("mousemove", function(d){

            tooltip.text(d.State + " " + selection + " = " + d[selection] );
            return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})

          .on("mouseout", function(d){
            if(!states_selected.includes(d.State)){
              d3.select(this)
                .attr('fill', 'green');
              tooltip.text(d.State + " " + selection + " = " + d[selection] );
              return tooltip.style("visibility", "hidden");
            }
            })

          .on('click', function(d) {
            //if the bar is unselected
            if(!states_selected.includes(d.State)){
              d3.select(this)
                .attr('fill', 'yellow');
                states_selected.push(d.State);
                array.push(d.State);
                create_table(jsonTuples, selection, array);
                return tooltip.style("visibility", "visible");
            }else{
              d3.select(this)
                .attr('fill', 'green');
                //remove the state from the Summary chart
                array = array.filter(e => e !== d.State);
                states_selected = states_selected.filter(e => e !== d.State);
                create_table(jsonTuples, selection, array);
            }
          });

      //in order to rotate the axis labels to make the graph more readable --> used this source: https://bl.ocks.org/d3noob/3c040800ff6457717cca586ae9547dbf
      d3.select(".chart").append("g")
          .attr("transform", "translate(0,650)")
          .call(d3.axisBottom(xBand))
          .selectAll("text")
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", ".15em")
          .attr("transform", "rotate(-65)");
      d3.select(".chart").append("g")
          .attr("transform", "translate(100,50)")
          .call(d3.axisLeft(hScale));

          //add y axis
            d3.select(".chart").append("text")
              .attr("class", "y axis")
              .attr("text-anchor", "end")
              .attr("y", 20)
              .attr("transform", "translate(0,-100)")
              .attr("transform", "rotate(-90)")
              .text(description);


              var button1_ascending = document.getElementById("but")
                .addEventListener("click", function(event) {
                  update_order(jsonTuples, "ascending", selection);
                });

                var button2_decending = document.getElementById("but2")
                  .addEventListener("click", function(event) {
                    update_order(jsonTuples, "descending", selection);
                  });

                  var button1_byState= document.getElementById("but3")
                    .addEventListener("click", function(event) {
                      update_order(jsonTuples, "byState", selection);
                    });



}

function create_table(jsonTuples, selection, array_states){
  console.log("adsfadsf");
  document.getElementById("id1").innerHTML = "State Name    ";
  document.getElementById("id2").innerHTML = selection + " Total";

  var table = document.getElementById('r_table');
  var value = 0;
  console.log("pop " + array_states[0]);

  //clear table
  while(table.rows.length > 1){
    table.deleteRow(1);
  }



  for(var i = 0; i < array_states.length; i++){
    console.log("ins" + i);
    var row = table.insertRow(i+1);
    var cell_state_name = row.insertCell(0);
    var cell_state_value = row.insertCell(1);

    console.log("pop--- " + array_states[i]);

    cell_state_name.innerHTML = array_states[i];

    for(var x = 0; x < jsonTuples.length; x++){
      console.log("state value = ");
      console.log(jsonTuples[x]);
      if((jsonTuples[x].State == array_states[i])){
        value = jsonTuples[x][selection];
      }
    }

      console.log("popdfasdf--- " + value);

    cell_state_value.innerHTML = value;


  }

  console.log("bye");

 document.getElementById('r_table').style.visibility = 'visible';

}
