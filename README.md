# GUI_Assignment5

GitHub URLs: https://github.com/daltonlee1010/GUI_Assignment5<br>
             https://daltonlee1010.github.io/GUI_Assignment5/html<br>


Author: Dalton Lee<br>
Created: December 1, at 8:00 PM<br>
Description: This assignment ties in all of what we learned throughout GUI 1 this semester.
The goal is to program a website using html, css, js (with jQuery UI for drag and drop mechanics)
that allows users to play "mini scrabble". The final product is one line, with two bonus squares, off a scrabble board
with a rack underneath holding seven letter tiles that can be dragged and dropped onto the board squares.
The program checks word is real (extra credit), has two letters and no gaps before allowing submission of a word.
There is 100 tiles total to be drawn per game, games can be reset, a highscore across all games is tracked,
bonus tiles properly handle score multipliers/additions upon display and submission and the current word is
displayed to the user and gets updated as tiles are added/removed from the board.

File: README.md<br>
GUI Assignment: Implementing a Bit of Scrabble with Drag-and-Drop<br>
Dalton Lee, UMass Lowell Computer Science Student, dalton_lee@student.uml.edu<br>
Copyright (c) 2021 by Dalton. All rights reserved. May be freely copied or<br>
excerpted for educational purposes with credit to the author.<br>
updated by Dalton Lee on December 6, at 10:00 PM<br>

Complete write-up about implemented features:<br>
This program upon starting up draws 7 letters and places them onto the holder or "rack". The
way this is done is by taking the quantity of letters in scrabble, and adding the letter that many
times to an array called letter weights. This is the array that is used to randomly choose which letter
to be drawn to make the game feel like its randomness in drawing is accurate (because it is). Once a letter is
drawn from the array it's spliced in that array, quantity subtracted by one in the actual letter_tiles array and
the respective letter is added to the holder/rack as a tile piece. Users are able to drag and drop these tile pieces
onto the one line of scrabble board squares. The console outputs when a tile is removed/added to specific board squares and the rack.
The div with id "word" in the html file is updated when a letter tile is dropped onto the board to identify the letter
was dropped on the board and the program recognizes it. My one line board contains a double letter bonus square and a double word bonus square.
The potential score is updated whenever letters are added/removed while considering these bonus squares. Once a submission is
made successfully, the score gets added on to the total score for the game. The program also keeps track of the highest score
across any game played during one session. Words can be played until there's no tiles left to draw or a users presses "Restart game" button.
All board squares are wiped upon successful submission for a new word to be played and tiles are drawn until the rack contains 7 tiles.
Not dropping a draggable tile in a valid location (board square or rack) will cause a bounce back animation to play and
the tile to return to where it was last. Tiles can be moved back to the rack and the word display and potential score is updated accordingly.
My program does not allow submission of a word unless two letters are played, no gaps between letters, and
the word is found in the dictionary (extra credit). As of now the only bug I've ran into that I was not able to fix before submitting this
is sometimes the tiles are not loaded properly onto the right rack locations and the window needs to be resized/reloaded for them to go there.
It's a minor bug that only happens at most once per session and it doesn't happen a lot.
