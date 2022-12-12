const testInput = `Monkey 0:
  Starting items: 79, 98
  Operation: new = old * 19
  Test: divisible by 23
    If true: throw to monkey 2
    If false: throw to monkey 3

Monkey 1:
  Starting items: 54, 65, 75, 74
  Operation: new = old + 6
  Test: divisible by 19
    If true: throw to monkey 2
    If false: throw to monkey 0

Monkey 2:
  Starting items: 79, 60, 97
  Operation: new = old * old
  Test: divisible by 13
    If true: throw to monkey 1
    If false: throw to monkey 3

Monkey 3:
  Starting items: 74
  Operation: new = old + 3
  Test: divisible by 17
    If true: throw to monkey 0
    If false: throw to monkey 1`
const input = Deno.readTextFileSync('./input.txt')


interface Monkey {
  no: number
  items: number[]
  operation: 'add' | 'multiply'
  argument: number | 'old'
  divisibleBy: number
  trueMonkeyNo: number
  falseMonkeyNo: number
}

const parseMonkey = (input: string): Monkey => {
  const lines = input.split('\n')

  const argument = lines[2].split(' ').pop()

  return {
    no: Number(lines[0].split(' ')[1].slice(0, 1)),
    items: lines[1].split(': ')[1].split(', ').map(Number),
    operation: lines[2].indexOf('*') === -1 ? 'add' : 'multiply',
    argument: argument === 'old' ? 'old' : Number(argument),
    divisibleBy: Number(lines[3].split('by ')[1]),
    trueMonkeyNo: Number(lines[4].split(' ').slice(-1)[0]),
    falseMonkeyNo: Number(lines[5].split(' ').slice(-1)[0]),
  }
}


function part1(input: string) {
  const monkeys = input.split('\n\n').map(parseMonkey)

  const inspectionCounts: Record<number, number> = {}
  for (let round = 0; round < 20; round++) {
    // console.log(`\n====\nROUND ${round}`)
    monkeys.forEach((monkey) => {

      // console.log(`Monkey ${monkey.no}`)
      while (monkey.items.length > 0) {
        const level = monkey.items.shift()!

        // console.log(`  Monkey inspects an item with worry level of ${level}`)
        inspectionCounts[monkey.no] = (inspectionCounts[monkey.no] || 0) + 1

        const arg = monkey.argument === 'old' ? level : monkey.argument
        const newWorryLevel = monkey.operation === 'add' ? level + arg : level * arg
        // console.log(`    Worry level is multiplied by ${monkey.argument} to ${newWorryLevel}`)

        const worryLevel2 = Math.floor(newWorryLevel / 3)
        // console.log(`    Monkey gets bored with item. Worry level is divided by 3 to ${worryLevel2}`)

        const isDivisible = worryLevel2 % monkey.divisibleBy === 0
        // console.log(`    Current worry level ${isDivisible ? 'is' : 'is NOT'} divisible by ${monkey.divisibleBy}.`)

        const toMonkey = isDivisible ? monkey.trueMonkeyNo : monkey.falseMonkeyNo
        // console.log(`    Item with worry level ${worryLevel2} is thrown to monkey ${toMonkey}.`)
        monkeys.find((item) => item.no === toMonkey)!.items.push(worryLevel2)
      }
    })
    // console.log(`After round ${round}:`)
    // monkeys.forEach((monkey) => {
    //   console.log(` Monkey ${monkey.no}: ${monkey.items}`)
    // })
  }

  // console.log(`\n\n`)
  // Object.entries(inspectionCounts).forEach(([num, count]) => {
  //   console.log(`Monkey ${num} has inspected ${count} times`)
  // })

  const mostActiveCounts = Object.values(inspectionCounts).sort((a, b) => b - a)

  return mostActiveCounts.shift()! * mostActiveCounts.shift()!
}

function part2(input: string) {
  return input
}


console.log('-- test input')
console.log({ part1: part1(testInput) })
// console.log({ part2: part2(testInput) })

console.log('-- real input')
console.log({ part1: part1(input) })
// console.log({ part2: part2(input) })
