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

  const visibleSidesFromOutside: Record<string, string[]> = {}
  const scenicIndexes: Record<string, number[]> = {}
  let maxScenicIndex = 0

  for (let x = 0; x < gridWidth; x++) {
    for (let y = 0; y < gridHeight; y++) {
      visibleSidesFromOutside[`${x},${y}`] = []
      scenicIndexes[`${x},${y}`] = []
      if (x === 0 || y === 0 || x === gridWidth - 1 || y === gridHeight - 1) {
        visibleSidesFromOutside[`${x},${y}`].push('side')
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
        {rangeStart: x + 1, rangeEnd: gridWidth, coordIndex: 0, name: 'right', def: gridWidth - x - 1},
        {rangeStart: x - 1, rangeEnd: -1, coordIndex: 0, name: 'left', def: x},
        {rangeStart: y - 1, rangeEnd: -1, coordIndex: 1, name: 'top', def: y},
        {rangeStart: y + 1, rangeEnd: gridHeight, coordIndex: 1, name: 'bottom', def: gridHeight - y - 1},
      ]

      config.forEach(({rangeStart, rangeEnd, coordIndex, name, def}) => {
        const dist = getBlockingTreeDistance(rangeStart, rangeEnd, coordIndex)
        scenicIndex *= dist ?? def
        if (dist === null) {
          visibleSidesFromOutside[`${x},${y}`].push(name)
        }
      })

      if (scenicIndex > maxScenicIndex) {
        maxScenicIndex = scenicIndex
      }
    }
  }

  return {
    part1: Object.values(visibleSidesFromOutside).filter((arr) => arr.length !== 0).length,
    part2: maxScenicIndex
  }
}

console.log('-- test input')
console.log(solve(testInput))

console.log('-- real input')
console.log(solve(input))
