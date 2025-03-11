// Game state tracking and similar

// Track the game state
// JavaScript doesn't have enums, but this implementation is similar to how TypeScript handles enums
const State = {
    Action: 'Action', // Waiting for the player to take an action
    Combat: 'Combat', // Waiting for combat animations to play
    Standby: 'Standby', // Waiting for AI turns to process
}

var game_state = State.Action;

// Call this when the invade button has been pressed
// TODO: In the future, bring up an army selection screen first. But for now, proceed directly to invasion
function invade_region(reg) {
    game_state = State.Combat;

    show_battle_window();
    start_battle();
}

// Called every 0.01s
function tick() {
    update();
}

// Update all visuals, map, battle-bar, etc.
let p = 0.0;

function update() {
    if (game_state == State.Combat) {
        battle_step();
        //set_bar_progress(p);
    }
    //set_bar_progress(p);
}

// Combat stuff - maybe put this in a separate file later

let battle_mod1 = 1.0 // This is the "correct" modifier that will gradually convert the initial score to the final score
let battle_mod2 = 1.0 // noise
let mod2_freq = 5.0;
let battle_mod3 = 1.0;
let mod3_freq = 5.0;
let battle_mod4 = 1.0;
let mod4_freq = 5.0;
let battle_mod5 = 1.0;
let mod5_freq = 5.0;

let initial_battlescore = 0.5 + Math.random(); // 0.5-1.5
let final_battlescore = 0.5 + Math.random(); // 0.5-1.5

// Track the number of combat steps that have passed
let step_count = 0;
let total_steps = 400;

// Combat starts here
function start_battle() {
    // To begin with, we don't have army stats, so let's just make something up
    initial_battlescore = 0.5 + Math.random(); // 0.5-1.5
    final_battlescore = 0.5 + Math.random(); // 0.5-1.5

    total_steps = Math.floor(400 + Math.random() * 400);

    battle_mod2 = Math.random() * 0.3;
    if (randi(0, 1) == 0) {
        battle_mod2 = -battle_mod2;
    }
    mod2_freq = 3.0 + Math.random() * 10.0;
    battle_mod3 = Math.random() * 0.3;
    if (randi(0, 1) == 0) {
        battle_mod3 = -battle_mod3;
    }
    mod3_freq = 3.0 + Math.random() * 10.0;

    battle_mod4 = Math.random() * 0.3;
    if (randi(0, 1) == 0) {
        battle_mod4 = -battle_mod4;
    }
    mod4_freq = 3.0 + Math.random() * 10.0;

    battle_mod5 = Math.random() * 0.3;
    if (randi(0, 1) == 0) {
        battle_mod5 = -battle_mod5;
    }
    mod5_freq = 3.0 + Math.random() * 10.0;

    step_count = 0;
    set_bar_progress(initial_battlescore / 2.0);
}

// Interpolate between the initial and final battlescore
function battle_step() {
    step_count++;
    if (step_count > total_steps) {
        // End combat
        game_state = State.Action;
        return;
    }

    let t = step_count / total_steps;

    let m2 = battle_mod2 * Math.sin(t * mod2_freq) * (1.0 - t);
    let m3 = battle_mod3 * Math.sin(t * mod3_freq) * (1.0 - t);
    let m4 = battle_mod4 * Math.sin(t * mod4_freq) * (1.0 - t);
    let m5 = battle_mod5 * Math.sin(t * mod5_freq) * (1.0 - t);

    let display_score = initial_battlescore * (1.0 - t) + final_battlescore * t + m2 + m3 + m4 + m5;
    set_bar_progress(display_score / 2.0)
}

// Generate a weighted number between 0.0 and 2.0 reflecting an army's performance in battle
function roll_warscore() {
    let r1 = Math.random();
    let r2 = Math.random();
    let r3 = Math.random();
    let r4 = Math.random();
    return (r1 + r2 + r3 + r4) * (2.0 / 4);
}

function set_bar_progress(prog) {
    if (prog > 1.0) {
        prog = 1.0;
    }
    else if (prog < 0.0) {
        prog = 0.0;
    }
    // prog is a value between 0.0 and 1.0
    let str = prog * 100 + "%";
    document.getElementById("battle_bar_fg").style.width = str;
}

function randi(min, max) {
    return min + Math.floor(Math.random() * (max + 1 - min));
}