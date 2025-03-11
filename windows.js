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
    w.appendChild(b);

    show_window_in_details_area(w);
}

function show_window_in_details_area(window) {
    var d = document.getElementById("details_area");
    d.innerHTML = "";
    d.appendChild(window);
}