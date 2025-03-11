// Handles creation and display of UI windows

// Test function, delete later
function windows_test() {
    console.log("Clicked a province")
    create_window()
    // Create a simple window displaying the province name
}

function show_region_window(reg) {
    //console.log(reg);
    create_region_window(reg);
}

function show_battle_window() {
    var w = document.createElement("div")
    w.className = "window window_white vbox"

    var h1 = document.createElement("h1")
    h1.className = "window_title"
    h1.innerHTML = "Battle of " + selected_region;
    w.appendChild(h1);

    var bar_bg = document.createElement("div");
    var bar_fg = document.createElement("div");
    bar_bg.className = "progress_bar bar_bg";
    bar_fg.className = "progress_bar bar_fg";
    bar_fg.id = "battle_bar_fg";

    bar_bg.appendChild(bar_fg);
    w.appendChild(bar_bg);

    show_window_in_event_area(w);
}

function create_window() {
    var w = document.createElement("div")
    w.className = "uitest window";
    show_window_in_details_area(w);
}

function create_region_window(reg) {
    var w = document.createElement("div")
    w.className = "window window_white vbox"

    var h1 = document.createElement("h1")
    h1.className = "window_title"
    h1.innerHTML = reg.name;
    w.appendChild(h1);

    // Create invade button
    var b = document.createElement("button")
    b.className = "grab_mouse";
    b.innerHTML = "Invade"
    b.addEventListener("click", invade_clicked);
    w.appendChild(b);

    show_window_in_details_area(w);
}

function show_window_in_event_area(window) {
    var d = document.getElementById("event_area");
    d.innerHTML = "";
    d.appendChild(window);
}

function show_window_in_details_area(window) {
    var d = document.getElementById("details_area");
    d.innerHTML = "";
    d.appendChild(window);
}

// Button handlers
function invade_clicked() {
    console.log("Invading " + selected_region)
    invade_region(0);
}