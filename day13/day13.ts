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

function part1(input: string) {
  const pairs: Pair[] = input.split(`\n\n`)
    .map((lines) => lines.split(`\n`)
      .map((line) => JSON.parse(line)))

  const isRight = ([left, right]: Pair, padding: number): boolean | null => {
    console.log(`${' '.repeat(padding)}- Compare ${JSON.stringify(left)} vs ${JSON.stringify(right)}`)
    if (Number.isInteger(left) && Number.isInteger(right)) {
      console.log(`${' '.repeat(padding+2)}- Compare ${left} vs ${right}`)

      if (left === right) {
        return null
      } else if (left < right) {
        console.log(`${' '.repeat(padding+4)}- Left side is smaller, RIGHT order`)
        return true
      } else if (right < left) {
        console.log(`${' '.repeat(padding+4)}- Right side is smaller, NOT RIGHT order`)
        return false
      }
    }

    const l = Array.isArray(left) ? left : [left]
    const r = Array.isArray(right) ? right : [right]

    const maxLen = Math.max(l.length, r.length)

    for (let i=0; i<maxLen; i++) {
      if (l[i] === undefined) {
        console.log(`${' '.repeat(padding+4)}- Left side ran out of items, RIGHT order`)
        return true
      }

      if (r[i] === undefined) {
        console.log(`${' '.repeat(padding+4)}- Right side ran out of items, NOT RIGHT order`)
        // right ran out of items
        return false
      }
      const subPair: Pair = [l[i] as Packet, r[i] as Packet]
      const subRight = isRight(subPair, padding+2)
      if (subRight !== null) {
        return subRight
      }
    }
    return null
  }

  const values: number[] = pairs.reduce((acc: number[], pair, key) => {
    console.log(`== Pair ${key+1} ==`)
    if (isRight(pair, 0)) {
      acc.push(key+1)
    }
    return acc
  }, [])


  return values.reduce((sum, value) => sum + value)
}

function part2(input: string) {
  const packets: Packet[] = input.split(/\n+/)
      .map((line) => JSON.parse(line))

  return packets
}


console.log('-- test input')
console.log({ part1: part1(testInput) })
// console.log({ part2: part2(testInput) })

console.log('-- real input')
console.log({ part1: part1(input) })
// console.log({ part2: part2(input) })
