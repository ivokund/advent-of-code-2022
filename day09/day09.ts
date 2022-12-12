const testInput = `R 4
U 4
L 3
D 1
R 4
D 1
L 5
R 2`
const input = Deno.readTextFileSync('./input.txt')

type Direction = 'L' | 'R' | 'U' | 'D'
type Coords = number[]

const getNewPos = ([x, y]: Coords, direction: Direction): Coords => {
  const posMatrix: Record<Direction, number[]> = {
    R: [1, 0],
    L: [-1, 0],
    U: [0, -1],
    D: [0, 1],
  }
  return [
    x + posMatrix[direction][0],
    y + posMatrix[direction][1],
  ]
}

const getTailPos = (head: Coords, tail: Coords): Coords => {
  const dx = head[0] - tail[0]
  const dy = head[1] - tail[1]

  if (Math.abs(dx) < 2 && Math.abs(dy) < 2) {
    return tail
  }

  if (dx === 0 || dy === 0) {
    // in the same column or row, need to just catch up
    if (dx === 0) {
      return [tail[0], tail[1] + dy / 2] // align
    } else {
      return [tail[0] + dx / 2, tail[1]]
    }
  } else {
    // diagonal difference, need to align
    if (Math.abs(dx) < Math.abs(dy)) {
      // x is smaller, align X exactly, move Y one step closer
      return [head[0], tail[1] + dy / 2]
    } else if (Math.abs(dx) > Math.abs(dy)) {
      // y is smaller, align Y exactly, move X one step closer
      return [tail[0] + dx / 2, head[1]]
    } else {
      // move in the middle
      return [tail[0] + dx / 2, tail[1] + dy / 2]
    }
  }
}


function solve(input: string, knots : number) {
  const moves = input.split('\n').map((line) => {
    const parts = line.split(' ')
    return [parts[0], Number(parts[1])]
  })

  const tailVisits = new Set(['0,0'])
  const rope = Array.from({length: knots}, () => [0, 0])

  moves.forEach(([direction, steps]) => {
    for (let i=0; i<steps; i++) {
      const head = rope[0]
      rope[0] = getNewPos(head, direction as Direction)

      for (let knot = 1; knot < knots; knot++) {
        rope[knot] = getTailPos(rope[knot-1], rope[knot])
      }
      tailVisits.add(`${rope[knots-1][0]},${rope[knots-1][1]}`)
    }
  })

  return tailVisits.size
}

function part2(input: string) {
  return input
}


console.log('-- test input')
console.log({ part1: solve(testInput, 2) })
console.log({ part2_small: solve(testInput, 10) })
console.log({ part2_larger: solve(`R 5
U 8
L 8
D 3
R 17
D 10
L 25
U 20`, 10) })

console.log('-- real input')
console.log({ part1: solve(input, 2) })
console.log({ part2: solve(input, 10) })
