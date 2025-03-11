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

let hovering_region = "none"; // track the region currently being hovered, str is the region id
let selected_region = "none";

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
        //draw_map();
    }
    else {
        const mousePos = {
            x: e.clientX - map_canvas.offsetTop,
            y: e.clientY - map_canvas.offsetLeft
        };
        const pixel = hit_ctx.getImageData(mousePos.x, mousePos.y, 1, 1).data;
        color = [pixel[0], pixel[1], pixel[2]]
        const r = find_region_by_color(color);
        if (r == null) {
            hovering_region = "none"
        }
        else {
            hovering_region = r;
        }
        //draw();
    }
    draw_map();
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

    hit_canvas.addEventListener('click', (e) => {
        // Figure out which area was clicked based on underlying pixel color
        const mousePos = {
            x: e.clientX - map_canvas.offsetTop,
            y: e.clientY - map_canvas.offsetLeft
        };
        // Get pixel under cursor
        const pixel = hit_ctx.getImageData(mousePos.x, mousePos.y, 1, 1).data;

        color = [pixel[0], pixel[1], pixel[2]]
        const r = find_region_by_color(color); // This returns the ID, not the whole object
        //console.log(r);
        if (r != null) {
            selected_region = r;
            let reg = region_data.regions[r]; // Do get from map instead? Skips path data and other stuff
            show_region_window(reg);
            draw_map()
        }

    })

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

        let display_color = reg.get_display_color();
        // If region is not being hovered, make the color darker
        if (hovering_region == reg.id) {
            // Todo: make a utility function for this

            // Doesn't work because the hex code isn't being converted, I think

            /*
            let r = parseInt(display_color.slice(1, 3), 16);
            let g = parseInt(display_color.slice(3, 5), 16);
            let b = parseInt(display_color.slice(5, 7), 16);
            r = Math.floor(r * 0.8);
            g = Math.floor(g * 0.8);
            b = Math.floor(b * 0.8);
            let rh = r.toString(16).padStart(2, '0');
            let gh = g.toString(16).padStart(2, '0');
            let bh = b.toString(16).padStart(2, '0');
            let newhex = '#' + [rh, gh, bh].join('');
            console.log(newhex);
            display_color = newhex;
            */

            display_color = 'rgb(0,255,250)'
        }

        map_ctx.fillStyle = display_color;
        map_ctx.fill(p);
    });
}

// Returns the region-id of the region with the matching color-id
function find_region_by_color(pixel_rgb) {
    let r;

    region_data.region_list.forEach((e) => {

        let reg = region_data.regions[e];

        if (reg.color_id[0] == pixel_rgb[0] && reg.color_id[1] == pixel_rgb[1] && reg.color_id[2] == pixel_rgb[2]) {
            r = e;//reg;
        }
    })
    return r;
}