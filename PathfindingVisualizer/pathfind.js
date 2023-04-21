//planning: 
//      - should create cell class/object that holds relevant variables to be modified throughout pathfinding processes 
//      - 
const cellW = "2vw";
const cellH = "3vh";
const grid = document.querySelector(".grid");
const gridArr = [];
var toggleWalls = false;
var remove = false;
var unweight = false;
var toggleStart = false;
var toggleTarget = false;
var toggleWeight = false; 
var canSearch = true;
var start = null; //need to set these at each toggle and reset if start/target set again such that there are no repeats 
var target = null;

// hover effect for cells 
let cells = document.querySelectorAll(".cell");
for (let cell of cells) {
    cell.onmouseover = function () {
        cell.style.backgroundColor = "grey";
    }
}

// event listener for closing and managing the instructions pop up
if (document.querySelector(".popup").style.display != "none") {
    grid.style.pointerEvents = "none";
    document.querySelector(".header").style.pointerEvents = "none";
}
let closePopup = document.querySelector("#exit-popup");
closePopup.addEventListener("click", function () {
    document.querySelector(".popup").style.display = "none";
    grid.style.pointerEvents = "";
    document.querySelector(".header").style.pointerEvents = "";
    console.log(document.querySelector(".header"));
})

let instruc = document.querySelector("#instructions");
instruc.addEventListener("click", function () {
    document.querySelector(".popup").style.display = "";
    grid.style.pointerEvents = "none";
    document.querySelector(".header").style.pointerEvents = "none";
})

//event listener to implement tracking for custom cursor; for changing icon, have custom cursor change properties depending on toggle, this is done below in the management for toggling 
let cust = document.querySelector(".custom-cursor");
document.addEventListener("mousemove", function (e) {
    cust.style.left = `${e.clientX}px`;
    cust.style.top =`${e.clientY}px`;
})
grid.addEventListener("click", function () {
    cust.style.transform = "scale(1.08)";
    cust.style.opacity = "1";
    if (toggleWeight & !unweight) {
        cust.getElementsByTagName("i")[0].classList.add("fa-bounce");
    }
    setTimeout(function (){
        cust.style.transform = "";
        cust.style.opacity = ".65";
        if (toggleWeight) {
            cust.getElementsByTagName("i")[0].classList.remove("fa-bounce");
        }
    }, 350);
})




function drawGrid() {
    // creates grid and relevant dom elements;
    for (let i = 0; i < 25; i ++) {
        gridArr[i] = [];
        for (let j = 0; j < 50; j ++) {
            let cell = document.createElement("div");
            cell.style.boxSizing = "border-box";
            cell.style.width = cellW;
            cell.style.height = cellH;
            // cell.style.border = "1px solid black";
            cell.classList.add("cell");
            let cur = new Cell(j, i, cell);
            gridArr[i].push(cur);
            grid.appendChild(cell);
        }
    }
    // console.log(gridArr);
}


// add event listeners for buttons 
let str = document.querySelector("#start"); 
str.addEventListener("click", function () {
    remove = false;
    toggleStart = true;
    toggleTarget = false;
    toggleWalls = false;
    toggleWeight = false;
    toggle(str);

    // update cursor 
    cust.innerHTML = `<i class="fa-solid fa-play"></i>`;
    cust.style.backgroundColor = "transparent";
});

let randStart = document.querySelector("#random-start")
randStart.addEventListener("click", function () {
    let startX = Math.floor(Math.random() * 50);
    let startY = Math.floor(Math.random() * 25);
    if (start) { //reset old start 
        start.div.innerHTML = "";
        start.start = false;
    }
    gridArr[startY][startX].div.innerHTML = `<i class="fa-solid fa-xl fa-play"></i>`;
    gridArr[startY][startX].div.querySelector("i").style.opacity = "0";
    setTimeout(function () {
        gridArr[startY][startX].div.querySelector("i").style.opacity = "1";
        gridArr[startY][startX].div.querySelector("i").classList.add("fa-bounce");
    }, 200)
    setTimeout(function () {
        gridArr[startY][startX].div.querySelector("i").classList.remove("fa-bounce");
    }, 1000)
    gridArr[startY][startX].start = true;
    start = gridArr[startY][startX];
    let targX =  Math.floor(Math.random() * 50);
    let targY = Math.floor(Math.random() * 25);
    if (target) { //reset old target 
        target.div.innerHTML = "";
        target.target = false;
    }
    gridArr[targY][targX].div.innerHTML = `<i class="fa-solid fa-xl fa-bullseye"></i>`;
    gridArr[targY][targX].div.querySelector("i").style.opacity = "0";
    setTimeout(function () {
        gridArr[targY][targX].div.querySelector("i").style.opacity = "1";
        gridArr[targY][targX].div.querySelector("i").classList.add("fa-bounce");
    }, 200)
    setTimeout(function () {
        gridArr[targY][targX].div.querySelector("i").classList.remove("fa-bounce");
    }, 1000)
    gridArr[targY][targX].target = true;
    target = gridArr[targY][targX];
})

let wlls = document.querySelector("#walls")
wlls.addEventListener("click", function () {
    remove = false;
    toggleStart = false;
    toggleTarget = false;
    toggleWalls = true;
    toggleWeight = false;
    toggle(wlls);

    // update cursor 
    cust.innerHTML = "";
    cust.style.width = `1vw`;
    cust.style.height = `1.5vh`;
    cust.style.backgroundColor = "black";
});
let remW = document.querySelector("#rem-walls")
remW.addEventListener("click", function () {
    remove = true;
    toggleStart = false;
    toggleTarget = false;
    toggleWalls = true;
    toggleWeight = false;
    toggle(remW);
    // update cursor 
    cust.innerHTML = `<i class="fa-solid fa-xmark"></i>`;
    cust.style.backgroundColor = "transparent";
});
let trgt = document.querySelector("#target");
trgt.addEventListener("click", function () {
    remove = false;
    toggleStart = false;
    toggleTarget = true;
    toggleWalls = false;
    toggleWeight = false;
    toggle(trgt);

    // update cursor 
    cust.innerHTML = `<i class="fa-solid fa-bullseye"></i>`;
    cust.style.backgroundColor = "transparent";
});
let wght = document.querySelector("#weight");
wght.addEventListener("click", function () {
    remove = false;
    unweight = false;
    toggleStart = false;
    toggleTarget = false;
    toggleWalls = false;
    toggleWeight = true;
    toggle(wght);
    // update cursor 
    cust.innerHTML = `<i class="fa-solid fa-weight-hanging"></i>`;
    cust.style.backgroundColor = "transparent";
})
let uWght = document.querySelector("#unweight");
uWght.addEventListener("click", function () {
    remove = false;
    unweight = true;
    toggleStart = false;
    toggleTarget = false;
    toggleWalls = false;
    toggleWeight = true;
    toggle(uWght);
    // update cursor 
    cust.innerHTML = `<i class="fa-solid fa-minus"></i>`;
    cust.style.backgroundColor = "transparent";
});


// event listener for drawing custom mouse over grid 
grid.addEventListener("mouseover", function (e) {
    cust.style.display = "";
    document.body.style.cursor = "none";
    
});
grid.addEventListener("mouseleave", function () {
    cust.style.display = "none";
    document.body.style.cursor = "default";
})

//add event listener for toggling various modifications of grid 
function toggle(cur) {
    cur.style.backgroundColor = "rgb(220,220,220)";
    for (let btn of document.querySelectorAll("button")) {
        if (btn != cur) {
            btn.style.backgroundColor = "white";
        }
    }
    if (toggleStart | toggleTarget) {
        grid.onmousedown = function (e) {
        let rect = grid.getBoundingClientRect();
        let denomX = (rect.left + rect.right)/50
        let cellX = Math.floor(e.clientX/denomX)
        let denomY = (rect.bottom-rect.top)/25;
        let cellY = Math.floor((e.clientY - rect.top)/denomY)
        if (toggleStart) {
            //update cursor to be start symbol 

            if (start) {
                //reset old start 
                // start.div.style.backgroundColor = "white";
                start.div.innerHTML = "";
                start.start = false;
            }
            // gridArr[cellY][cellX].div.style.backgroundColor = "green";
            
            gridArr[cellY][cellX].div.innerHTML = `<i class="fa-solid fa-xl fa-play"></i>`;
            gridArr[cellY][cellX].div.querySelector("i").style.opacity = "0";
            setTimeout(function () {
                gridArr[cellY][cellX].div.querySelector("i").style.opacity = "1";
                gridArr[cellY][cellX].div.querySelector("i").classList.add("fa-bounce");
            }, 200)
            setTimeout(function () {
                gridArr[cellY][cellX].div.querySelector("i").classList.remove("fa-bounce");
            }, 1000)
            gridArr[cellY][cellX].start = true;
            start = gridArr[cellY][cellX];
        } else {
            //update cursor to be target symbol

            if (target) {
                // target.div.style.backgroundColor = "white";
                target.div.innerHTML = "";
                target.target = false;
            }
            // gridArr[cellY][cellX].div.style.backgroundColor = "red";
            gridArr[cellY][cellX].div.innerHTML = `<i class="fa-solid fa-xl fa-bullseye"></i>`;
            gridArr[cellY][cellX].div.querySelector("i").style.opacity = "0";
            setTimeout(function () {
                gridArr[cellY][cellX].div.querySelector("i").style.opacity = "1";
                gridArr[cellY][cellX].div.querySelector("i").classList.add("fa-bounce");
            }, 200)
            setTimeout(function () {
                gridArr[cellY][cellX].div.querySelector("i").classList.remove("fa-bounce");
            }, 1000)

            // gridArr[cellY][cellX].div.appendChild()
            gridArr[cellY][cellX].target = true;
            target = gridArr[cellY][cellX];
        }
    }
    }
    if (toggleWalls) {
        grid.onmousedown = function () {
            grid.onmousemove = function (e) {
                let rect = grid.getBoundingClientRect();
                let denomX = (rect.left + rect.right)/50
                let cellX = Math.floor(e.clientX/denomX)
                let denomY = (rect.bottom-rect.top)/25;
                let cellY = Math.floor((e.clientY - rect.top)/denomY)
                // console.log(cellX);
                // console.log(cellY)
                if (!remove && !gridArr[cellY][cellX].wall) {
                    gridArr[cellY][cellX].wall = true;
                    gridArr[cellY][cellX].div.style.backgroundColor = "black";
                    gridArr[cellY][cellX].div.style.border = "1px solid black";
                    gridArr[cellY][cellX].div.style.transform = "scale(1.35)";
                    setTimeout(function () {
                        gridArr[cellY][cellX].div.style.transform = "";
                    }, 200);
                    
                } 
                if (remove && gridArr[cellY][cellX].wall) {
                    console.log(gridArr[cellY][cellX].wall);
                    gridArr[cellY][cellX].wall = false;
                    gridArr[cellY][cellX].div.style.transform = "scale(.2)";
                    setTimeout(function () {
                        gridArr[cellY][cellX].div.style.transform = "";
                    }, 400);
                    gridArr[cellY][cellX].div.style.backgroundColor = "white";
                    gridArr[cellY][cellX].div.style.border = "1px solid rgb(238, 250, 255)";
                } 
                // console.log(gridArr[cellY][cellX]);
            }
        }
    }
    if (toggleWeight) {
        grid.onmousedown = function (e) {
            let rect = grid.getBoundingClientRect();
            let denomX = (rect.left + rect.right)/50
            let cellX = Math.floor(e.clientX/denomX)
            let denomY = (rect.bottom-rect.top)/25;
            let cellY = Math.floor((e.clientY - rect.top)/denomY)
            if (gridArr[cellY][cellX].div.innerHTML != "") {
                //if already weighted 
                if (! unweight) {
                    gridArr[cellY][cellX].div.innerHTML = Number(gridArr[cellY][cellX].div.innerHTML) + 1; 
                    gridArr[cellY][cellX].weight += 1;
                    gridArr[cellY][cellX].div.style.transform = "scale(1.2)";
                } else {
                    gridArr[cellY][cellX].div.innerHTML = Number(gridArr[cellY][cellX].div.innerHTML) - 1;
                    gridArr[cellY][cellX].weight -= 1;
                    gridArr[cellY][cellX].div.style.transform = "scale(.8)";
                }
               
            } else {
                if (!unweight) {
                    gridArr[cellY][cellX].div.innerHTML = 1;
                    gridArr[cellY][cellX].weight += 1;
                    gridArr[cellY][cellX].div.style.transform = "scale(1.2)";
                } else {
                    gridArr[cellY][cellX].div.innerHTML = -1;
                    gridArr[cellY][cellX].weight -= 1;
                    gridArr[cellY][cellX].div.style.transform = "scale(.8)";
                }
            }
            gridArr[cellY][cellX].div.style.backgroundColor = `rgb(${250-5*(gridArr[cellY][cellX].div.innerHTML)}, ${250-5*(gridArr[cellY][cellX].div.innerHTML)}, ${250-5*(gridArr[cellY][cellX].div.innerHTML)})`
            gridArr[cellY][cellX].div.style.color = `rgb(${3*(gridArr[cellY][cellX].div.innerHTML)}, ${3*(gridArr[cellY][cellX].div.innerHTML)}, ${3*(gridArr[cellY][cellX].div.innerHTML)})`
            
            setTimeout(function () {
                gridArr[cellY][cellX].div.style.transform = "";
            }, 200);

        }
    }
}

grid.addEventListener("mouseup", function () {
    grid.onmousemove = null;
})

//functions for resetting grid, clearing search and randomizing weight/wall configurations 
var refID = null;
function reset() {
    canSearch = true;
    start = null;
    target = null;
    clearInterval(refID);
    for (let i = 0; i < 25; i ++) {
        for (let j = 0; j < 50; j ++) {
            gridArr[i][j].reset();
        }}}
function clear() {
    canSearch = true;
    clearInterval(refID);
    for (let i = 0; i < 25; i ++) {
        for (let j = 0; j < 50; j ++) {
            gridArr[i][j].clear();
        }}}

function clearWalls() {
    for (let i = 0; i < 25; i ++) {
        for (let j = 0; j < 50; j ++) {
            gridArr[i][j].clearWall();
        }}}

function clearWeights() {
    for (let i = 0; i < 25; i ++) {
        for (let j = 0; j < 50; j ++) {
            gridArr[i][j].clearWeight();
        }}}



function randomizeWeights() {
    for (let i = 0; i < 25; i ++) {
        for (let j = 0; j < 50; j ++) {
            let rand = Math.floor(Math.random()*25);
            let chance = Math.random();
            if (chance > .65) {
                if (!gridArr[i][j].start & !gridArr[i][j].wall & !gridArr[i][j].target) {
                    gridArr[i][j].weight = rand; 
                    if (rand != 0) {
                        gridArr[i][j].div.innerHTML = `${rand}`;
                    }
                    gridArr[i][j].div.style.backgroundColor = `rgb(${250-5*gridArr[i][j].weight}, ${250-5*gridArr[i][j].weight}, ${250-5*gridArr[i][j].weight})`;
                }
            } else {
                if (!gridArr[i][j].start & !gridArr[i][j].wall & !gridArr[i][j].target) {
                    gridArr[i][j].weight = 0; gridArr[i][j].div.innerHTML = '';
                    gridArr[i][j].div.style.backgroundColor = "white";
                }
            }
        }
    }
}

function randomizeWalls() {
    for (let i = 0; i < 25; i ++) {
        for (let j = 0; j < 50; j ++) {
            let chance = Math.random();
            if (chance > .71) {
                if (!gridArr[i][j].start & !gridArr[i][j].wall & !gridArr[i][j].target) {
                    gridArr[i][j].div.style.backgroundColor = `black`;
                    gridArr[i][j].div.style.border = "1px solid black";
                    gridArr[i][j].div.style.transform = "scale(1.08)";
                setTimeout(function () {
                    gridArr[i][j].div.style.transform = "";
                }, 100);
                    gridArr[i][j].wall = true;
                }
            } else {
                    if (!gridArr[i][j].start & !gridArr[i][j].target) {
                        gridArr[i][j].div.innerHTML = "";
                        gridArr[i][j].div.style.backgroundColor = "white";
                        gridArr[i][j].div.style.border = "1px solid rgb(238, 250, 255)";
                        gridArr[i][j].wall = false;
                    }
            }
            }
        }
}


// event listener for randomizeWeights and randomize walls btn 
let randWalls = document.querySelector("#rand-walls");
randWalls.addEventListener("click", randomizeWalls)
let randomWeight = document.querySelector("#rand-weight");
randomWeight.addEventListener("click", randomizeWeights);
//event listener for reset and clear buttons 
let rst = document.querySelector("#reset");
rst.addEventListener("click", reset);
let clr = document.querySelector("#clear");
clr.addEventListener("click", clear);
let wallClr = document.querySelector("#clear-walls");
wallClr.addEventListener("click", clearWalls);
let weightClr = document.querySelector("#clear-weights");
weightClr.addEventListener("click", clearWeights); 

// algorithms and relevant event listeners are added/implemented below
var timer = Date.now(); //initialize runtimer 
var dfsButton = document.querySelector("#DFS");
dfsButton.addEventListener("click", function () {
    if (!start | !target) {
        result.innerHTML = "Please set start and target"
    } else if (!canSearch) {
        result.innerHTML = "Please clear search before searching again"
    } else {
        canSearch = false;
        result.innerHTML = "";
        frontier = [];
        start.cost = 0;
        frontier.push(start);
        timer = Date.now();
        refID = setInterval(function () {
            DFS(frontier, target, refID, false, false);
        }, 5);
    }
})
var bfsButton = document.querySelector("#BFS");
bfsButton.addEventListener("click", function () {
    if (!start | !target) {
        result.innerHTML = "Please set start and target"
    } else if (!canSearch) {
        result.innerHTML = "Please clear search before searching again"
    } else {
        canSearch = false;
        result.innerHTML = "";
        frontier = [];
        start.cost = 0;
        frontier.push(start);
        timer = Date.now();
        refID = setInterval(function () {
            DFS(frontier, target, refID, true, false);
        }, 5);
    }
})

var aStarButton = document.querySelector("#Astar");
aStarButton.addEventListener("click", function () {
    if (!start | !target) {
        result.innerHTML = "Please set start and target"

    } else if (!canSearch) {
        result.innerHTML = "Please clear search before searching again"
    } else {
        canSearch = false;
        result.innerHTML = "";
        frontier = [];
        start.cost = 0;
        frontier.push(start);
        timer = Date.now();
        refID = setInterval(function () {
            DFS(frontier, target, refID, true, true);
        }, 5);
    }
})

var dijkButton = document.querySelector("#dijkstra");
dijkButton.addEventListener("click", function () {
    if (!start | !target) {
        result.innerHTML = "Please set start and target"
    } else if (!canSearch) {
        result.innerHTML = "Please clear search before searching again"
    } else {
        canSearch = false;
        result.innerHTML = "";
        frontier = [];
        start.cost = 0;
        frontier.push(start);
        timer = Date.now();
        mult = 0;
        refID = setInterval(function () {
            mult += 1;
            Dijkstras(frontier, target, refID, mult);
        }, 5);
    }
})

let result = document.querySelector(".result");

function DFS(frontier, target, refID, isBFS, isA) {
    // want each algorithm to be implemented as a single iteration (rather than full while loop), such that we can call it 
    // w setInterval within event listeners for appropriate button 
    if (frontier.length > 0) {
        if (isBFS) {
            if (isA) {
                frontier.sort(compareDistTarget);
            }
            cur = frontier.shift();
        } else {
            cur = frontier.pop();
        }
        cur.visited = true;
        cur.div.style.backgroundColor = "blue";
        cur.div.style.border = "1px solid blue";
        // want to animate this somehow 
        cur.div.style.opacity = ".1";
        // cur.div.style.transform = "scale(.35)";
        let scopeHm = cur;
        setTimeout(function () {
                scopeHm.div.style.opacity = "1";
                // scopeHm.div.style.transform  = "";
        }, 500)
        if (cur == target) {
            console.log("found");
            clearInterval(refID);
            // retrace path 
            var pathCost = cur.cost;
            var pathLength = -1;
            let i = 0;
            while (cur != null) {
                if (cur == start) {
                    cur.div.style.backgroundColor = "white";
                    cur.div.style.border = "1px solid rgb(238, 250, 255)";
                } else {
                    let scopeTest = cur;
                    console.log(scopeTest);
                    setTimeout(function () {
                        scopeTest.div.style.backgroundColor = "red";
                        scopeTest.div.style.border = "1px solid red";
                        scopeTest.div.style.transform = "scale(1.5) rotate(360deg)";
                    }, 30 * i)
                    setTimeout(function () {
                        scopeTest.div.style.transform = "rotate(360deg)";
                    }, 40 * i)
                }
                i += 1;
                pathLength += 1;

                cur = cur.parent;
            }
            result.innerHTML = `Path Length: ${pathLength} Path Cost: ${pathCost} Runtime: ${Date.now()-timer}ms`;
          

            return 
        }
        for (let n of cur.getNeighbors()) {
            if (!n.visited & !n.queued) {
                newCost = n.weight + cur.cost + 1;
                if (newCost < n.cost) {
                        n.cost = newCost;
                        n.parent = cur;}
                n.queued = true;
                if (!isA) {
                    n.parent = cur;
                }
                n.div.style.backgroundColor = "rgb(200,200, 250)";
                n.div.style.border = "1px solid rgb(200,200,250)";
                // n.div.style.opacity = ".3";
                n.div.style.transform = "scale(1.25)"
                setTimeout(function () {
                    // n.div.style.opacity = "1";
                    n.div.style.transform = "";
                }, 250)
                frontier.push(n);
            }
        }
    }
}

function Dijkstras(frontier, target, refID, mult) {
    if (frontier.length > 0) {
        frontier.sort(compareCost);
        cur = frontier.shift();
        cur.visited = true;
        cur.div.style.backgroundColor = "blue";
        // want to animate this somehow 
        cur.div.style.border = "1px solid blue";
        cur.div.style.opacity = ".1";
        // cur.div.style.transform = "scale(.35)"
        let scopeHm = cur;
        setTimeout(function () {
                scopeHm.div.style.opacity = "1";
                // scopeHm.div.style.transform = "";
        }, 500)

        if (cur == target) {
            console.log("found");
            clearInterval(refID);
            // retrace path 
            var pathCost = cur.cost;
            let i = 0;
            var pathLength = -1
            while (cur != null) {
                if (cur == start) {
                    cur.div.style.backgroundColor = "white";
                    cur.div.style.border = "1px solid rgb(238, 250, 255)";
                } else {
                    let scopeTest = cur;
                    console.log(scopeTest);
                    setTimeout(function () {
                        scopeTest.div.style.backgroundColor = "red";
                        scopeTest.div.style.border = "1px solid red";
                        scopeTest.div.style.transform = "scale(1.5) rotate(360deg)";
                    }, 30 * i)
                    setTimeout(function () {
                        scopeTest.div.style.transform = "rotate(360deg)";
                    }, 40 * i)
                }
                i += 1;
                // cur.div.style.transform = "scale(.8)"
                // setTimeout(function () {
                //     cur.div.style.transform = "";
                // }, 5);
                pathLength += 1;
                cur = cur.parent;
            }

            //add html element displaying path found with cost: 
            result.innerHTML = `Path Length: ${pathLength} Path Cost: ${pathCost} Runtime: ${Date.now()-timer}ms`;
            return 
        }
        for (let n of cur.getNeighbors()) {
            if (!n.visited ) {
                n.queued = true;
                newCost = n.weight + cur.cost + 1; 
                if (newCost < n.cost) {
                    n.cost = newCost
                    n.parent = cur;
                }
                n.div.style.border = "1px solid rgb(200,200, 250)";
                n.div.style.backgroundColor = "rgb(200,200, 250)";
                // n.div.style.opacity = ".1";
                n.div.style.transform = "scale(1.25)";
                // n.div.style.borderRadius = "10px";
                setTimeout(function () {
                    // n.div.style.opacity = "1";
                    // n.div.style.borderRadius = "0px";
                    n.div.style.transform = "";
                    
                },250)
                if (!frontier.includes(n)) {
                    frontier.push(n);}
                }
            }
        }
    }



function compareDistTarget(cell1, cell2) {
    var dist1 = Math.abs(target.x - cell1.x) + Math.abs(target.y-cell1.y);
    var dist2 = Math.abs(target.x - cell2.x) + Math.abs(target.y - cell2.y);
    return (dist1+cell1.cost) - (dist2+cell2.cost);
}

function compareCost(cell1, cell2) {
    return cell1.cost- cell2.cost;
}

// cell class for each cell of the grid such that book keeping variables relevant to algs is easy 
function Cell(column, row, element) {
    // control values 
    this.div = element;
    this.x = column;
    this.y = row;
    this.start = false;
    this.wall = false;
    this.target = false;
    this.weight = 0;
    this.cost = 99999;

    // values to be changed during pathfinding algorithms 
    this.visited = false;
    this.queued = false;
    
    // values for retracing path upon algorithm completion
    this.parent = null;

    this.reset = function () {
        this.div.style.backgroundColor = "white";
        this.div.style.border = "1px solid rgb(238, 250, 255)";
        this.div.innerHTML = "";
        this.div.style.transform = "";
        this.start = false;
        this.wall = false;
        this.target = false;
        this.weight = 0;
        result.innerHTML = "";
        // values to be changed during pathfinding algorithms 
        this.visited = false;
        this.queued = false;
        
        // values for retracing path upon algorithm completion
        this.parent = null;
    }
    this.clear = function () {
        if (!this.start & !this.target & !this.wall) {
            this.div.style.backgroundColor = `rgb(${255-5*this.weight}, ${255-5*this.weight}, ${255-5*this.weight})`;
        } else if (this.start | this.target)  {
            this.div.style.backgroundColor = "white";
        }
        if (!this.wall) {
            this.div.style.border = "1px solid rgb(238, 250, 255)";
        }
        this.visited = false;
        this.queued = false;
        this.parent = null;
        this.cost = 99999;
        result.innerHTML = "";
        this.div.style.transform = "";
    }

    this.clearWall = function () {
        if (this.wall) {
            this.wall = false;
            this.div.style.backgroundColor = "white";
            this.div.style.border = "1px solid rgb(238, 250, 255)";
        }
    }

    this.clearWeight = function () {
        if (this.weight > 0) {
            this.weight = 0;
            this.div.style.backgroundColor = "white";
            this.div.innerHTML = "";
        }
    }

    this.neighbors = [];

    this.getNeighbors = function () {
        //neighbors will be cells directly above,below, and to left/right of cell
        // by that 
        neighbs = [];
        if (this.x != 0) { //add left neighbor (cell at (this.x-1, this.y))
            if ( !gridArr[this.y][this.x-1].wall) {
                neighbs.push(gridArr[this.y][this.x-1]);
            }
            
        }

        if (this.x != 49) { //add right neighbor (cell at (this.x+1, this.y))
            if (!gridArr[this.y][this.x+1].wall) {
                neighbs.push(gridArr[this.y][this.x+1]);
            }
        }

        if (this.y != 0) { //add above neighbor (cell at (this.x, this.y-1))
            if (!gridArr[this.y-1][this.x].wall) {
                neighbs.push(gridArr[this.y-1][this.x]);
            }
        }

        if (this.y != 24) { //add below neighbor (cell at (this.x, this.y+1))
            if (!gridArr[this.y+1][this.x].wall) {
                neighbs.push(gridArr[this.y+1][this.x]);
            }
        }
        return neighbs;
    }
}


// Plan 4/18/23 
// As of now have very functional visualizer working for BFS, DFS, A* and UCF (like dijkstras)
// 1. have cursors change based on current toggle (be start sign when adding start, target for target, walls for walls, etc)
// 2. improve animations (specifically on final path) 
// dev notes (4/18/23 2:07 PM)
//  have just implemented a bunch of animation changes and modified cursor such that it represents the element in the grid you are modifying 
//  might wanna update searching nodes animation now such that border changes to match color change in node 
//      cud be easier to do this by having preset classes that are added depending on node status 
// 3. update aesthetics of menu (simplify button layout and make better looking)
//      get cheeky w hover stuff 

// Updates 4/19/23 
// have done most of the above, now want to:
// -  have it so if you change target / start node when visualition over, it automically recomputes 
// -  add belman ford for negatively weighting nodes 
// -  maze generation 

// Updates 4/20/23 
//  have updated animation to be somewhat cool; wanna focus on this and make it look rly cool, like its expanding 
//  need to: 
//      - clean up code
//      - comment code 
//      - implement maze generation 

// also considering making grid take up the whole screen and having header be a somewhat opaque overlay;
// this would be relatively simple, just have to resize cells and grid accordingly and make sure math is all correct 



