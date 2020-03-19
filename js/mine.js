// How many negs around the bomb
function setMinesNegsCount(board) {
    var mineCounter = 0;

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {

            if (gBoard[i][j].value === MINE) continue;
            if (i + 1 < board.length && board[i + 1][j].value === MINE) mineCounter++;
            if (i - 1 >= 0 && board[i - 1][j].value === MINE) mineCounter++;
            if (i >= 0 && j + 1 < board.length && board[i][j + 1].value === MINE) mineCounter++;
            if (j - 1 >= 0 && board[i][j - 1].value === MINE) mineCounter++;
            if (i > 0 && j > 0 && board[i - 1][j - 1].value === MINE) mineCounter++;
            if (i + 1 < board.length && j + 1 < board.length && board[i + 1][j + 1].value === MINE) mineCounter++;
            if (i - 1 >= 0 && j + 1 < board.length && board[i - 1][j + 1].value === MINE) mineCounter++;
            if (j - 1 >= 0 && i + 1 < board.length && board[i + 1][j - 1].value === MINE) mineCounter++;

            // Update the model
            gBoard[i][j].value = mineCounter;
            gBoard[i][j].lastValue = mineCounter;

            if (gBoard[i][j].value === 0) {
                gBoard[i][j].value = '';
                gBoard[i][j].lastValue = '';
            }

            // Update the DOM
            // renderBoard(gBoard, '.content');

            // Restart the mine Counter
            mineCounter = 0;
        }
    }

}

// Set Random Mines if no mine there
function setRandomMine(mineNumber, cellI, cellJ) {
    for (var i = 0; i < mineNumber; i++) {
        var posI = getRandom(0, gBoard.length);
        var posJ = getRandom(0, gBoard[0].length);
        var cell = gBoard[posI][posJ];

        if (cell.value !== MINE && !cell.isShown) {
            if (posI !== cellI && posJ !== cellJ) {
                gBoard[posI][posJ].value = MINE;
                gBoard[posI][posJ].lastValue = MINE;
            } else i--;
        } else i--;
    }
}