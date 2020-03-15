// Player Factory
function createPlayer(symbol) {
  let moves = 0;
  const player = Object.create(null);

  player.getMoves = function() {
    return moves;
  };

  player.updateMoves = function() {
    ++moves;
  };

  player.getSymbol = function() {
    return symbol;
  }

  return player;
}

// Board Module
const boardObj = (function() {
  let representation = [
    ['x', 'o', 'o'],
    ['', 'x', ''],
    ['', 'o', 'x']
  ];

  function checkBoundsValidity(x, y) {
    return (0 <= x && x < 3) && (0 <= y && y < 3)
  }

  // Return board array
  const getRepresentation = function() {
    return representation;
  };

  const getValueAt = function(x, y) {
    if (checkBoundsValidity(x, y)) {
      return representation[y][x];
    }
  }

  const setValueAt = function(x, y, value) {
    if (checkBoundsValidity(x, y)) {
      representation[y][x] = value;
      return true;
    }

    return false;
  }

  // Set all tiles of the board to empty string
  const clear = function() {
    representation.forEach((row, y) => {
      row.forEach((tile, x) => {
        representation[y][x] = '';
      });
    });
  }

  return {getRepresentation, getValueAt, setValueAt, clear};
})();

// Display Module
const displayObj = (function(boardElement, boardRepresentation) {

  // Remove the current board and create a new one
  function createNewBoardElement() {
    boardElement.parentElement.removeChild(boardElement);
    const newBoard = document.createElement('div');
    newBoard.id = 'board';
    return newBoard;
  }

  function getTileIndex(tileElement) {
    return [tileElement.dataset.x, tileElement.dataset.y];
  }

  function handleTileElementClick(e) {
    e.stopPropagation();
    let [x, y] = getTileIndex(e.target);
    gameObj.placeSymbolForPlayer(x, y);
    render();
  }

  // Render contents of board representation to screen
  const render = function() {
    // Recreate all DOM elements with updated values
    boardElement = createNewBoardElement();

    boardRepresentation.forEach((row, y) => {
      const rowElement = document.createElement('div');
      rowElement.classList.add('row');

      row.forEach((tile, x) => {
        const tileElement = document.createElement('div');
        tileElement.classList.add('tile');
        tileElement.dataset.x = x;
        tileElement.dataset.y = y;
        tileElement.dataset.symbol = tile;
        tileElement.textContent = tile;
        tileElement.addEventListener('click', handleTileElementClick);
        rowElement.appendChild(tileElement);
      });

      boardElement.appendChild(rowElement);
    });

    document.body.appendChild(boardElement);
  };

  return {render};
})(document.getElementById('board'), boardObj.getRepresentation());

// Game Module
const gameObj = (function() {
  const players = [createPlayer('x'), createPlayer('o')];
  let currentPlayerIndex = 0;
  let currentPlayer = players[currentPlayerIndex];

  function updateCurrentPlayer() {
    if (currentPlayerIndex === 1) {
      currentPlayerIndex = 0;
    } else {
      currentPlayerIndex = 1;
    }

    return players[currentPlayerIndex];
  }

  const placeSymbolForPlayer = function(x, y) {
    const currentTileValue = boardObj.getValueAt(x, y);
    if (currentTileValue === '') {
      const moveIsValid = boardObj.setValueAt(x, y, currentPlayer.getSymbol());
      if (moveIsValid) {
        currentPlayer.updateMoves();
        if (currentPlayer.getMoves() >= 3) {
          const boardStatus = boardObj.getStatus();
          if (boardStatus === currentPlayer.getSymbol()) {
            displayWinner();
          } else if (boardStatus === 'draw') {
            displayResetMessage();
          }
        }

        currentPlayer = updateCurrentPlayer();
      }
    }
  };
  
  const reset = function() {
    boardObj.clear();
    displayObj.render();
    currentPlayerIndex = 0;
  };

  return {boardObj, displayObj, placeSymbolForPlayer, reset};
})();

gameObj.displayObj.render();
gameObj.reset();
