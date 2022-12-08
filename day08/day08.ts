import { lodash } from 'https://deno.land/x/deno_ts_lodash/mod.ts';
const testInput = `30373
25512
65332
33549
35390`
const input = Deno.readTextFileSync('./input.txt')


function solve(input: string) {
  const treesYX = input.split('\n').map((line) => line.split('').map(Number))

  const gridWidth = treesYX[0].length
  const gridHeight = treesYX.length

  const getHeight = ([x, y]: number[]) => {
    return treesYX[y][x]
  }

  const visibleTrees: Record<string, boolean> = {}
  let maxScenicIndex = 0

  for (let x = 0; x < gridWidth; x++) {
    for (let y = 0; y < gridHeight; y++) {
      visibleTrees[`${x},${y}`] = false
      if (x === 0 || y === 0 || x === gridWidth - 1 || y === gridHeight - 1) {
        visibleTrees[`${x},${y}`] = true
        continue
      }

      const getBlockingTreeDistance = (rangeStart: number, rangeEnd: number, rangeCoord: number) => {
        const range = lodash.range(rangeStart, rangeEnd)
        for (const rangeIndex in range) {
          const newCoord = range[rangeIndex]
          const newCoords = [x, y]
          newCoords[rangeCoord] = newCoord
          const newHeight = getHeight(newCoords)

          if (newHeight >= getHeight([x, y])) {
            return Number(rangeIndex) + 1
          }
        }
        return null
      }

      let scenicIndex = 1

      const config = [
        // right
        {rangeStart: x + 1, rangeEnd: gridWidth, coordIndex: 0, distance: gridWidth - x - 1},
        // left
        {rangeStart: x - 1, rangeEnd: -1, coordIndex: 0, distance: x},
        // top
        {rangeStart: y - 1, rangeEnd: -1, coordIndex: 1, distance: y},
        // bottom
        {rangeStart: y + 1, rangeEnd: gridHeight, coordIndex: 1, distance: gridHeight - y - 1},
      ]

      config.forEach(({rangeStart, rangeEnd, coordIndex, distance}) => {
        const dist = getBlockingTreeDistance(rangeStart, rangeEnd, coordIndex)
        scenicIndex *= dist ?? distance
        if (dist === null) {
          visibleTrees[`${x},${y}`] = true
        }
      })

      if (scenicIndex > maxScenicIndex) {
        maxScenicIndex = scenicIndex
      }
    }
  }

  return {
    part1: Object.values(visibleTrees).filter((visible) => visible).length,
    part2: maxScenicIndex
  }
}

console.log('-- test input')
console.log(solve(testInput))

console.log('-- real input')
console.log(solve(input))
