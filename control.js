
function rotateOnClick(card) {
    card.addEventListener("click", function rot() {
        if (card.style.transform === 'rotateY(180deg)') {
            card.style.transform = "rotateY(0deg)";
        }
        else {
            card.style.transform = "rotateY(180deg)";
        }
    })
}