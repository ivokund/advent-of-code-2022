const testInput = `    [D]    
[N] [C]    
[Z] [M] [P]
 1   2   3 

move 1 from 2 to 1
move 3 from 1 to 3
move 2 from 2 to 1
move 1 from 1 to 2`
const input = Deno.readTextFileSync('./input.txt')

const parseBuckets = (input: string) => {
  const stackLines = input.split('\n\n')[0].split('\n')
  stackLines.pop()
  const bucketLines = stackLines
    .map((line) => line.match(/.{3}\s?/g).map((value) => {
      const matches = value.match(/\[(\w)]\s?/)
      return matches ? matches[1] : null
    }))

  return bucketLines.reduce((buckets: (string | null)[][], items) => {
    items.forEach((val, itemKey) => {
      if (!buckets[itemKey]) {
        buckets[itemKey] = []
      }
      if (val) {
        buckets[itemKey].unshift(val)
      }
    })
    return buckets
  }, [])
}

const parseInstructions = (input: string) => {
  return input.split('\n\n')[1]
      .split('\n')
      .map((line) => {
        const matches = line.match(/move (\d+) from (\d+) to (\d+)/)
        if (!matches) {
          throw new Error('no matches')
        }
        return { count: Number(matches[1]), from: Number(matches[2]), to: Number(matches[3])}
      })
}

const doRearrange = (input: string, keepOrder: boolean) => {
  const buckets = parseBuckets(input)
  parseInstructions(input)
    .forEach(({ count, from, to }) => {
      const items = buckets[from-1].splice(buckets[from-1].length - count, count)
      buckets[to-1].push(...(keepOrder ? items : items.reverse()))
    })

  const lastItems = buckets.map((items) => items.slice(-1)[0])
  return lastItems.join('')
}

function part1(input: string) {
  return doRearrange(input, false)
}

function part2(input: string) {
  return doRearrange(input, true)
}


console.log('-- test input')
console.log({ part1: part1(testInput) })
console.log({ part2: part2(testInput) })

console.log('-- real input')
console.log({ part1: part1(input) })
console.log({ part2: part2(input) })


