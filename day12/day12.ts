const testInput = `Sabqponm
abcryxxl
accszExk
acctuvwj
abdefghi`
const input = Deno.readTextFileSync('./input.txt')

const findCoordsByChar = (char: string, rows: string[][]): number[][]=> {
  const matches = []
  for (let row=0; row<rows.length; row++) {
    for (let col=0; col<rows[0].length; col++) {
      if (rows[row][col] === char) {
        matches.push([col, row])
      }
    }
  }
  return matches
}

const elevationCache: Record<string, number> = {}
const getElevation = (char: string): number => {
  if (elevationCache[char]) {
    return elevationCache[char]
  }
  if (char === 'S') {
    return getElevation('a')
  } else if (char === 'E') {
    return getElevation('z')
  } else {
    elevationCache[char] = char.charCodeAt(0)
    return elevationCache[char]
  }
}

const elevationDifference = (a: string, b: string): number => {
  return getElevation(b) - getElevation(a)
}

function solve(input: string) {
  const rows = input.split('\n').map((line) => line.split(''))

  const [start] = findCoordsByChar('S', rows)
  const getPossibleStepCoords = ([x, y]: number[]) => {
    const moves = [
      [-1, 0],
      [1, 0],
      [0, 1],
      [0, -1],
    ]

    return moves.reduce((acc: number[][], [dx, dy]) => {
      if (!rows[y + dy]?.[x + dx]) {
        return acc
      }
      const elevationDiff = elevationDifference(rows[y][x], rows[y + dy][x + dx])
      if (elevationDiff <= 1) {
        acc.push([x + dx, y + dy])
      }
      return acc
    }, [])
  }

  const findShortestPathFromCoords = (coords: number[]) => {
    const pathQueue: { coords: number[], path: string, pathLength: number }[] = [
      {coords, path: '', pathLength: 0}
    ]
    const successes: string[] = []

    const minNodeVisitations: Record<string, number> = {}

    while (pathQueue.length > 0) {
      const {coords, path, pathLength} = pathQueue.pop()!

      if (rows[coords[1]][coords[0]] === 'E') {
        successes.push(path)
        continue
      }

      for (const [newX, newY] of getPossibleStepCoords(coords)) {
        const coordStr = `|${newX},${newY}|`

        if (!minNodeVisitations[coordStr] || minNodeVisitations[coordStr] > pathLength + 1) {
          if (path.indexOf(coordStr) === -1) {
            minNodeVisitations[coordStr] = pathLength + 1
            pathQueue.push({
              coords: [newX, newY],
              path: `${path}\n${coordStr}`,
              pathLength: pathLength + 1
            })
          }
        }
      }
    }

    const lengths = successes.map((nodes) => nodes.split('\n').length - 1)
    return Math.min(...lengths)
  }

  const part2ShortestPaths = findCoordsByChar('a', rows)
    .map((startCoord) => findShortestPathFromCoords(startCoord))

  return {
    part1: findShortestPathFromCoords(start),
    part2: Math.min(...part2ShortestPaths),
  }
}

console.log('-- test input')
console.log(solve(testInput))

console.log('-- real input')
console.log(solve(input))
