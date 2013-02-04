Sudoku

by Chip Camden

Colors mentioned below are per the included stylesheet (sudoku.css).

This version of Sudoku presents the usual 9 x 9 grid which is divided into nine 
3 x 3 regions.  The object of the game is to fill in the grid with numbers from 
1 to 9, such that each row, column, and region contains one and only one 
instance of each number.  To get you started, each game provides a number of 
"givens" -- cells that already have their value filled in, and which you cannot 
change (indicated by a gray background).  By default, this version randomly 
provides 36 givens -- without any attempt to evenly distribute them across rows,
columns, or regions.

When you enter a number in a cell, if the value conflicts with another cell in 
the same row, column, or region, then the background of both cells will be 
changed to red (unless the other cell is a given, in which case it remains 
gray).  If a cell has two or more conflicts, a darker shade of red is used, up 
to four conflicts -- beyond which point the color remains the same.  If you 
try to enter a value in the cell other than the numbers 1 through 9, the cell 
is cleared.  You can also clear the cell by pressing "delete".  When a cell is 
focused, the arrow keys can be used to navigate to the next cell in the 
specified direction, with wrap-around.  For us vim fans, the letters h, j, k,
and l (case-insensitive) can be used in place of the arrow keys.  Tab and
Shift-tab follow the browser's defined behavior for navigating input controls
-- the cells are defined in column order within rows, followed by the buttons.
The first empty cell will be focused at the beginning of each new game.

If you press the letter "q" (case-insensitive), the current cell's "questionable"
state will be toggled.  The provided stylesheet colors questionable cells with
a yellow background.

For those of you who are keyboard challenged, the numbered buttons on the right
side can be used to set the most recently focused cell to the value shown on
each button.

A status line shows the number of givens, as well as providing a text control
where you can enter the number of givens to supply in the next game (from
0 to 81, inclusive).

The "Hint" button provides another given, randomly choosing an empty cell to 
fill in.  If there are no empty cells remaining, an alert "Can't fill in 
anything!" will be displayed.

The "Solve" button will reveal the entire puzzle.  Note that it may be possible 
to solve a Sudoku in more than one way for the given values, but this button 
reveals the solution that was generated when the puzzle was created.  Cells for
which you entered an incorrect value will display the corrected value in red.
Cells that you left empty will be displayed in blue.

The "New" button generates a new puzzle.

The "Help" button displays a help window for keyboard shortcuts.  You can move
this window by clicking and dragging it, and you can close it by clicking the
"x" button or by pressing ESC.

When you have solved the puzzle, an alert "Solved!" will be displayed.

You can use your browser's "Zoom" or "Text size" functions to resize the puzzle.

Browser-specific differences

This game was tested with the following browsers, and revealed a few minor 
issues where noted:

Google Chrome 1.0.154.46 thru 2.0.172.28
Mozilla Firefox 3.0.6 thru 3.0.10
Safari 3.2.1
Internet Explorer 7 & 8 - Sizing the browser small enough causes the cells to 
	misalign.  Corners on the container aren't rounded.
Opera 9.25 - border width differences used to delineate the regions are not
	honored, and neither are the rounded corners on the container.
Opera Mini Simulator- same issues as Opera.

I've attempted to make this game mobile-friendly, but of course it only works on 
platforms that support JavaScript and CSS.

Thanks to Douglas Crockford for the indispensable JSLint utility
(http://www.jslint.com), which sorted out a number of cases of
"it just doesn't work".

Styling

Styling for this game has been separated out into the file sudoku.css.  You 
can modify this or provide your own stylesheet to change the effects for the 
following class names (note that more than one class name may be applied to an 
individual cell):

sudoku - the container for the game (defined in sudoku.htm)
sudokuButton - the control buttons
sudokuCell - every cell in the puzzle
sudokuCloseBtn - the "x" button in the title bar of the help window
sudokuCorrected - a cell whose value was corrected by pressing the "Solve" button
sudokuConflict0 - a cell whose value does not conflict with any other cells
sudokuConflict1 - a cell whose value conflicts with one other cell
sudokuConflict2 - a cell whose value conflicts with two other cells
sudokuConflict3 - a cell whose value conflicts with three other cells
sudokuConflict4 - a cell whose value conflicts with four or more cells
sudokuGiven - a cell whose value is given
sudokuHelp - the help window
sudokuHelpTitle - the title bar of the help window
sudokuInputGivens - the text input for the number of givens to provide next game
sudokuNumberBtn - the numbered buttons down the right side
sudokuRegionTop - a cell that is along the top edge of a region
sudokuRegionBottom - a cell that is along the bottom edge of a region
sudokuRegionLeft - a cell that is along the left edge of a region
sudokuRegionRight - a cell that is along the right edge of a region
sudokuSolvedEmpty - a cell that was empty when the "Solve" button was pressed
sudokuStatus - a div that displays status information
info - the section that contains the link to this page

Using the code

This code has been designed to play well with others.  It introduces only one 
global symbol, the name of the Sudoku function.  However, it does use the jQuery
framework (included in the download).

You can instantiate a Sudoku puzzle within any HTML element using the following code:

new Sudoku(elem, ngivens)

where elem is the DOM Element that will contain the puzzle, and ngivens is the 
optional number of givens to display (default = 36).

Algorithm

For every new puzzle, the script generates a completed solution and then 
randomly chooses the location of the givens to reveal.  The algorithm for 
generating the puzzle can probably be made more elegant, but it works.  The 
generatePuzzle() function is called recursively, beginning with the first cell
and progressing to the last one.  At each cell, the numbers 1 through 9 are 
attempted in a random order until no conflicts are found and we successfully 
recurse through the rest of the puzzle.  Thus, if no solution can be found for a
given combination up to this point, we backtrack through the recursion and try 
something else.  This could certainly be optimized -- for instance, we could 
keep track of unused values within the current row and only try those.  But 
I'm not certain that the benefit of that optimization wouldn't be offset by 
the additional array manipulation required.  Ideally, this is a problem for 
graph theory -- perhaps one day I'll attack it from that angle.

For checking conflicts, the script maintains arrays of arrays:  an array of 
rows, an array of columns, and an array of regions.  Each element of these 
arrays is an array of DOM elements:  the <input> element for each cell.  
Each of those elements also has back-linked properties for its row, column, and 
region.  Thus, when the "change" event occurs for a cell, we can easily check it
against the other cells that might conflict.

For more details, see the comments in the code.
