var courses = document.querySelector(".courses");
var selector = document.querySelector("select");
selector.onchange = function () {
    courses.innerHTML = "<a href='demo.html' class='nav-item'>Demo Course 111</a>"
}



