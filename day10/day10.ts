const testInput = Deno.readTextFileSync('./testInput.txt')
const input = Deno.readTextFileSync('./input.txt')

function part1(input: string) {
  const commands: string[] = input.split('\n')

  let cycleNo = 0
  let registerValue = 1
  let valueToAdd = null

  const signalStrengths: number[] = []

  const checkValue = () => {
    if ([20, 60, 100, 140, 180, 220].includes(cycleNo)) {
      signalStrengths.push(cycleNo * registerValue)
    }
  }

  do {
    cycleNo++
    checkValue()
    // console.log(`> Cycle ${cycleNo} starts, value: ${registerValue}`)
    if (valueToAdd) {
      // console.log(`  > Addition: adding ${valueToAdd} to register value ${registerValue}`)
      registerValue += valueToAdd
      valueToAdd = null
      continue
    }

    const [command, value] = commands.shift()!.split(' ')

    if (command === 'noop') {
      // does nothing
    } else if (command === 'addx') {
      valueToAdd = Number(value)
    }
    // console.log(`> Cycle ${cycleNo} ends, value: ${registerValue}`)

  } while (commands.length > 0 || valueToAdd !== null)

  return signalStrengths.reduce((sum, value) => sum + value)
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
