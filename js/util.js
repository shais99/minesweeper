function renderBoard(mat, selector) {
    var strHTML = `<table><tbody>`;
    for (var i = 0; i < mat.length; i++) {
        strHTML += `<tr>`;
        for (var j = 0; j < mat[0].length; j++) {
            var cell = (mat[i][j].isShown) ? mat[i][j].lastValue : EMPTY
            var className = `cell cell-${i}-${j}`;
            strHTML += `<td onmousedown="flagCell(event, this)" onclick="cellClicked(this, ${i}, ${j})" class="${className}">${cell}</td>`;
        }
        strHTML += `</tr>`
    }
    strHTML += `</tbody></table>`;
    var elContent = document.querySelector(selector);
    elContent.innerHTML = strHTML;
}

// Render Hint Function
function renderHint() {
    var elHint = document.querySelector('.hints');
    var strHTML = ``
    for (; gHintsCounter > 0; gHintsCounter--) {
        strHTML += `<li onclick="hint(this)"><img src="pics/hint.png" /></li>`
    }
    elHint.innerHTML = strHTML;
}

// Render Safe Click Function
function renderSafeClick() {
    var elSafeClick = document.querySelector('.safe-clicks');
    var strHTML = ``
    for (; gSafeClickCounter > 0; gSafeClickCounter--) {
        strHTML += `<li onclick="safeClick(this)"></li>`;
    }
    elSafeClick.innerHTML = strHTML;
}

// Render Cell Function
function renderCell(location, value) {
    var elCell = document.querySelector(`.cell-${location.i}-${location.j}`);
    elCell.innerText = value;
}

// Get Random Function
function getRandom(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

// Get Cell Object - Only Numbers
function getCellSep(strCellClass) {
    var parts = strCellClass.split('-');
    var cellCrop = { i: +parts[1], j: +parts[2] };
    return cellCrop;
}

// Get Class Name Function
function getClassName(location) {
    var cellClass = 'cell-' + location.i + '-' + location.j;
    return cellClass;
}