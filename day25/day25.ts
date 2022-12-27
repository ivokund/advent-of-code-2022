const testInput = `1=-0-2
12111
2=0=
21
2=01
111
20012
112
1=-1=
1-12
12
1=
122`
const input = Deno.readTextFileSync('./input.txt')

const toDecimal = (snafu: string) => {
  const valueMap: Record<string, number> = {
    '0': 0,
    '1': 1,
    '2': 2,
    '-': -1,
    '=': -2
  }
  const chars = snafu.split('')
  let exp = 0
  const values = []

  while (chars.length) {
    const char = chars.pop()!
    const mult = Math.pow(5, exp)
    values.push(valueMap[char] * mult)
    exp++
  }
  return values.reduce((sum, value) => value + sum)
}

const toSnafu = (decimal: number): string => {
  const snafuDigits: string[] = `0${decimal.toString(5)}`.split('')

  const incrementSnafuDigit = (digit: string) => {
    const map = {
      '=': '-',
      '-': '0',
    }
    return map[digit] ?? (Number(digit) + 1).toString(10)
  }

  let replaced = true

  while (replaced) {
    replaced = false
    for (let i=0; i<snafuDigits.length; i++) {
      if (snafuDigits[i] === '3' || snafuDigits[i] === '4') {
        snafuDigits[i-1] = incrementSnafuDigit(snafuDigits[i-1])
        const newVal = Number(snafuDigits[i]) - 5
        if (newVal === -2) {
          snafuDigits[i] = '='
        } else if (newVal === -1) {
          snafuDigits[i] = '-'
        } else {
          snafuDigits[i] = newVal.toString(10)
        }
        replaced = true
        break
      }
    }
  }
  while (true) {
    if (snafuDigits[0] === '0') {
      snafuDigits.shift()
    } else {
      break
    }
  }

  return snafuDigits.join('')
}



function solve(input: string) {
  const snafuNumbers = input.split('\n')
  const decimal = snafuNumbers
    .reduce((sum, item) => sum + toDecimal(item), 0)
  return toSnafu(decimal)
}

console.log('-- test input')
console.log(solve(testInput))

console.log('-- real input')
console.log(solve(input))
