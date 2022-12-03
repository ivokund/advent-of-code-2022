const testInput = `vJrwpWtwJgWrhcsFMMfFFhFp
jqHRNqRjqzjGDLGLrsFMfFZSrLrFZsSL
PmmdzqPrVvPwwTWBwg
wMqvLMZHhHMvwLHjbvcjnnSBnvTQFn
ttgJtRGJQctTZtZT
CrZsJsPPZsGzwwsLwLmpwMDw`
const input = Deno.readTextFileSync('./input.txt')

const findCommonChar = (a: string, b: string, c: string): string => {
  for (let i=0; i<a.length; i++) {
    for (let j=0; j<b.length; j++) {
      if (a[i] === b[j]) {
        for (let k=0; k<c.length; k++) {
          if (a[i] === c[k]) {
            return a[i]
          }
        }
      }
    }
  }
  throw new Error('not found')
}

const getPriority = (char: string) => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  return chars.indexOf(char) + 1
}

function part1(input: string) {
  const getCompartmentsByBag = (input: string) => {
    return input.split('\n').map((line) => {
      return [line.substring(0, line.length / 2), line.substring(line.length / 2)]
    })
  }

  const commonChars = getCompartmentsByBag(input).map(([comp1, comp2]) => {
    return findCommonChar(comp1, comp2, comp2)
  })
    const priorities = commonChars.map(getPriority)
  return priorities.reduce((acc, value) => acc + value)
}

function part2(input: string) {
  const bags = input.split('\n')
  const chars = []
  for (let i=0; i<bags.length; i += 3) {
    chars.push(findCommonChar(bags[i], bags[i+1], bags[i+2]))
  }

  const priorities = chars.map(getPriority)
  return priorities.reduce((acc, value) => acc + value)
}


console.log('-- test input')
console.log({ part1: part1(testInput) })
console.log({ part2: part2(testInput) })

console.log('-- real input')
console.log({ part1: part1(input) })
console.log({ part2: part2(input) })
