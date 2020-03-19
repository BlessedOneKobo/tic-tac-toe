// Board Module
const gameBoard = (function() {
  const EMPTY = '#';
  const size = 3;

  // Total number of symbols for each player in each section
  let player1Total = 0;
  let player2Total = 0;

  let representation = [
    [EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY]
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
    if (getValueAt(row, col) === EMPTY) {
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

  function clear() {
    representation.forEach((rowValue, rowIndex) => {
      rowValue.forEach((colValue, colIndex) => {
        representation[rowIndex][colIndex] = EMPTY;
      });
    });
  }

  return {
    getRepresentation, getValueAt, setValueAt, getWinnerSymbol, clear, EMPTY
  };
})();


// Display Module
const displayController = (function(boardElement, gameBoardObject) {
  // Page elements
  const containerElement = document.querySelector('.container');
  const headingElement = document.querySelector('h1');
  const formDisplayToggleBtn = document.querySelector('.name-form-display');
  const form = document.querySelector('form');
  const inputFields = [...form.children].filter((f) => f.nodeName === 'INPUT');
  const startBtn = document.querySelector('.start-reset-btn');
  const messageElement = document.querySelector('.message');

  // Event listeners
  formDisplayToggleBtn.addEventListener('click', _toggleFormDisplay);
  startBtn.addEventListener('click', _handleStartBtnClick);
  form.addEventListener('submit', _handleFormSubmission);

  function _toggleFormDisplay() {
    if (_checkIfFormIsHidden()) {
      _showForm();
    } else {
      _hideForm();
    }
  }

  function _checkIfFormIsHidden() {
    return [...form.classList].includes('hidden');
  }

  function _handleStartBtnClick() {
    _hideElement(messageElement);
    if (startBtn.textContent === 'Reset') {
      game.restart();
    } else {
      game.play();
      _changeToGameStartDisplay();
    }

    if (!_checkIfFormIsHidden()) {
      game.updateNames(_retrieveNames());
      _hideForm();
    }
  }

  function _handleFormSubmission(e) {
    e.preventDefault();
    game.updateNames(_retrieveNames());
    _hideForm();
    if (!game.isRunning()) _changeToGameStartDisplay();
    game.play();
  }

  function _changeToGameStartDisplay() {
    _showElement(boardElement);
    _hideElement(headingElement);
    startBtn.textContent = 'Reset';
    _swapElementClass(startBtn, 'start', 'reset');
  }

  function _setDataAttribs(elem, obj) {
    Object.keys(obj).forEach((key) => elem.dataset[key] = obj[key]);
  }

  function _showForm() {
    formDisplayToggleBtn.textContent = 'Close'
    _swapElementClass(formDisplayToggleBtn, 'update-names', 'close');
    _showElement(form);
  }

  function _hideForm() {
    // Clear input fields
    inputFields.forEach((f) => f.value = '');
    formDisplayToggleBtn.textContent = 'Update Player Names';
    _swapElementClass(formDisplayToggleBtn, 'close', 'update-names');
    _hideElement(form);
  }

  function _swapElementClass(elem, before, after) {
    elem.classList.remove(before);
    elem.classList.add(after);
  }

  function _showElement(elem, value) {
    elem.classList.remove('hidden');
    if (value) elem.style.display = value;
  }

  function _hideElement(elem) {
    elem.classList.add('hidden');
  }

  function _retrieveNames() {
    return inputFields.map((f) => f.value);
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

  function _handleTileElementClick(e) {
    if (game.isRunning()) {
      _hideElement(messageElement);
      let [row, col] = _getTileIndex(e.target);
      game.placeSymbolForCurrentPlayer(row, col);
    }

    renderBoard();
  }

  function renderBoard() {
    // Recreate all DOM elements with updated values
    _resetBoardElement();
    gameBoardObject.getRepresentation().forEach((rowValue, rowIndex) => {
      const rowElement = document.createElement('div');
      rowElement.classList.add('row');
      rowValue.forEach((colValue, colIndex) => {
        const tileElement = document.createElement('span');
        if (colValue === gameBoardObject.EMPTY) tileElement.style.color = 'transparent';
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

  function renderWinnerMessage(winnerName) {
    messageElement.textContent = winnerName + ' wins';
    _showElement(messageElement);
  }

  function renderDrawMessage() {
    messageElement.textContent = 'It\'s a draw';
    _showElement(messageElement);
  }

  return {renderBoard, renderWinnerMessage, renderDrawMessage};
})(document.getElementById('board'), gameBoard);


// Game State Module
const game = (function() {
  const movesForDraw = 9;
  const movesForWin = 3;
  const players = [createPlayer('X'), createPlayer('O')];
  let currentPlayerIndex = 0;
  let currentPlayer = players[currentPlayerIndex];
  let gameIsRunning = false;

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
  
  function _reset() {
    gameIsRunning = true;
    gameBoard.clear();
    _resetCurrentPlayer();
    players.forEach((player) => player.resetMoves());
  }

  function _declareWinner() {
    displayController.renderWinnerMessage(currentPlayer.getName());
    gameIsRunning = false;
  }

  function _declareDraw() {
    displayController.renderDrawMessage();
    gameIsRunning = false;
  }

  function updateNames(names) {
    names.forEach((name, index) => players[index].setName(name));
  }

  function placeSymbolForCurrentPlayer(row, col) {
    if (gameIsRunning) {
      const placementIsValid = gameBoard.setValueAt(row, col, currentPlayer);
      if (placementIsValid) {
        if (currentPlayer.updateMoves() >= movesForWin) {
          if (gameBoard.getWinnerSymbol() === currentPlayer.getSymbol()) {
            _declareWinner();
          } else if (_calculateTotalMoves() === movesForDraw) {
            _declareDraw();
          }
        }

        _updateCurrentPlayer();
      }
    }
  }

  function isRunning() {
    return gameIsRunning;
  }

  function play() {
    if (!gameIsRunning) gameIsRunning = true;
    displayController.renderBoard();
  }

  function restart() {
    _reset();
    displayController.renderBoard();
  }

  return {updateNames, placeSymbolForCurrentPlayer, play, restart, isRunning};
})();


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
