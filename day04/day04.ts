const testInput = `2-4,6-8
2-3,4-5
5-7,7-9
2-8,3-7
6-6,4-6
2-6,4-8`
const input = Deno.readTextFileSync('./input.txt')

const parseRanges = (input: string) => {
  return input.split('\n')
    .map((line) => line.split(',')
    .map((range) => range.split('-').map((num) => Number(num))))
}


const rangeContains = (range: number[], subrange: number[]) => {
  return range[0] <= subrange[0] && range[1] >= subrange[1]
}

const rangeOverlaps = (range1: number[], range2: number[]) => {
  return range1[1] >= range2[0] && range2[1] >= range1[0]
}

function part1(input: string) {
  const assignments = parseRanges(input)
  return assignments
    .filter(([r1, r2]) => rangeContains(r1, r2) || rangeContains(r2, r1))
    .length
}

function part2(input: string) {
  const assignments = parseRanges(input)
  return assignments
    .filter(([r1, r2]) => rangeOverlaps(r1, r2) || rangeOverlaps(r2, r1))
    .length
}


console.log('-- test input')
console.log({ part1: part1(testInput) })
console.log({ part2: part2(testInput) })

console.log('-- real input')
console.log({ part1: part1(input) })
console.log({ part2: part2(input) })
