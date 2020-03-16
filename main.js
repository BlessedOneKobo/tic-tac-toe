// Manage internal representation of board
const board = (function() {
  const size = 3;
  let representation = [
    ['', '', ''],
    ['', '', ''],
    ['', '', '']
  ];

  function getRepresentation() {
    return representation;
  }

  function checkBoundsValidity(row, col) {
    return (0 <= row && row < size) && (0 <= col && col < size);
  }

  function getValueAt(row, col) {
    if (checkBoundsValidity(row, col)) {
      return representation[row][col];
    }
  }

  function setValueAt(row, col, value) {
    if (checkBoundsValidity(row, col) && representation[row][col] === '') {
      representation[row][col] = value;
      return true;
    }

    return false;
  }

  function updateCount(row, col, p1Count, p2Count) {
    switch(representation[row][col]) {
      case 'x': ++p1Count; break;
      case 'o': ++p2Count; break;
    }

    return [p1Count, p2Count];
  }

  function getWinner(p1Count, p2Count) {
    const countForWin = size;
    if (p1Count === countForWin) {
      return 'x';
    } else if (p2Count === countForWin) {
      return 'o';
    }

    return null;
  }

  function checkHorizontals() {
    for (let col = 0; col < size; col++) {
      let p1Count = 0;
      let p2Count = 0;

      for (let row = 0; row < size; row++) {
        [p1Count, p2Count] = updateCount(row, col, p1Count, p2Count);
      }

      const winner = getWinner(p1Count, p2Count);
      if (winner) {
        return winner;
      }
    }

    return null;
  }

  function checkVerticals() {
    for (let row = 0; row < size; row++) {
      let p1Count = 0;
      let p2Count = 0;

      for (let col = 0; col < size; col++) {
        [p1Count, p2Count] = updateCount(row, col, p1Count, p2Count);
      }

      const winner = getWinner(p1Count, p2Count);
      if (winner) {
        return winner;
      }
    }

    return null;
  }

  function checkDiagonals() {
    let winner;
    let p1Count = 0;
    let p2Count = 0;

    // Check left-diagonal
    for (let row = 0, col = 0; row < size; row++, col++) {
      [p1Count, p2Count] = updateCount(row, col, p1Count, p2Count);
    }

    winner = getWinner(p1Count, p2Count);
    if (winner) {
      return winner;
    }

    // Reset symbol count for both players before final check
    p1Count = p2Count = 0;

    // Check right-diagonal
    for (let row = 0, col = size - 1; row < size; row++, col--) {
      [p1Count, p2Count] = updateCount(row, col, p1Count, p2Count);
    }

    return getWinner(p1Count, p2Count);
  }

  function checkStatus() {
    let status = '';
    status = checkHorizontals();
    if (status !== null) {
      return status;
    }

    status = checkVerticals();
    if (status !== null) {
      return status;
    }

    status = checkDiagonals();
    if (status !== null) {
      return status;
    }
  }

  // Set all tiles of the board to empty string
  function clear() {
    representation.forEach((rowValue, rowIndex) => {
      rowValue.forEach((colValue, colIndex) => {
        representation[rowValue][colIndex] = '';
      });
    });
  }

  return {getRepresentation, getValueAt, setValueAt, checkStatus, clear};
})();

// Control DOM manipulation
const display = (function(boardElement, boardRepresentation) {

  // Remove the current board and create a new one
  function createNewBoardElement() {
    boardElement.parentElement.removeChild(boardElement);
    const newBoard = document.createElement('div');
    newBoard.id = 'board';
    return newBoard;
  }

  function getTileIndex(tileElement) {
    return [tileElement.dataset.row, tileElement.dataset.col];
  }

  function handleTileElementClick(e) {
    let [row, col] = getTileIndex(e.target);
    game.placeSymbolForCurrentPlayer(row, col);
    renderBoard();
  }

  // Render contents of board representation to screen
  function renderBoard() {
    // Recreate all DOM elements with updated values
    boardElement = createNewBoardElement();

    boardRepresentation.forEach((rowValue, rowIndex) => {
      const rowElement = document.createElement('div');
      rowElement.classList.add('row');

      rowValue.forEach((colValue, colIndex) => {
        const tileElement = document.createElement('div');
        tileElement.classList.add('tile');
        tileElement.dataset.row = rowIndex;
        tileElement.dataset.col = colIndex;
        tileElement.dataset.symbol = colValue;
        tileElement.textContent = colValue;
        tileElement.addEventListener('click', handleTileElementClick);
        rowElement.appendChild(tileElement);
      });

      boardElement.appendChild(rowElement);
    });

    document.body.appendChild(boardElement);
  }

  return {renderBoard};
})(document.getElementById('board'), board.getRepresentation());

// Manage game state
const game = (function() {
  const arrayOfPlayers = [createPlayer('x'), createPlayer('o')];
  let gameIsOn = false;
  let currentPlayerIndex = 0;
  let currentPlayer = arrayOfPlayers[currentPlayerIndex];

  function updateCurrentPlayer() {
    if (currentPlayerIndex === 1) {
      currentPlayerIndex = 0;
    } else {
      currentPlayerIndex = 1;
    }

    return arrayOfPlayers[currentPlayerIndex];
  }

  function getCurrentPlayer() {
    return currentPlayer;
  }

  function placeSymbolForCurrentPlayer(row, col) {
    const moveIsValid = board.setValueAt(row, col, currentPlayer.getSymbol());
    if (moveIsValid) {
      currentPlayer.updateMoves();
      if (currentPlayer.getMoves() >= 3) {
        const boardStatus = board.checkStatus();
        if (boardStatus === currentPlayer.getSymbol()) {
          declareWinner(currentPlayer);
        } else if (boardStatus === 'draw') {
          declareDraw();
        }
      }

      currentPlayer = updateCurrentPlayer();
    }
  }
  
  function reset() {
    board.clear();
    display.renderBoard();
  }

  function declareWinner(winner) {
    console.log(winner.getSymbol(), 'wins');
    // display.renderWinnerMessage(winner);
    gameIsOn = false;
  }

  function declareDraw() {
    display.renderDrawMessage();
    gameIsOn = false;
  }

  function play() {
    if (!gameIsOn) {
      gameIsOn = true;
      display.renderBoard();
    } else {
      console.log('game is currently ongoing');
    }
  }

  return {play, placeSymbolForCurrentPlayer};
})();

// Create player objects
function createPlayer(symbol) {
  let moves = 0;
  const playerProto = Object.create(null, {
    getMoves: {
      value: function() {
        return moves;
      }
    },
    updateMoves: {
      value: function() {
        return ++moves;
      }
    },
    getSymbol: {
      value: function() {
        return symbol;
      }
    },
  });

  return Object.create(playerProto);
}

// Initialization
game.play();
