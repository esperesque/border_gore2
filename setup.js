document.addEventListener('DOMContentLoaded', page_setup);

// First thing called if the user loads the page normally. Should show the "setup game" screen before anything
function page_setup() {
    document.getElementById("game_area").style.display = "none";
    document.getElementById("start_button").addEventListener("click", create_game);
}

function create_game() {
    document.getElementById("setup_screen").style.display = "none";
    document.getElementById("game_area").style.display = "inline";
    setInterval(tick, 10);
}