document.addEventListener("DOMContentLoaded", function () {
    arrowKeyNav();
    cellInput();
});

function arrowKeyNav() {
    const sudokuGrid = document.getElementById("sudoku-grid");

    sudokuGrid.addEventListener("keydown", (event) => {

        let currentInput = sudokuGrid.querySelector("input");
        if (document.activeElement.classList.contains("sudoku-cell")) {
            currentInput = document.activeElement
        }
        const key = event.key;
        let move = false;

        switch (key) {
            case "ArrowUp":
                move = moveUp();
                break;
            case "ArrowDown":
                move = moveDown();
                break;
            case "ArrowLeft":
                move = moveLeft();
                break;
            case "ArrowRight":
                move = moveRight();
                break;
        }

        if (move) {
            event.preventDefault();
            currentInput.focus();
        }

        function moveUp() {
            const currentRowIndex = currentInput.parentNode.parentNode.rowIndex;
            if (currentRowIndex > 0) {
                currentInput = sudokuGrid.rows[currentRowIndex - 1].cells[currentInput.parentNode.cellIndex].querySelector("input");
                return true;
            }
            return false;
        }

        function moveDown() {
            const currentRowIndex = currentInput.parentNode.parentNode.rowIndex;
            if (currentRowIndex < sudokuGrid.rows.length - 1) {
                currentInput = sudokuGrid.rows[currentRowIndex + 1].cells[currentInput.parentNode.cellIndex].querySelector("input");
                return true;
            }
            return false;
        }

        function moveLeft() {
            const currentCellIndex = currentInput.parentNode.cellIndex;
            if (currentCellIndex > 0) {
                currentInput = currentInput.parentNode.parentNode.cells[currentCellIndex - 1].querySelector("input");
                return true;
            }
            return false;
        }

        function moveRight() {
            const currentCellIndex = currentInput.parentNode.cellIndex;
            if (currentCellIndex < currentInput.parentNode.parentNode.cells.length - 1) {
                currentInput = currentInput.parentNode.parentNode.cells[currentCellIndex + 1].querySelector("input");
                return true;
            }
            return false;
        }

    });
}

function cellInput() {
    const sudokuGrid = document.getElementById("sudoku-grid");
    sudokuGrid.addEventListener("keydown", (event) => {
        const key = event.key;

        // check if input is not a number
        if (key === "Backspace" || key === "Tab") {
            // allow keypress to occur

        } else if (isNaN(key)) {
            event.preventDefault();

        } else {
            // get current cell / input
            let currentInput = sudokuGrid.querySelector("input");
            if (document.activeElement.classList.contains("sudoku-cell")) {
                currentInput = document.activeElement;
            }

            // check cell input mode
            let inputMode = document.querySelector('input[name="cell-input-mode"]:checked').value;
            if (inputMode === "original") {
                // remove user-input class
                currentInput.classList.remove("user-input")

            } else if (inputMode === "user") {
                // add user-input class
                currentInput.classList.add("user-input")
            }

            // delete current value in cell
            currentInput.value = '';

            // allow keypress to occur (call nothing)
        }
    });
}

function sudokuHelper() {
    removeFeedback();
    const sudokuGrid = document.getElementById("sudoku-grid");
    let originalNumsArr, allNumsArr, solutionArr, errorsArr = [];
    originalNumsArr = getArrayFromSudoku(sudokuGrid, true);
    allNumsArr = getArrayFromSudoku(sudokuGrid, false);
    solutionArr = solveSudoku(originalNumsArr);

    if (solutionArr === false) {
        displayFeedback("Puzzle is unsolvable! Please make sure numbers were input correctly.", true);
        return;
    }

    // check if any user errors
    let diffFlag = false;
    [errorsArr, diffFlag] = diffSudokuArrays(allNumsArr, solutionArr);

    if (!diffFlag) {
        displayFeedback("No errors found - you're on the right track!", true);
        return;
    }

    // go through errors list, change class of corresponding input
    let cells = sudokuGrid.getElementsByTagName('input');
    errorsArr.forEach((userError, i) => {
        if (userError) {
            cells[i].classList.remove("user-input");
            cells[i].classList.add("user-error");
        }
    });

    displayFeedback("Errors have been marked!", true);
}

function sudokuSolution() {
    removeFeedback();
    const sudokuGrid = document.getElementById("sudoku-grid");
    let originalNumsArr = [];
    originalNumsArr = getArrayFromSudoku(sudokuGrid, true);
    originalNumsArr = solveSudoku(originalNumsArr);

    if (originalNumsArr === false) {
        displayFeedback("Puzzle cannot be solved", false);
        return;
    }

    // overwrite puzzle with solution
    let cells = sudokuGrid.getElementsByTagName('input');
    originalNumsArr.forEach((num, i) => {
        cells[i].classList.remove("user-input");
        cells[i].classList.remove("user-error");
        if (num > 0) cells[i].value = num;
    });
}

function loadDemo() {
    removeFeedback();
    loadSudokuFromArray(examples.Med1);
    document.getElementById("inlineRadio2").checked = true;
}

/**
 * Function to convert table element representing sudoku board to array
 * @param {table} tableElem Table element representing sudoku board
 * @param {boolean} inputType True to pull original numbers only, otherwise pull all numbers
 * @return {Array[Number]} A 1D array holding numbers in sudoku board
 */
function getArrayFromSudoku(tableElem, inputType) {
    let arr = [];
    let cells = tableElem.getElementsByTagName('input');
    let cellVal = 0;
    for (let cell of cells) {
        if (cell.value === '') {
            cellVal = 0;
        } else if (inputType && isUserCell(cell)) {
            cellVal = 0;
        } else {
            cellVal = Number(cell.value);
        }
        arr.push(cellVal);
    }
    return arr;
}

function isUserCell(inputElem) {
    return inputElem.classList.contains("user-input") || inputElem.classList.contains("user-error");
}

/**
 * Function to display puzzle feedback message
 * @param {string} msg Message to display
 * @param {boolean} sourceButton True if called from sudokuHelper, False if from sudokuSolution
 */
function displayFeedback(msg, sourceButton) {
    if (sourceButton) {
        document.getElementById("sudokuHelperFeedback").innerHTML = msg;
    } else {
        document.getElementById("sudokuSolutionFeedback").innerHTML = msg;
    }
}

function removeFeedback() {
    displayFeedback('', true);
    displayFeedback('', false);
}

function diffSudokuArrays(allNumsArr, solutionArr) {
    let diffArr = [];
    let diffFlag = false;
    allNumsArr.forEach((num, i) => {
        if (num === 0) {
            diffArr.push(false);
        } else {
            diffArr.push(num !== solutionArr[i]);
            diffFlag = diffFlag || num !== solutionArr[i]
        }

    });
    return [diffArr, diffFlag];
}

function loadSudokuFromArray(arr) {
    const sudokuGrid = document.getElementById("sudoku-grid");
    let cells = sudokuGrid.getElementsByTagName('input');
    arr.forEach((num, i) => {
        cells[i].classList.remove("user-input");
        cells[i].classList.remove("user-error");
        if (num === 0) {
            cells[i].value = ' ';
        } else {
            cells[i].value = num;
        }
    });
}

// actually solve sudoku (inspired by https://lisperator.net/blog/javascript-sudoku-solver/)
function solveSudoku(board) {
    let [index, choices] = cellWithLeastChoices(board);
    if (index == null) return board;
    for (let choice of choices) {
        board[index] = choice;
        let recursion = solveSudoku(board);
        if (recursion !== false) return board;
    }
    board[index] = 0;
    return false;
}

function cellWithLeastChoices(board) {
    let bestCellIndex, bestCellChoices, bestLen = 100;
    for (let i = 0; i < 81; i++) {
        if (board[i] === 0) {
            let choices = getChoices(board, i);
            if (choices.length < bestLen) {
                bestLen = choices.length;
                bestCellChoices = choices;
                bestCellIndex = i;
                if (bestLen == 0) break;
            }
        }
    }
    return [bestCellIndex, bestCellChoices];
}

function getChoices(board, index) {
    let choices = [];
    for (let num = 1; num <= 9; num++) {
        if (acceptable(board, index, num)) {
            choices.push(num);
        }
    }
    return choices;
}

function acceptable(board, index, value) {
    let { row, col } = indexToPos(index);

    // check column
    for (let i = 0; i < 9; i++)
        if (board[posToIndex(i, col)] === value) return false;

    // check row
    for (let i = 0; i < 9; i++)
        if (board[posToIndex(row, i)] === value) return false;

    // check box
    let cornerOfBoxRow = Math.floor(row / 3) * 3;
    let cornerOfBoxCol = Math.floor(col / 3) * 3;
    for (let r = cornerOfBoxRow; r < cornerOfBoxRow + 3; r++) {
        for (let c = cornerOfBoxCol; c < cornerOfBoxCol + 3; c++) {
            if (board[posToIndex(r, c)] === value) return false;
        }
    }

    return true;
}

// index -> { row, col }
function indexToPos(index) {
    return { row: Math.floor(index / 9), col: index % 9 };
}

// { row, col } -> index
function posToIndex(row, col) {
    return row * 9 + col;
}

const examples = {
    Med1: [
        0, 0, 0, 0, 0, 0, 0, 0, 6,
        0, 3, 0, 0, 7, 1, 0, 4, 0,
        0, 0, 0, 0, 0, 0, 8, 0, 0,

        0, 0, 0, 9, 0, 8, 0, 7, 1,
        1, 0, 3, 0, 0, 0, 0, 0, 0,
        0, 0, 2, 0, 3, 0, 9, 0, 0,

        5, 0, 7, 0, 0, 6, 0, 0, 0,
        2, 0, 0, 0, 0, 0, 7, 0, 0,
        0, 0, 1, 8, 0, 0, 0, 0, 2,
    ],
    Med1Soln: [
        7, 2, 4, 3, 8, 9, 1, 5, 6,
        6, 3, 8, 5, 7, 1, 2, 4, 9,
        9, 1, 5, 6, 4, 2, 8, 3, 7,

        4, 5, 6, 9, 2, 8, 3, 7, 1,
        1, 9, 3, 7, 6, 4, 5, 2, 8,
        8, 7, 2, 1, 3, 5, 9, 6, 4,

        5, 8, 7, 2, 9, 6, 4, 1, 3,
        2, 6, 9, 4, 1, 3, 7, 8, 5,
        3, 4, 1, 8, 5, 7, 6, 9, 2,

    ],
    Med2: [
        0, 0, 0, 0, 1, 7, 2, 0, 0,
        0, 0, 0, 4, 0, 0, 0, 0, 0,
        0, 0, 9, 0, 0, 3, 0, 0, 0,

        4, 0, 0, 7, 8, 0, 5, 0, 0,
        0, 2, 5, 0, 0, 0, 8, 0, 0,
        0, 0, 0, 6, 0, 0, 0, 0, 0,

        6, 0, 1, 5, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 6, 0, 3, 0,
        2, 0, 0, 0, 0, 1, 7, 0, 4,
    ],
    Med3: [
        9, 0, 0, 5, 0, 1, 7, 0, 0,
        2, 0, 1, 0, 0, 9, 0, 0, 0,
        0, 0, 0, 8, 7, 0, 0, 9, 0,

        0, 8, 0, 0, 6, 4, 0, 7, 0,
        0, 0, 0, 0, 0, 0, 2, 1, 0,
        0, 0, 0, 0, 9, 0, 0, 0, 0,

        7, 0, 6, 2, 4, 0, 0, 0, 0,
        0, 4, 0, 0, 0, 0, 0, 0, 6,
        1, 0, 0, 0, 0, 0, 0, 4, 0,
    ],
    Med4: [
        0, 0, 0, 0, 3, 0, 5, 7, 0,
        0, 0, 2, 0, 0, 8, 0, 0, 0,
        6, 0, 0, 0, 0, 0, 0, 0, 0,

        0, 3, 0, 5, 7, 0, 0, 4, 0,
        0, 0, 0, 4, 0, 0, 0, 0, 2,
        0, 0, 5, 6, 0, 0, 7, 1, 8,

        0, 7, 8, 0, 0, 0, 0, 0, 0,
        0, 0, 6, 7, 0, 9, 0, 0, 1,
        0, 0, 0, 0, 0, 0, 0, 2, 0,
    ],
    Hard1: [
        8, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 3, 6, 0, 0, 0, 0, 0,
        0, 7, 0, 0, 9, 0, 2, 0, 0,

        0, 5, 0, 0, 0, 7, 0, 0, 0,
        0, 0, 0, 0, 4, 5, 7, 0, 0,
        0, 0, 0, 1, 0, 0, 0, 3, 0,

        0, 0, 1, 0, 0, 0, 0, 6, 8,
        0, 0, 8, 5, 0, 0, 0, 1, 0,
        0, 9, 0, 0, 0, 0, 4, 0, 0,
    ],
    Hard2: [
        0, 0, 3, 9, 0, 0, 0, 0, 0,
        4, 0, 0, 0, 8, 0, 0, 3, 6,
        0, 0, 8, 0, 0, 0, 1, 0, 0,

        0, 4, 0, 0, 6, 0, 0, 7, 3,
        8, 0, 0, 0, 0, 0, 0, 1, 0,
        0, 0, 0, 0, 0, 2, 0, 0, 0,

        0, 0, 4, 0, 7, 0, 0, 6, 8,
        6, 0, 0, 0, 0, 0, 0, 0, 0,
        7, 0, 0, 0, 0, 0, 5, 0, 0,
    ],
    Hard3: [
        0, 0, 0, 8, 0, 1, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 4, 3,
        5, 0, 0, 0, 0, 0, 0, 0, 0,

        0, 0, 0, 0, 7, 0, 8, 0, 0,
        0, 0, 0, 0, 0, 0, 1, 0, 0,
        0, 2, 0, 0, 3, 0, 0, 0, 0,

        6, 0, 0, 0, 0, 0, 0, 7, 5,
        0, 0, 3, 4, 0, 0, 0, 0, 0,
        0, 0, 0, 2, 0, 0, 6, 0, 0,
    ],
    Temp1: [
        0, 0, 0, 7, 4, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 5, 0, 0, 0,
        0, 1, 0, 0, 0, 0, 0, 0, 5,

        3, 0, 0, 2, 0, 0, 0, 0, 0,
        0, 2, 8, 0, 0, 0, 0, 5, 4,
        0, 0, 5, 0, 6, 0, 8, 9, 0,

        4, 3, 0, 9, 0, 7, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 6,
        8, 0, 0, 0, 0, 2, 0, 3, 0,
    ],
    Temp2: [
        0, 0, 0, 0, 0, 6, 0, 8, 5,
        0, 0, 3, 0, 0, 0, 9, 0, 7,
        0, 1, 0, 0, 4, 0, 0, 0, 0,

        1, 8, 0, 9, 0, 0, 0, 0, 0,
        0, 0, 7, 0, 0, 0, 3, 0, 0,
        0, 4, 0, 0, 0, 0, 0, 0, 0,

        8, 0, 0, 7, 6, 0, 0, 3, 0,
        0, 0, 0, 0, 0, 1, 0, 0, 9,
        0, 0, 0, 0, 9, 4, 2, 0, 0,
    ],
    Temp3: [
        0, 0, 0, 0, 0, 0, 5, 2, 8,
        4, 7, 0, 0, 1, 0, 0, 0, 0,
        0, 0, 3, 8, 0, 0, 0, 0, 0,

        0, 0, 1, 7, 8, 0, 0, 0, 3,
        0, 0, 0, 0, 0, 0, 0, 9, 0,
        0, 0, 0, 0, 4, 0, 0, 0, 1,

        0, 0, 0, 9, 5, 8, 7, 0, 0,
        5, 0, 0, 0, 0, 3, 0, 0, 0,
        0, 2, 0, 0, 0, 0, 6, 0, 0,
    ],
    Temp4: [
        0, 0, 0, 0, 0, 0, 4, 0, 3,
        0, 0, 0, 6, 0, 0, 0, 0, 0,
        0, 0, 0, 8, 0, 0, 0, 0, 0,

        0, 0, 0, 9, 0, 0, 0, 8, 0,
        0, 2, 0, 0, 0, 0, 0, 9, 0,
        0, 7, 0, 0, 1, 0, 0, 0, 0,

        5, 0, 0, 0, 4, 0, 1, 0, 0,
        8, 0, 0, 0, 0, 0, 3, 0, 0,
        9, 0, 6, 0, 0, 0, 0, 0, 0,
    ],
    Temp5: [
        0, 0, 0, 0, 7, 0, 8, 0, 0,
        6, 0, 0, 0, 0, 0, 0, 0, 3,
        0, 0, 0, 0, 0, 0, 5, 0, 0,

        5, 0, 0, 3, 0, 0, 1, 0, 0,
        9, 0, 0, 6, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 9, 0, 0, 0,

        0, 4, 7, 0, 0, 0, 0, 9, 0,
        0, 8, 0, 0, 1, 0, 0, 0, 0,
        0, 0, 0, 5, 0, 0, 0, 0, 0,
    ],
    Temp6: [
        0, 8, 0, 0, 0, 0, 5, 0, 0,
        9, 0, 0, 3, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0,

        0, 5, 0, 0, 4, 0, 8, 0, 0,
        0, 0, 0, 7, 0, 0, 0, 3, 0,
        6, 1, 0, 0, 0, 0, 0, 0, 0,

        0, 0, 0, 0, 5, 0, 1, 0, 0,
        3, 0, 0, 9, 0, 0, 0, 0, 0,
        7, 0, 0, 0, 0, 0, 0, 0, 8,
    ],
    Temp7: [
        0, 5, 0, 0, 0, 0, 9, 3, 0,
        4, 0, 0, 8, 0, 0, 2, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0,

        0, 2, 0, 0, 0, 3, 0, 0, 0,
        0, 0, 0, 0, 5, 0, 0, 7, 0,
        9, 0, 0, 0, 0, 0, 0, 0, 4,

        7, 0, 6, 4, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 3, 0, 0,
        0, 0, 0, 7, 0, 0, 0, 0, 0,
    ],
    Temp8: [
        0, 0, 0, 0, 0, 0, 0, 8, 3,
        0, 9, 0, 1, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0,

        0, 0, 0, 0, 3, 5, 1, 0, 0,
        8, 0, 0, 0, 7, 0, 0, 0, 0,
        0, 6, 0, 0, 0, 0, 9, 0, 0,

        0, 0, 0, 6, 0, 0, 4, 9, 0,
        3, 0, 0, 4, 0, 0, 0, 0, 0,
        7, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    Temp9: [
        0, 0, 0, 0, 4, 0, 6, 9, 0,
        3, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 5, 0, 0,

        0, 0, 0, 5, 0, 1, 0, 0, 8,
        0, 0, 7, 3, 0, 0, 0, 0, 0,
        0, 4, 0, 0, 0, 0, 9, 0, 0,

        1, 0, 0, 0, 0, 0, 0, 0, 3,
        0, 9, 0, 0, 0, 0, 0, 7, 0,
        0, 0, 0, 8, 0, 0, 0, 0, 0,
    ]
};