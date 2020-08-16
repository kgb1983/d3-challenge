
var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "income";

// Function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8, d3.max(censusData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

    return xLinearScale;
}

// Function used for updating y-scale var upon click on axis label
function yScale(censusData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.8,
    d3.max(censusData, d => d[chosenYAxis]) *1.2
])
.range([height, 0]);
return yLinearScale
}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    
    return yAxis;
    
}
// function used for updating x circles group with a transition to new circles
function renderXCircles(circlesGroup, newXScale, chosenXAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));
    return circlesGroup;
}

// functoin used for updating y circles group with a transition to new circles
function renderYCircles(circlesGroup, newYScale, chosenYAxis) {
    circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
}

// function used for x circles text
function renderXText(textCircles, newXScale, chosenXAxis) {
    textCircles.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]));
    
    return textCircles;
}

// function used for y circles text

function renderYText(textCircles, newYScale, chosenYAxis) {
    textCircles.transition()
    .duration(1000)
    .attr("y", d => newYScale(d[chosenYAxis])+4);

    return textCircles;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    var xlabel;
    var ylabel;
    if (chosenXAxis === "poverty") {
        xlabel = "Poverty:";
    }
    else if (chosenXAxis === "healthcare") {
        xlabel = "Healthcare Rate:"
    }
    else {
        xlabel = "Obesity %:"
    }

    if (chosenYAxis === "income") {
        ylabel = "Average Median Income:";
    }
    else if (chosenYAxis === "age") {
        ylabel = "Age:"
    }
    else {
        ylabel = "Smokers %:"
    }

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function(d) {
            return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
    })
    // onmouseout event
    .on("mouseout", function(data, index) {
        toolTip.hide(data);
    });

    return circlesGroup;
}

// Retrieve data from the csv file and execute everything below
d3.csv("./assets/js/data.csv").then(function(censusData, err) {
    if (err) throw err;

    // parse data
    censusData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.income = +data.income
        data.age = +data.age
        data.obesity = +data.obesity
        data.smokes = +data.smokes;
    });

    // xLinearScale function above csv import
    var xLinearScale = xScale(censusData, chosenXAxis);

    // create y scale function
    var yLinearScale = yScale(censusData, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(censusData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 10)
        .attr("fill", "teal")
        .attr("stroke", "black")
        .attr("opacity", ".5");
    
     //append text
     var textCircles = chartGroup.append("g")
     .selectAll("text")
     .data(censusData)
     .enter()
     .append("text")
     .text(d => d.abbr)
     .attr("x", d => xLinearScale(d[chosenXAxis]))
     .attr("y", d => yLinearScale(d[chosenYAxis]) + 4)
     .attr("font-family", "sans-serif")
     .attr("text-anchor", "middle")
     .attr("font-size", "10px")
     .style("fill", "white")
     .attr("font-weight", "bold");

    
    // Create group for two x-axis labels
    var xlabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grabe for event listener
        .classed("active", true)
        .text("Poverty Rate %");

    var healthcareLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "healthcare") // value to grab for event listener
        .classed("inactive", true)
        .text("% Lack Healthcare");
    
    var obesityLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "obesity")
        .classed("inactive", true)
        .text("Obesity %")
    
    // income age smokers

    // create y axis labels
    var ylabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)");
    
    var incomeLabel = ylabelsGroup.append("text")
        .attr("y", 0 - margin.left + 15)
        .attr("x", 0 - (height/2))
        .attr("value", "income")
        .classed("active", true)
        .text("Average Median Income")
    
    var ageLabel = ylabelsGroup.append("text")
        .attr("y", 0 - margin.left + 35)
        .attr("x", 0 - (height/2))
        .attr("value", "age")
        .classed("inactive", true)
        .text("Average Age")
    
    var smokesLabel = ylabelsGroup.append("text")
        .attr("y", 0 - margin.left + 55)
        .attr("x", 0 - (height/2))
        .attr("value", "smokes")
        .classed("inactive", true)
        .text("Percentage of Smokers")
    

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x axis labels event listener
    xlabelsGroup.selectAll("text")
        .on("click", function() {
            // get value of selection
            var xValue = d3.select(this).attr("value");
            if (xValue !== chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = xValue;

                // functions here found above csv import
                xLinearScale = xScale(censusData, chosenXAxis);

                // updates x axis with transition
                xAxis = renderXAxes(xLinearScale, xAxis);

                // updates circles with new x values
                circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis);
                textCircles = renderXText(textCircles, xLinearScale, chosenXAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // poverty healthcare obesity
                // income age smokes

                // changes classes to change bold text
                if (chosenXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true)
                }
                else if (chosenXAxis === "healthcare") {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                
                }

                else {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obesityLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }

                }

                

            
        });

// y axis labels event listener
ylabelsGroup.selectAll("text")
.on("click", function() {
    // get value of selection
    var yValue = d3.select(this).attr("value");
    if (yValue !== chosenYAxis) {
        // replaces chosenYAxis with value
        chosenYAxis = yValue;
        // Updates y scale for new data
        yLinearScale = yScale(censusData, chosenYAxis);
        // Updates y axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);
        // updates circles and circle text with new y values
        circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);
        textCircles = renderYText(textCircles, yLinearScale, chosenYAxis);

        // Updates tool tips with new info
        circlesGroup = updateToolTip(chosenYAxis, chosenXAxis, circlesGroup);
        // Changes classes to change bold text
        if (chosenYAxis === "income") {
            incomeLabel
                .classed("active", true)
                .classed("inactive", false);
            ageLabel
                .classed("active", false)
                .classed("inactive", true);
            smokesLabel
                .classed("active", false)
                .classed("inactive", true);
        }

        else if (chosenYAxis === "age") {
            incomeLabel
                .classed("active", false)
                .classed("inactive", true);
            ageLabel
                .classed("active", true)
                .classed("inactive", false);
            smokesLabel
                .classed("active", false)
                .classed("inactive", true);
        }

        else {
            incomeLabel
                .classed("active", false)
                .classed("inactive", true);
            ageLabel
                .classed("active", false)
                .classed("inactive", true);
            smokesLabel
                .classed("active", true)
                .classed("inactive", false);
        }
    }
});
})

