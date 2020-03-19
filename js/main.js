'use strict';
const MINE = '💣';
const FLAG = '🚩';

// Global Variables
var gSize = 4;
var gBoard;
var gClickedCounter = 0;
var gInterval;
var gGameIsOn = true;
var gMineCount = 2;
var gShowCount = 0;
var gHintsCounter = 3;
var gCellIFirst;
var gCellJFirst;
var gHintUse = false;

// Init The Game
function initGame() {
    buildBoard(gSize);
    renderBoard(gBoard, '.content');
    renderHint();
}

function hint(element) {
    if (!gGameIsOn) return;
    element.style.display = 'none';
    gHintUse = true;
}

// Check If Game Is Over (Lose Or Win)
function checkGameOver(i, j) {
    var elSmiley = document.querySelector('.smiley');
    // Lose!
    if (gBoard[i][j].value === MINE) {
        gGameIsOn = false;
        clearInterval(gInterval);
        elSmiley.src = 'pics/lose.png';
        var audioLose = new Audio('sound/lose.mp3');
        audioLose.play();
        var elHelp = document.querySelector('.help');
        elHelp.innerHTML = `<span style="font-size: 32px; font-weight: bold; color: #e74c3c">YOU LOSE!</span>`;
    }

    // Win!
    if (gShowCount === (gSize ** 2) - gMineCount &&
        gBoard[i][j].value !== MINE &&
        gBoard[i][j].value !== FLAG) {
        gGameIsOn = false;
        clearInterval(gInterval);
        elSmiley.src = 'pics/win.png';
        var audioWin = new Audio('sound/win.mp3');
        audioWin.play();
        var elHelp = document.querySelector('.help');
        elHelp.innerHTML = `<span style="font-size: 32px; font-weight: bold; color: #2ecc71">YOU WON!</span>`;
    }

}

// Restart Game Function
function restartGame(element) {
    var elSmiley = document.querySelector('.smiley');
    elSmiley.src = 'pics/normal.png';
    gGameIsOn = true;
    buildBoard(gSize);
    renderBoard(gBoard, '.content');
    gClickedCounter = 0;
    clearInterval(gInterval);
    document.querySelector('.timer span').innerText = '0';
    gShowCount = 0;
    gHintsCounter = 3;
    renderHint();
}

// Set The Level Of The Game
function setLevel(element) {
    gSize = element.className;
    restartGame()
    if (element.classList.contains('4')) {
        gMineCount = 2;
    } else if (element.classList.contains('8')) {
        gMineCount = 12;
    } else if (element.classList.contains('12')) {
        gMineCount = 30;
    }
}

function timer() {
    var timer = 1;
    gInterval = setInterval(() => {
        var elTimer = document.querySelector('.timer span');
        elTimer.innerText = timer++;
    }, 1000);
}

// If Right Click - FLAG
function flagCell(event, element) {
    if (!gGameIsOn) return;

    var cellClickedClass = getCellSep(element.classList[1]);
    var cellClicked = gBoard[cellClickedClass.i][cellClickedClass.j];
    var cellSep = getCellSep(getClassName(cellClickedClass));

    // If Right Clicked And No Flag
    if (gBoard[cellSep.i][cellSep.j].isShown) return;

    if (event.button === 2 && cellClicked.value !== FLAG) {
        if (gClickedCounter === 0) timer();

        gBoard[cellClickedClass.i][cellClickedClass.j].value = FLAG;

        renderCell({ i: cellClickedClass.i, j: cellClickedClass.j },
            gBoard[cellClickedClass.i][cellClickedClass.j].value);
        return;
    }

    // If Right Clicked And There Is Already A Flag
    if (event.button === 2 && cellClicked.value === FLAG) {
        gBoard[cellClickedClass.i][cellClickedClass.j].value = '';
        renderCell({ i: cellClickedClass.i, j: cellClickedClass.j }, '');
    }
}

// Close Hint Function
function closeHint(cellI, cellJ, elCell) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard.length || i < 0 || i >= gBoard.length) continue;
            if (i === cellI && j === cellJ) continue;

            // var clickedClassName = 
            var className = getClassName({ i: i, j: j })
            var elClass = document.querySelector('.' + className)

            if (gBoard[i][j].value !== FLAG) {
                gBoard[cellI][cellJ].isShown = false;
                gBoard[i][j].isShown = false;
                elClass.classList.remove('marked');
                elCell.classList.remove('marked');
                elClass.innerText = '';
                elCell.innerText = '';
                renderCell({ i: i, j: j }, '')
            }

        }
    }
}

// If Cell Clicked Function
function cellClicked(elCell, i, j) {
    if (!gGameIsOn) return;
    if (gBoard[i][j].value === FLAG) return;
    if (gBoard[i][j].isShown) return;

    if (!gHintUse) checkGameOver(i, j);

    if (gHintUse) {
        expandShown(i, j);
        setTimeout(closeHint, 2000, i, j, elCell)
        gHintUse = false;
    }

    if (gClickedCounter === 0) {
        timer();
        gCellIFirst = i;
        gCellJFirst = j;
        setRandomMine(gMineCount, gCellIFirst, gCellJFirst);
        setMinesNegsCount(gBoard);
    }

    if (!gBoard[i][j].value) {
        expandShown(i, j)
    }
    gClickedCounter++;

    gBoard[i][j].isShown = true;
    elCell.classList.add('marked');
    elCell.innerText = gBoard[i][j].lastValue;

    if (gHintUse) gShowCount++;
    else {
        gShowCount++;
        checkGameOver(i, j);
    }
}

function expandShown(cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard.length || i < 0 || i >= gBoard.length) continue;
            if (i === cellI && j === cellJ) continue;

            if (gBoard[i][j].value === MINE && !gHintUse) continue;

            var className = getClassName({ i: i, j: j });
            var elClass = document.querySelector('.' + className);

            if (gBoard[i][j].value !== FLAG && gBoard[i][j].value !== MINE) {
                if (!gBoard[i][j].isShown && !gHintUse) gShowCount++;
                gBoard[i][j].isShown = true;
                elClass.classList.add('marked');
                elClass.innerText = gBoard[i][j].value;
                renderCell({ i: i, j: j }, gBoard[i][j].value);
            }

        }
    }
}

// MINE HERE - ONLY FOR ME...

// Build board function
function buildBoard() {
    gBoard = [];
    for (var i = 0; i < gSize; i++) {
        gBoard.push([]);
        for (var j = 0; j < gSize; j++) {
            gBoard[i][j] = {
                value: '',
                lastValue: '',
                isShown: false
            };
        }
    }
    return gBoard;
}