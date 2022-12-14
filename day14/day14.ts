const testInput = `498,4 -> 498,6 -> 496,6
503,4 -> 502,4 -> 502,9 -> 494,9`
const input = Deno.readTextFileSync('./input.txt')

interface Coord {
  x: number
  y: number
}
interface Range {
  from: Coord
  to: Coord
}

const isRock = ({x, y}: Coord, rockRanges: Range[]) => {
  const rockRange = rockRanges.find((range) => {
    const xInRange = x >= range.from.x && x <= range.to.x
    const yInRange = y >= range.from.y && y <= range.to.y
    return xInRange && yInRange
  })
  return rockRange !== undefined
}

const getRockRanges = (input: string): Range[]  => {
  const parsedLines: Coord[][] = input.split('\n')
    .map((line) => line.split(' -> ')
      .map((coords) => {
        const [x, y] = coords.split(',')
        return {x: Number(x), y: Number(y)}
      }))

  return parsedLines.reduce((acc: Range[], ranges) => {
    let lastPoint = ranges[0]
    for (let i=1; i<ranges.length; i++) {
      const newPoint = ranges[i]
      const minX = Math.min(lastPoint.x, newPoint.x)
      const minY = Math.min(lastPoint.y, newPoint.y)
      const maxX = Math.max(lastPoint.x, newPoint.x)
      const maxY = Math.max(lastPoint.y, newPoint.y)

      acc.push({ from: { x: minX, y: minY }, to: { x: maxX, y: maxY } })
      lastPoint = newPoint
    }
    return acc
  }, [])
}

const isSand = ({x, y}: Coord, settledSandIndex: Record<string, boolean>) =>
  settledSandIndex[`${x},${y}`] === true

const getNextFreePosForFalling = (sandPos: Coord, rockRanges: Range[], settledSand: Record<string, boolean>, floorY?: number | undefined) => {
  if (floorY && floorY === sandPos.y + 1) {
    return undefined
  }

  const potentialCoords: Coord[] = [
    [0, 1],
    [-1, 1],
    [1, 1]
  ].map(([dx, dy]) => ({ x: sandPos.x + dx, y: sandPos.y + dy }))
  return potentialCoords.find((coord) => {
    return !isSand(coord, settledSand) && !isRock(coord, rockRanges)
  })
}


function part1(input: string) {
  const rockRanges = getRockRanges(input)
  const settledSandIndex: Record<string, boolean> = {}

  const maxY = Math.max(...rockRanges.map(({to}) => to.y))

  let fellThrough = false
  do {
    let fallingSand: Coord = { x: 500, y: 0 }

    let nextPos = undefined
    do {
      nextPos = getNextFreePosForFalling(fallingSand, rockRanges, settledSandIndex)
      if (nextPos === undefined) {
        // cannot fall anymore
        settledSandIndex[`${fallingSand.x},${fallingSand.y}`] = true
        break;
      }
      if (nextPos.y >= maxY) {
        fellThrough = true
        break
      }
      fallingSand = nextPos
    } while (true)
  } while (fellThrough === false)
  return Object.keys(settledSandIndex).length
}

function part2(input: string) {
  const rockRanges = getRockRanges(input)
  const settledSandIndex: Record<string, boolean> = {}

  const maxY = Math.max(...rockRanges.map(({to}) => to.y))
  const floorY = maxY + 2
  do {
    let fallingSand: Coord = { x: 500, y: 0 }
    if (settledSandIndex[`500,0`]) {
      break
    }
    let nextPos = undefined
    do {
      nextPos = getNextFreePosForFalling(fallingSand, rockRanges, settledSandIndex, floorY)
      if (nextPos === undefined) {
        // cannot fall anymore
        settledSandIndex[`${fallingSand.x},${fallingSand.y}`] = true
        break;
      }
      fallingSand = nextPos
    } while (true)
  } while (true)
  return Object.keys(settledSandIndex).length
}


console.log('-- test input')
console.log({ part1: part1(testInput) })
console.log({ part2: part2(testInput) })

console.log('-- real input')
console.log({ part1: part1(input) })
console.log({ part2: part2(input) })
