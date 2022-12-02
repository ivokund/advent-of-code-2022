const testInput = `1000
2000
3000

4000

5000
6000

7000
8000
9000

10000`
const input = Deno.readTextFileSync('./input.txt')

const getCalorieGroupSums = (input: string): number[] => {
  const calorieGroups = input.split('\n\n')
    .map((text) => text.split('\n').map(Number))

  return calorieGroups.map((items) => {
    return items.reduce((acc, item) => acc + item)
  })
}

function part1(input: string) {
  const sums = getCalorieGroupSums(input)
  return Math.max(...sums)
}

function part2(input: string) {
  const sums = getCalorieGroupSums(input)
  sums.sort((a, b) => b - a)

  return sums[0] + sums[1] + sums[2]
}


console.log('-- test input')
console.log({ part1: part1(testInput) })
console.log({ part2: part2(testInput) })

console.log('-- real input')
console.log({ part1: part1(input) })
console.log({ part2: part2(input) })
