
const testInput = `        ...#
        .#..
        #...
        ....
...#.......#
........#...
..#....#....
..........#.
        ...#....
        .....#..
        .#......
        ......#.

10R5L5R10L4R5L5`
const input = Deno.readTextFileSync('./input.txt')

const DEBUG = false

const _cl = console.debug
console.debug = (msg: string) => {
  if (DEBUG) {
    _cl(msg)
  }
}

type Direction = 'U' | 'D' | 'L' | 'R'
type Turn = 'L' | 'R'

const changeDirection = (direction: Direction, turn: Turn) => {
  switch (direction) {
    case 'U':
      return turn === 'L' ? 'L' : 'R'
    case 'R':
      return turn === 'L' ? 'U' : 'D'
    case 'D':
      return turn === 'L' ? 'R' : 'L'
    case 'L':
      return turn === 'L' ? 'D' : 'U'
    default:
      throw new Error('invalid direction')
  }
}

function part1(input: string) {
  const [mapStr, instructionsStr] = input.split('\n\n')
  const instructions = instructionsStr.split(/([RL])/)
  const rows = mapStr.split('\n').map((line) => line.split(''))
  const colCount = Math.max(...rows.map((cols) => cols.length))

  rows.forEach((row) => {
    for (let i=row.length; i<colCount; i++) {
      row.push(' ')
    }
  })

  const rowCount = rows.length

  const getIndex = (rowNo: number, colNo: number) => {
    const rowIndex = (rowNo + rowCount) % rowCount
    const colIndex = (colNo + colCount) % colCount
    return [rowIndex, colIndex]
  }


  let currentRow = 0
  let currentCol = rows[0].findIndex((cell) => cell === '.')
  let direction: Direction = 'R'
  let currentValue = '.'

  const getNextCell = (row: number, col: number) => {
    switch (direction) {
      case 'U': return getIndex(row - 1, col)
      case 'D': return getIndex(row + 1, col)
      case 'L': return getIndex(row, col - 1)
      case 'R': return getIndex(row, col + 1)
    }
  }

  const draw = (label: string) => {
    console.debug('>>>> ' + label)
    const drawRows = rows.map((row, rowNo) => row.map((cell, colNo) => {
      return (currentCol === colNo && currentRow === rowNo) ? '$' : cell
    }).join(''))
    console.debug(drawRows.join('\n'))
  }


  draw('initial')


  while (instructions.length) {
    const instruction = instructions.shift()!
    console.debug(`> Parsing instruction: ${instruction}. Currently at "${currentValue}"`)
    if (['L', 'R'].includes(instruction)) {
      direction = changeDirection(direction, instruction as Turn)
      console.debug(`  > Changed direction to : ${direction}`)
    } else {
      const stepCount = Number(instruction)
      console.debug(`  > Stepping ${stepCount} steps`)

      let stepped = 0

      let [newRow, newCol] = getNextCell(currentRow, currentCol)
      let newValue
      do {
        newValue = rows[newRow][newCol]
        console.debug(`    > New cell is: ${newRow},${newCol}: "${newValue}". Stepped ${stepped}/${stepCount}`)
        if (newValue === '.') {
          currentValue = newValue
          stepped++
          currentCol = newCol
          currentRow = newRow
        } else if (newValue === '#') {
          break
        }
        console.debug({newRow, newCol, direction});
        [newRow, newCol] = getNextCell(newRow, newCol)
        console.debug({newRow, newCol})

      } while (stepped < stepCount)
      draw('AFTER MOVE')
    }
  }
  const facing: Record<Direction, number> = {
    R: 0,
    D: 1,
    L: 2,
    U: 3,
  }

  const part1 = (1000 * (currentRow + 1)) + (4 * (currentCol + 1)) + facing[direction]

  return {
    part1
  }
}

function part2(input: string) {
  return input
}


console.log('-- test input')
console.log({ part1: part1(testInput) })
// console.debug({ part2: part2(testInput) })

console.log('-- real input')
console.log({ part1: part1(input) })
// console.debug({ part2: part2(input) })
