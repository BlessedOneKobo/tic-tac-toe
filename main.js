// Manage internal representation of board
const board = (function() {
  // Size of the board
  // Total number of consecutive symbols that shows that a player is the winner
  const size = 3;

  // Total number of symbols for each player used to check for a winner
  let player1Total = 0;
  let player2Total = 0;

  let representation = [
    ['', '', ''],
    ['', '', ''],
    ['', '', '']
  ];

  // Check if a given pair of indices are out of bounds
  function _checkBoundsValidity(row, col) {
    return (0 <= row && row < size) && (0 <= col && col < size);
  }

  // Update the total number of symbols each player has on the board
  function _updatePlayerTotals(row, col) {
    switch(representation[row][col]) {
      case 'x': ++player1Total; break;
      case 'o': ++player2Total; break;
    }
  }

  // Reset the total number of symbols each player has on the board
  function _resetPlayerTotals() {
    player1Total = player2Total = 0;
  } 

  // Determine the winner symbol
  // Return null is there is no winner
  function _determineWinnerSymbol() {
    if (player1Total === size) {
      return 'x';
    } else if (player2Total === size) {
      return 'o';
    }

    return null;
  }

  // Check the horizontal sections of the board for a winner
  // Return the symbol for winner if one is found, otherwise return null
  function _checkHorizontalSections() {
    for (let col = 0; col < size; col++) {
      player1Total = player2Total = 0;

      for (let row = 0; row < size; row++) {
        _updatePlayerTotals(row, col);
      }

      const winner = _determineWinnerSymbol();
      if (winner) {
        return winner;
      }
    }

    return null;
  }

  // Check the vertical sections of the board for a winner
  // Return the symbol for winner if one is found, otherwise return null
  function _checkVerticalSections() {
    for (let row = 0; row < size; row++) {
      _resetPlayerTotals();
      for (let col = 0; col < size; col++) {
        _updatePlayerTotals(row, col);
      }

      const winner = _determineWinnerSymbol();
      if (winner) {
        return winner;
      }
    }

    return null;
  }

  // Check the diagonal sections of the board for a winner
  // Return the symbol for the winner if one is found, otherwise return null
  function _checkDiagonalSections() {
    let winnerSymbol, player1Total, player2Total;

    // Check top-left diagonal
    _resetPlayerTotals();
    for (let row = 0, col = 0; row < size; row++, col++) {
      _updatePlayerTotals(row, col);
    }

    winnerSymbol = _determineWinnerSymbol();
    if (winnerSymbol) {
      return winnerSymbol;
    }

    // Check top-right diagonal
    _resetPlayerTotals();
    for (let row = 0, col = size - 1; row < size; row++, col--) {
      _updatePlayerTotals(row, col);
    }

    return _determineWinnerSymbol();
  }

  // Return the board array
  function getRepresentation() {
    return representation;
  }

  // Return the value of a given tile
  // Return undefined if given board tile is invalid
  function getValueAt(row, col) {
    if (_checkBoundsValidity(row, col)) {
      return representation[row][col];
    }
  }

  // Set the value for a given tile to a given player symbol
  // Return true if tile location is valid, false otherwise
  function setValueAt(row, col, playerObject) {
    if (getValueAt(row, col) === '') {
      representation[row][col] = playerObject.getSymbol();
      return true;
    }

    return false;
  }

  // Return the symbol for the player who wins the game
  // Return null if there is not winner
  function getWinnerSymbol() {
    let status = _checkHorizontalSections();
    if (status) {
      return status;
    }

    status = _checkVerticalSections();
    if (status) {
      return status;
    }

    return _checkDiagonalSections();
  }

  // Removes all player symbols from the board
  // Sets all tiles to empty string
  function clear() {
    representation.forEach((rowValue, rowIndex) => {
      rowValue.forEach((colValue, colIndex) => {
        representation[rowIndex][colIndex] = '';
      });
    });
  }

  return {getRepresentation, getValueAt, setValueAt, getWinnerSymbol, clear};
})();

// Control DOM manipulation
const display = (function(boardElement, boardObject) {
  const formDisplayToggleBtn = document.querySelector('.name-form-display');
  const form = document.querySelector('form');
  const inputFields = [...form.children].filter((f) => f.nodeName === 'INPUT');

  // Event listeners
  formDisplayToggleBtn.addEventListener('click', _toggleFormDisplay);
  form.addEventListener('submit', _handleFormSubmission);

  function _toggleFormDisplay(e) {
    const formOpacity = form.style.opacity;
    if (formOpacity === '0') {
      formDisplayToggleBtn.textContent = 'Close'
      form.style.opacity = '1';
    } else {
      formDisplayToggleBtn.textContent = 'Update Player Names';
      form.style.opacity = '0';
      inputFields.forEach((f) => f.value = '');
    }
  }

  function _handleFormSubmission(e) {
    e.preventDefault();
    game.updateNames(_retrieveNames());
    _toggleFormDisplay();
  }

  function _retrieveNames() {
    return inputFields.map((f) => f.value);
  }

  // Remove the current board and create a new one
  function _createNewBoardElement() {
    boardElement.parentElement.removeChild(boardElement);
    const newBoard = document.createElement('div');
    newBoard.id = 'board';
    return newBoard;
  }

  // Return the row and column values for a given tile element
  function _getTileIndex(tileElement) {
    return [tileElement.dataset.row, tileElement.dataset.col];
  }

  // Event handler for tile element click
  function _handleTileElementClick(e) {
    let [row, col] = _getTileIndex(e.target);
    game.placeSymbolForCurrentPlayer(row, col);
    renderBoard();
  }

  // Render contents of board representation to screen
  function renderBoard() {
    // Recreate all DOM elements with updated values
    boardElement = _createNewBoardElement();

    boardObject.getRepresentation().forEach((rowValue, rowIndex) => {
      const rowElement = document.createElement('div');
      rowElement.classList.add('row');

      rowValue.forEach((colValue, colIndex) => {
        const tileElement = document.createElement('div');
        tileElement.classList.add('tile');
        tileElement.dataset.row = rowIndex;
        tileElement.dataset.col = colIndex;
        tileElement.dataset.symbol = colValue;
        tileElement.textContent = colValue;
        tileElement.addEventListener('click', _handleTileElementClick);
        rowElement.appendChild(tileElement);
      });

      boardElement.appendChild(rowElement);
    });

    document.body.appendChild(boardElement);
  }

  return {renderBoard};
})(document.getElementById('board'), board);

// Manage game state
const game = (function() {
  const movesForDraw = 9;
  const movesForWin = 3;
  const arrayOfPlayers = [
    createPlayer('x', 'Player 1'),
    createPlayer('o', 'Player 2')
  ];
  let currentPlayerIndex = 0;
  let currentPlayer = arrayOfPlayers[currentPlayerIndex];
  let gameIsRunning = false;

  // Calculate the total number of moves made by both players
  function _calculateTotalMoves() {
    return arrayOfPlayers.reduce((acc, cur) => acc + cur.getMoves(), 0);
  }

  // Change the current player to the next player
  function _toggleCurrentPlayer() {
    if (currentPlayerIndex === 1) {
      currentPlayerIndex = 0;
    } else {
      currentPlayerIndex = 1;
    }

    return arrayOfPlayers[currentPlayerIndex];
  }
  
  // Reset the board and display
  function _reset() {
    gameIsRunning = true;
    board.clear();
    display.renderBoard();
    arrayOfPlayers.forEach((player) => player.resetMoves());
  }

  // Declare the current player winner and stop the game
  function _declareWinner() {
    console.log(currentPlayer.getName(), 'wins');
    // display.renderWinnerMessage(winner);
    gameIsRunning = false;
    _reset();
  }

  // Declare a draw and stop the game
  function _declareDraw() {
    console.log('draw');
    // display.renderDrawMessage();
    gameIsRunning = false;
    _reset();
  }

  function updateNames(names) {
    names.forEach((name, index) => arrayOfPlayers[index].setName(name));
  }

  // Place a symbol on the board for the current player and check for a winner
  function placeSymbolForCurrentPlayer(row, col) {
    if (gameIsRunning) {
      const placementIsValid = board.setValueAt(row, col, currentPlayer);
      if (placementIsValid) {
        if (currentPlayer.updateMoves() >= movesForWin) {
          if (board.getWinnerSymbol() === currentPlayer.getSymbol()) {
            _declareWinner();
          } else if (_calculateTotalMoves() === movesForDraw) {
            _declareDraw();
          }
        }

        currentPlayer = _toggleCurrentPlayer();
      }
    }
  }

  // Main entry point
  function play() {
    if (!gameIsRunning) {
      gameIsRunning = true;
      display.renderBoard();
    } else {
      console.log('game is currently ongoing');
    }
  }

  return {updateNames, placeSymbolForCurrentPlayer, play};
})();

// Create player objects
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
    return name;
  }

  function setName(newName) {
    if (newName.trim() !== '') {
      name = newName;
    }

    return name;
  }

  return {getMoves, updateMoves, resetMoves, getSymbol, getName, setName};
}

// Initialization
game.play();
