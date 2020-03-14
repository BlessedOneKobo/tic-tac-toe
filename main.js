function createPlayer(symbol) {
  return {symbol};
}

const gameBoard = (function() {
  let representation = [
    ['x', 'o', 'o'],
    ['', 'x', ''],
    ['', 'o', 'x']
  ];

  const clear = function() {
    representation.forEach((row, y) => {
      row.forEach((tile, x) => {
        representation[x][y] = '';
      });
    });
  }

  return {representation, clear};
})();

const gameDisplay = (function(domElement, board) {
  const render = function() {
    let str = '';
    board.representation.forEach((row) => {
      row.forEach((tile) => {
        if (tile !== '') {
          str += tile;
        } else {
          str += '#';
        }
      });

      str += '\n';
    });

    console.log(str);
  };

  return {render};
})(document.getElementById('board'), gameBoard);

const gameObject = (function() {
  let currentPlayerIndex = 0;
  const players = [createPlayer('x'), createPlayer('o')];
  
  const reset = function() {
    gameBoard.clear();
    gameDisplay.render();
    currentPlayerIndex = 0;
  };

  return {players, gameBoard, gameDisplay, reset};
})();

gameObject.gameDisplay.render();
console.log(gameObject.players);
console.log(gameObject.gameBoard);
console.log(gameObject.gameDisplay);
gameObject.reset();
gameObject.gameDisplay.render();
