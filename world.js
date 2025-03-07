// Handles world state data, regions, etc.

let min_zoom = 1.5;
let max_zoom = 10.0;
let boundary_top = -10000;
let boundary_bot = 10000;
let boundary_right = 10000;
let boundary_left = -10000;

// This object stores a modifiable region instance that has been created from map data
class Region {
    constructor(rdata) {
        // rdata is a province object from one of the maps in the maps folder
        this.path = rdata.path;
        this.color_id = rdata.color_id;
    }

    get_display_color() {
        // Figure out the display color based on owner/settings
        // For now, return a default color
        return ('rgb(180,180,180)')
    }
}

function load_regions() {
    // Define region data
    region_data = earth_medium;

    min_zoom = region_data.settings["min_zoom"];
    max_zoom = region_data.settings["max_zoom"];

    viewportTransform.x = region_data.settings["pos_x"]
    viewportTransform.y = region_data.settings["pos_y"]

    region_data.region_list.forEach((e) => {
        let reg = new Region(region_data.regions[e]);
        regions.set(e, reg);
    })
}