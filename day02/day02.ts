const testInput = `A Y
B X
C Z`
const input = Deno.readTextFileSync('./input.txt')


// A, X - Rock, 1
// B, Y - Paper, 2
// C, Z - Scissors, 3

// X - Lose
// Y - Draw
// Z - Win

enum Move {
  ROCK = 'ROCK',
  PAPER = 'PAPER',
  SCISSORS = 'SCISSORS'
}

const moves: Record<string, Move> = {
  A: Move.ROCK,
  X: Move.ROCK,
  B: Move.PAPER,
  Y: Move.PAPER,
  C: Move.SCISSORS,
  Z: Move.SCISSORS,
}

const winConfig = [ // 0 is won by 1
  [Move.ROCK, Move.PAPER],
  [Move.PAPER, Move.SCISSORS],
  [Move.SCISSORS, Move.ROCK],
]
const loseConfig = winConfig.map((arr) => [...arr].reverse())

const parseInput = (input: string) => {
  return input.split('\n').map((str) => str.split(' '))
}

const getPoints = (a: Move, b: Move): number[] => {
  const wins = winConfig.map((arr) => arr.join('-'))
  if (a === b) {
    return [3, 3]
  }
  if (wins.includes(`${a}-${b}`)) {
    return [0, 6]
  }
  if (wins.includes(`${b}-${a}`)) {
    return [6, 0]
  }
  throw new Error('something wrong')
}

const getMoveScore = (move1: Move, move2: Move) => {
  const movePoints = {
    [Move.ROCK]: 1,
    [Move.PAPER]: 2,
    [Move.SCISSORS]: 3,
  }
  const [, myPoints] = getPoints(move1, move2)
  return movePoints[move2] + myPoints
}

function part1(input: string) {
  return parseInput(input).reduce((acc, [move1, move2]) => {
    return acc + getMoveScore(moves[move1], moves[move2])
  }, 0)
}

function part2(input: string) {
  const getSecondMoveByResult = (firstMove: string, result: string) => {
    const move1 = moves[firstMove]
    if (result === 'X') { // lose
      return Object.fromEntries(loseConfig)[move1]
    } else if (result === 'Y') { // draw
      return move1
    } else { // win
      return Object.fromEntries(winConfig)[move1]
    }
  }

  return  parseInput(input).reduce((acc, [firstMove, result]) => {
    return acc + getMoveScore(moves[firstMove], getSecondMoveByResult(firstMove, result))
  }, 0)
}


console.log('-- test input')
console.log({ part1: part1(testInput) })
console.log({ part2: part2(testInput) })

console.log('-- real input')
console.log({ part1: part1(input) })
console.log({ part2: part2(input) })
