const testInput = Deno.readTextFileSync('./testInput.txt')
const input = Deno.readTextFileSync('./input.txt')

function solve(input: string) {
  const commands: string[] = input.split('\n')

  let cycleNo = 0
  let registerValue = 1
  let valueToAdd = null

  const signalStrengths: number[] = []

  const getCoordsByCycle = () => {
    const y = Math.floor((cycleNo - 1) / 40)
    const x = cycleNo % 40 - 1
    return [x, y]
  }

  const litPixels: Record<string, boolean> = {}


  const checkValue = () => {
    if ([20, 60, 100, 140, 180, 220].includes(cycleNo)) {
      signalStrengths.push(cycleNo * registerValue)
    }
    const [pixelX, pixelY] = getCoordsByCycle()
    const spriteX = registerValue

    if ([spriteX - 1, spriteX, spriteX + 1].includes(pixelX)) {
      litPixels[`${pixelX},${pixelY}`] = true
    }
  }

  do {
    cycleNo++
    checkValue()
    if (valueToAdd) {
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
  } while (commands.length > 0 || valueToAdd !== null)

  console.log('PART1: ' + signalStrengths.reduce((sum, value) => sum + value))

  console.log('PART2: ')
  for (let rowNo = 0; rowNo < 6; rowNo++) {
    const chars = []
    for (let colNo = 0; colNo < 40; colNo++) {
      chars.push(litPixels[`${colNo},${rowNo}`] ? '#' : '.')
    }
    console.log(`${chars.join('')}`)
  }
}


console.log('-- test input')
solve(testInput)

console.log('-- real input')
solve(input)
