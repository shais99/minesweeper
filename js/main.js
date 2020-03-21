'use strict';
const MINE = '💣';
const FLAG = '🚩';
const EMPTY = '';

// Global Variables
var gBoard;
var gClickedCounter = 0;
var gInterval;
var gHintsCounter = 3;
var gSafeClickCounter = 3;
var gCellIFirst;
var gCellJFirst;
var gHintUse = false;
var gHintCells = [];
var gTimer;
var gLevel = {
    size: 4,
    mines: 2
}
var gGame = {
    isOn: true,
    shownCount: 0,
}
var gManuallyMode = {
    isOn: false,
    boardSize: null,
    numOfMine: null
}
var gLifeCount = 3;
var gElLifeCount = document.querySelector('.life-count');

// Init The Game
function initGame() {
    buildBoard(gLevel.size);
    renderBoard(gBoard, '.content');
    renderHint();
    renderSafeClick();
    showLife();
    showBestScore();
}

function showBestScore() {

    var elBestScore = document.querySelector('.best-score');

    if (parseInt(gLevel.size) === 4 && gLevel.mines === 2) {
        elBestScore.innerText = localStorage.getItem('bestScoreEasy');

    } else if (parseInt(gLevel.size) === 8 && gLevel.mines === 12) {
        elBestScore.innerText = localStorage.getItem('bestScoreMedium');

    } else if (parseInt(gLevel.size) === 12 && gLevel.mines === 30) {
        elBestScore.innerText = localStorage.getItem('bestScoreExpert');
    } else elBestScore.innerText = 'No best score for manually mode';

    if (gLevel.size === 4 && !localStorage.getItem('bestScoreEasy')) elBestScore.innerText = 'Not set';
    if (gLevel.size === 8 && !localStorage.getItem('bestScoreMedium')) elBestScore.innerText = 'Not set';
    if (gLevel.size === 12 && !localStorage.getItem('bestScoreExpert')) elBestScore.innerText = 'Not set';


}

function showLife() {
    var lifeHTML = '';
    for (var i = 0; i < gLifeCount; i++) {
        lifeHTML += '❤️';
    }
    gElLifeCount.innerText = lifeHTML;
}

function hint(element) {
    if (!gGame.isOn) return;
    if (gClickedCounter === 0) return;

    element.style.display = 'none';
    gHintUse = true;
}

function safeClick(element) {
    if (!gGame.isOn) return;
    if (gClickedCounter === 0) return;

    element.style.display = 'none';

    var emptyCells = findEmptyCell();
    var randomEmptyCell = getRandom(0, emptyCells.length);
    randomEmptyCell = emptyCells[randomEmptyCell];


    // Showing the random cell
    gBoard[randomEmptyCell.i][randomEmptyCell.j].isShown = true;
    renderCell(randomEmptyCell, gBoard[randomEmptyCell.i][randomEmptyCell.j].lastValue);

    var className = getClassName(randomEmptyCell)
    var elCell = document.querySelector('.' + className);
    elCell.classList.add('marked'); // {i:3, j:2} BACK: cell-3-2

    // Hiding the random cell
    setTimeout(hideSafeClick, 2000, randomEmptyCell, elCell);

}

function hideSafeClick(cell, elCell) {
    gBoard[cell.i][cell.j].isShown = false;
    renderCell(cell, EMPTY);
    elCell.classList.remove('marked');
}

function findEmptyCell() {
    var emptyCells = [];
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var currCell = gBoard[i][j];
            if (currCell.value !== MINE && currCell.value !== FLAG && !currCell.isShown) {
                emptyCells.push({ i: i, j: j });
            }
        }
    }
    return emptyCells
}

// Check If Game Is Over (Lose Or Win)
function checkGameOver(i, j) {

    var elSmiley = document.querySelector('.smiley');
    var elHelp = document.querySelector('.help');

    // Lose!
    if (gBoard[i][j].lastValue === MINE) {
        if (gLifeCount !== 1) {
            gGame.shownCount--;
            gLifeCount--;
            elHelp.innerHTML = `<span style="font-size: 32px; font-weight: bold; color: #e74c3c">
                                ONLY <span class="life-number">${gLifeCount}</span> MORE LIFES LEFT, BE CAREFUL!</span>`;
            showLife();
        } else {
            gElLifeCount.innerText = '💔';
            gGame.isOn = false;
            clearInterval(gInterval);
            elSmiley.src = 'pics/lose.png';
            var audioLose = new Audio('sound/lose.mp3');
            audioLose.play();
            elHelp.innerHTML = `<span style="font-size: 32px; font-weight: bold; color: #e74c3c">YOU LOSE!</span><br />
                                Click on your face to restart the game`;
        }
    }

    // Win!
    if (gGame.shownCount === (gLevel.size ** 2) - gLevel.mines &&
        gBoard[i][j].lastValue !== MINE &&
        gBoard[i][j].lastValue !== FLAG) {
        setBestScore();
        showBestScore();
        gGame.isOn = false;
        clearInterval(gInterval);
        elSmiley.src = 'pics/win.png';
        var audioWin = new Audio('sound/win.mp3');
        audioWin.play();
        elHelp.innerHTML = `<span style="font-size: 32px; font-weight: bold; color: #2ecc71">YOU WON!</span>`;
    }

}

function setBestScore() {
    var currEasyBest = localStorage.getItem('bestScoreEasy');

    var currMediumBest = localStorage.getItem('bestScoreMedium');
    var currExpertBest = localStorage.getItem('bestScoreExpert');

    if (gTimer < currEasyBest || !currEasyBest && gLevel.size === 4) localStorage.setItem('bestScoreEasy', gTimer);
    else if (gTimer < currMediumBest || !currMediumBest && gLevel.size === 8) localStorage.setItem('bestScoreMedium', gTimer);
    else if (gTimer < currExpertBest || !currExpertBest && gLevel.size === 12) localStorage.setItem('bestScoreExpert', gTimer);
}

// Restart Game Function
function restartGame(element) {
    var elSmiley = document.querySelector('.smiley');
    elSmiley.src = 'pics/normal.png';
    gGame.isOn = true;
    buildBoard(gLevel.size);
    renderBoard(gBoard, '.content');
    gClickedCounter = 0;
    clearInterval(gInterval);
    document.querySelector('.timer span').innerText = '0';
    gGame.shownCount = 0;
    gHintsCounter = 3;
    renderHint();
    gLifeCount = 3;
    showLife();
    gSafeClickCounter = 3;
    renderSafeClick();
    var elHelp = document.querySelector('.help');
    elHelp.innerHTML = `<span style="font-size: 32px; font-weight: bold; color: #3498db">It's a new game!</span>`;
    gManuallyMode.isOn = false;
    gManuallyMode.boardSize = null;
    gManuallyMode.numOfMine = null;
}

// Set The Level Of The Game
function setLevel(element) {
    if (element.classList.contains('4')) {
        gLevel.size = parseInt(element.className);
        gLevel.mines = 2;
        restartGame();
        showBestScore();
    } else if (element.classList.contains('8')) {
        gLevel.size = parseInt(element.className);
        gLevel.mines = 12;
        restartGame();
        showBestScore();
    } else if (element.classList.contains('12')) {
        gLevel.size = parseInt(element.className);
        gLevel.mines = 30;
        restartGame();
        showBestScore();
    } else if (element.classList.contains('manually')) {
        gManuallyMode.isOn = true;
        while (isNaN(gManuallyMode.boardSize) ||
        gManuallyMode.boardSize === null ||
        gManuallyMode.boardSize === 0) {
            gManuallyMode.boardSize = +prompt('What is your board size?');
        }

        while (isNaN(gManuallyMode.numOfMine) ||
            gManuallyMode.numOfMine === null ||
            gManuallyMode.numOfMine > (gManuallyMode.boardSize ** 2)) {

            gManuallyMode.numOfMine = +prompt('How many mines do you want?');
        }

        gLevel.size = gManuallyMode.boardSize;
        gLevel.mines = gManuallyMode.numOfMine;
        restartGame();
        showBestScore();
    }
}

function timer() {
    gTimer = 1;
    gInterval = setInterval(() => {
        var elTimer = document.querySelector('.timer span');
        elTimer.innerText = gTimer++;
    }, 1000);
}

// If Right Click - FLAG
function flagCell(event, element) {
    if (!gGame.isOn) return;
    if (gClickedCounter === 0) return;

    var cellClickedClass = getCellSep(element.classList[1]);
    var cellClicked = gBoard[cellClickedClass.i][cellClickedClass.j];
    var cellSep = getCellSep(getClassName(cellClickedClass));

    // If Right Clicked And No Flag
    if (gBoard[cellSep.i][cellSep.j].isShown) return;

    if (event.button === 2 && cellClicked.value !== FLAG) {

        gBoard[cellClickedClass.i][cellClickedClass.j].value = FLAG;

        renderCell({ i: cellClickedClass.i, j: cellClickedClass.j },
            gBoard[cellClickedClass.i][cellClickedClass.j].value);
        return;
    }

    // If Right Clicked And There Is Already A Flag
    if (event.button === 2 && cellClicked.value === FLAG) {
        gBoard[cellClickedClass.i][cellClickedClass.j].value = gBoard[cellClickedClass.i][cellClickedClass.j].lastvalue;
        renderCell({ i: cellClickedClass.i, j: cellClickedClass.j }, EMPTY);
    }
}

// Close Hint Function
function closeHint(cellI, cellJ, elCell) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard.length || i < 0 || i >= gBoard.length) continue;
            if (i === cellI && j === cellJ) continue;

            var className = getClassName({ i: i, j: j })
            var elClass = document.querySelector('.' + className)


            gBoard[cellI][cellJ].isShown = false;
            gBoard[i][j].isShown = false;

            elClass.classList.remove('marked');
            elCell.classList.remove('marked');

            elClass.innerText = EMPTY;
            elCell.innerText = EMPTY;
        }
    }

    // Setting back to true for the cells that were true before
    for (var i = 0; i < gHintCells.length; i++) {

        var currI = gHintCells[i].i;
        var currJ = gHintCells[i].j;
        gBoard[currI][currJ].isShown = true;

        var className = getClassName({ i: currI, j: currJ })
        var elClass = document.querySelector('.' + className)

        elClass.classList.add('marked');

        renderCell({ i: currI, j: currJ }, gBoard[currI][currJ].lastValue);

    }
    gGame.shownCount--;
    gHintCells = []
}

// If Cell Clicked Function
function cellClicked(elCell, i, j) {

    if (!gGame.isOn) return;
    if (gBoard[i][j].value === FLAG) return;
    if (gBoard[i][j].isShown) return;
    if (gManuallyMode.isOn) {
        timer();
        gCellIFirst = i;
        gCellJFirst = j;
        setRandomMine(gLevel.mines, gCellIFirst, gCellJFirst);
        setMinesNegsCount(gBoard);
    }

    if (gHintUse) {
        expandShown(i, j);
        setTimeout(closeHint, 1000, i, j, elCell)
    }

    if (gClickedCounter === 0 && !gManuallyMode.isOn) {
        timer();
        gCellIFirst = i;
        gCellJFirst = j;
        setRandomMine(gLevel.mines, gCellIFirst, gCellJFirst);
        setMinesNegsCount(gBoard);
    }

    if (!gBoard[i][j].lastValue && !gHintUse) {
        expandShown(i, j)
    }
    gClickedCounter++;

    gBoard[i][j].isShown = true;
    elCell.classList.add('marked');
    renderCell({ i: i, j: j }, gBoard[i][j].lastValue);

    gGame.shownCount++;
    if (!gHintUse) checkGameOver(i, j);
    gHintUse = false;

}

function expandShown(cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard.length || i < 0 || i >= gBoard.length) continue;
            if (i === cellI && j === cellJ) continue;

            if (gBoard[i][j].lastValue === MINE && !gHintUse) continue;

            if (gHintUse && gBoard[i][j].isShown) {
                gHintCells.push({ i: i, j: j });
            }

            var className = getClassName({ i: i, j: j });
            var elClass = document.querySelector('.' + className);

            // if (gBoard[i][j].lastValue !== MINE) {
            if (!gBoard[i][j].isShown && !gHintUse) gGame.shownCount++;

            gBoard[i][j].isShown = true;
            elClass.classList.add('marked');

            renderCell({ i: i, j: j }, gBoard[i][j].lastValue);
            // }

        }
    }

}

// Build board function
function buildBoard() {
    gBoard = [];
    for (var i = 0; i < gLevel.size; i++) {
        gBoard.push([]);
        for (var j = 0; j < gLevel.size; j++) {
            gBoard[i][j] = {
                value: EMPTY,
                lastValue: EMPTY,
                isShown: false,
                isHint: false
            };
        }
    }
    return gBoard;
}