// Javascript implementation of Tic-tac-toe
// The entry point for the game is the splash screen function
// of the gameDisplay module

// Player Factory
function createPlayer(symbol, name) {
  let moves = 0;
  let type = 'human';

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

  function getType() {
    return type;
  }

  function setType(newType) {
    if (newType === 'human' || newType === 'computer') type = newType;
  }

  return {
    getMoves,
    updateMoves,
    resetMoves,
    getSymbol,
    getName,
    setName,
    getType,
    setType,
  };
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

  function _calculateRandomNumber(x, y) {
    return Math.floor(Math.random() * y) + x;
  }

  function _calculateRandomBoardPosition() {
    const randomRow = _calculateRandomNumber(0, MOVES_FOR_WIN);
    const randomCol = _calculateRandomNumber(0, MOVES_FOR_WIN);
    return {row: randomRow, col: randomCol};
  }

  function _updateGameStatus(status) {
    if (currentPlayer.updateMoves() >= MOVES_FOR_WIN) {
      if (gameBoard.getWinnerSymbol() === currentPlayer.getSymbol()) {
        status = {win: true, draw: false};
      } else if (_calculateTotalMoves() === MOVES_FOR_DRAW) {
        status = {win: false, draw: true};
      }
    }

    return status;
  }

  function _placeSymbolForComputer() {
    let status = {win: false, draw: false};
    while (true) {
      let {row, col} = _calculateRandomBoardPosition();
      const placementIsValid = gameBoard.setValueAt(row, col, currentPlayer);
      if (placementIsValid) {
        status = _updateGameStatus(status);
        break;
      }
    }

    return status;
  }

  function setOpponent(opponentType) {
    players[1].setType(opponentType);
  }

  function updateNames(names) {
    names.forEach((name, index) => {
      const newName = players[index].setName(name);
      localStorage.setItem(index, newName);
    });
  }

  function placeSymbolForCurrentPlayer(row, col) {
    let status = {win: false, draw: false};
    if (gameIsRunning) {
      const placementIsValid = gameBoard.setValueAt(row, col, currentPlayer);
      if (placementIsValid) {
        status = _updateGameStatus(status);
        if (status.win || status.draw) {
          gameIsRunning = false;
        } else {
          _updateCurrentPlayer();
          if (currentPlayer.getType() === 'computer') {
            status = _placeSymbolForComputer();
            if (status.win || status.draw) gameIsRunning = false;
            else                           _updateCurrentPlayer();
          }
        }
      }
    }

    return status;
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
    setOpponent,
  };
})();


// Display Module - manages user interaction
const displayController = (function(gameBoardObj, gameStateObj) {
  // Initialization
  const containerElement = document.querySelector('.container');
  _renderSplashScreen();

  // Event handlers
  function _toggleFormDisplay() {
    const formElement = document.querySelector('form');
    if (_checkIfElementIsHidden(formElement)) {
      _showForm();
    } else {
      _hideForm();
    }
  }

  function _handleStartResetBtnClick(e) {
    const startResetBtn = e.target;
    const messageElement = document.querySelector('.message');
    const formElement = document.querySelector('form');
    _hideElement(messageElement);
    if (startResetBtn.textContent === 'Reset') {
      gameStateObj.reset();
    } else {
      gameStateObj.play();
      _changeToGameStartDisplay();
    }

    if (!_checkIfElementIsHidden(formElement)) {
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
    const messageElement = document.querySelector('.message');
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

  function _handleOpponentSelection(e) {
    const selectedOpponent = e.target.dataset.opponent;
    const splashScreen = document.querySelector('.splash-screen');
    containerElement.removeChild(splashScreen);
    gameStateObj.setOpponent(selectedOpponent);
    _renderGameScreen(selectedOpponent);
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

  function _setElementAttribs(elem, obj) {
    Object.keys(obj).forEach((key) => elem.setAttribute(key, obj[key]));
  }

  function _appendChildren(parent, ...children) {
    children.forEach((child) => parent.appendChild(child));
  }

  function _checkIfElementIsHidden(elem) {
    if (elem) return [...elem.classList].includes('hidden');
    return true;
  }

  function _showForm() {
    const formElement = document.querySelector('form');
    const formDisplayToggleBtn = document.querySelector('.name-form-display');
    formDisplayToggleBtn.textContent = 'Close'
    _swapElementClass(formDisplayToggleBtn, 'update-names', 'close');
    _showElement(formElement);
    formElement.firstElementChild.focus();
  }

  function _hideForm() {
    const formElement = document.querySelector('form');
    const formInputFields = [...formElement.children].filter((child) => {
      return child.nodeName === 'INPUT'
    });
    const formDisplayToggleBtn = document.querySelector('.name-form-display');
    formInputFields.forEach((f) => f.value = '');
    formDisplayToggleBtn.textContent = 'Update Player Names';
    _swapElementClass(formDisplayToggleBtn, 'close', 'update-names');
    _hideElement(formElement);
  }

  function _retrieveNames() {
    const formElement = document.querySelector('form');
    const formInputFields = [...formElement.children].filter((child) => {
      return child.nodeName === 'INPUT';
    });
    return formInputFields.map((inputField) => inputField.value);
  }

  function _addToContainer(...elems) {
    let displayRow = document.createElement('div');
    displayRow.classList = 'display-row';
    _appendChildren(displayRow, ...elems);
    _appendChildren(containerElement, displayRow);
  }

  function _resetBoardElement(boardElement) {
    if (boardElement) containerElement.removeChild(boardElement);
    boardElement = document.createElement('div');
    boardElement.classList = 'display-row board';
    return boardElement;
  }

  function _getTileIndex(tileElement) {
    return [tileElement.dataset.rowIndex, tileElement.dataset.colIndex];
  }

  function _changeToGameStartDisplay() {
    const startResetBtn = document.querySelector('.start-reset-btn');
    startResetBtn.textContent = 'Reset';
    _swapElementClass(startResetBtn, 'start', 'reset');
    if (_checkIfElementIsHidden(startResetBtn)) _showElement(startResetBtn);
    _renderBoard();
  }

  function _renderPlayerNamesForm() {
    // Form display toggle button
    const formCloseBtn = document.createElement('button');
    formCloseBtn.classList = 'name-form-display close';
    formCloseBtn.textContent = 'Close';
    formCloseBtn.addEventListener('click', _toggleFormDisplay);
    _addToContainer(formCloseBtn);
    // Form fields
    const player1InputElement = document.createElement('input');
    _setElementAttribs(
      player1InputElement,
      {type: 'text', name: 'player1', placeholder: 'Enter Player 1 Name'}
    );
    const player2InputElement = document.createElement('input');
    _setElementAttribs(
      player2InputElement,
      {type: 'text', name: 'player2', placeholder: 'Enter Player 2 Name'}
    );
    // Submit button
    const submitBtn = document.createElement('button');
    _setElementAttribs(submitBtn, {type: 'submit'});
    submitBtn.textContent = 'Submit';
    // Form
    const formElement = document.createElement('form');
    formElement.addEventListener('submit', _handleFormSubmission);
    _appendChildren(
      formElement, player1InputElement, player2InputElement, submitBtn
    );
    _addToContainer(formElement);
    player1InputElement.focus();
  }

  function _renderGameScreen(opponent) {
    if (opponent === 'human') _renderPlayerNamesForm();

    const startResetBtn = document.createElement('button');
    startResetBtn.textContent = 'Start';
    startResetBtn.classList = 'hidden start-reset-btn start';
    startResetBtn.addEventListener('click', _handleStartResetBtnClick);
    _addToContainer(startResetBtn);

    const messageElement = document.createElement('p');
    messageElement.textContent = 'No winner yet';
    messageElement.classList = 'message';
    _addToContainer(messageElement);
    _hideElement(messageElement);

    if (opponent === 'computer') {
      startResetBtn.textContent = 'Reset';
      _swapElementClass(startResetBtn, 'start', 'reset');
      _showElement(startResetBtn);
      gameStateObj.play();
      _renderBoard();
    }
  }

  function _renderSplashScreen() {
    // Create buttons
    const humanBtn = document.createElement('button');
    _setDataAttribs(humanBtn, {opponent: 'human'});
    humanBtn.addEventListener('click', _handleOpponentSelection);
    humanBtn.textContent = 'Human';
    const computerBtn = document.createElement('button');
    _setDataAttribs(computerBtn, {opponent: 'computer'});
    computerBtn.addEventListener('click', _handleOpponentSelection);
    computerBtn.textContent = 'Computer';
    const btnGroup = document.createElement('div');
    _appendChildren(btnGroup, humanBtn, computerBtn);
    btnGroup.classList.add('btn-group');

    // Create heading
    const headingElement = document.createElement('h2');
    headingElement.textContent = 'Choose your opponent';

    // Create container element and add components
    const splashScreenElement = document.createElement('div');
    splashScreenElement.classList = 'display-row splash-screen';
    _appendChildren(splashScreenElement, headingElement, btnGroup);

    containerElement.appendChild(splashScreenElement);
  }

  function _renderBoard() {
    // Recreate all DOM elements with updated values
    let boardElement = document.querySelector('.board');
    boardElement = _resetBoardElement(boardElement);

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
    const messageElement = document.querySelector('.message');
    messageElement.textContent = winnerName + ' wins';
    _showElement(messageElement);
  }

  function _renderDrawMessage() {
    const messageElement = document.querySelector('.message');
    messageElement.textContent = 'It\'s a draw';
    _showElement(messageElement);
  }
})(gameBoard, gameState);
