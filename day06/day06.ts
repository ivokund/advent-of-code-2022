const testInput = `mjqjpqmgbljsphdztnvjfqwrcgsmlb`
const input = Deno.readTextFileSync('./input.txt')

const getUnique = (str: string) => {
  return [...new Set(str)].join('')
}

const calculate = (input: string, length: number) => {
  for (let i=0; i<input.length - length; i++) {
    const str = input.slice(i, i+length)
    if (str === getUnique(str)) {
      return i + length
    }
  }
  throw new Error('not found')
}

function part1(input: string) {
  return calculate(input, 4)
}

function part2(input: string) {
  return calculate(input, 14)
}


console.log('-- test input')
console.log({ part1: part1(testInput) })
console.log({ part2: part2(testInput) })

console.log('-- real input')
console.log({ part1: part1(input) })
console.log({ part2: part2(input) })
