
const SVG_NS = "http://www.w3.org/2000/svg";
const SVG_WIDTH = 600;
const SVG_HEIGHT = 400;

// An object that represents a 2-d point, consisting of an
// x-coordinate and a y-coordinate. The `compareTo` function
// implements a comparison for sorting with respect to x-coordinates,
// breaking ties by y-coordinate.
function Point (x, y, id) {
    this.x = x;
    this.y = y;
    this.id = id;

    // Compare this Point to another Point p for the purposes of
    // sorting a collection of points. The comparison is according to
    // lexicographical ordering. That is, (x, y) < (x', y') if (1) x <
    // x' or (2) x == x' and y < y'.
    this.compareTo = function (p) {
	if (this.x > p.x) {
	    return 1;
	}

	if (this.x < p.x) {
	    return -1;
	}

	if (this.y > p.y) {
	    return 1;
	}

	if (this.y < p.y) {
	    return -1;
	}

	return 0;
    }

    // return a string representation of this Point
    this.toString = function () {
	return "(" + x + ", " + y + ")";
    }
}

// An object that represents a set of Points in the plane. The `sort`
// function sorts the points according to the `Point.compareTo`
// function. The `reverse` function reverses the order of the
// points. The functions getXCoords and getYCoords return arrays
// containing x-coordinates and y-coordinates (respectively) of the
// points in the PointSet.
function PointSet () {
    this.points = [];
    this.curPointID = 0;

    // create a new Point with coordintes (x, y) and add it to this
    // PointSet
    this.addNewPoint = function (x, y) {
	this.points.push(new Point(x, y, this.curPointID));
	this.curPointID++;
    }

    // add an existing point to this PointSet
    this.addPoint = function (pt) {
	this.points.push(pt);
    }

    // sort the points in this.points 
    this.sort = function () {
	this.points.sort((a,b) => {return a.compareTo(b)});
    }

    // reverse the order of the points in this.points
    this.reverse = function () {
	this.points.reverse();
    }

    // return an array of the x-coordinates of points in this.points
    this.getXCoords = function () {
	let coords = [];
	for (let pt of this.points) {
	    coords.push(pt.x);
	}

	return coords;
    }

    // return an array of the y-coordinates of points in this.points
    this.getYCoords = function () {
	let coords = [];
	for (pt of this.points) {
	    coords.push(pt.y);
	}

	return coords;
    }

    // get the number of points 
    this.size = function () {
	return this.points.length;
    }

    // return a string representation of this PointSet
    this.toString = function () {
	let str = '[';
	for (let pt of this.points) {
	    str += pt + ', ';
	}
	str = str.slice(0,-2); 	// remove the trailing ', '
	str += ']';

	return str;
    }
}


function ConvexHullViewer (svg=document.querySelector("svg"), ps=PointSet()) {
    this.svg = svg;  // a n svg object where the visualization is drawn
    this.ps = ps;
    

    // COMPLETE THIS OBJECT
    this.clickDraw = function (e) {
        // function to add and draw point; takes in event (user click), adds point w relevant coordinates to ps and DOM element to svg
        const rect = this.svg.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;

        let toAdd = document.createElementNS(SVG_NS, "circle");
        toAdd.setAttributeNS(null, "cx", x);
        toAdd.setAttributeNS(null, "cy", y);
        toAdd.setAttributeNS(null, "r", 6);
        toAdd.setAttributeNS(null, "stroke", "black");
        toAdd.setAttributeNS(null, "cursor", "pointer");

        //add event listeners so points highlight when mouseover 
        toAdd.addEventListener("mouseover", function () {
            toAdd.setAttributeNS(null, "fill", "white");
        })
        toAdd.addEventListener("mouseleave", function () {
            toAdd.setAttributeNS(null, "fill", "black");
        })


        this.svg.appendChild(toAdd);
        this.ps.addNewPoint(x,y);
    }
    // add event listener to this.svg to call addDraw upon user click
    this.svg.addEventListener("click", (event) => {
        this.clickDraw(event);
        console.log(this.ps.points);
    });

    this.drawPoint = function (point, highlight = "black") {
        let toAdd = document.createElementNS(SVG_NS, "circle");
        toAdd.setAttributeNS(null, "cx", point.x);
        toAdd.setAttributeNS(null, "cy", point.y);
        toAdd.setAttributeNS(null, "r", 6);
        toAdd.setAttributeNS(null, "stroke", "black");
        toAdd.setAttributeNS(null, "cursor", "pointer");
        toAdd.setAttributeNS(null, "fill", highlight);

        //add event listeners so points highlight when mouseover 
        toAdd.addEventListener("mouseover", function () {
            toAdd.setAttributeNS(null, "fill", "white");
        })
        toAdd.addEventListener("mouseleave", function () {
            toAdd.setAttributeNS(null, "fill", highlight);
        })
        svg.appendChild(toAdd);
    }

    // function to draw a line between two points 
    this.connect = function (p1, p2, color =  'black') {
        // line should connect from p1 to p2; essentially means x1, y1 of line are p1.x, p1.y and x2,y2 are p2.x, p2.y
        let line = document.createElementNS(SVG_NS, "line");
        // line.classList.add("smooth");
        line.setAttributeNS(null, "x1", p1.x);
        line.setAttributeNS(null, "y1", p1.y);
        line.setAttributeNS(null, "x2", p2.x);
        line.setAttributeNS(null, "y2", p2.y);
        line.setAttributeNS(null, "stroke", color);
        line.setAttributeNS(null, "stroke-width", "4");
        this.svg.appendChild(line);
    }

    this.highlight = function (p1) {
        p1.setAttributeNS(null, "fill", "lightgrey");
    }

    // function to generate random points for testing 
    this.genRandom = function (numP = 0) {
        let nm = document.querySelector("#num");
        if (nm.value != null) {
            numP = nm.value;
        }
        for (let i = 0; i < numP; i ++) {
            let h = window.innerHeight;
            let w = window.innerWidth;
            let x = Math.random()*(.90*w);
            let y = Math.random()*(.65*h);
            this.ps.addNewPoint(x,y);
            let randP = this.ps.points[this.ps.points.length-1];
            console.log(randP);
            this.drawPoint(randP);
        }
    }


}

/*
 * An object representing an instance of the convex hull problem. A ConvexHull stores a PointSet ps that stores the input points, and a ConvexHullViewer viewer that displays interactions between the ConvexHull computation and the 
 */
function ConvexHull (ps, viewer) {
    this.ps = ps;          // a PointSet storing the input to the algorithm
    this.viewer = viewer;  // a ConvexHullViewer for this visualization
    this.curStep = 1;
    // start a visualization of the Graham scan algorithm performed on ps
    this.cvSet = null;
	this.strt = false;

    this.updateSpeed = function () {
        let rng = document.querySelector("#spd");
        this.spd = rng.value;
    }

    this.resetVis = function () {
        let svg = document.querySelector("svg");
        this.conceal();
        for(let i= 0; i < svg.children.length; i ++) {
            if (svg.children[i].tagName === "line" | svg.children[i].getAttribute("fill") !=  "black") {
                if ( ! svg.children[i].classList.contains("curCheck")) {
                    svg.children[i].remove();
                    i -= 1; 
                }
            }
        }
        this.curStep = 1;
    }

    this.start = function () {
	// COMPLETE THIS METHOD
        this.strt = true;
    }

    // perform a single step of the Graham scan algorithm performed on ps
    this.step = function () {
	// COMPLETE THIS METHOD
        // this.spd = rng.value;
        this.updateSpeed();
        if (this.strt) {
            this.drawConvexHull(this.curStep);
            this.curStep += 1;
            // console.log(this.curStep+2);
            // console.log(this.ps.points.length);
        }
	// my thinking right now for taking one step of graham scan is to perform one iteration of the outer for loop (loop that iterates for each point in set) 
    }

    // Return a new PointSet consisting of the points along the convex
    // hull of ps. This method should **not** perform any
    // visualization. It should **only** return the convex hull of ps
    // represented as a (new) PointSet. Specifically, the elements in
    // the returned PointSet should be the vertices of the convex hull
    // in clockwise order, starting from the left-most point, breaking
    // ties by minimum y-value.
    var upperA = null;
    var upperB = null;
    var upperC = null;
    var lowerA = null;
    var lowerB = null;
    var lowerC = null;

    // create circle elements for tracking and displaying point being currently checked on each half 
    this.createTracker = function(color) {
        let tracker = document.createElementNS(SVG_NS, "circle");
        tracker.setAttributeNS(null, "cx",-10);
        tracker.setAttributeNS(null, "cy", -10);
        tracker.setAttributeNS(null, "fill-opacity", 0);
        tracker.setAttributeNS(null, "r", 9);
        tracker.classList.add("curCheck");
        tracker.setAttributeNS(null, "stroke", color);
        tracker.setAttributeNS(null, "stroke-width", 4);
        tracker.setAttributeNS(null, "opacity", 0);
        return tracker;
    }
    this.initializeTrackers = function () {
        upperA = this.createTracker("rgb(0,0,0)");
        upperB = this.createTracker("rgb(100,100,100)");
        upperC = this.createTracker("rgb(0, 250,0)");
        lowerA = this.createTracker("rgb(0,0,0)");
        lowerB = this.createTracker("rgb(100,100,100)");
        lowerC = this.createTracker("rgb(0,250,0)");
        let svg = document.querySelector("svg");
        svg.appendChild(upperA);
        svg.appendChild(upperB);
        svg.appendChild(lowerB);
        svg.appendChild(lowerA);
        svg.appendChild(upperC);
        svg.appendChild(lowerC);
    }
    // this.initializeTrackers();

    this.updateUpper = function () {
        upperA.setAttributeNS(null, "opacity", 1);
        upperB.setAttributeNS(null, "opacity", 1);
        upperC.setAttributeNS(null, "opacity", 1);
    }
    this.updateLower = function () {
        lowerA.setAttributeNS(null, "opacity", 1);
        lowerB.setAttributeNS(null, "opacity", 1);
        lowerC.setAttributeNS(null, "opacity", 1);
    }

    this.conceal = function () {
        upperA.setAttributeNS(null, "opacity", 0);
        upperB.setAttributeNS(null, "opacity", 0);
        upperC.setAttributeNS(null, "opacity", 0);
        lowerA.setAttributeNS(null, "opacity", 0);
        lowerB.setAttributeNS(null, "opacity", 0);
        lowerC.setAttributeNS(null, "opacity", 0);
    }
    
    // question of which coordinates to update upperCur and lowerCur to, for inner loops of getConvexHull
    // 
    // console.log(this.spd);

    this.drawConvexHull = function (iters = this.ps.points.length) {
        // COMPLETE THIS METHOD
        // modify css variable --speed to scale w number of points (such that circles transition at appropriate speed)
        let root = document.querySelector(":root");
        root.style.setProperty("--speed", String(.5/((this.ps.points.length/2)/(10/this.spd))) + "s");
        this.updateSpeed();

        // for each call to getConvexHull, ensure all previously drawn lines are removed 
            let svg = document.querySelector("svg");
            for(let i= 0; i < svg.children.length; i ++) {
                if (svg.children[i].tagName === "line" | svg.children[i].getAttribute("fill") !=  "black") {
                    if ( ! svg.children[i].classList.contains("curCheck")) {
                        svg.children[i].remove();
                        i -= 1; 
                    }
                    else {
                        console.log("hEYEYYY");
                    }
                }
            }
            
            // one half; 
            this.ps.sort(); 
            pointsArr = this.ps.points;
            upperHalf = [];
            // sort the points and push first two onto stack
            // for every other point (after first two) in set:
            for (let i = 0; i < iters; i ++) {
                // this.updateUpper();
                // c = current point
                c = pointsArr[i];
                upperC.setAttributeNS(null, "cx", c.x);
                upperC.setAttributeNS(null, "cy", c.y);
                    // while not a right turn (not an obtuse angle) from a->b->c, pop from the stack (as this means we don't want to use that point),
                    //  b will always be the point that is popped (as it is midpoint of a-b-c)
                while (upperHalf.length > 1 &&  !this.isRight(upperHalf[upperHalf.length-2],upperHalf[upperHalf.length-1],c)) {
                    upperHalf.pop();
                    a = upperHalf[upperHalf.length-2];
                    b = upperHalf[upperHalf.length-1];
                    if (a!=null) {
                        upperA.setAttributeNS(null, "cx", a.x);
                        upperA.setAttributeNS(null, "cy", a.y);
                    }
                    upperB.setAttributeNS(null, "cx", b.x);
                    upperB.setAttributeNS(null, "cy", b.y);
                    this.updateUpper();  
                    }
                    // having found right turn between a-b-c, push c to stack 
                    upperHalf.push(c);
                    this.updateUpper();  
                }
            // other half
            this.ps.reverse();
            pointsArr = this.ps.points;
            lowerHalf = [];
            for (let i = 0; i < iters; i ++) {
                // this.updateLower();
                c = pointsArr[i];
                lowerC.setAttributeNS(null, "cx", c.x);
                lowerC.setAttributeNS(null, "cy", c.y);
                    while (lowerHalf.length > 1 && !this.isRight(lowerHalf[lowerHalf.length-2],lowerHalf[lowerHalf.length-1],c)) { //while not right turn
                        lowerHalf.pop();
                        a = lowerHalf[lowerHalf.length-2];
                        b = lowerHalf[lowerHalf.length-1];
                        if (a != null) {
                            lowerA.setAttributeNS(null, "cx", a.x);
                            lowerA.setAttributeNS(null, "cy", a.y);
                        }
                        lowerB.setAttributeNS(null, "cx", b.x);
                        lowerB.setAttributeNS(null, "cy", b.y);
                        this.updateLower();
                    }
                    lowerHalf.push(c);
                    this.updateLower();
            }
            // create set of all points in convex hull by adding upper and lower halfs 
            for (const p of lowerHalf) {
                if (upperHalf.includes(p)) {
                    let ind = lowerHalf.indexOf(p);
                    lowerHalf.splice(ind, 1);
                }
            }
            this.cvSet = upperHalf.concat(lowerHalf);
            console.log(this.cvSet);
            for (const p of this.cvSet) {
                console.log(p + "ajsdhjh");
                if (upperHalf.includes(p)) {
                    viewer.drawPoint(p, "red");
                } else {
                    viewer.drawPoint(p, "blue");
                }
            }
            if (iters < this.ps.points.length) {
                for (let i =0; i < upperHalf.length-1; i ++) {
                    if ( i >= upperHalf.length-3) {
                        viewer.connect(upperHalf[i], upperHalf[i+1], "rgb(220,220,220)");
                    } else {
                        viewer.connect(upperHalf[i], upperHalf[i+1]);
                    }
                   
                }
                for (let i =0; i < lowerHalf.length-1; i ++) {
                    if (i >= lowerHalf.length-3) {
                        viewer.connect(lowerHalf[i], lowerHalf[i+1], "rgb(220,220,220)");
                    }
                    else {
                        viewer.connect(lowerHalf[i], lowerHalf[i+1]);
                    }
                   
                }
            } else {
                this.conceal();
                for (let i = 0; i < this.cvSet.length-1; i ++) {
                    viewer.connect(this.cvSet[i], this.cvSet[i+1]);
                }
                viewer.connect(this.cvSet[this.cvSet.length-1], this.cvSet[0]);
            }
            return this.cvSet;
        }


// this function copies above but for testing 
    this.getConvexHull = function () {
        this.ps.sort(); 
        // this.ps.reverse();
        pointsArr = this.ps.points;
        upperHalf = [];
        // for every other point in set:
        for (let i = 0; i < pointsArr.length; i ++) {
            // this.updateUpper();
            // c = current point
            c = pointsArr[i];
                // while not a right turn (not an obtuse angle) from a->b->c, pop from the stack (as this means we don't want to use that point),
                //  b will always be the point that is popped (as it is midpoint of a-b-c)
            while (upperHalf.length > 1 && !this.isRight(upperHalf[upperHalf.length-2],upperHalf[upperHalf.length-1],c)) {
                upperHalf.pop();
            }
                // having found right turn between a-b-c, push c to stack 
            upperHalf.push(c);
        }
        
        // other half
        this.ps.reverse();
        pointsArr = this.ps.points;
        lowerHalf = [];
        // lowerHalf.push(this.ps.points[0]);
        // lowerHalf.push(this.ps.points[1]);
        for (let i = 0; i < pointsArr.length; i ++) {
            c = pointsArr[i];
            while (lowerHalf.length > 1 && !this.isRight(lowerHalf[lowerHalf.length-2],lowerHalf[lowerHalf.length-1],c)) { //while not right turn
                lowerHalf.pop();
            }
            lowerHalf.push(c);
        }

        var retSet = new PointSet();
        for (var p of upperHalf) {
            retSet.addNewPoint(p.x, p.y);
        }
        for (let i = 1; i < lowerHalf.length; i ++) {
            retSet.addNewPoint(lowerHalf[i].x, lowerHalf[i].y);
        }
   
        return retSet;
    }

    // plan: 
    //  implement full graham scan algorithm in getConvexHull; take fragments of it to implement step and start accordingly;
    // as of now, the algorithm i have here in getConvexHull doesn't seem to work perfectly all of the time; 
    // i am not exactly sure why/when it fails, need to figure that out 
    // also need to build full set of points in convex hull as opposed to using both halves to draw; will need this for testing as well;
    // need to figure out how to implement step by step

    // GOALS: 
    //  1. have getConvexHull return one set of all points as opposed to set for each half; (done)
    //  2. figure out how to implement single step of graham scan and how we want to visualize (done)
    //  3. use step to implement animate (done)

    //  4. figure out what is causing bug (what causes graham scan to fail) have no clue what the common corner case is here but 
    //     alg def fails every once in a while; think it has something to do w the setting of a,b, c (also seems like its always for lowerHalf)
    //  5. fix bug, ensure is testable and passing all tests
    //  6. organize code for submission 
    //  7. make curCheck transition speed a variable that scales opposite to num of points 
    //  8. catch edge cases of pointSet of size 1, 2 (hard code in catch, in this case convex hull is literally every point in set)
    // 

    this.isRight = function(p1, p2, p3) {
        if ((p3.y-p2.y)*(p2.x-p1.x)-(p2.y-p1.y)*(p3.x-p2.x) >= 0) {
            return false;
        } else {
            return true;
        }
    }
    
}

function go() { 
    let tS = new PointSet();
    let test = new ConvexHullViewer(document.querySelector("svg"), tS);
    let alg = new ConvexHull(tS, test);
    alg.initializeTrackers();
    let tConnect = document.querySelector("#connect");
    tConnect.addEventListener("click", function ( ) {
        if (alg.strt) {
            alg.drawConvexHull();
        }
    })


    let S = document.querySelector("#start");
    S.addEventListener("click", function () {
        alg.start();
        S.classList.add("vis");
    })



    let step = document.querySelector("#step");
    step.addEventListener("click", function () {
        if (alg.curStep <= alg.ps.points.length) {
            alg.step();
        }
    })

    let refID = null;
    let animate = document.querySelector("#animate");
    animate.addEventListener("click", function () {
        alg.updateSpeed();
        if (alg.strt) {
            refID = setInterval(function () {
                temp = []
                if (alg.cvSet != null) {
                    for (var p of alg.cvSet) {
                        temp.push(p);
                    }
                }
                console.log("temp " + temp);
                console.log("cv set " + alg.cvSet);         
                if (alg.curStep <= alg.ps.points.length) {
                        alg.step();
                }
                if (JSON.stringify(temp) === JSON.stringify(alg.cvSet)) {
                    clearInterval(refID);
                }
                
            }, (1500/(alg.ps.points.length/10))/alg.spd);
        }
    })

    let rm =document.querySelector("#rN");
    rm.addEventListener("click", function () {
        let svg = document.querySelector("svg");
        console.log("good");
        clearInterval(refID);
        test.ps = new PointSet();
        alg.ps = test.ps;
        alg.curStep = 1;
            for(let i= 0; i < svg.children.length; i ++) {
                    if (! svg.children[i].classList.contains("curCheck")) {
                        svg.children[i].remove();
                        i -= 1;
                    } else {
                        svg.children[i].setAttributeNS(null, "opacity", 0);
                    }
            }
    });
    // let cntr = 0;
    let rnd = document.querySelector("#rand");
    rnd.addEventListener("click", function () {
        test.genRandom();
    })
    rnd.addEventListener("mouseleave", function () {
        let get = document.querySelector("#num");
        get.value = 0;
    })

    let rst = document.querySelector("#rst");
    rst.addEventListener('click', function () {
        clearInterval(refID);
        alg.resetVis();
    })
}

go();


exports.PointSet = PointSet;
exports.ConvexHull = ConvexHull;

//think about getting animation to smoothly transform rather than snap through steps; perhaps try using circle 
// technique will showed w dfs visualization where circle representing the node being currently checked is drawn at start 
// and updates x, y for each new node; question, which point a, b ,c should that circle be drawn at? perhaps b and c? 

// also maybe draw each half one by one; so have convex hull first populate left half and second populate right half 

// modify format so it works w tester file;
// ensure accuracy and consistency of circle trackers 

// literally label points A, B, C
// color contrast 
// distinguish points 