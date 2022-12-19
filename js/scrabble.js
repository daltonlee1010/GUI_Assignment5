/*
Author: Dalton Lee
Created: December 1, at 8:00 PM
Description: This assignment ties in all of what we learned throughout GUI 1 this semester.
The goal is to program a website using html, css, js (with jQuery UI for drag and drop mechanics)
that allows users to play "mini scrabble". The final product is one line, with two bonus squares, off a scrabble board
with a rack underneath holding seven letter tiles that can be dragged and dropped onto the board squares.
The program checks word is real (extra credit), has two letters and no gaps before allowing submission of a word.
There is 100 tiles total to be drawn per game, games can be reset, a highscore across all games is tracked,
bonus tiles properly handle score multipliers/additions upon display and submission and the current word is
displayed to the user and gets updated as tiles are added/removed from the board.

File: scrabble.js
GUI Assignment: Implementing a Bit of Scrabble with Drag-and-Drop
Dalton Lee, UMass Lowell Computer Science Student, dalton_lee@student.uml.edu
Copyright (c) 2021 by Dalton. All rights reserved. May be freely copied or
excerpted for educational purposes with credit to the author.
updated by Dalton Lee on December 19, at 4:00 PM
*/

// Global variable for letter pieces including how much they're worth and the
// correct quantity for each that are in a scrabble game
var letter_pieces = [];
// Use letter_weights global array for accurate random distrubtion of letter drawing
var letter_weights = [];
// Use holder_positions global array to find where to put next piece when drawn
var holder_positions = [];
// Use current_tile_container global array to see where the tiles are at yo
var current_tile_container = [];
// Use score to remember the score of the current game
var score = 0;
// Use score_to_add to remember the score of the board currently
var score_to_add_upon_submit = 0;
// Use word_score_doubled for bonus square functionality
var word_score_doubled = false;
// Keep track of highscore globally
var highscore = 0;
// Use current_word to keep track of all letters on board
var current_word = "";
// Dictionary to check if current_word is a word
var dict = [];
// If initialized use dict for word checking
var use_dict = 0;
// Update positioning of elements based on other elements within window
window.onresize = reportWindowSize;


$().ready(function() {
    // Tie droppable images to their respective event handler functions
    $("#holder").droppable({
        activeClass: "highlight_nonactive",
        hoverClass: "highlight_active",
        disabled: true,
        drop: holderDropped
    });
    $(".boardBlank").droppable({
        activeClass: "highlight_nonactive",
        hoverClass: "highlight_active",
        drop: boardBlankDropped
    });
    $(".boardDoubleWord").droppable({
        activeClass: "highlight_nonactive",
        hoverClass: "highlight_active",
        drop: boardDoubleWordDropped
    });
    $(".boardDoubleLetter").droppable({
        activeClass: "highlight_nonactive",
        hoverClass: "highlight_active",
        drop: boardDoubleLetterDropped
    });


    // Generate a fresh game of scrabble when DOM is loaded
    startFresh();
});
// End of jquery startup activities


// Run when DOM is finished loading and when reset button is clicked for a fresh new scrabble game
function startFresh() {
    // When starting up make sure holder and globals are reset
    removeAllTakenSlots();
    setLetterPiecesFresh();
    letter_weights = [];
    holder_positions = [false, false, false, false, false, false, false];
    current_tile_container = [];
    score = 0;
    score_to_add_upon_submit = 0;
    word_score_doubled = false;
    current_word = "";
    current_word_start_index = 99;
    setScoreBoard(0);
    updateWord();
    checkSubmit();

    // Put all letters in letter_weights array the number of times equal to their respective quantity
    for(var i = 0; i < Object.keys(letter_pieces).length; i++)
        for(var j = 0; j < letter_pieces[i].quantity; j++)
            letter_weights.push(letter_pieces[i].letter);

    // Draw and place 7 letter pieces on the letter holder
    chosen_piece = ""
    for(var i = 0; i < 7; i++) {
        chosen_piece = drawLetter();
        placeOnFreeHolderSlot(chosen_piece);
    }
}

// Function for setting and reseting the correct scrabble letter piece info array for a new game
function setLetterPiecesFresh() {
    letter_pieces = [
        {"letter":"A", "worth":1,  "quantity":9},
        {"letter":"B", "worth":3,  "quantity":2},
        {"letter":"C", "worth":3,  "quantity":2},
        {"letter":"D", "worth":2,  "quantity":4},
        {"letter":"E", "worth":1,  "quantity":12},
        {"letter":"F", "worth":4,  "quantity":2},
        {"letter":"G", "worth":2,  "quantity":3},
        {"letter":"H", "worth":4,  "quantity":2},
        {"letter":"I", "worth":1,  "quantity":9},
        {"letter":"J", "worth":8,  "quantity":1},
        {"letter":"K", "worth":5,  "quantity":1},
        {"letter":"L", "worth":1,  "quantity":4},
        {"letter":"M", "worth":3,  "quantity":2},
        {"letter":"N", "worth":1,  "quantity":6},
        {"letter":"O", "worth":1,  "quantity":8},
        {"letter":"P", "worth":3,  "quantity":2},
        {"letter":"Q", "worth":10, "quantity":1},
        {"letter":"R", "worth":1,  "quantity":6},
        {"letter":"S", "worth":1,  "quantity":4},
        {"letter":"T", "worth":1,  "quantity":6},
        {"letter":"U", "worth":1,  "quantity":4},
        {"letter":"V", "worth":4,  "quantity":2},
        {"letter":"W", "worth":4,  "quantity":2},
        {"letter":"X", "worth":8,  "quantity":1},
        {"letter":"Y", "worth":4,  "quantity":2},
        {"letter":"Z", "worth":10, "quantity":1},
        {"letter":"_", "worth":0,  "quantity":2}
    ];
}

// Score functions
function setScoreBoard(val) {
    $("#score").html(val + " (+0)");
}
function addToScoreboard(worth) {
    score_to_add_upon_submit += worth;
    if(word_score_doubled == false) {
        $("#score").html(score + " (+" + score_to_add_upon_submit + ")");
    }
    else {
        $("#score").html(score + " (+" + (score_to_add_upon_submit * 2) + ")");
    }
}
function subtractFromScoreboard(worth) {
    score_to_add_upon_submit = score_to_add_upon_submit - worth;
    if(word_score_doubled == false) {
        $("#score").html(score + " (+" + score_to_add_upon_submit + ")");
    }
    else {
        $("#score").html(score + " (+" + (score_to_add_upon_submit * 2) + ")");
    }
}

// Draw a letter randomly based on remaining tiles (statistically accurate) and return chosen letter
function drawLetter() {
    // Define variables
    var max = letter_weights.length;
    var random_weight = 0;
    var random = 0;
    var cond = true;

    if(letter_weights.length <= 0) {
        console.log("All tiles used up, can't draw additional tiles");
        console.log("Restarting game");
        startFresh();
    }

    // While cond
    while(cond == true) {
        // Find a random number between 0 and the total quantity of all letters minus 1 for indexing purposes
        random_weight = Math.floor(Math.random() * (max));
        for(var j = 0; j < Object.keys(letter_pieces).length; j++)
            if(letter_weights[random_weight] == letter_pieces[j].letter)
                random = j;

        // Check if piece chosen to draw is left
        if(letter_pieces[random].quantity != 0) {
            cond = false;
            letter_pieces[random].quantity--;        // Remove 1 quantity from letter obj
            letter_weights.splice(random_weight, 1); // Remove 1 from letter_weight random array
            max = letter_weights.length;
        }
    }
    $("#remaining_tiles").html(letter_weights.length);
    return letter_pieces[random].letter;
}


// Place new/returning letter tiles on a free spot in the holder
function placeOnFreeHolderSlot(piece_to_place) {
    var slot_to_place = 10;
    for(var i = holder_positions.length - 1; i >= 0 ; i--)
        if(holder_positions[i] == false)
            slot_to_place = i;
    
    if(slot_to_place > holder_positions.length) {
        console.log("ERROR: No free slots available for letter placement on holder");
        return;
    }

    holder_positions[slot_to_place] = true;

    var letter_pieces_path = "../graphics/scrabble_tiles/Scrabble_Tile_";
    var letter_piece = "<img class='" + piece_to_place + "' id='holder_piece"
                    + slot_to_place + "' src='" + letter_pieces_path + piece_to_place + ".jpg" +
                    "' height='70' width='70'></img>"; // height of 72 pixels to fit on scrabble line
    var piece_ID = "#holder_piece" +  slot_to_place;

    var pos = $("#holder").position();
    var img_left = pos.left + 50 + ((66 + 14)* slot_to_place);
    var img_top = pos.top + 68;
    console.log("Placing tile " + piece_to_place  + " in holder slot " + 
                (slot_to_place+1) + " at x:" + Number(img_left).toFixed(0) +
                " y:" + Number(img_top).toFixed(0));
    $(".holderDiv").append(letter_piece);

    $(piece_ID).css("left", img_left).css("top", img_top).css("position", "absolute");

    $(piece_ID).draggable({
        revert: "invalid",
        start : pieceStartDrag
    });
    current_tile_container.push({"tile_ID":piece_ID, "current_droppable":"#holder"});
}

// Place letter tile on a specific slot on the holder
function placeOnSpecificHolderSlot(piece_to_place, slot_to_place) {
    var letter_pieces_path = "../graphics/scrabble_tiles/Scrabble_Tile_";
    var letter_piece = "<img class='" + piece_to_place + "' id='holder_piece"
                    + slot_to_place + "' src='" + letter_pieces_path + piece_to_place + ".jpg" +
                    "' height='70' width='70'></img>"; // height of 72 pixels to fit on scrabble line
    var piece_ID = "#holder_piece" +  slot_to_place;

    var pos = $("#holder").position();
    var img_left = pos.left + 50 + ((66 + 14)* slot_to_place);
    var img_top = pos.top + 68;
    console.log("Placing tile " + piece_to_place  + " in holder slot " + 
                (slot_to_place+1) + " at x:" + Number(img_left).toFixed(0) +
                " y:" + Number(img_top).toFixed(0));
    $(".holderDiv").append(letter_piece);

    $(piece_ID).css("left", img_left).css("top", img_top).css("position", "absolute");

    $(piece_ID).draggable({
        revert: "invalid",
        start : pieceStartDrag
    });
    current_tile_container.push({"tile_ID":piece_ID, "current_droppable":"#holder"});
}

// For when the reset game button is clicked
function removeAllTakenSlots() {
    for(var i = holder_positions.length - 1; i >= 0 ; i--)
        if(holder_positions[i] == true) {
            $("#holder_piece" + i).remove()
        }
    for(var j = 0; j < current_tile_container.length; j++)
        for(var i = 0; i < current_tile_container.length; i++)
            if(current_tile_container[j].tile_ID == "#boardPieceAtboardSpace"+(i+1)) {
                $("#boardPieceAtboardSpace"+(i+1)).remove();
                $("#boardSpace"+(i+1)).droppable( "option", "disabled", false );;
            }
}

// When a window resizes is reported, update draggables to still be in their correct droppable spots
function reportWindowSize() {
    // Declare variables
    var pos = $("#holder").position();
    var img_left = 0;
    var img_top = 0;
    var piece_to_repos = $("#holder_piece" + 99);

    // Iterate over holder_positions and if there's a letter tile in them reposition it accordingly
    for(var i = holder_positions.length - 1; i >= 0 ; i--)
        if(holder_positions[i] == true) {
            piece_to_repos = $("#holder_piece" + i)
            img_left = pos.left + 50 + ((66 + 14)* i);
            img_top = pos.top + 68;
            console.log("Placing tile " + $("#holder_piece" + i).attr('class').split(' ')[0] +
                        " in holder slot " + (i+1) + " at x:" + Number(img_left).toFixed(0) +
                        " y:" + Number(img_top).toFixed(0));

            piece_to_repos.css("left", img_left).css("top", img_top).css("position", "absolute");
        }

    // Iterate over all board positions and if there's a letter tile in them reposition it accordingly
    var letter = "";
    for(var j = 0; j < current_tile_container.length; j++)
        for(var i = 0; i < current_tile_container.length; i++)
            if(current_tile_container[j].tile_ID == "#boardPieceAtboardSpace"+(i+1)) {
                pos = $("#boardSpace"+(i+1)).position();
                letter = $("#boardPieceAtboardSpace"+(i+1)).attr("class").split(' ')[0]
                img_left = pos.left + 4;
                img_top = pos.top + 4;
                console.log("Placing tile " + letter + " on " + "boardSpace" + (i+1) + " at x:" +
                            Number(img_left).toFixed(0) + " y:" + Number(img_top).toFixed(0));

                $("#boardPieceAtboardSpace"+(i+1)).css("left", img_left).css("top", img_top).css("position", "absolute");
            }
}


// Run when a piece starts to be dragged. Used to print helpful debug info and
// to check whether or not board IDs are available
function pieceStartDrag(event, ui) {
    // Declare variables
    $(this).addClass("draggable-inmotion");
    var tile_ID = $(this).attr("id");
    var tile_letter = $(this).attr('class').split(' ')[0];
    var potential_board_ID = 0;

    // Iterate through current tile container length and perform notifications and updates and stuff
    for(var i = 0; i < current_tile_container.length; i++)
        if(current_tile_container[i].tile_ID == "#"+tile_ID) { // find selected tile's current container
            if(current_tile_container[i].current_droppable == "#holder") {
                console.log("Removing tile " + tile_letter + " from holder"); // debug info
            }
            for(var j = 0; j < 7; j++) { //iterate through all board pieces and find which it was removed from
                potential_board_ID = j+1;
                if(current_tile_container[i].current_droppable == "#boardSpace" + potential_board_ID) {
                    console.log("Removing tile " + tile_letter + " from board space " + potential_board_ID);
                    $("#boardSpace" + potential_board_ID).droppable( "option", "disabled", false );
                }
            }
        }
}

// Run when a letter tile is dropped in the holder
function holderDropped(event, ui) {
    // Declare variables
    var tile_ID = ui.draggable.attr("id");
    var tile_class = ui.draggable.attr("class").split(' ')[0];

    // If the tile that was dropped was last on the holder, just put it back in its original spot
    for(var i = 0; i < current_tile_container.length; i++)
        if(current_tile_container[i].tile_ID == "#"+tile_ID)
            if(current_tile_container[i].current_droppable == "#holder") {
                console.log("Placing tile " + tile_class + " back to original spot in holder");
                ui.draggable.remove();
                for(var j = holder_positions.length - 1; j >= 0 ; j--)
                    if("holder_piece" + j == tile_ID) {
                        current_tile_container.splice(i, 1);
                        placeOnSpecificHolderSlot(tile_class, j);
                        return;
                    }
            }

    // Perform proper subtractions based on where tile came from
    var score_to_sub = 0;
    board_space_class = findLetterClassToPerformSub(tile_ID);
    subtractScoreBasedOnClass(board_space_class, tile_class, score_to_sub);

    // If the tile that was dropped was last on the board, splice
    for(var i = 0; i < current_tile_container.length; i++)
        if(current_tile_container[i].tile_ID == "#"+tile_ID)
            for(var j = 0; j < 7; j++)
                if(current_tile_container[i].current_droppable == "#boardSpace" + (j+1)) {
                    current_tile_container.splice(i, 1);
                    break;
                }
    // If the tile is coming from the board, just put it on a free slot
    ui.draggable.remove();
    placeOnFreeHolderSlot(tile_class);

    // If the holder has all 7 spots taken don't allow more droppables to be placed here
    var taken_spots = 0;
    for(var i = holder_positions.length - 1; i >= 0 ; i--)
        if(holder_positions[i] == true) {
            taken_spots += 1;
        }
    if(taken_spots == 7)
        $("#holder").droppable( "option", "disabled", true );

    updateWord();
}


// Ran when a tile is placed on the board, indicates where a free position is on the holder now
function removeHolderPosition(tile_ID) {
    for(var i = holder_positions.length - 1; i >= 0 ; i--)
        if("holder_piece" + i == tile_ID)
            holder_positions[i] = false;
}


// Three functions below are ran when letter tiles are placed on corresponding board tiles
function boardBlankDropped(event, ui) {
    // Commit to dropping on blank board space
    // Declare Variables
    var blank_ID = $(this).attr("id");
    var tile_ID = ui.draggable.attr("id");
    var letter = $("#"+ui.draggable.attr("id")).attr('class').split(' ')[0];

    subtractIfMovedFromBoardPiece(tile_ID, letter);

    placeOnBoardSlot(ui.draggable, blank_ID);
    $(this).droppable( "option", "disabled", true );
    $("#holder").droppable( "option", "disabled", false );

    // Now add worth of letter to current score
    var dropped_letter = ui.draggable.attr("class").split(' ')[0];
    var score_to_add = findWorthBasedOnLetter(dropped_letter);
    addToScoreboard(score_to_add);
    updateWord();
}
function boardDoubleWordDropped(event, ui) {
    // Commit to dropping on double word board space
    // Declare Variables
    var doubleWord_ID = $(this).attr("id");
    var tile_ID = ui.draggable.attr("id");
    var letter = $("#"+ui.draggable.attr("id")).attr('class').split(' ')[0];

    subtractIfMovedFromBoardPiece(tile_ID, letter);

    placeOnBoardSlot(ui.draggable, doubleWord_ID);
    $(this).droppable( "option", "disabled", true );
    $("#holder").droppable( "option", "disabled", false );

    // Now add worth of letter to current score
    var dropped_letter = ui.draggable.attr("class").split(' ')[0];
    var score_to_add = findWorthBasedOnLetter(dropped_letter);
    word_score_doubled = true;
    addToScoreboard(score_to_add);
    updateWord();
}
function boardDoubleLetterDropped(event, ui) {
    // Commit to dropping on double letter board space
    // Declare Variables
    var doubleLetter_ID = $(this).attr("id");
    var tile_ID = ui.draggable.attr("id");
    var letter = $("#"+ui.draggable.attr("id")).attr('class').split(' ')[0];

    subtractIfMovedFromBoardPiece(tile_ID, letter);

    placeOnBoardSlot(ui.draggable, doubleLetter_ID);
    $(this).droppable( "option", "disabled", true );
    $("#holder").droppable( "option", "disabled", false );

    // Now add worth of letter to current score
    var dropped_letter = ui.draggable.attr("class").split(' ')[0];
    var score_to_add = findWorthBasedOnLetter(dropped_letter);
    addToScoreboard(score_to_add*2);
    updateWord();
}


// Use this function when placing a tile on a board slot
function placeOnBoardSlot(dropped_obj, unused_space) {
    var pos = $("#"+unused_space).position();
    removeHolderPosition(dropped_obj.attr("id"));
    for(var i = 0; i < current_tile_container.length; i++)
        if(current_tile_container[i].tile_ID == "#"+dropped_obj.attr("id"))  {
            current_tile_container[i].tile_ID = "#boardPieceAt" + unused_space;
            current_tile_container[i].current_droppable = "#" + unused_space;
        }
    dropped_obj.attr("id", "boardPieceAt" + unused_space);
    var letter = dropped_obj.attr("class").split(' ')[0]
    var img_left = pos.left + 4;
    var img_top = pos.top + 4;
    console.log("Placing tile " + letter + " on " + unused_space + " at x:" +
                Number(img_left).toFixed(0) + " y:" + Number(img_top).toFixed(0));

    $("#"+dropped_obj.attr("id")).css("left", img_left).css("top", img_top).css("position", "absolute");
}

// This function takes in a letter and finds how much it's worth by looking into the letter_pieces array of objects
function findWorthBasedOnLetter(dropped_letter) {
    var letter_worth = 0;
    for(var i = 0; i < Object.keys(letter_pieces).length; i++)
        if(dropped_letter == letter_pieces[i].letter) {
            letter_worth = letter_pieces[i].worth;
            return letter_worth;
        }
    return 0;
}

// The three functions below are used to perform proper subtractions based on letter tile worth
function subtractIfMovedFromBoardPiece(tile_ID, letter) {
    var sub_from_other_space = true;

    // Find if the letter tile was moved from a board space
    for(var i = 0; i < current_tile_container.length; i++)
        if(current_tile_container[i].tile_ID == "#"+tile_ID) // find selected tile's current container
            if(current_tile_container[i].current_droppable == "#holder")
                sub_from_other_space = false;

    // If it was subtract score
    if(sub_from_other_space == true) {
        var score_to_sub = 0;
        board_space_class = findLetterClassToPerformSub(tile_ID);
        subtractScoreBasedOnClass(board_space_class, letter, score_to_sub);
    }
}

// given tile_ID, find the letter associated with it
function findLetterClassToPerformSub(tile_ID) {
    var potential_board_ID = 0;
    var actual_board_ID = 0;
    for(var i = 0; i < current_tile_container.length; i++) {
        if(current_tile_container[i].tile_ID == "#"+tile_ID) { // find selected tile's current container
            for(var j = 0; j < 7; j++) { //iterate through all board pieces and find which it was removed from
                potential_board_ID = j+1;
                if(current_tile_container[i].current_droppable == "#boardSpace" + potential_board_ID) {
                    actual_board_ID = potential_board_ID;
                }
            }
        }
    }
    return $("#boardSpace" + actual_board_ID).attr("class").split(' ')[0]; // Return the letter of the tile
}

// Perform subtraction operations based on which board space class a tile was moved from
function subtractScoreBasedOnClass(board_space_class, letter, score_to_sub) {
    if(board_space_class == "boardBlank") {
        score_to_sub = findWorthBasedOnLetter(letter);
        subtractFromScoreboard(score_to_sub);
    }
    if(board_space_class == "boardDoubleWord") {
        score_to_sub = findWorthBasedOnLetter(letter);
        word_score_doubled = false;
        subtractFromScoreboard(score_to_sub);
    }
    if(board_space_class == "boardDoubleLetter") {
        score_to_sub = findWorthBasedOnLetter(letter);
        subtractFromScoreboard(score_to_sub*2);
    }
}


// Function below used for updating word when tiles are placed/removed from board
function updateWord() {
    var first_letter_of_word = false;
    var space_used = false;
    for(var i = (0 +1); i < (7 +1); i++) { // in order find all tiles on board
        space_used =  false;
        for(var j = 0; j < current_tile_container.length; j++) { // iterate through tiles' current container
            if("#boardSpace" + i == current_tile_container[j].current_droppable) {
                if(first_letter_of_word == false) {
                    current_word = $(current_tile_container[j].tile_ID).attr("class").split(' ')[0];
                    first_letter_of_word = true;
                    space_used = true;
                }
                else {
                    current_word += $(current_tile_container[j].tile_ID).attr("class").split(' ')[0];
                    space_used = true;
                }
            }
        }
        if(space_used == false && first_letter_of_word == true) {
            current_word += "-";
        }
    }
    if(first_letter_of_word == false) {
        $("#word").html("");
        return;
    }
    for(var i = current_word.length - 1; i >= 0; i--) {
        if(current_word[i] == "-"){
            continue;
        }
        else {
            current_word = current_word.slice(0, i+1);
            break;
        }
    }
    $("#word").html(current_word);
    checkSubmit();
}

// Before submitting, check to see if three important requirements are met (no gaps, two letters, real word)
function checkSubmit() {
    var total_check = true;

    // This block of code checks and displays to the user whether or not there's no gaps in the current word
    var no_gap_check = true;
    for(var i = current_word.length - 1; i >= 0; i--)
        if(current_word[i] == "-"){
            total_check = false;
            no_gap_check = false
            $("#no_gaps").css("color", "red");
        }
    if(no_gap_check == true)
        $("#no_gaps").css("color", "green");

    // This block of code checks and displays to the user whether or not there's two letter in the current word
    if(current_word.length >= 2) {
        $("#two_letter").css("color", "green");
    }
    else {
        total_check = false;
        $("#two_letter").css("color", "red");
    }
    
    // This block of code checks and displays to the user whether or not there's the current word is a real word
    // THIS IS THE EXTRA CREDIT PART
    // If the $.getJSON succeeded perform dict check
    if(use_dict) {
        $("#real_word").css("color", "green");
        if(dict.includes(current_word)) {
            console.log(current_word + " is a real word!");
            $("#real_word").css("color", "green");
            $("#word").css("color", "rgb(0, 165, 55)");
        }
        else {
            total_check = false;
            console.log(current_word + " is not a real word...");
            $("#real_word").css("color", "red");
            $("#word").css("color", "rgb(165, 0, 0)");
        }
    }
    // If the $.getJSON failed just assume everything is a real word
    else {
        $("#real_word").css("color", "green");
        $("#word").css("color", "rgb(0, 165, 55)");
    }
    return total_check;
}

// Ran when submit button is pressed on site
function submitButtonPress() {
    if(checkSubmit() == false) {
        console.log("Requirements colored in red need to be met before submitting");
        return;
    }
    
    // Remove tiles from board
    var tiles_to_add_back = 0;
    var current_container_indicies_to_splice = [];
    var already_deleted = false;
    for(var i = current_tile_container.length - 1; i >= 0; i--) {
        already_deleted = false;
        for(var j = 0; j < 7; j++) {
            if(already_deleted == false && current_tile_container[i].current_droppable == "#boardSpace" + (j+1)) {
                console.log("Removing " + current_tile_container[i].tile_ID);
                current_container_indicies_to_splice.push(i);
                $(current_tile_container[i].tile_ID).remove();
                current_tile_container.splice(i, 1);
                tiles_to_add_back += 1;
                already_deleted = true;
                $("#boardSpace" + + (j+1)).droppable( "option", "disabled", false );//make board space available again
            }
        }
    }

    // Add score_to_add to real score, update highscore if need be
    if(word_score_doubled == true)
        score += 2 * score_to_add_upon_submit;
    else
        score += score_to_add_upon_submit;
    $("#score").html(score + " (+0)");
    if(score > highscore) {
        highscore = score;
        $("#high_score").html(highscore);
    }
    // Add letters back to holder
    var chosen_piece = "";
    for(i = 0; i < tiles_to_add_back; i++){
        chosen_piece = drawLetter();
        placeOnFreeHolderSlot(chosen_piece);
    }

    // Update word because the board just got wiped
    updateWord();

    // Update current word/score global variables
    score_to_add_upon_submit = 0;
    word_score_doubled = false;
    current_word = "";
    current_word_start_index = 99;
}

// When 'Replace Blank Tile' button is pressed, this is ran, replacing tile with character as long as it's a letter
function blankTile() {
    for(var i = 0; i < current_tile_container.length; i++) {
        if(current_tile_container[i].current_droppable == "#holder") {
            if($(current_tile_container[i].tile_ID).attr("class").split(' ')[0] == "_") {
                var str = $("#blank_tile_text").val();
                if(str.length === 1 && str.match(/[a-z]/i)) {
                    str = str.toUpperCase();
                    console.log("Valid letter of '" + str + "' given, converting blank tile");
                    removeHolderPosition(current_tile_container[i].tile_ID.substring(1));
                    $(current_tile_container[i].tile_ID).remove();
                    current_tile_container.splice(i, 1);
                    placeOnFreeHolderSlot(str);
                    return;
                }
                console.log("Blank tile found, invalid character as input, no conversion");
                return;
            }
        }
    }
    console.log("No blank tile");
}

// load in dictionary for checking word validity functionality
$.getJSON('../dictionary/words_dictionary.json', function(data) {
    use_dict = 1;
    $.each( data, function( key, val ) {
        dict.push(key.toUpperCase());
    });
});