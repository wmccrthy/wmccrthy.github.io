var select = document.querySelector(".selector");
var courses = document.querySelector(".courses");
var selector = document.querySelector("select");
selector.onchange = function () {
    // courses.innerHTML = "<a href='demo.html' class='nav-item'>Demo Course 111</a>"
    courses.style.opacity = "1";
}

var searchProf = document.querySelector("#search-prof");
searchProf.addEventListener("click", function () {
    select.innerHTML = "";
    // select.innerHTML = '<select name="" id="department"><option selected disabled>Select a Professor</option><option value="DemoDepartment">John Doe</option></select>';
}) 

var header = document.querySelector(".header");
window.onscroll = function () {
    if (window.scrollY > 50) {
        header.style.transform = "scaleY(.75) scaleX(.95) translateY(-4vh)";
        header.style.opacity = ".9";
       
    } else {
        header.style.transform = "";
        header.style.opacity = "1";
    }
}



