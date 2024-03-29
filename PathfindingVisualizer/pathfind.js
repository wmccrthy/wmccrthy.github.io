

var cellW = "2vw";
var cellH = "3vh";
var windowRs = 25;
var windowCs = 50;

//for this to work comprehensively, need to update all uses of "50" and "25" (for cols and rows) to be 
// set to windowRs and windowCs

//this code is used such that the grid functions as properly and resizes upon the window resizing;
// we tried to make this as optimal as possible for mobile layout with the techniques we knew and time we had 
let windowWidth = window.innerWidth
window.addEventListener("resize", function (e) {
    //only do the following on width changes bc mobile resizes height on scroll
    console.log(windowWidth)
    console.log(this.innerWidth)
    if (windowWidth != this.innerWidth) {
        console.log("working")
        windowWidth = this.innerWidth;
        reset();
        //clear relevant intervals and timeouts to ensure no errors 

        //if window is 600px or narrower, switch to mobile sizing format 
        if(window.matchMedia("(max-width: 600px)").matches & cellW == "2vw") {
            cellW = "4vw";
            cellH = "2vh";
            windowRs = 25;
            windowCs = 25;
            // need function for removing all cell divs 
            emptyGrid();
            drawGrid(25, 25);
        } else if (!window.matchMedia("(max-width: 600px)").matches) {
            cellW = "2vw";
            cellH = "3vh";
            windowRs = 25;
            windowCs = 50;
            emptyGrid();
            drawGrid();
        }
    }
    
});


const grid = document.querySelector(".grid");
//dom element to hold grid
var gridArr = [];
//2d array to hold cells of grid

var toggleWalls = false;
var remove = false;
var unweight = false;
var toggleStart = false;
var toggleTarget = false;
var toggleWeight = false; 
var canSearch = true;
var pathFound = false;
//booleans for controlling program flow and button logic 

var chosenAlg = null;
//chosenAlg variable to be used to update result display 

var start = null; //need to set these at each toggle and reset if start/target set again such that there are no repeats 
var target = null;


// basic hover effect for cells such that user knows location of mouse if not displayed and where clicking 
let cells = document.querySelectorAll(".cell");
for (let cell of cells) {
    cell.onmouseover = function () {
        cell.style.backgroundColor = "grey";
    }
}

// event listener for closing and managing the instructions and home pop up
let info = document.querySelector(".popup-big");

if (document.querySelector(".popup").style.display != "none") {
    // info.style.display = "none";
    info.style.opacity = "0";
    info.style.pointerEvents = "none";
    grid.style.pointerEvents = "none";
    document.querySelector(".header").style.pointerEvents = "none";
    grid.style.opacity = ".25"; 
    document.querySelector(".header").style.opacity = ".25";
}
// if the pop up is being displayed, disable pointer events on the grid and header (components of normal interface) such that 
// user has to close popup first 

let closePopup = document.querySelectorAll("#exit-popup");
closePopup.forEach(element => element.addEventListener("click", function () {
    element.parentElement.style.opacity = "0"
    element.parentElement.style.pointerEvents = "none";
    // document.querySelector(".popup").style.display = "none";
    grid.style.pointerEvents = "";
    document.querySelector(".header").style.pointerEvents = "";
    console.log(document.querySelector(".header"));
    grid.style.opacity = "1"; 
    document.querySelector(".header").style.opacity = "1";
}))
// event listener for closing pop-up; enables pointer events for header and grid such that upon closing, program functions as intended 

let instruc = document.querySelector("#instructions");

instruc.addEventListener("click", function () {
    // document.querySelector(".popup").style.display = "";
    // info.style.display = "";
    info.style.pointerEvents = "";
    info.style.opacity = "1";
    console.log(info);
    // info.style.zIndex = "6";
    grid.style.pointerEvents = "none";
    document.querySelector(".header").style.pointerEvents = "none";
    grid.style.opacity = ".25"; 
    document.querySelector(".header").style.opacity = ".25";
})
// event listener for instructions pop-up such that users can revisit if they forgot how to use program;
// disables appropriate pointer events 


//event listener to implement tracking for custom cursor; for changing icon, have custom cursor change properties depending on toggle, this is done below in the management for toggling 
let cust = document.querySelector(".custom-cursor");
document.addEventListener("mousemove", function (e) {
    cust.style.left = `${e.clientX}px`;
    cust.style.top =`${e.clientY}px`;
})
// with cust being the custom cursor div in index.html, simply have cust follow the mouse location across the document
// by setting its top and left offset = to the y and x coordinate of the mouse according to event 

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
// adds subtle visual effects for the custom cursor; most notably, will bounce when weighting nodes so it looks almost as if 
// the user is dropping a weight on that cell

// eventlistener for custom speed slider (upon changing value, change interval at which algorithms are iteratively called)
var algInterval = 1;
let speed = document.querySelector("input");
speed.onchange = function () {
    algInterval = Math.floor(100/speed.value);
}

function drawGrid(rows=25, cols=50) {
    // creates grid and relevant dom elements;
    for (let i = 0; i < rows; i ++) {
        gridArr[i] = [];
        for (let j = 0; j < cols; j ++) {
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
}
// function called upon window load to draw the grid; only called once to create grid as it would be wildly inconvenient to preset 
// thousands of divs within html 
function emptyGrid() {
    gridArr = []
    while (grid.lastChild) {
        grid.removeChild(grid.lastChild);
    }
}


// event listener for dropdown menu function 
let select = document.querySelectorAll(".dropdown");
for (let el of select) {
    let hd = el.querySelector(".dd-head");
    let mnu = el.querySelector(".dd-menu");
    hd.querySelector("button").style.pointerEvents = "none";
    mnu.style.pointerEvents = 'none';
    hd.addEventListener("click", function () {
        // if algorithm, disable it prompting upon click, only want to do so when we select alg from dropdown menu itself
        if (mnu.style.opacity != '1') {
            mnu.style.opacity = "1";
            // open caret
            el.style.boxShadow = '0px 3px 3px rgb(180,180,180)'
            hd.querySelector('button').querySelector('i').classList.toggle('fa-rotate-270')
            hd.querySelector("button").style.pointerEvents = "auto";
            mnu.style.pointerEvents = 'auto';
        } else {
            mnu.style.opacity = "0";
            // close caret
            el.style.boxShadow = ''
            hd.querySelector('button').querySelector('i').classList.toggle('fa-rotate-270')
            hd.querySelector("button").style.pointerEvents = "none";
            // have dropdown automatically scroll to top
            el.scrollTop = 0;
            mnu.style.pointerEvents = "none;"
        }
        
    })
    mnu.addEventListener('click', function (e) {
        // presuming e.target is the button we want to become select
        // insert target element into dd head 
        // insert selected element into dd menu
        console.log(e.target.tagName)
        if (e.target.tagName == 'BUTTON') {
            tmp = hd.querySelector("button")
            mnu.style.opacity = '0';
            e.target.classList.toggle('selected')
            e.target.innerHTML += `<i class="fa-solid fa-caret-down"></i>`
            tmp.classList.toggle('selected')
            hd.insertBefore(e.target, tmp)
            console.log(hd)
            console.log(hd.children);
            hd.removeChild(tmp)
            tmp.removeChild(tmp.querySelector('i'));
            // mnu.insertBefore(tmp, e.target)
            mnu.insertBefore(tmp, mnu.lastChild)
            el.style.boxShadow = ''
            // e.target = 
            el.scrollTop = 0;
            // dropdown automatically scroll to top 
            e.target.style.pointerEvents = "none";
            mnu.style.pointerEvents = "none"
        } else {
            mnu.style.opacity = '0'
            hd.querySelector("button").style.pointerEvents = "none";
            el.style.boxShadow = ''
            el.scrollTop = 0;
            hd.querySelector('button').querySelector('i').classList.toggle('fa-rotate-270')
        }
    })
   
    

}

// EVENT LISTENERS AND FUNCTIONALITY FOR BUTTONS 
let str = document.querySelector("#start"); 
str.addEventListener("click", function () {
    remove = false;
    toggleStart = true;
    toggleTarget = false;
    toggleWalls = false;
    toggleWeight = false;
    // ^ think i'm gonna wrap these in a function to keep this section of code cleaner !!!
    toggle(str);

    // update cursor to represent start symbol
    cust.innerHTML = `<i class="fa-solid fa-play"></i>`;
    // cust.innerHTML = "S";
    cust.style.backgroundColor = "transparent";
});
// start button programmed such that upon click, users can set start node; this ability will be toggled until user selects another 
// toggled button (target, walls, weights, etc)


let randStart = document.querySelector("#random-start")
randStart.addEventListener("click", function () {
    // this condition ensures that users cannot re-select start/target node during a search (doing so is prone to bugs)
    if (canSearch)  {
        let startX = Math.floor(Math.random() *windowCs);
        let startY = Math.floor(Math.random() *windowRs);
        if (start) { //reset old start 
            start.div.innerHTML = "";
            start.start = false;
        }
        //ensure randomized cells are not walls
        while (gridArr[startY][startX].wall | gridArr[startY][startX].weight != 0) {
            startX = Math.floor(Math.random() *windowCs);
            startY = Math.floor(Math.random() *windowRs);
        }
          
        
        // fill innerHTML of start w start symbol element 
        gridArr[startY][startX].div.innerHTML = `<i class="fa-solid fa-xl fa-play"></i>`;
        // gridArr[startY][startX].div.innerHTML = "s";
        gridArr[startY][startX].div.querySelector("i").style.opacity = "0";
        setTimeout(function () {
            if (gridArr[startY][startX] != null) {
                gridArr[startY][startX].div.querySelector("i").style.opacity = "1";
                gridArr[startY][startX].div.querySelector("i").classList.add("fa-bounce");
            }
        }, 200)

        setTimeout(function () {
            if (gridArr[startY][startX].div.querySelector("i") != null) {
                gridArr[startY][startX].div.querySelector("i").classList.remove("fa-bounce");
            }
        }, 1000)
        // animate start symbol such that it bounces into the randomly chosen cell
        gridArr[startY][startX].start = true;
        start = gridArr[startY][startX];

        let targX =  Math.floor(Math.random() *windowCs);
        let targY = Math.floor(Math.random() *windowRs);
        if (target) { //reset old target if it exists; keeps bugs away
            target.div.innerHTML = "";
            target.target = false;
        }
        while (gridArr[targY][targX].wall  | gridArr[targY][targX].weight != 0) {
            targX = Math.floor(Math.random() *windowCs);
            targY = Math.floor(Math.random() *windowRs);
        }
        
        // fill innerHTML of target w target symbol element 
        gridArr[targY][targX].div.innerHTML = `<i class="fa-solid fa-xl fa-bullseye"></i>`;
        // gridArr[targY][targX].div.innerHTML = "t";
        gridArr[targY][targX].div.querySelector("i").style.opacity = "0";
        setTimeout(function () {
            if (gridArr[targY][targX] != null) { 
                gridArr[targY][targX].div.querySelector("i").style.opacity = "1";
                gridArr[targY][targX].div.querySelector("i").classList.add("fa-bounce");
            }
        }, 200)
        setTimeout(function () {
            if (gridArr[targY][targX].div.querySelector("i") != null) {
                gridArr[targY][targX].div.querySelector("i").classList.remove("fa-bounce");
            }
        }, 1000)
        // control animation of symbol such that it bounces into the cell 
        gridArr[targY][targX].target = true;
        target = gridArr[targY][targX];
    } else {
        result.innerHTML = "Cannot randomize start/target node while generating maze/searching"
    }
})
// functionality for random start button, essentially automates what the user has control over in toggling start; randomly selects 
// x and y coordinate for start and target and sets variables accordingly 

let wlls = document.querySelector("#walls")
wlls.addEventListener("click", function () {
    remove = false;
    toggleStart = false;
    toggleTarget = false;
    toggleWalls = true;
    toggleWeight = false;
    toggle(wlls);

    // update cursor to display wall symbol
    cust.innerHTML = "";
    cust.style.width = `1vw`;
    cust.style.height = `1.5vh`;
    cust.style.backgroundColor = "black";
});
// wall button programmed such that upon click users toggle ability to add walls; hold and drag across grid to create walls;
// as with all other toggle buttons, will be toggled until another is selected

let remW = document.querySelector("#rem-walls")
remW.addEventListener("click", function () {
    remove = true;
    toggleStart = false;
    toggleTarget = false;
    toggleWalls = true;
    toggleWeight = false;
    toggle(remW);
    // update cursor to x symbol to represent getting rid of (maybe make trash can?)
    cust.innerHTML = `<i class="fa-solid fa-xmark"></i>`;
    cust.style.backgroundColor = "transparent";
});
// remove walls button programmed such that upon click users toggle ability to remove walls; hold and drag mouses across walls 
// to remove them; (toggled until another toggleable button is selected)


let trgt = document.querySelector("#target");
trgt.addEventListener("click", function () {
    remove = false;
    toggleStart = false;
    toggleTarget = true;
    toggleWalls = false;
    toggleWeight = false;
    toggle(trgt);

    // update cursor to bullseye symbol
    cust.innerHTML = `<i class="fa-solid fa-bullseye"></i>`;
    // cust.innerHTML = "S";
    cust.style.backgroundColor = "transparent";
});
// upon click of target button users can select node to place target; button is toggled until another is selected 


let wght = document.querySelector("#weight");
wght.addEventListener("click", function () {
    remove = false;
    unweight = false;
    toggleStart = false;
    toggleTarget = false;
    toggleWalls = false;
    toggleWeight = true;
    toggle(wght);
    // update cursor to weight symbol 
    cust.innerHTML = `<i class="fa-solid fa-weight-hanging"></i>`;
    cust.style.backgroundColor = "transparent";
})
// upon click of weight button, users can select node to increase its weight by 1; button toggled until another selected

let uWght = document.querySelector("#unweight");
uWght.addEventListener("click", function () {
    remove = false;
    unweight = true;
    toggleStart = false;
    toggleTarget = false;
    toggleWalls = false;
    toggleWeight = true;
    toggle(uWght);
    // update cursor to subtraction symbol
    cust.innerHTML = `<i class="fa-solid fa-minus"></i>`;
    cust.style.backgroundColor = "transparent";
});
// upon click of unweight button, users can select node to decrease its weight by 1; button toggled until another selected 


// EVENT LISTENER FOR DISPLAYING CUSTOM CURSOR W RELEVANT ICONS 
grid.addEventListener("mouseover", function (e) {
    cust.style.display = "";
    document.body.style.cursor = "none";
});
grid.addEventListener("mouseleave", function () {
    cust.style.display = "none";
    document.body.style.cursor = "default";
})
// only display custom cursor (appearance updated based on which button is toggled) when mouse is over grid; otherwise display 
// default mouse 


//CODE FOR THE TOGGLE FUNCTION; USED FOR TOGGLING USER ACTION BASED ON BUTTON PRESSED 
//toggle function that implements functionality for adding start, target, walls, weight, and removing walls/weights
// relevant booleans are set upon button press that determine what functionality toggle enables 
function toggle(cur, rows=windowRs, cols=windowCs) {
    cur.style.backgroundColor = "rgb(220,220,220)";
    for (let btn of document.querySelectorAll("button")) {
        if (btn != cur) {
            btn.style.backgroundColor = "white";
        }
    }
    if (toggleStart | toggleTarget ) {
        // if booleans for setting start/target are toggled, when mouse is pressed on grid
        grid.onmousedown = function (e) {
            if (canSearch | pathFound) {
                let rect = grid.getBoundingClientRect();
                let denomX = (rect.left + rect.right)/windowCs
                let cellX = Math.floor(e.clientX/denomX)
                let denomY = (rect.bottom-rect.top)/windowRs;
                let cellY = Math.floor((e.clientY - rect.top)/denomY)
                // retrieve grid coordinates (x,y) of cell that mouse is over 
                
                if (toggleStart) { 
                    if (start) { //reset old start if it existed prior 
                        start.div.innerHTML = "";
                        start.start = false;
                    }
                          
                    //update innerHTML of selected node with start symbol 
                    gridArr[cellY][cellX].div.innerHTML = `<i class="fa-solid fa-xl fa-play"></i>`;
                    gridArr[cellY][cellX].div.querySelector("i").style.opacity = "0";
                    setTimeout(function () {
                        if (gridArr[cellY][cellX].div != null) { 
                            gridArr[cellY][cellX].div.querySelector("i").style.opacity = "1";
                            gridArr[cellY][cellX].div.querySelector("i").classList.add("fa-bounce");
                        }
                    }, 200)
                    setTimeout(function () {
                        if (gridArr[cellY][cellX].div != null) {
                            gridArr[cellY][cellX].div.querySelector("i").classList.remove("fa-bounce");
                        }
                    }, 1000)
                    //add animation for selected start node such that symbol bounces in 
                    gridArr[cellY][cellX].start = true; //set start cells.start value to true; this boolean is used within algos
                    start = gridArr[cellY][cellX]; //set global variable start (holds start node) to the selected node
                } else { //if toggleTarget  

                    if (target) { //reset old target if it exists 
                        target.div.innerHTML = "";
                        target.target = false;
                    }
                    //update innerHTML of selected node w target symbol 
                    gridArr[cellY][cellX].div.innerHTML = `<i class="fa-solid fa-xl fa-bullseye"></i>`;
                    gridArr[cellY][cellX].div.querySelector("i").style.opacity = "0";
                    setTimeout(function () {
                        if (gridArr[cellY][cellX].div != null) {
                            gridArr[cellY][cellX].div.querySelector("i").style.opacity = "1";
                            gridArr[cellY][cellX].div.querySelector("i").classList.add("fa-bounce");
                        }
                    }, 200)
                    setTimeout(function () {
                        if (gridArr[cellY][cellX].div != null) {
                            gridArr[cellY][cellX].div.querySelector("i").classList.remove("fa-bounce");
                        }
                    }, 1000)
                    // animation such that symbol bounces into view

                    gridArr[cellY][cellX].target = true;
                    target = gridArr[cellY][cellX]; 
                }

                //CODE SUCH THAT UPON CHANGING START OR TARGET NODE WHILE VISUALIZATION IS DISPLAYED (PATH FOUND AND CURRENTLY SHOWN ON SCREEN)
                //PROGRAM AUTOMATICALLY REDISPLAYS RESULT FOR SEARCH W NEW START/TARGET 
                if (pathFound) {
                    // recompute currently displayed algorithm based on change of start/target nodes post visualization; 
                    // this feature alllows users to change the target/start node upon the conclusion of a visualization 
                    // and the program will atuomatically display the algorithm output for the new target/start node
                    //  (new path, new visited nodes, queued nodes, etc)
                    clear();
                    frontier = [];
                    start.cost = 0;
                    frontier.push(start);
                    timer = Date.now();
                    canSearch = false;
                    refID = setInterval(function () {
                        var done = "";
                        if (chosenAlg == 0) {
                            while (done != "done") { 
                                done = DFS(frontier, target, refID, false, false, true);
                            }
                        } 
                        if (chosenAlg == 1) {
                            while (done != "done") {
                                done = DFS(frontier, target, refID, true, false, true);
                            }
                        }
                        if (chosenAlg == 2) {
                            while (done != "done") {
                                done = DFS(frontier, target, refID, true, true, true);
                            }
                        }
                        if (chosenAlg == 3) {
                            while (done != "done") {
                                done = Dijkstras(frontier, target, refID, true);
                            }
                        } else {
                            frontier = [start]
                            frontier2 = [target]
                            while (done != "done") {
                                done = Bidirectional(frontier, frontier2, start, target, refID);
                            }
                        }
                    }, 0);
                }
            } else {//if current search going on (canSearch will b false), indicate to user they cannot modify start/target
                    result.innerHTML = "Cannot set start or target while searching"
                }
            }
    }
    if (toggleWalls) {
        grid.onmousedown = function () {
            grid.onmousemove = function (e) {
                // adding a grid.onmousemove function dependent on grid.onmousedown occurance creates a click, hold, and drag effect
                let rect = grid.getBoundingClientRect();
                let denomX = (rect.left + rect.right)/windowCs
                let cellX = Math.floor(e.clientX/denomX)
                let denomY = (rect.bottom-rect.top)/windowRs;
                let cellY = Math.floor((e.clientY - rect.top)/denomY)
                // compute cell over which mouse is 

                if (!remove && !gridArr[cellY][cellX].wall) {
                    // if adding walls, update visual components and variables of selected cell
                    gridArr[cellY][cellX].wall = true;
                    gridArr[cellY][cellX].div.style.backgroundColor = "black";
                    gridArr[cellY][cellX].div.style.border = "1px solid black";
                    gridArr[cellY][cellX].div.style.transform = "scale(1.35)";
                    setTimeout(function () {
                        gridArr[cellY][cellX].div.style.transform = "";
                    }, 200);
                    // add animation such that it looks like wall falls into place 
                } 
                if (remove && gridArr[cellY][cellX].wall) {
                    // if removing walls, update visual components and variables of selected cell
                    console.log(gridArr[cellY][cellX].wall);
                    gridArr[cellY][cellX].wall = false;
                    gridArr[cellY][cellX].div.style.transform = "scale(.2)";
                    setTimeout(function () {
                        gridArr[cellY][cellX].div.style.transform = "";
                    }, 400);
                    gridArr[cellY][cellX].div.style.backgroundColor = "white";
                    gridArr[cellY][cellX].div.style.border = "1px solid rgb(238, 250, 255)";
                } 
                // add animation such that it looks like wall shrivels away (shrinks)
            }
        }
    }
    if (toggleWeight) {
        // if adding weights
        grid.onmousedown = function (e) {
            // upon mouse click
            let rect = grid.getBoundingClientRect();
            let denomX = (rect.left + rect.right)/windowCs
            let cellX = Math.floor(e.clientX/denomX)
            let denomY = (rect.bottom-rect.top)/windowRs;
            let cellY = Math.floor((e.clientY - rect.top)/denomY)
            // compute cell over which mouse is clicked 

            //do nothing if start/target is selected as they are not valid to weight
            if (!gridArr[cellY][cellX].start & !gridArr[cellY][cellX].target) {
                if (gridArr[cellY][cellX].div.innerHTML != "" ) {
                    //if selected cell is already weighted (it is displaying that weight and thus can just increment/decrement weight accordingly)
                    if (! unweight) {
                        gridArr[cellY][cellX].div.innerHTML = Number(gridArr[cellY][cellX].div.innerHTML) + 1; 
                        gridArr[cellY][cellX].weight += 1;
                        gridArr[cellY][cellX].div.style.transform = "scale(1.35)";
                    } else if (gridArr[cellY][cellX].weight > 0) {
                        gridArr[cellY][cellX].div.innerHTML = Number(gridArr[cellY][cellX].div.innerHTML) - 1;
                        gridArr[cellY][cellX].weight -= 1;
                        gridArr[cellY][cellX].div.style.transform = "scale(.65)";
                    }
                   
                } else { //if selected cell is not already weighted, set its innerHTML to 1/-1 such that is can be updated accordingly
                    if (!unweight) {
                        gridArr[cellY][cellX].div.innerHTML = 1;
                        gridArr[cellY][cellX].weight += 1;
                        gridArr[cellY][cellX].div.style.transform = "scale(1.35)";
                    } 
                }
                gridArr[cellY][cellX].div.style.backgroundColor = `rgb(${250-5*(gridArr[cellY][cellX].div.innerHTML)}, ${250-5*(gridArr[cellY][cellX].div.innerHTML)}, ${250-5*(gridArr[cellY][cellX].div.innerHTML)})`
                gridArr[cellY][cellX].div.style.color = `rgb(${3*(gridArr[cellY][cellX].div.innerHTML)}, ${3*(gridArr[cellY][cellX].div.innerHTML)}, ${3*(gridArr[cellY][cellX].div.innerHTML)})`
                setTimeout(function () {
                    gridArr[cellY][cellX].div.style.transform = "";
                }, 200);    
                // update visual components based on weight, higher weights -> darker shades, and add enlarging animation if weighting / shrinking animation if unweighted 
            }
        }
    }
}

grid.addEventListener("mouseup", function () {
    grid.onmousemove = null;
})
//reset grid.onmousemove when no longer holding mouse over grid; prevents bugs from occuring after adding/removing walls 


//functions for resetting grid, clearing search and randomizing weight/wall configurations 
var refID = null; //refID for intervals in which algorithms are called 
var refID1 = null;
var refID2 = null;
var mazeID = null;
var innerREF = []; //arrays of refIDs for the timeouts used to animate path drawing 
var innerREF2 = []; 
// need to keep track of these such that they can be cleared when relevant as otherwise visual bugs can occur

function reset() {
    //reset relevant variables and each cell in the grid; clear refID of whatever algorithm may have been running to ensure no carryover to next call
    pathFound = false;
    canSearch = true;
    start = null;
    target = null;
    clear();
    clearInterval(mazeID);
    clearGroups();
    wallList = [];
    for (let i = 0; i < windowRs; i ++) {
        for (let j = 0; j < windowCs; j ++) {
            gridArr[i][j].reset();
        }}}

function clear() {
    // clear refID of algorithm that was running, clear each timeout incurred by the path animation for that animation, reset innerREF arrays 
    // clear each cell in the grid (only resets components added for being 'visited',  'queued', or 'path' node)
        pathFound = false;
        console.log(innerREF);
        clearInterval(refID);
        clearInterval(refID1); clearInterval(refID2);
        innerREF.forEach(timeout => {
            clearTimeout(timeout);
            // innerREF.splice(innerREF.indexOf(timeout), 1);
        });
        innerREF2.forEach(timeout => {
            clearTimeout(timeout);
            // innerREF2.splice(innerREF2.indexOf(timeout), 1);
        });
        innerREF = []
        innerREF2 = []
        canSearch = true;
        for (let i = 0; i < windowRs; i ++) {
            for (let j = 0; j < windowCs; j ++) {
                gridArr[i][j].clear();
            }}
}


function clearWalls() {
    //clear all walls in grid
    if (canSearch) {
        clearInterval(mazeID);
        clearGroups();
        wallList = []
        for (let i = 0; i < windowRs; i ++) {
            for (let j = 0; j < windowCs; j ++) {
                gridArr[i][j].clearWall();
        }}
    } else {
        result.innerHTML = "Cannot clear while generating maze/searching"
    }
}

function clearWeights() {
    //clear all weights in grid
    if (canSearch) {
        for (let i = 0; i < windowRs; i ++) {
            for (let j = 0; j < windowCs; j ++) {
                gridArr[i][j].clearWeight();
            }}
    } else {
        result.innerHTML = "Cannot clear while generating maze/searching"
    }
    
}

function randomizeWeights() {
    //iterate though all cells and add random weight to cells 35% of time (if canSearch)

    if (canSearch) {
        for (let i = 0; i < windowRs; i ++) {
            for (let j = 0; j < windowCs; j ++) {
                let rand = Math.floor(Math.random()*25 + 5);
                let chance = Math.random();
                if (chance > .65) {
                    if (!gridArr[i][j].start & !gridArr[i][j].wall & !gridArr[i][j].target) {
                        gridArr[i][j].weight = rand; 
                        if (rand != 0) {
                            gridArr[i][j].div.innerHTML = `${rand}`;
                        }
                        if (!gridArr[i][j].visited & !gridArr[i][j].queued) {
                            gridArr[i][j].div.style.backgroundColor = `rgb(${250-5*gridArr[i][j].weight}, ${250-5*gridArr[i][j].weight}, ${250-5*gridArr[i][j].weight})`;
                        }
                        
                    }
                } else {
                    if (!gridArr[i][j].start & !gridArr[i][j].wall & !gridArr[i][j].target) {
                        gridArr[i][j].weight = 0; gridArr[i][j].div.innerHTML = '';
                        if (!gridArr[i][j].visited  & !gridArr[i][j].queued)  { 
                            gridArr[i][j].div.style.backgroundColor = "white";
                        }
                    }
                }
            }
        }
    } else {
        result.innerHTML = "Please let algorithm finish or clear search"
    }
}

function randomizeWalls() {
    //iterate through cells and add walls to cell 29% of time (if canSearch)

    if (canSearch) {
        for (let i = 0; i < windowRs; i ++) {
            for (let j = 0; j < windowCs; j ++) {
                let chance = Math.random();
                if (chance > .71) {
                    if (!gridArr[i][j].start & gridArr[i][j].weight == 0 & !gridArr[i][j].target) {
                        gridArr[i][j].div.style.backgroundColor = `black`;
                        gridArr[i][j].div.style.border = "1px solid black";
                    //     gridArr[i][j].div.style.transform = "scale(1.25)";
                    // setTimeout(function () {
                    //     gridArr[i][j].div.style.transform = "";
                    // }, 250);
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
    } else {
        result.innerHTML = "Please let algorithm finish or clear search"
    }
}


// event listener for randomizing and clearing weights/walls
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



// ALGORITHMS AND RELEVANT EVENT LISTENERS ARE IMPLEMENTED BELOW 

var timer = Date.now(); //initialize runtimer; this is used to calculate runtime of each algo

var dfsButton = document.querySelector("#DFS");
dfsButton.addEventListener("click", function () {
    //if not valid to search at the moment, display reason why
    if (!start | !target) {
        result.innerHTML = "Please set start and target"
    } else if (!canSearch) {
        result.innerHTML = "Please clear search before searching again"
    } else {
        //otherwise, initialize frontier and push start cell, clear results display, update run timer, and call algorithm step
        // iteratively separated by 5 ms 
        chosenAlg = 0;
        canSearch = false;
        result.innerHTML = "";
        frontier = [];
        start.cost = 0;
        frontier.push(start);
        timer = Date.now();
        refID = setInterval(function () {
            DFS(frontier, target, refID, false, false);
        }, algInterval);
    }
})
var bfsButton = document.querySelector("#BFS");
bfsButton.addEventListener("click", function () {
    if (!start | !target) {
        result.innerHTML = "Please set start and target"
    } else if (!canSearch) {
        result.innerHTML = "Please clear search before searching again"
    } else {
        chosenAlg = 1;
        canSearch = false;
        result.innerHTML = "";
        frontier = [];
        start.cost = 0;
        frontier.push(start);
        timer = Date.now();
        refID = setInterval(function () {
            DFS(frontier, target, refID, true, false);
        }, algInterval);
    }
})

var bidirectionalButton = document.querySelector("#bi");
bidirectionalButton.addEventListener("click", function () {
    if (!start | !target) {
        result.innerHTML = "Please set start and target"
    } else if (!canSearch) {
        result.innerHTML = "Please clear search before searching again"
    } else {
        chosenAlg = null;
        canSearch = false;
        result.innerHTML = "";
        frontier = [];
        start.cost = 0;
        frontier.push(start);
        frontier2 = [target];
        timer = Date.now();
        refID = setInterval(function () {
            Bidirectional(frontier, frontier2, start, target, refID)
        }, algInterval)
        
    }
})

var aStarButton = document.querySelector("#Astar");
aStarButton.addEventListener("click", function () {
    if (!start | !target) {
        result.innerHTML = "Please set start and target"

    } else if (!canSearch) {
        result.innerHTML = "Please clear search before searching again"
    } else {
        chosenAlg = 2;
        canSearch = false;
        result.innerHTML = "";
        frontier = [];
        start.cost = 0;
        frontier.push(start);
        timer = Date.now();
        refID = setInterval(function () {
            DFS(frontier, target, refID, true, true);
        }, algInterval);
    }
})

var dijkButton = document.querySelector("#dijkstra");
dijkButton.addEventListener("click", function () {
    if (!start | !target) {
        result.innerHTML = "Please set start and target"
    } else if (!canSearch) {
        result.innerHTML = "Please clear search before searching again"
    } else {
        chosenAlg = 3;
        canSearch = false;
        result.innerHTML = "";
        frontier = [];
        start.cost = 0;
        frontier.push(start);
        timer = Date.now();
        refID = setInterval(function () {
            Dijkstras(frontier, target, refID);
        }, algInterval);
    }
})




let result = document.querySelector(".result"); //grab dom element for displaying results and info 


//algorithms are implemented as a single step such they are called in intervals by relevant buttons; 
// if you implement them normally (so full algorihtm runs once, rather than algorihtm steps being repeatedly called), the program
// will only display the end result and not actually visualize the process 

function DFS(frontier, target, refID, isBFS, isA, isRecompute = false) {
    // want each algorithm to be implemented as a single iteration (rather than full while loop), such that we can call it 
    // w setInterval within event listeners for appropriate button 
    // as BFS, DFS, and A* are very similar structurally, we use the same function for each of them and have variables controlling the differing factors
    // BFS used queue, DFS uses stack, so that is controlled by isBFS variable (if isBFS, use queue, otherwise stack)
    // A* uses priority queue, rather than implementing that DS we simply sort the array on basis of cost before each step such that 
    // the queue essentially functions as priority queue (this is controlled by isA boolean)
    // console.log(speed.value);
    if (frontier.length > 0) {
        // if frontier not empty 
        if (isBFS) {
            if (isA) {
                frontier.sort(compareDistTarget);
                // heuristic for A* is the manhattan distance from target node (also considers number of steps and weights, of course)
            }
            cur = frontier.shift();
            // if BFS/A*, get first node in queue (FIFO)
        } else {
            cur = frontier.pop();
            // if DFS, get last node in stack (LIFO)
        }
        //update visual components of current node; as it has been retrieved from frontier it is now 'visited'
        cur.visited = true;
        cur.div.style.backgroundColor = "blue";
        cur.div.style.border = "1px solid blue";
        // want to animate this somehow 
        if (!isRecompute) {
            cur.div.style.opacity = ".25";
            // cur.div.style.transform = "scale(.35)";
            let scopeHm = cur;
            setTimeout(function () {
                    scopeHm.div.style.opacity = "1";
                    // scopeHm.div.style.transform  = "";
            }, 500)
        }
        
        //if we've found target, clearInterval so no further steps of algorithm are called
        if (cur == target) {
            console.log("found");
            clearInterval(refID);

            // retrace path 
            // initialize variables for tracking path cost and length
            var pathCost = cur.cost;
            var pathLength = -1;
            let i = 0;
            //tracing back from the target node
            while (cur != null) {
                if (cur == start) { //if at start, end 
                    cur.div.style.backgroundColor = "white";
                    cur.div.style.border = "1px solid rgb(238, 250, 255)";
                } else {
                    //need to use let variable to represent cur such that setTimeout works properly (niche issue w scope of setTimeout)

                    let scopeTest = cur;
                    console.log(scopeTest);
                    innerREF.push(setTimeout(function () {
                        
                            scopeTest.div.style.backgroundColor = "red";
                            scopeTest.div.style.border = "1px solid red";
                            scopeTest.div.style.transform = "scale(1.5) rotate(360deg)";
                            scopeTest.div.style.opacity = ".25";
                         
                    }, 30 * i))
                    innerREF2.push(setTimeout(function () {
                            scopeTest.div.style.opacity = "1";
                            scopeTest.div.style.transform = "rotate(360deg)";
                        
                    }, 45 * i))
                    // set animations for each cell in traced path such that they animate incrementally based on their position; creates a smooth trace
                }
                i += 1; //i is used to enable the proper interval separation of animations for cells in the path (see how timeouts are set for 30ms * i)
                pathLength += 1; //increment path length

                cur = cur.parent; //until we reach start, set cur to parent node
            }
            //having traced path, display the result of algorithm search
            if (chosenAlg == 0) {
                result.innerHTML = "Depth First Search\n"
            } 
            if (chosenAlg == 1) {
                result.innerHTML = "Breadth First Search\n"
            }
            if (chosenAlg == 2) {
                result.innerHTML = "A*\n"
            }
            if (chosenAlg == 3) {
                result.innerHTML = "UCS\n"
            }
            result.innerHTML += `Path Length: ${pathLength} Path Cost: ${pathCost} Runtime: ${Date.now()-timer}ms`;
            pathFound = true;
            return "done"
        }

        //for each neighbor of our current node
        for (let n of cur.getNeighbors()) {
            //if not visited / already in frontier 
            if (!n.visited & !n.queued) {
                //calculate potential newcost of neighbor n based on its weight and cost of cur (its potential parent)
                newCost = n.weight + cur.cost + 1;
                if (newCost < n.cost) {
                    // if newcost is shorter than original cost, update cost and parent cell accordingly 
                        n.cost = newCost;
                        n.parent = cur;
                }
                
                n.queued = true;
                if (!isA) {
                    //bfs doesn't consider costs in the same way as A* so n's parent will always b cur
                    n.parent = cur;
                }

                n.div.style.backgroundColor = "rgb(200,200, 250)";
                n.div.style.border = "1px solid rgb(200,200,250)";
                // n.div.style.opacity = ".3";
                if (!isRecompute) {
                    n.div.style.transform = "scale(.45)";
                    // n.div.style.borderRadius = "10px";
                    setTimeout(function () {
                        // n.div.style.opacity = "1";
                        // n.div.style.borderRadius = "10px";
                        n.div.style.transform = "scale(1.5)";
                    },250)
                    setTimeout(function () {
                        // n.div.style.opacity = "1";
                        // n.div.style.borderRadius = "0px";
                        n.div.style.transform = "";
                    }, 450)
                }
                //update visual components 

                frontier.push(n);
                //push n to frontier 
            }
        }
    }
}

function retracePath(cur) {
    // retrace path 
            // initialize variables for tracking path cost and length
            var pathCost = cur.cost;
            var pathLength = -1;
            let i = 0;
            //tracing back from the target node
            while (cur != null) {
                if (cur == start) { //if at start, end 
                    cur.div.style.backgroundColor = "white";
                    cur.div.style.border = "1px solid rgb(238, 250, 255)";
                } else {
                    //need to use let variable to represent cur such that setTimeout works properly (niche issue w scope of setTimeout)

                    let scopeTest = cur;
                    console.log(scopeTest);
                    innerREF.push(setTimeout(function () {
                        
                            scopeTest.div.style.backgroundColor = "red";
                            scopeTest.div.style.border = "1px solid red";
                            scopeTest.div.style.transform = "scale(1.5) rotate(360deg)";
                            scopeTest.div.style.opacity = ".25";
                         
                    }, 30 * i))
                    innerREF2.push(setTimeout(function () {
                            scopeTest.div.style.opacity = "1";
                            scopeTest.div.style.transform = "rotate(360deg)";
                        
                    }, 45 * i))
                    // set animations for each cell in traced path such that they animate incrementally based on their position; creates a smooth trace
                }
                i += 1; //i is used to enable the proper interval separation of animations for cells in the path (see how timeouts are set for 30ms * i)
                pathLength += 1; //increment path length

                cur = cur.parent; //until we reach start, set cur to parent node
            }
            return (pathCost, pathLength);
}

// bidirectional search
function Bidirectional(frontier, frontier2, start ,target, ref) {
    for (let cell of frontier) {
        // console.log(cell)
        // console.log(frontier2.includes(cell))
        for (let n of cell.getNeighbors()) {
            if (frontier2.includes(n)) {
                // merge paths of cell and n 
                console.log("Merge Here: " + cell);
                let path1 = retracePath(cell);
                let path2 = retracePath(n);
                console.log(path1)
                console.log(path2)
                let totalCost = path1 + path2 + 1;
                result.innerHTML = "BIDIRECTIONAL\n"
                result.innerHTML += `Path Length: ${totalCost} Path Cost: ${totalCost} Runtime: ${Date.now()-timer}ms`;
                pathFound = true;
                clearInterval(ref);
                return "done";
            }
        }
    }
   
    DFS(frontier, target, ref, true, false);

    DFS(frontier2, start, ref, true, false);
    // need to implement functionality s.t when one DFS frontier meets the other, we form paths by merging those of points that have met 
}

//THIS FUNCTION IS CALLED DIJKSTRAS BUT IT IMPLEMENTS UNIFORM COST SEARCH (SORRY FOR NAMING CONFUSION)
function Dijkstras(frontier, target, refID, isRecompute = false) {
    if (frontier.length > 0) {
        // sort frontier based on cost (considers weights) such that it functions like priority queue 
        frontier.sort(compareCost);
        cur = frontier.shift();
        cur.visited = true;
        cur.div.style.backgroundColor = "blue";
        // want to animate this somehow 
        cur.div.style.border = "1px solid blue";
        if (!isRecompute) {
            cur.div.style.opacity = ".25";
            // cur.div.style.transform = "scale(.35)"
            let scopeHm = cur;
            setTimeout(function () {
                    scopeHm.div.style.opacity = "1";
                    // scopeHm.div.style.transform = "";
            }, 500)
        }

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
                    innerREF.push(setTimeout(function () {
                        
                            scopeTest.div.style.backgroundColor = "red";
                            scopeTest.div.style.border = "1px solid red";
                            scopeTest.div.style.transform = "scale(1.5) rotate(360deg)";
                            scopeTest.div.style.opacity = ".25";
                        
                    }, 30 * i))
                    innerREF2.push(setTimeout(function () {
                            scopeTest.div.style.opacity = "1";
                            scopeTest.div.style.transform = "rotate(360deg)";
                        
                    }, 45 * i))
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
            if (chosenAlg == 0) {
                result.innerHTML = "Breadth First Search\n"
            } 
            if (chosenAlg == 1) {
                result.innerHTML = "Depth First Search\n"
            }
            if (chosenAlg == 2) {
                result.innerHTML = "A*\n"
            }
            if (chosenAlg == 3) {
                result.innerHTML = "UCS\n"
            }
            result.innerHTML += `Path Length: ${pathLength} Path Cost: ${pathCost} Runtime: ${Date.now()-timer}ms`;
            pathFound = true;
            return "done"
        }
        for (let n of cur.getNeighbors()) {
            if (!n.queued) {
                n.queued = true;
                newCost = n.weight + cur.cost + 1; 
                if (newCost < n.cost) { //is newcost of n (applicable in instance we revisit n and new path to it is cheaper than original)
                    //update cost and parent accordingly
                    n.cost = newCost
                    n.parent = cur;
                }
                n.div.style.border = "1px solid rgb(200,200, 250)";
                n.div.style.backgroundColor = "rgb(200,200, 250)";
                // n.div.style.opacity = ".1";
                if (!isRecompute) {
                    n.div.style.transform = "scale(.45)";
                    // n.div.style.borderRadius = "10px";
                    setTimeout(function () {
                        // n.div.style.opacity = "1";
                        // n.div.style.borderRadius = "25px";
                        n.div.style.transform = "scale(1.5)";
                    },250)
                    setTimeout(function () {
                        // n.div.style.opacity = "1";
                        // n.div.style.borderRadius = "0px";
                        n.div.style.transform = "";
                    },450)

                }
                //update visual components of queued cell
                if (!frontier.includes(n)) {
                    //push it to frontier 
                    frontier.push(n); 
                }
                }
            }
        }
}

// MAZE GENERATION 

var wallList = []

function mazeGenStart() {
// want grid to start as disconnected cells; so for every other column and row, make that full column/row walls 
    for (let column = 0; column < windowCs; column ++) {
        if (column % 2 != 0) {
            for (let r = 0; r < windowRs; r ++) {
                wallList.push(gridArr[r][column]);
                // console.log(gridArr[r][column]);
                gridArr[r][column].wall = true;
                gridArr[r][column].div.style.backgroundColor = "black";
                gridArr[r][column].div.style.border = "1px solid black";
            }
        }
    }
    for (let row = 0; row < windowRs; row ++) {
        if (row % 2 != 0) {
            for (let c = 0; c < windowCs; c ++) {
                wallList.push(gridArr[row][c]);
                gridArr[row][c].wall = true;
                gridArr[row][c].div.style.backgroundColor = "black";
                gridArr[row][c].div.style.border = "1px solid black";
            }
        }
    }
    // console.log(wallList);
}

// need to keep track of:
//      - each cell needs to have a 'group', (cells its connected to) 
//          - bc cells in the same group will all have the same .group variable, when checking if removing a wall connects two separate regions, 
//            i can simply compare the groups of the cells on either side of that wall
//      - also need to keep track of all walls (thats easy though, just create list and add each cell modified in mazeStart alg to list)
let test = false;
function mazeGen(mazeID, i) {
    // select random wall to remove
    // if cells on either side of that wall (wall.getNeighbors), have different .groups, remove the wall and update the .groups of cells 
    // repeat until all cells have the same group

    //  maybe enhance animations of this? 
    if (!mazeGenTermTest()) {
        // select random wall
        let randWall = wallList[Math.floor(Math.random() * wallList.length)];
        // animations to highlight this wall
        // setTimeout(function () {
        //     randWall.div.style.border = "1px solid yellow"
        //     randWall.div.style.transform = "scale(1.25)";
        // }, 1 * i)
        // setTimeout(function () {
        //     if (randWall.wall) {
        //         randWall.div.style.border = "1px solid black";
        //     } else {
        //         randWall.div.style.border = "1px solid rgb(238, 250, 255)";
        //     }
        //     randWall.div.style.transform = "";
        // }, 2 * i)


        // if removing wall connects unconnected neighbors of randWall, remove it and update groups of neighbors,
        // else, keep wall, repeat
        let neighbs = randWall.getNeighbors();
        // to see if neighbors unconnected, compare their groups 
        if (neighbs.length > 0) {
            // check if neighbors disconnected 
            let cntrlG = neighbs[0].group;
            let keepWall = true;
            for (let n = 1; n < neighbs.length; n ++) {
                if (neighbs[n].group != cntrlG) {
                    // console.log("cap")
                    // console.log(neighbs[n].group);
                    // console.log(cntrlG);
                    keepWall = false;
                    break;
                }
            }

            // if neighbs disconnected, remove wall 
            if (!keepWall) {
                randWall.wall = false;
                setTimeout(function () {
                    randWall.div.style.backgroundColor = "white";
                    randWall.div.style.border = "rgb(238, 250, 255)";
                }, 2 * i)
                wallList.splice(wallList.indexOf(randWall), 1);
                // if wall is removed, need to connect groups of neighbors, by that, create combined group list
                // first add cell of wall being removed 
                // then add each neighbros group to that list
                // then for each cell in the combined group, set its group = combinedgroup, since they are now all connected 
                var combinedGroup = []
                combinedGroup.push(randWall)
                for (let n of neighbs) {
                   combinedGroup = combinedGroup.concat(n.group);
                }
                for (let n of combinedGroup) {
                    n.group = combinedGroup;
                }
            }
            // wallList.splice(wallList.indexOf(randWall), 1);
        }
    } else {
        // if maze has been generated, clear its interval such that algorithm is no longer called and reset variables used in algorithm process 
        clearInterval(mazeID);
        clearGroups();
        wallList = []
        canSearch = true;
    }
}

//checks if each cell in the maze has the same group 
//by selecting random cell and comparing its group w every other cell in grid 
function mazeGenTermTest() {
    let compR = Math.floor(Math.random() *windowRs);
    let compC = Math.floor(Math.random() *windowCs);
    while (gridArr[compR][compC].wall) {
        compR = Math.floor(Math.random() *windowRs);
        compC = Math.floor(Math.random() *windowCs);
    }
    let controlGroup = gridArr[compR][compC].group; 
    for (let r = 0; r < windowRs; r ++) {
        for (let c = 0; c < windowCs; c ++) {
            if (!gridArr[r][c].wall) {
                if (gridArr[r][c].group != controlGroup) {
                    return false;
                }
            }
        }
    }
    return true;
}
//clear groups utility function 
function clearGroups() {
    for (let r = 0; r < windowRs; r ++) {
        for (let c = 0; c < windowCs; c ++) {
            gridArr[r][c].group = [gridArr[r][c]]
    }}
}
// Psuedocode description used for figuring out maze generation: 
// Kruskal's algorithm: This algorithm starts with a grid of disconnected cells and repeatedly selects a random wall to remove. 
// If removing the wall connects two separate regions of the maze, the wall is removed and the regions are merged. This algorithm 
// can create mazes with many interconnected paths and loops.


// Maze generation button event listener 
let maze = document.querySelector("#maze")
maze.addEventListener("click", function () {
    if (canSearch) {
        reset();
        mazeGenStart();
        let i = 0;
        canSearch = false;
        mazeID = setInterval(function () {
            mazeGen(mazeID, i);
            i += 1;
        }, 1);
    } else {
        result.innerHTML = "Cannot generate maze until search is complete and cleared"
    }
});


//function for comparing manhattan distance + euclidian distance from 2 diff cells to target; used within A* to mimic priority queue
function compareDistTarget(cell1, cell2) {
    //want to make it use hybrid of manhattan and euclidian distance 
    var dist1 = Math.abs(target.x - cell1.x) + Math.abs(target.y-cell1.y);
    var dist2 = Math.abs(target.x - cell2.x) + Math.abs(target.y - cell2.y);
    var euclidDist1 = Math.sqrt((target.x-cell1.x)**2 + (target.y-cell1.y)**2);
    var euclidDist2 = Math.sqrt((target.x-cell2.x)**2 + (target.y-cell2.y)**2);
    return (euclidDist1 + dist1 + cell1.cost) - (euclidDist2 + dist2 + cell2.cost);
}
//function for comparing costs of 2 cells; used within UCS/dijkstras for mimicing priority queue 
function compareCost(cell1, cell2) {
    return cell1.cost- cell2.cost;
}

// cell class for each cell of the grid such that book keeping variables relevant to algs is easy 
function Cell(column, row, element) {
    // variables of a cell; 
    this.div = element; //used to access and update dom element of cell
    this.x = column; 
    this.y = row;
    this.start = false; //used if cell is start 
    this.wall = false; //used if cell is wall
    this.target = false; //used if cell is target
    this.weight = 0; //used for cell weight
    this.cost = 99999; //used for cell cost 

    // values to be changed during pathfinding algorithms 
    this.visited = false;
    this.queued = false;
    
    // values for retracing path upon algorithm completion
    this.parent = null;

    //value for maze gen kruskals 
    this.group = [this];

    this.reset = function () {
        this.div.style.backgroundColor = "white";
        this.div.style.border = "1px solid rgb(238, 250, 255)";
        this.div.innerHTML = "";
        this.div.style.transform = "";
        this.start = false;
        this.wall = false;
        this.target = false;
        this.weight = 0;
        this.cost = 99999;
        result.innerHTML = "";
        // values to be changed during pathfinding algorithms 
        this.visited = false;
        this.queued = false;
        
        // values for retracing path upon algorithm completion
        this.parent = null;

        //fully resets cell to blank slate 
    }

    this.clear = function () {
        //only clears cell of visited/queued modifications 

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
        //removes wall from cell
    }

    this.clearWeight = function () {
        this.weight = 0;
        if (! this.wall & !this.start & !this.target) {
            if (!this.visited & !this.queued) 
            {this.div.style.backgroundColor = "white";}

            this.div.innerHTML = "";
        }
        
        // removes weight from cell
    }


    this.neighbors = [];
    //cells array of neighbors (above, below, left, right)

    this.getNeighbors = function () {
        //neighbors will be cells directly above,below, and to left/right of cell
        //neighbors are only valid if they are not walls 
        neighbs = [];
        if (this.x != 0) { //add left neighbor (cell at (this.x-1, this.y))
            if ( !gridArr[this.y][this.x-1].wall) {
                neighbs.push(gridArr[this.y][this.x-1]);
            }
            
        }
        if (this.x != windowCs-1) { //add right neighbor (cell at (this.x+1, this.y))
            if (!gridArr[this.y][this.x+1].wall) {
                neighbs.push(gridArr[this.y][this.x+1]);
            }
        }
        if (this.y != 0) { //add above neighbor (cell at (this.x, this.y-1))
            if (!gridArr[this.y-1][this.x].wall) {
                neighbs.push(gridArr[this.y-1][this.x]);
            }
        }
        if (this.y != windowRs-1) { //add below neighbor (cell at (this.x, this.y+1))
            if (!gridArr[this.y+1][this.x].wall) {
                neighbs.push(gridArr[this.y+1][this.x]);
            }
        }
        return neighbs;
    }

    //was considering using this for different types of maze generation but ended up not mattering 
    this.getNeighborsMaze = function () {
        // for maze logic is diff so neighbors need to b cells that r 2 steps away from this 
        //otherwise exact same as normal neighbors func
        neighbs = [];
        if (this.x != 1) { //add left neighbor (cell at (this.x-1, this.y))
            if ( !gridArr[this.y][this.x-2].wall) {
                neighbs.push(gridArr[this.y][this.x-2]);
            }
        }
        if (this.x != windowCs-1) { //add right neighbor (cell at (this.x+1, this.y))
            if (!gridArr[this.y][this.x+2].wall) {
                neighbs.push(gridArr[this.y][this.x+2]);
            }
        }
        if (this.y != 0) { //add above neighbor (cell at (this.x, this.y-1))
            if (!gridArr[this.y-2][this.x].wall) {
                neighbs.push(gridArr[this.y-2][this.x]);
            }
        }
        if (this.y != windowRs-1) { //add below neighbor (cell at (this.x, this.y+1))
            if (!gridArr[this.y+2][this.x].wall) {
                neighbs.push(gridArr[this.y+2][this.x]);
            }
        }
        return neighbs;
    }
}


// Plan 4/18/23 
// As of now have very functional visualizer working for BFS, DFS, A* and UCS (like dijkstras)
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

//Bug fixes 4/22/23

// fixed bug where if you cleared search while path was being traced, it would continue to trace
// fixed bug that occured when prompting different algorithms at the same time; would occasionally cause start node
//  to represent a prior start node and thus produce incorrect search and path visualization 
// disabled ability to change target and start node while searching (for bug fixing purposes, may re-enable this when trying to add 
// recomputation thing)

//commented code w brief explanations 


//Goals 4/24/23 
// -  have it so if you change target / start node when visualition over, it automically recomputes 
// -  maze generation 
// as of today (in class 2:45), have implemented some automatic recomputation but it redoes the entire visualization, only want it to display
//  new result, might need to create new functions for this that do algos without timeouts (apart from traced path)
//  FUCK YEA! (in class 3:20) figured it out, ugly code for now but works; will continue to develop in coming days 
//  now allows for picking new start/target upon visualization finishing and recomputed animation is a lot smoother as per 
//  disabling the graphical transformation within algorithm when called for recomputation made a lot smoother 

// New Dev Goals:
//  - maze generation 
//  - make animation for visited and queued nodes cooler 


// Updates 4/29/23 

// implemented maze generation via variation of kruskals algorithm; 
// new goal is to enhance animations of maze gen to exhibit specific wall being evaluated by alg 
// visually will highlight (change border color) and upscale 
// hmmm, algorithm should practically be quite fast but animating it makes no sense then...
// what else to add????


// Notes 5/2 
//      extra page with information on algorithms / more instructions
//      small bug fixes so buttons cant be pressed while running alg or generating maze
//      ask him in OH for suggestions 
//      add speed option 


// Notes 5/4 
//      maybe add to a* star visualization to include the calculated cost (including weight, distance from start, and distance to target)
//      could do the same for dijkstras 
//      

// Notes 5/7 
//      have handled most small bugs 
//      have updated program to adapt somewhat compotently to mobile dimensions 
//      added algorithm speed option for better visualization 
//      Need to add:
//          - info page 
//              - for this, change instructions button to prompt new instruction pop up 
