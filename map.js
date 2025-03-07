// This file should handle drawing and navigating the map, panning, zooming, etc.

document.addEventListener('DOMContentLoaded', initialize_navigation);

// Three overlapping canvas objects for handling the map
let map_canvas;
let shadow_canvas;
let hit_canvas;
// Corresponding contexts (what's a context?)
let map_ctx;
let shadow_ctx;
let hit_ctx;

let region_data;

let regions = new Map();

let previousX = 0, previousY = 0;
let panning = false;

const viewportTransform = {
    x: 0,
    y: 0,
    scale: 3
};

const NEUTRAL_COLOR = "rgb(225,225,225)" //"rgb(240, 220, 200)";

function update_panning(e) {
    const localX = e.clientX;
    const localY = e.clientY;

    viewportTransform.x += localX - previousX;
    viewportTransform.y += localY - previousY;

    // Clamp the viewportTransform so the user can't scroll endlessly
    // TODO: Factor in zoom level somehow
    if (viewportTransform.x > boundary_right) {
        viewportTransform.x = boundary_right;
    }
    else if (viewportTransform.x < boundary_left) {
        viewportTransform.x = boundary_left;
    }

    if (viewportTransform.y > boundary_bot) {
        viewportTransform.y = boundary_bot;
    }
    else if (viewportTransform.y < boundary_top) {
        viewportTransform.y = boundary_top;
    }


    previousX = localX;
    previousY = localY;
}

function onMouseMove(e) {
    if (panning) {
        update_panning(e);
        draw_map();
    }
}

// Zoom
function onMouseWheel(e) {
    const oldScale = viewportTransform.scale;
    const oldX = viewportTransform.x;
    const oldY = viewportTransform.y;

    const localX = e.clientX;
    const localY = e.clientY;

    const previousScale = viewportTransform.scale;

    let newScale = viewportTransform.scale += e.deltaY * -0.006;
    if (newScale > max_zoom) {
        newScale = max_zoom;
    }
    else if (newScale < min_zoom) {
        newScale = min_zoom;
    }

    const newX = localX - (localX - oldX) * (newScale / previousScale);
    const newY = localY - (localY - oldY) * (newScale / previousScale);

    viewportTransform.x = newX;
    viewportTransform.y = newY;
    viewportTransform.scale = newScale;

    draw_map();
}

function initialize_navigation() {
    map_canvas = document.getElementById("map_canvas");
    shadow_canvas = document.getElementById("shadow_canvas");
    hit_canvas = document.getElementById("hit_canvas");

    map_ctx = map_canvas.getContext('2d', { willReadFrequently: true });
    shadow_ctx = shadow_canvas.getContext('2d');
    hit_ctx = hit_canvas.getContext('2d', { willReadFrequently: true });

    hit_canvas.addEventListener("mousemove", onMouseMove);
    hit_canvas.addEventListener("wheel", onMouseWheel);

    load_regions();

    hit_canvas.addEventListener("mousedown", (e) => {
        panning = true
        previousX = e.clientX;
        previousY = e.clientY;
    })

    hit_canvas.addEventListener("mouseup", (e) => {
        panning = false
    })

    draw_map();
}

function draw_map() {
    /*if (!canvas_ready) {
        return;
    }*/
    let contexts = [map_ctx, shadow_ctx, hit_ctx];
    contexts.forEach((e) => {
        e.canvas.width = window.innerWidth;
        e.canvas.height = window.innerHeight;
        e.setTransform(1, 0, 0, 1, 0, 0);
        e.clearRect(0, 0, map_canvas.width, map_canvas.height);
        e.setTransform(viewportTransform.scale, 0, 0, viewportTransform.scale, viewportTransform.x, viewportTransform.y);
    })

    // Draw the background
    let cg = map_ctx.createLinearGradient(0, -400, 0, 400);
    cg.addColorStop(0, "rgb(150,150,255)");
    cg.addColorStop(1, "rgb(50,50,255)");

    map_ctx.fillStyle = cg; //'rgb(100,150,255)';
    map_ctx.fillRect(-8000, -4500, 16000, 9000);

    // Draw the regions
    earth_medium.region_list.forEach((e) => {
        let reg = regions.get(e);
        const p = new Path2D(reg.path);

        // Draw the 'hit' svgs, invisible regions used only for hit detection
        hit_ctx.fillStyle = `rgb(${reg.color_id[0]},${reg.color_id[1]},${reg.color_id[2]})`
        hit_ctx.fill(p);

        // Draw the visible map
        map_ctx.fillStyle = reg.get_display_color();
        map_ctx.fill(p);
    });
}