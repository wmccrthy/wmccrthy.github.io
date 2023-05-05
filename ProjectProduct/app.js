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



