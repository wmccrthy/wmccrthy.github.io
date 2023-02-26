// thinking is: 
// use function similar to HW3 box generator to generate divs in ".grid" class 
// first ask for rule input from the user (via alert initially, make sexier later on)
// have random initial config of div existing in grid already (grid is 800 x 1000px so design div size accordingly)
// ideal 20px by 20px divs for 40x50 grid (so top row just need to add 40 divs)

// use map to randomly initalize starting config 
// by that, have config = array of all 0s; 

function randomizeStart(num) {
    return Math.floor(Math.random()*2);
}

const start = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]; 


// for ensuring accuracy (preset start): 
const initialConfig = start;
initialConfig[39] = 1; 

// for randomized starting config: 
// const initialConfig = start.map(randomizeStart);

function fillInitialConfig(rule) {
    const grid = document.querySelector(".grid");
    var binaryRule = rule.toString(2);
    binaryRule = binaryRule.padStart(8, '0');
    console.log(initialConfig)
    var dynamicConfig = initialConfig;
    for (let t = 0; t <100; t ++ ) {
        dynamicConfig = applyRule(dynamicConfig, rule);
        }
    }

function checkNeighbors(config, index) {
    arr = [0,0,0];
    righStatus = 2; 
    self = 1;
    leftStatus = 0;
    
    if (index  === config.length-1) {
        arr[righStatus] = config[0];
    }
    else {
        arr[righStatus] = config[index+1];
    }
    if (index === 0) {
        arr[leftStatus] = config[config.length-1];

    }
    else {
        arr[leftStatus] = config[index-1];
    }
    arr[self] = config[index];

        // return binary value(128,64,32,16,8,4,2,1) associated w combination
    // console.log(arr);
    if (JSON.stringify(arr) === JSON.stringify([0,0,0])) {
        return 1;
    }
    if ( JSON.stringify(arr) === JSON.stringify([0,0,1])) {
        return 2;
    }
    if ( JSON.stringify(arr) === JSON.stringify([0,1,0])) {
        return 4;
    }
    if (JSON.stringify(arr) === JSON.stringify([0 ,1,1])) {
        return 8;
    }
    if (JSON.stringify(arr) === JSON.stringify([1,0,0])) {
        return 16;
    }
    if (JSON.stringify(arr) === JSON.stringify([1,0,1])) {
        return 32;
    }
    if (JSON.stringify(arr) === JSON.stringify([1,1,0])) {
        return 64;
    }
    if (JSON.stringify(arr) === JSON.stringify([1,1,1])) {
        return 128;
    }

    // better way to return value here mathematically 
    // iterate over arr, ()
    
}


// apply rule function, random intial config is set as default value 
// such that I don't need to pass in rule when calling in HTML file
function applyRule(config, rule) {
    // need to convert rule (0 - 255) to conditions based on binary format 
    // steps: 1. conv input to binary 
    //        2. use binary to derive conditions
    // to do step 2, conv binary number to string; iterate through string w conditions dependent on bit at relevant indices 

    const grid = document.querySelector(".grid");

    var binaryRule = rule.toString(2);
    binaryRule = binaryRule.padStart(8, '0');


    updatedGrid = config.splice(0, 0);
        for (let i = 0; i < config.length; i ++) {
            let cell = document.createElement("div");
            // cell.style.backgroundColor = "white";
            if (config[i] === 0) {
                cell.style.backgroundColor = "white";
            }
            else {
                // console.log(dynamicConfig[i]);
                var randR = Math.random()*255;
                var randG = Math.random()*255;
                var randB = Math.random()*255;
                cell.style.backgroundColor = "rgb(" + randR + ", " + randG + ", " + randB + ")";
            } 
            // this part needs to be replaced w relevant rules 

            // cell.style.border = "1px solid black";
            cell.style.width = "10px";
            cell.style.height = "10px";
            cell.style.boxSizing = "border-box";
            cell.classList.add("cell");
            grid.appendChild(cell);

            const bin = checkNeighbors(config, i);
            
            ind = 0;
            // console.log(ind);
            // console.log(bin);

            for (let x = 128; x >= 1; x/=2) {
                // console.log(binaryRule.charAt(ind));
                
                if (bin == x) {
                    updatedGrid[i] = Number(binaryRule.charAt(ind));
                    
                }
                
                ind += 1;
            }
            }
        config = updatedGrid;
        return config;

   
}

module.exports = { applyRule };

