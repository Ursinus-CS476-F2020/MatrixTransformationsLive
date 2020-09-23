
/**
 * First row with matrix labels
 */
function getLabelRow(labels) {
    let row = document.createElement("tr");
    for (let i = 0; i < labels.length; i++) {
        let col = document.createElement("td");
        col.innerHTML = "<h2>" + labels[i] + "</h2>";
        row.appendChild(col);
    }
    return row;
}

/**
 * Make a row of buttons
 * @param {array} labels Labels for each button
 */
function getButtonRow(labels) {
    let row = document.createElement("tr");
    let buttons = {};
    for (let i = 0; i < labels.length; i++) {
        let col = document.createElement("td");
        let button = document.createElement("button");
        button.innerHTML = "Show Transformation";
        col.appendChild(button);
        row.appendChild(col);
        buttons[labels[i]] = button;
    }
    return {"buttons":buttons, "row":row};
}

/**
 * Create a 3x3 grid of different colored squares
 * @param {dom element} parent Element to which to add the squares
 * @param {double} shapeSide Dimension of the square
 */
function makeShape(parent, shapeSide) {
    let face = parent.append("g")
            .attr("viewBox", "0 0 "+shapeSide+" "+shapeSide+"");
    // make a colorful square made up of 9 smaller squares to use as the reference object
    let side = shapeSide/3;
    let colors = d3.scale.category10([3, 3]);
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            face.append("rect")
                    .attr("class", "square")
                    .attr({width: side, height: side})
                    .attr("transform", "translate(" + (j * side) + "," + (i * side) + ")")
                    .style("opacity", .5)
                    .style("fill", colors([j, i]));
        }
    };
    return face;
}

/**
 * Add coordinate axes
 * @param {dom element} parent Element to which to add the axes
 */
function makePlane(parent) {
    var plane = parent.append("g")
            .attr("viewBox", "-100 -100 200 200")
    plane.append("line").attr({x1: 0, y1: -100, x2: 0, y2: 100});
    plane.append("line").attr({x1: -100, y1: 0, x2: 100, y2: 0});
    return plane;
}

/**
 * 
 * @param {array} labels String labels for each plot
 */
function addSquaresRow(labels, width, height, shapeSide) {
    //<td><svg id ="Ax" width="300", height="300", viewBox="-100 -100 300 300"></svg></td>
    let row = document.createElement("tr");
    let svgs = [];
    for (let i = 0; i < labels.length; i++) {
        let col = document.createElement("td");
        let svgi = d3.select(col).append("svg")
                    .attr("id", labels[i])
                    .attr("width", width)
                    .attr("height", height)
                    .attr("viewBox", "" + (-width/3) + " " + (-height/3) + " " + width + " " + height);
        row.appendChild(col);
        svgs.push(svgi);
    }
    svgs.forEach(function(item) {
        item.attr("transform", "translate(0, "+height+")");
        item.attr("transform", "scale(1, -1)")
    });
    for (let i = 0; i < svgs.length; i++) {
        let plane = makePlane(svgs[i], shapeSide);
        let shape = makeShape(plane, shapeSide);
        let m = 50;
        shape.attr("id", "shape_" + i )
                .append("circle").attr("r", 2).attr("fill", "red").attr("stroke", "black");
        plane.attr("id", "plane_" + i )
                .attr("transform", "translate("+m+", "+m+")");
    }
    return row;
}
    

/**
 * Add the matrix widgets to a particular div element
 * @param {string} id ID of parent element
 * @param {boolean} homogenous Whether to use homogenous coordinates
 */
function addMatrixWidgets(id, homogenous) {
    let labels = ["Ax", "Bx", "A(Bx)", "(AB)x"];
    let parent = document.getElementById(id);
    let table = document.createElement("table");
    parent.appendChild(table);
    // First row with labels
    table.appendChild(getLabelRow(labels));
    // Second row with buttons
    let res = getButtonRow(labels);
    table.appendChild(res.row);
    let buttons = res.buttons;
    // Third row with colorful squares
    res = addSquaresRow(labels, 300, 300, 60);
    table.appendChild(res);
}








var eye = [1, 0, 0, 1, 0, 0];

function transform(index, As, delay) {
    let shape = d3.select("#shape_"+index);
    shape.attr("transform", "matrix("+eye+")");
    As.forEach(function(A, index) {
        shape.transition().delay(delay*(index+1))
        .attr("transform", "matrix("+A+")");
    });
}

/*for (var i = 0; i < 3; i++) {
    transform(i, eye, eye, 0)
}*/

function getMatrices() {
    var A = [];
    var B = [];
    // Column major!!
    for (var j = 1; j <= 2; j++) {
        for (var i = 1; i <= 2; i++) {
            A.push(document.getElementById("a"+i+""+j).value);
            B.push(document.getElementById("b"+i+""+j).value);
        }
        
    }
    for (var i = 0; i < 2; i++) {
        A.push(0); B.push(0);
    }
    var BA = [0, 0, 0, 0, 0, 0];
    for (var j = 0; j < 2; j++) {
        for (var i = 0; i < 2; i++) {
            for (var k = 0; k < 2; k++) {
                // ba_ij = \sum_k b_ik * a_kj
                BA[j*2+i] += B[k*2+i]*A[j*2+k];
            }
        }
    }
    return {'A':A, 'B':B, 'BA':BA};
}

function showA() {
    res = getMatrices();
    transform(0, [res['A']], 1000);
}

function showAB1() {
    res = getMatrices();
    transform(1, [res['A'], res['BA']], 1000)
}

function showAB2() {
    res = getMatrices();
    transform(2, [res['BA']], 1000);
}