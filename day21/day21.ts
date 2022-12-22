const testInput = `root: pppw + sjmn
dbpl: 5
cczh: sllz + lgvd
zczc: 2
ptdq: humn - dvpt
dvpt: 3
lfqf: 4
humn: 5
ljgn: 2
sjmn: drzm * dbpl
sllz: 4
pppw: cczh / lfqf
lgvd: ljgn * ptdq
drzm: hmdt - zczc
hmdt: 32`

const input = Deno.readTextFileSync('./input.txt')

interface Monkey {
  name: string
  num?: number
  originalNum?: number
  resolvedValue?: number
  dep1Name?: string
  dep2Name?: string
  dep1?: Monkey
  dep2?: Monkey
  operation?: string
}

const performOperation = (monkey: Monkey) => {
  switch (monkey.operation) {
    case '+':
      monkey.num = monkey.dep1?.num + monkey.dep2?.num
      break
    case '-':
      monkey.num = monkey.dep1?.num - monkey.dep2?.num
      break
    case '*':
      monkey.num = monkey.dep1?.num * monkey.dep2?.num
      break
    case '/':
      monkey.num = monkey.dep1?.num / monkey.dep2?.num
      break
    case '=':
      monkey.num = Number(monkey.dep1?.num === monkey.dep2?.num)
      break
    default:
      throw new Error('wrong operator')
  }
}

const prepMonkeys = (input: string) => {
  const monkeys: Monkey[] = input.split(`\n`).map((line) => {
    const [name, expr] = line.split(': ')
    if (expr.match(/^\d+$/)) {
      return ({ name, originalNum: Number(expr), num: Number(expr) })
    } else {
      const [_, dep1Name, operation, dep2Name] = line.match(/(\w{4}) ([*/+-]) (\w{4})/)!
      return ({ name, dep1Name, dep2Name, operation })
    }
  })

  const monkeyMap = Object.fromEntries(monkeys.map((monkey) => [monkey.name, monkey]))

  monkeys.forEach((monkey) => {
    if (monkey.dep1Name) {
      monkey.dep1 = monkeyMap[monkey.dep1Name]
    }
    if (monkey.dep2Name) {
      monkey.dep2 = monkeyMap[monkey.dep2Name]
    }
  })
  return { monkeys, monkeyMap }
}

function part1(input: string) {
  const { monkeys, monkeyMap } = prepMonkeys(input)

  const resetMonkeys = () => {
    monkeys.forEach((monkey) => {
      monkey.num = monkey.originalNum
    })
  }

  const runLoop = () => {
    let didChanges = false
    while (true) {
      didChanges = false
      for (const monkey of monkeys) {
        if (monkey.num === undefined && monkey.dep1?.num && monkey.dep2?.num) {
          // console.log(` > Processsing ${monkey.name}`)

          performOperation(monkey)
          // console.log(`   > Set monkey ${monkey.name} value to ${monkey.num}`)
          didChanges = true
        }
      }
      if (!didChanges) {
        break
      }
    }
  }

  runLoop()
  const part1 = monkeyMap['root'].num


  monkeyMap['root'].operation = '='

  let i = 700_000_000
  let part2
  while (true) {
    if (i % 10000 === 0) {
      console.log(`Trying ${i}`)
    }
    resetMonkeys()
    monkeyMap['humn']['num'] = i
    runLoop()

    if (monkeyMap['root'].num) {
      part2 = i
      break
    }

    i++
  }



  return { part1, part2 }
}

function part2(input: string) {
  return input
}


console.log('-- test input')
// console.log({ part1: part1(testInput) })
// console.log({ part2: part2(testInput) })

console.log('-- real input')
console.log({ part1: part1(input) })
// console.log({ part2: part2(input) })
