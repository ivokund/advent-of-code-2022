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

function part1(input: string) {
  const moves = input.split('\n').map((line) => {
    const parts = line.split(' ')
    return [parts[0], Number(parts[1])]
  })


  const tailVisits = new Set(['0,0'])
  let head = [0, 0]
  let tail = [0, 0]

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
      } else {
        // y is smaller, align Y exactly, move X one step closer
        return [tail[0] + dx / 2, head[1]]
      }
    }
  }


  moves.forEach(([direction, steps]) => {
    // console.log(`PROCESSING MOVE ${direction} by ${steps} steps`)

    for (let i=0; i<steps; i++) {
      // console.log(` > Taking step ${i+1}`)
      const newHead = getNewPos(head, direction as Direction)
      const newTail = getTailPos(newHead, tail)

      head = newHead
      tail = newTail
      tailVisits.add(`${tail[0]},${tail[1]}`)
    }
  })

  return tailVisits.size
}

function part2(input: string) {
  return input
}


console.log('-- test input')
console.log({ part1: part1(testInput) })
// console.log({ part2: part2(testInput) })

console.log('-- real input')
console.log({ part1: part1(input) })
// console.log({ part2: part2(input) })
