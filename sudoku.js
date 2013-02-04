// Sudoku
//
// Chip Camden
//
// http://chipstips.com/?tag=jssudoku
//

//
// Create a sudoku game:
//
// new Sudoku(elem, ngivens)
//
// Where:
//	elem is an HTML element that will contain the Sudoku game
//	ngivens is the number of givens to show (default = 36)
//

// Global definitions for JSLint (jslint.com):

/*global alert:false, jQuery:false, $:false, document:false, window:false, event:false */

function Sudoku(ctr, ngivens) {
    var row;
    var col;
    var region;
    var elem;
    var game = this;	// disambiguate this
    game.nGivens = (typeof ngivens == "undefined") ? 36 : Math.max(0,Math.min(ngivens,81)); // Default to ~4 per region
    game.rows = [];	// Array or arrays of cells in each row
    game.cols = [];	// Array of arrays of cells in each column
    game.regions = [];  // Array of arrays of cells in each square region
    game.empties = [];	// Array of remaining empty cells
    game.cells = [];	// Array of all cells
    for (row = 0; row< 9; row++) {
      game.rows[row] = [];
      game.cols[row] = [];
      game.regions[row] = [];
    }

    // Check for conflicts when generating the underlying puzzle
    game.Conflicts = function(e, num, arry) {
	var z;
    	for (z = 0; z < arry.length; z++) {
	  if ((arry[z] !== e) && (arry[z].puzzleValue == num)) {
	    return true;
	  }
	}
	return false;
    };

    // Check for conflicts when a cell value is changed
    game.Check = function(e, num, arry) {
        jQuery.each(arry, function() {
	  if ((this !== e) && (this.value == num) && (jQuery.inArray(e, this.conflicts) < 0)) {
	    this.conflicts.push(e);
	    e.conflicts.push(this);
	    game.repaintElement(this);
	  }
	});
    };

    // Check to see if the puzzle is completely solved

    game.checkSolved = function() {
    	if (game.empties.length > 0) {
	  return false;
	}
	for (var ndx = 0; ndx < game.cells.length; ndx++) {
	  if (game.cells[ndx].conflicts.length > 0) {
	    return false;
	  }
	}
	return true;
    };

    // Process changes to a cell's value
    game.onChange = function(e, r, c, s) {
	var num;
	var ndx;
	var elem;
	// First, back out any existing conflicts
	while (e.conflicts.length > 0) {
	    elem = e.conflicts.pop();
	    if (elem !== null) {
	      while ((ndx = jQuery.inArray(e, elem.conflicts)) >= 0) {	// Do we have this one?
		// Remove it
		elem.conflicts.splice(ndx,1);
	      }
	      game.repaintElement(elem);
	    }
	}
	num = parseInt(e.value, 10);
	ndx = jQuery.inArray(e, game.empties);
	// Check against current row, column, and region
	if ((num >= 1) && (num <= 9)) {		// Valid value?
          game.Check(e, num, game.rows[r]);
          game.Check(e, num, game.cols[c]);
          game.Check(e, num, game.regions[s]);
	  if (ndx >= 0) {
	    game.empties.splice(ndx,1);		// Remove from empties
	  }
	} else {				// Invalid value
	  e.value = "";
	  if (ndx < 0) {
	    game.empties.push(e);		// Add to empties
	  }
	}
        game.repaintElement(e);
	if (game.checkSolved()) {
	  alert("Solved!");
	}
    };

    // Closure generator to capture element, row, column, and region for onchange
    game.makeChange = function(e, r, c, s) { return function() { game.onChange(e, r, c, s); }; };

    // Process key down event for each cell
    game.onKeydown = function(e, r, c) {
        var keycode = e ? e.which : event.keyCode;
	var nc = c;
	var nr = r;
	var elem;
	switch (keycode) {
	  case 37:	// left
	  case 72:	// H
	    nc -= 1;
	    if (nc < 0) {
	      nc = 8;
	    }
	    game.rows[nr][nc].focus();
	    game.rows[nr][nc].select();
	    return false;
	  case 38:	// up
	  case 75:	// K
	    nr -= 1;
	    if (nr < 0) {
	      nr = 8;
	    }
	    game.rows[nr][nc].focus();
	    game.rows[nr][nc].select();
	    return false;
	  case 39:	// right
	  case 76:	// L
	    nc += 1;
	    if (nc > 8) {
	      nc = 0;
	    }
	    game.rows[nr][nc].focus();
	    game.rows[nr][nc].select();
	    return false;
	  case 40:	// down
	  case 74:	// J
	    nr += 1;
	    if (nr > 8) {
	      nr = 0;
	    }
	    game.rows[nr][nc].focus();
	    game.rows[nr][nc].select();
	    return false;
	  case 49:	// 1
	  case 50:	// 2
	  case 51:	// 3
	  case 52:	// 4
	  case 53:	// 5
	  case 54:	// 6
	  case 55:	// 7
	  case 56:	// 8
	  case 57:	// 9
	    elem = game.rows[nr][nc];
	    if (!elem.readOnly)
	    {
	      elem.value = String.fromCharCode(keycode);	// Immediate response
	      elem.onchange();
	      elem.focus();
	      elem.select();
	    }
	    return false;
	  case 81:	// Q
	    elem = game.rows[nr][nc];
	    if (!elem.given) {
	      elem.questionable = !elem.questionable;	// Toggle
	    }
	    game.repaintElement(elem);
	    return false;
	}
	return true;		// Let everything else through
    };

    // Closure generator to capture row and column for onkeydown
    game.makeKeydown = function(r, c) { return function(e) { return game.onKeydown(e, r, c); }; };

    // Make the onblur event handler for an element
    game.makeBlur = function(elem) { return function() { game.lastFocus = elem; }; };
    
    // Compute region number from row, column
    game.getRegion = function(r, c) { return (Math.floor(r / 3) * 3 + Math.floor(c / 3)); };

    // Generate a valid puzzle (recurses for each cell)
    game.generatePuzzle = function(ndx) {
	if (ndx >= game.cells.length) {
	    return true;				// Got 'em all!
	}

    	var e = game.cells[ndx];			// Next cell
	var vals = [1, 2, 3, 4, 5, 6, 7, 8, 9];		// Potential values
	var val;

	vals.sort(function (a,b) { return (Math.random() < 0.5) ? -1 : 1; });		// Random sort

	while (vals.length > 0) {	// Try each one in random order until one works
	    val = vals.pop();
	    if (game.Conflicts(e, val, game.rows[e.row]) ||
	        game.Conflicts(e, val, game.cols[e.col]) ||
	        game.Conflicts(e, val, game.regions[e.region])) {
	      continue;
	    }
	    e.puzzleValue = val;
	    if (game.generatePuzzle(ndx + 1)) {	// Recurse for next element
	      return true;		// Made it to the end
	    }
	}
        e.puzzleValue = 0;		// Didn't work, try another
	return false;		// No valid value at this point
    };

    // Update the status window

    game.updateStatus = function() {
        game.statusGivens.innerHTML = game.shownGivens;
    };

    // Give the user one cell value (picks one of the empty ones)
    game.showGiven = function() {
    	if (game.empties.length > 0) {
	  var ndx = Math.max(0, Math.ceil(Math.random() * game.empties.length) - 1);
	  var e = game.empties[ndx];
          e.value = e.puzzleValue;
	  e.given = true;
	  e.readOnly = true;
	  game.shownGivens++;
	  game.updateStatus();
	  e.onchange();
	  return;
	}
	alert("Can't fill in anything!");
    };

    // Build a brand new puzzle
    game.reset = function() {
	game.empties = [];
	jQuery.each(game.cells,
	    function() {
	        this.puzzleValue = 0;
		this.value = '';
		this.given = false;
		this.corrected = false;
		this.readOnly = false;
		this.questionable = false;
		this.conflicts = [];
		game.empties.push(this);
		game.repaintElement(this);
	    });
        if (!game.generatePuzzle(0)) {
            alert("Unable to generate game!");
	    return;
	}
	game.statusNextGivens.value = game.nGivens;
	game.shownGivens = 0;
        for (var given = 0; given < game.nGivens; given++) {
            game.showGiven();		// As many givens as specified at the top
        }
	var ndx = 0;
	while ((ndx < game.cells.length) && game.cells[ndx].given) {
	  ndx++;
	}
	game.cells[ndx].focus();	// Focus the first empty cell
    };

    game.solve = function() {
    	jQuery.each(game.cells, function() {
	    this.questionable = false;
	    if (!this.given && (this.value != this.puzzleValue)) {
	      if (this.value === '') {
	        this.corrected = 1;
	      } else {
	        this.corrected = 2;
	      }
	      this.value = this.puzzleValue;
	      this.onchange();
	    } else {
	      game.repaintElement(this);
	    }
	});
    };

    game.help = function() {
	jQuery.each($(".sudokuHelp"), function() {
	  this.style.display = 'block';
	  this.style.zIndex = 1000;
	  this.close.focus();
	});
    };

    game.hideHelp = function() {
    	jQuery.each($(".sudokuHelp"), function() {
	  this.style.display = 'none';
	});
	if (game.lastFocus) {
	  game.lastFocus.focus();
	}
    };
	
    // Function to modify className based on whether the cell is given, how many conflicts it has,
    // whether it's marked as questionable, or supplied by a "Solve".

    game.repaintElement = function(e) {
      var cls = e.className.replace(/sudoku(Given|Conflict[0-9]|Corrected|SolvedEmpty|Questionable)/g, "");
      if (e.given) {
        cls += ' sudokuGiven';
      } else {
        cls += ' sudokuConflict' + Math.min(e.conflicts.length, 4);
      }
      if (e.corrected == 2) {
        cls += ' sudokuCorrected';
      } else if (e.corrected == 1) {
        cls += ' sudokuSolvedEmpty';
      } else if (e.questionable) {
        cls += ' sudokuQuestionable';
      }
      e.className = cls;
    };

    game.clickNumber = function() {
      if (game.lastFocus) {
	if (!game.lastFocus.readOnly) {
          game.lastFocus.value = this.value;
	  game.lastFocus.onchange();
	}
	game.lastFocus.focus();
      }
    };

    // Here we construct the stuff that stays the same between games
    for (row = 0; row < 9; row++) {
      for (col = 0; col < 9; col++) {
	region = game.getRegion(row, col);
	elem = document.createElement("input");		// Each cell is an input field
	elem.type = "text";
	elem.maxLength = 1;
	elem.className = "sudokuCell";
	switch (row % 3) {
	    case 0:
	      elem.className += " sudokuRegionTop";
	      break;
	    case 2:
	      elem.className += " sudokuRegionBottom";
	      break;
	}
	switch (col % 3) {
	    case 0:
	      elem.className += " sudokuRegionLeft";
	      break;
	    case 2:
	      elem.className += " sudokuRegionRight";
	      break;
	}
	elem.row = row;
	elem.col = col;
	elem.region = region;
	elem.onkeydown = game.makeKeydown(row, col); 
	elem.onchange = game.makeChange(elem, row, col, region);
	elem.onblur = game.makeBlur(elem);
	ctr.append(elem);
	game.rows[row].push(elem);
	game.cols[col].push(elem);
	game.regions[region].push(elem);
        game.cells.push(elem);
      }
      elem = document.createElement("input");
      elem.type = "button";
      elem.className = "sudokuNumberBtn";
      elem.value = row + 1;
      elem.onclick = game.clickNumber;
      ctr.append(elem);
      ctr.append('<br/>');	// Newline!
    }

    // Status window
    game.statusWindow = document.createElement("div");
    game.statusWindow.className = "sudokuStatus";
    game.statusWindow.innerHTML = "<span>Givens: </span>";
    game.statusGivens = document.createElement("span");
    game.statusWindow.appendChild(game.statusGivens);
    elem = document.createElement("span");
    elem.innerHTML = ", Next time: ";
    game.statusWindow.appendChild(elem);
    elem = document.createElement("input");
    elem.className = "sudokuInputGivens";
    elem.type = "text";
    elem.maxLength = 2;
    elem.onchange = function() {
        var n = parseInt(this.value, 10);
	if ((n >= 0) && (n <= 81)) {
	  game.nGivens = n;
	} else {
	  this.value = game.nGivens;
	}
    };
    game.statusWindow.appendChild(elem);
    game.statusNextGivens = elem;
    ctr.append(game.statusWindow);

    // Control buttons
    var btn = document.createElement("input");
    btn.type = "button";
    btn.value = "Hint";
    btn.onclick = game.showGiven;
    btn.className = "sudokuButton";
    ctr.append(btn);
    btn = document.createElement("input");
    btn.type = "button";
    btn.value = "Solve";
    btn.onclick = game.solve;
    btn.className = "sudokuButton";
    ctr.append(btn);
    btn = document.createElement("input");
    btn.type = "button";
    btn.value = "New";
    btn.onclick = game.reset;
    btn.className = "sudokuButton";
    ctr.append(btn);
    btn = document.createElement("input");
    btn.type = "button";
    btn.value = "Help";
    btn.onclick = game.help;
    btn.className = "sudokuButton";
    ctr.append(btn);

    // Help dialog
    var help = document.createElement("div");
    help.className = "sudokuHelp";
    help.style.display = "none";
    help.addline = function(line, className) {
      var div = document.createElement("div");
      if (className) {
        div.className = className;
      }
      div.appendChild(document.createTextNode(line));
      help.appendChild(div);
      return div;
    };
    btn = document.createElement("input");
    btn.type = "button";
    btn.value = "x";
    btn.className = "sudokuCloseBtn";
    btn.onclick = game.hideHelp;
    help.appendChild(btn);
    help.close = btn;
    help.addline("Sudoku Help", 'sudokuHelpTitle');
    help.addline("h / left arrow - move left");
    help.addline("j / down arrow - move down");
    help.addline("k / up arrow - move up");
    help.addline("l / right arrow - move right");
    help.addline("q - toggle questionable");
    help.addline("ESC - close this window (when focused)");
    help.onkeydown = function(e) {
        var keycode = e ? e.which : event.keyCode;
	if (keycode == 27) {	// ESC
	  game.hideHelp();
	}
    };
    ctr.append(help);

    // Enable click and drag
    game.dragObject = null;

    game.mouseCoords = function(e) {
    	if (e.pageX || e.pageY) {
	  return {x:e.pageX, y:e.pageY};
	}
	return {
	  x: e.clientX + document.body.scrollLeft - document.body.clientLeft,
	  y: e.clientY + document.body.scrollTop - document.body.clientTop
	};
    };

    game.getPosition = function(e) {
    	var left = 0;
	var top = 0;

	while (e.offsetParent) {
	  left += e.offsetLeft;
	  top += e.offsetTop;
	  e = e.offsetParent;
	}

	left += e.offsetLeft;
	top += e.offsetTop;

	return {x:left, y:top};
    };

    game.getMouseOffset = function(target, e) {
    	e = e || window.event;
	var docPos = game.getPosition(target);
	var mousePos = game.mouseCoords(e);
	return {x:mousePos.x - docPos.x, y:mousePos.y - docPos.y};
    };

    game.makeDraggable = function(item) {
        item.onmousedown = function(e) {
	  game.dragObject = this;
	  game.mouseOffset = game.getMouseOffset(this,e);
	  this.style.zIndex = 1000;
	};
    };

    document.onmousemove = function(e) {
      e = e || window.event;
      var mousePos = game.mouseCoords(e);
      if (game.dragObject) {
        game.dragObject.style.position = 'absolute';
	game.dragObject.style.top = mousePos.y - game.mouseOffset.y;
	game.dragObject.style.left = mousePos.x - game.mouseOffset.x;
	return false;
      }
    };
    document.onmouseup = function() { game.dragObject = null; };

    game.makeDraggable(help);

    // OK, now let's start with a fresh game!
    game.reset();
}
