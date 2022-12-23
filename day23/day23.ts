const testInput = `....#..
..###.#
#...#.#
.#...##
#.###..
##.#.##
.#..#..`
const input = Deno.readTextFileSync('./input.txt')

interface Coord {
  x: number
  y: number
}

interface Move {
  dx: number
  dy: number
}
interface Box {
  minX: number
  maxX: number
  minY: number
  maxY: number
}
interface ProposedMove {
  from: Coord
  to: Coord
}
type ElvesMap = Record<string, Coord>

const getElvesMap = (input: string) => {
  const rows = input.split('\n').map((line) => line.split(''))

  return rows.reduce((map: ElvesMap, row, y) => {
    row.forEach((col, x) => {
      if (col === '#') {
        map[`${x},${y}`] = { x, y }
      }
    })
    return map
  }, {})
}

const getSurroundingBox = (elvesMap: ElvesMap): Box => {
  const coords: Coord[] = Object.values(elvesMap)

  const minX = Math.min(...coords.map(({x}) => x))
  const maxX = Math.max(...coords.map(({x}) => x))
  const minY = Math.min(...coords.map(({y}) => y))
  const maxY = Math.max(...coords.map(({y}) => y))

  return { minX, maxX, minY, maxY }
}

const moveMappingTemplate = [
  (x: number, y: number) => ({
    clear: [[x, y-1], [x-1, y-1], [x+1, y-1]],
    move: [0, -1],
  }),
  (x: number, y: number) => ({
    clear: [[x, y+1], [x-1, y+1], [x+1, y+1]],
    move: [0, +1],
  }),
  (x: number, y: number) => ({
    clear: [[x-1, y], [x-1, y-1], [x-1, y+1]],
    move: [-1, 0],
  }),
  (x: number, y: number) => ({
    clear: [[x+1, y], [x+1, y-1], [x+1, y+1]],
    move: [+1, 0],
  }),
]

const move = (mapping: any, elvesMap: ElvesMap): number => {

  const hasElf = ({x, y}: Coord) => {
    return !!elvesMap[`${x},${y}`]
  }

  const getProposedMove = ({ x, y }: Coord): Move => {
    // If no other Elves are in one of those eight positions, the Elf does not do anything
    if (!hasElf({x: x-1, y: y-1}) && !hasElf({x, y: y-1}) && !hasElf({x: x+1, y: y-1}) && !hasElf({x: x-1, y}) && !hasElf({x: x+1, y}) && !hasElf({x: x-1, y: y+1}) && !hasElf({x, y: y+1}) && !hasElf({x: x+1, y: y+1})) {
      return { dx: 0, dy: 0 }
    }

    for (const moveFn of mapping) {
      const {clear, move, name} = moveFn(x, y)
      const elves = clear.filter(([x, y]) => hasElf({x, y}))
      if (elves.length === 0) {
        return { dx: move[0], dy: move[1] }
      }
    }

    return { dx: 0, dy: 0 }
  }

  let movedCount = 0
  const proposedMoveMap: Record<string, ProposedMove[]> = {}
  for (const coord of Object.values(elvesMap)) {
    const move = getProposedMove(coord)
    const targetCoords: Coord = {
      x: coord.x + move.dx,
      y: coord.y + move.dy,
    }
    const idx = `${targetCoords.x},${targetCoords.y}`
    proposedMoveMap[idx] = (proposedMoveMap[idx] ?? []).concat({
      from: coord,
      to: targetCoords,
    })
  }

  for (const [_, moves] of Object.entries(proposedMoveMap)) {
    if (moves.length === 1) {
      for (const move of moves) {
        delete elvesMap[`${move.from.x},${move.from.y}`]
        elvesMap[`${move.to.x},${move.to.y}`] = {
          x: move.to.x,
          y: move.to.y,
        }
        if (move.from.x !== move.to.x || move.from.y !== move.to.y) {
          movedCount++
        }
      }
    }
  }

  const first = mapping.shift()
  mapping.push(first!)

  return movedCount
}

function part1(input: string) {
  const elvesMap = getElvesMap(input)
  const moveMapping = [...moveMappingTemplate]

  for (let i=0; i<10; i++) {
    move(moveMapping, elvesMap)
  }

  const box = getSurroundingBox(elvesMap)
  const totalTiles = (box.maxX - box.minX + 1) * (box.maxY - box.minY + 1)
  const elfCount = Object.values(elvesMap).length
  return totalTiles - elfCount
}

function part2(input: string) {
  const elvesMap = getElvesMap(input)
  const moveMapping = [...moveMappingTemplate]

  let roundNo = 0
  let moveCount = 0
  do {
    roundNo++
    moveCount = move(moveMapping, elvesMap)
  } while (moveCount > 0)
  return roundNo
}

console.log('-- test input')
console.log({ part1: part1(testInput) })
console.log({ part2: part2(testInput) })

console.log('-- real input')
console.log({ part1: part1(input) })
console.log({ part2: part2(input) })
