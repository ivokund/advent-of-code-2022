const testInput = `[1,1,3,1,1]
[1,1,5,1,1]

[[1],[2,3,4]]
[[1],4]

[9]
[[8,7,6]]

[[4,4],4,4]
[[4,4],4,4,4]

[7,7,7,7]
[7,7,7]

[]
[3]

[[[]]]
[[]]

[1,[2,[3,[4,[5,6,7]]]],8,9]
[1,[2,[3,[4,[5,6,0]]]],8,9]`
const input = Deno.readTextFileSync('./input.txt')

type Packet = (number | Packet)[]
type Pair = Packet[]

const isRightOrder = ([left, right]: Pair): boolean | null => {
  if (Number.isInteger(left) && Number.isInteger(right)) {
    if (left === right) {
      return null
    } else if (left < right) {
      return true
    } else if (right < left) {
      return false
    }
  }

  const l = Array.isArray(left) ? left : [left]
  const r = Array.isArray(right) ? right : [right]

  const maxLen = Math.max(l.length, r.length)

  for (let i=0; i<maxLen; i++) {
    if (l[i] === undefined) {
      return true
    }

    if (r[i] === undefined) {
      // right ran out of items
      return false
    }
    const subRight = isRightOrder([l[i] as Packet, r[i] as Packet])
    if (subRight !== null) {
      return subRight
    }
  }
  return null
}

function part1(input: string) {
  const pairs: Pair[] = input.split(`\n\n`)
    .map((lines) => lines.split(`\n`)
      .map((line) => JSON.parse(line)))

  const values: number[] = pairs.reduce((acc: number[], pair, key) => {
    if (isRightOrder(pair)) {
      acc.push(key+1)
    }
    return acc
  }, [])


  return values.reduce((sum, value) => sum + value)
}

function part2(input: string) {
  const packets: Packet[] = input.split(/\n+/)
      .map((line) => JSON.parse(line))
  packets.push([[2]])
  packets.push([[6]])

  packets.sort((a, b) => {
    const isRight = isRightOrder([a, b])
    return isRight === null ? 0 : (isRight ? -1 : 1)
  })

  const serialized = packets.map((packet) => JSON.stringify(packet))
  const index1 = serialized.findIndex((line) => line === '[[2]]')
  const index2 = serialized.findIndex((line) => line === '[[6]]')

  return (index1 + 1) * (index2 + 1)
}


console.log('-- test input')
console.log({ part1: part1(testInput) })
console.log({ part2: part2(testInput) })

console.log('-- real input')
console.log({ part1: part1(input) })
console.log({ part2: part2(input) })
