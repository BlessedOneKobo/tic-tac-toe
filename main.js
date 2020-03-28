// Javascript implementation of Tic-tac-toe
// The entry point for the game is at the event handler 
// for the click of the start button

// Player Factory
function createPlayer(symbol, name) {
  let moves = 0;

  function getMoves() {
    return moves;
  }

  function updateMoves() {
    moves += 1;
    return moves;
  }

  function resetMoves() {
    moves = 0;
  }

  function getSymbol() {
    return symbol;
  }

  function getName() {
    return name || symbol;
  }

  function setName(newName) {
    if (newName.trim() !== '') name = newName;
    return name;
  }

  return {getMoves, updateMoves, resetMoves, getSymbol, getName, setName};
}


// Board Module - manages the internal state of the board
const gameBoard = (function() {
  const EMPTY_SYMBOL = '#';
  const size = 3;

  // Stores the total number of symbols for each player in each section
  // (i.e horizontal, vertical, and diagonal)
  let player1Total = 0;
  let player2Total = 0;

  let representation = [
    [EMPTY_SYMBOL, EMPTY_SYMBOL, EMPTY_SYMBOL],
    [EMPTY_SYMBOL, EMPTY_SYMBOL, EMPTY_SYMBOL],
    [EMPTY_SYMBOL, EMPTY_SYMBOL, EMPTY_SYMBOL]
  ];

  function _checkBoundsValidity(row, col) {
    return (0 <= row && row < size) && (0 <= col && col < size);
  }

  function _updatePlayerTotals(row, col) {
    switch(representation[row][col]) {
      case 'X': ++player1Total; break;
      case 'O': ++player2Total; break;
    }
  }

  function _resetPlayerTotals() {
    player1Total = player2Total = 0;
  } 

  function _determineWinnerSymbol() {
    if (player1Total === size) {
      return 'X';
    } else if (player2Total === size) {
      return 'O';
    }

    return null;
  }

  function _checkHorizontalSections() {
    for (let col = 0; col < size; col++) {
      _resetPlayerTotals();
      for (let row = 0; row < size; row++) {
        _updatePlayerTotals(row, col);
      }

      const winner = _determineWinnerSymbol();
      if (winner) return winner;
    }

    return null;
  }

  function _checkVerticalSections() {
    for (let row = 0; row < size; row++) {
      _resetPlayerTotals();
      for (let col = 0; col < size; col++) {
        _updatePlayerTotals(row, col);
      }

      const winner = _determineWinnerSymbol();
      if (winner) return winner;
    }

    return null;
  }

  function _checkDiagonalSections() {
    let winnerSymbol, player1Total, player2Total;

    // Check top-left diagonal
    _resetPlayerTotals();
    for (let row = 0, col = 0; row < size; row++, col++) {
      _updatePlayerTotals(row, col);
    }

    winnerSymbol = _determineWinnerSymbol();
    if (winnerSymbol) return winnerSymbol;

    // Check top-right diagonal
    _resetPlayerTotals();
    for (let row = 0, col = size - 1; row < size; row++, col--) {
      _updatePlayerTotals(row, col);
    }

    return _determineWinnerSymbol();
  }

  function getRepresentation() {
    return representation;
  }

  function getValueAt(row, col) {
    if (_checkBoundsValidity(row, col)) return representation[row][col];
  }

  function setValueAt(row, col, playerObject) {
    if (getValueAt(row, col) === EMPTY_SYMBOL) {
      representation[row][col] = playerObject.getSymbol();
      return true;
    }

    return false;
  }

  function getWinnerSymbol() {
    let status = _checkHorizontalSections();
    if (status) return status;

    status = _checkVerticalSections();
    if (status) return status;

    return _checkDiagonalSections();
  }

  function getEmptySymbol() {
    return EMPTY_SYMBOL;
  }

  function clear() {
    representation.forEach((rowValue, rowIndex) => {
      rowValue.forEach((colValue, colIndex) => {
        representation[rowIndex][colIndex] = EMPTY_SYMBOL;
      });
    });
  }

  return {
    getRepresentation,
    getValueAt,
    setValueAt,
    clear,
    getWinnerSymbol,
    getEmptySymbol
  };
})();


// Game State Module - manages the gameplay
const gameState = (function() {
  const MOVES_FOR_DRAW = 9;
  const MOVES_FOR_WIN = 3;
  const players = [createPlayer('X'), createPlayer('O')];
  let currentPlayerIndex = 0;
  let currentPlayer = players[currentPlayerIndex];
  let gameIsRunning = false;

  // Initialization
  players.forEach((player, index) => {
    const nameFromLocalStorage = localStorage.getItem(index);

    // Clearing the browser history sets the value of all
    // localStorage items to the string 'undefined'
    if (nameFromLocalStorage && nameFromLocalStorage !== 'undefined') {
      player.setName(nameFromLocalStorage);
    }
  });

  function _calculateTotalMoves() {
    return players.reduce((acc, cur) => acc + cur.getMoves(), 0);
  }

  function _updateCurrentPlayer() {
    currentPlayerIndex = (currentPlayerIndex + 1) % 2;
    currentPlayer = players[currentPlayerIndex];
  }

  function _resetCurrentPlayer() {
    currentPlayerIndex = 0;
    currentPlayer = players[currentPlayerIndex];
  }

  function updateNames(names) {
    names.forEach((name, index) => {
      const newName = players[index].setName(name);
      localStorage.setItem(index, newName);
    });
  }

  function placeSymbolForCurrentPlayer(row, col) {
    let update = {win: false, draw: false};
    if (gameIsRunning) {
      const placementIsValid = gameBoard.setValueAt(row, col, currentPlayer);
      if (placementIsValid) {
        if (currentPlayer.updateMoves() >= MOVES_FOR_WIN) {
          if (gameBoard.getWinnerSymbol() === currentPlayer.getSymbol()) {
            update.win = true;
          } else if (_calculateTotalMoves() === MOVES_FOR_DRAW) {
            update.draw = true;
          }
        }

        if (update.win || update.draw) gameIsRunning = false;
        else                           _updateCurrentPlayer();
      }
    }

    return update;
  }

  function isRunning() {
    return gameIsRunning;
  }

  function play() {
    if (!gameIsRunning) gameIsRunning = true;
  }

  function reset() {
    gameIsRunning = true;
    gameBoard.clear();
    _resetCurrentPlayer();
    players.forEach((player) => player.resetMoves());
  }

  function getCurrentPlayerName() {
    return currentPlayer.getName();
  }

  return {
    play,
    reset,
    isRunning,
    updateNames,
    getCurrentPlayerName,
    placeSymbolForCurrentPlayer,
  };
})();


// Display Module - manages user interaction
const displayController = (function(boardElement, gameBoardObj, gameStateObj) {

  // Page elements
  const containerElement = document.querySelector('.container');
  const headingElement = document.querySelector('h1');
  const formDisplayToggleBtn = document.querySelector('.name-form-display');
  const formElement = document.querySelector('form');
  const formInputFields = [...formElement.children].filter((field) => {
    return field.nodeName === 'INPUT';
  });
  const startBtn = document.querySelector('.start-reset-btn');
  const messageElement = document.querySelector('.message');

  // Event listeners
  formDisplayToggleBtn.addEventListener('click', _toggleFormDisplay);
  startBtn.addEventListener('click', _handleStartBtnClick);
  formElement.addEventListener('submit', _handleFormSubmission);

  // Event handlers
  function _toggleFormDisplay() {
    if (_checkIfFormIsHidden()) {
      _showForm();
    } else {
      _hideForm();
    }
  }

  function _handleStartBtnClick() {
    _hideElement(messageElement);
    if (startBtn.textContent === 'Reset') {
      gameStateObj.reset();
    } else {
      gameStateObj.play();
      _changeToGameStartDisplay();
    }

    if (!_checkIfFormIsHidden()) {
      gameStateObj.updateNames(_retrieveNames());
      _hideForm();
    }

    _renderBoard();
  }

  function _handleFormSubmission(e) {
    e.preventDefault();
    gameStateObj.updateNames(_retrieveNames());
    _hideForm();
    if (!gameStateObj.isRunning()) _changeToGameStartDisplay();
    gameStateObj.play();
  }

  function _handleTileElementClick(e) {
    // Stores/used to check if the result of the game has been determined
    // (i.e if there the game is a draw or if there is a winner)
    let status = {win: false, draw: false};

    if (gameStateObj.isRunning()) {
      _hideElement(messageElement);
      let [row, col] = _getTileIndex(e.target);
      status = gameStateObj.placeSymbolForCurrentPlayer(row, col);
    }

    if (status.win) {
      const winnerName = gameStateObj.getCurrentPlayerName();
      _renderWinnerMessage(winnerName);
    } else if (status.draw) {
      _renderDrawMessage();
    }

    _renderBoard();
  }

  // Helper functions
  function _showElement(elem, value) {
    elem.classList.remove('hidden');
    if (value) elem.style.display = value;
  }

  function _hideElement(elem) {
    elem.classList.add('hidden');
  }

  function _swapElementClass(elem, before, after) {
    elem.classList.remove(before);
    elem.classList.add(after);
  }

  function _setDataAttribs(elem, obj) {
    Object.keys(obj).forEach((key) => elem.dataset[key] = obj[key]);
  }

  function _checkIfFormIsHidden() {
    return [...formElement.classList].includes('hidden');
  }

  function _showForm() {
    formDisplayToggleBtn.textContent = 'Close'
    _swapElementClass(formDisplayToggleBtn, 'update-names', 'close');
    _showElement(formElement);
  }

  function _hideForm() {
    formInputFields.forEach((f) => f.value = '');
    formDisplayToggleBtn.textContent = 'Update Player Names';
    _swapElementClass(formDisplayToggleBtn, 'close', 'update-names');
    _hideElement(formElement);
  }

  function _retrieveNames() {
    return formInputFields.map((inputField) => inputField.value);
  }

  function _resetBoardElement() {
    containerElement.removeChild(boardElement);
    boardElement = document.createElement('div');
    boardElement.id = 'board';
    boardElement.classList.add('display-row');
  }

  function _getTileIndex(tileElement) {
    return [tileElement.dataset.rowIndex, tileElement.dataset.colIndex];
  }

  function _changeToGameStartDisplay() {
    _showElement(boardElement);
    _hideElement(headingElement);
    startBtn.textContent = 'Reset';
    _swapElementClass(startBtn, 'start', 'reset');
  }

  function _renderBoard() {
    // Recreate all DOM elements with updated values
    _resetBoardElement();
    gameBoardObj.getRepresentation().forEach((rowValue, rowIndex) => {
      const rowElement = document.createElement('div');
      rowElement.classList.add('row');
      rowValue.forEach((colValue, colIndex) => {
        const tileElement = document.createElement('span');
        if (colValue === gameBoardObj.getEmptySymbol()) {
          tileElement.style.color = 'transparent';
        }

        tileElement.classList.add('tile');
        _setDataAttribs(tileElement, {rowIndex, colIndex, 'symbol': colValue});
        tileElement.textContent = colValue;
        tileElement.addEventListener('click', _handleTileElementClick);
        rowElement.appendChild(tileElement);
      });

      boardElement.appendChild(rowElement);
    });

    containerElement.appendChild(boardElement);
  }

  function _renderWinnerMessage(winnerName) {
    messageElement.textContent = winnerName + ' wins';
    _showElement(messageElement);
  }

  function _renderDrawMessage() {
    messageElement.textContent = 'It\'s a draw';
    _showElement(messageElement);
  }
})(document.getElementById('board'), gameBoard, gameState);
