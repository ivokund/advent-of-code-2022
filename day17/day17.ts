const testInput = `>>><<><>><<<>><>>><<<>>><<<><<<>><>><<>>`
const input = Deno.readTextFileSync('./input.txt')

const rocks = [
  [[0, 0], [1, 0], [2, 0], [3, 0]],           // --
  [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]],   // +
  [[2, 2], [2, 1], [2, 0], [1, 0], [0, 0]],   // _|
  [[0, 0], [0, 1], [0, 2], [0, 3]],           // |
  [[0, 0], [0, 1], [1, 0], [1, 1]],           // []
]

type Jet = '>' | '<'
type Coord = { x: number, y: number }
type Rock = Coord[]


function part1(input: string) {
  const jets = input.split('')
  let rockIdx = 0
  let jetIdx = 0

  const maxX = 6
  const settledRockMap: Record<string, Coord> = {}

  const moveRockBy = (rock: Rock, dx: number, dy: number) => {
    return rock.map(({x, y}) => ({x: x + dx, y: y + dy}))
  }

  const getNextRock = (): Rock => {
    const rock: Coord[] = rocks[rockIdx].map(([x, y]) => ({x, y}))
    rockIdx = rockIdx === rocks.length - 1 ? 0 : rockIdx + 1
    const settledMax = Math.max(...(Object.values(settledRockMap).map(({y}) => y + 1)), 0)


    const dx = 2
    const dy = settledMax + 3
    return moveRockBy(rock, dx, dy)
  }

  const draw = (rock: Rock) => {
    const colCount = maxX+1
    const settledMaxY = Math.max(...Object.values(settledRockMap).map(({y}) => y), 0)
    const movingMaxY = rock ? Math.max(...rock.map(({y}) => y)) : 0
    const topmostY = Math.max(settledMaxY, movingMaxY)

    console.log(' ')
    for (let y=topmostY; y>=0; y--) {
      const row = ['|']
      for (let x=0; x<colCount; x++) {
        if (settledRockMap[`${x},${y}`]) {
          row.push('#')
        } else if (rock.find((rock) => rock.x === x && rock.y ===y )) {
          row.push('@')
        } else {
          row.push('.')
        }
      }
      row.push('|')
      console.log(row.join(''))
    }
    console.log(`+${'-'.repeat(colCount)}+`)
  }

  const getNextJet = (): Jet => {
    const jet = jets[jetIdx]
    jetIdx = jetIdx === jets.length - 1 ? 0 : jetIdx + 1
    return jet as Jet
  }

  const rockFits = (rock: Rock): boolean => {
    const conflicts = rock.filter(({x, y}) => {
      if (x > maxX || x < 0 || y < 0) {
        return true
      }

      return settledRockMap[`${x},${y}`]
    })
    return conflicts.length === 0
  }

  let rockCount=1
  let movingRock = getNextRock()
  // draw(movingRock)

  do {
    // console.log('start')
    // draw(movingRock)

    const jet = getNextJet()
    // console.log('next jet is ' + jet)
    const jetDeltaX = jet === '>' ? 1 : -1

    const jetPropelledRock = moveRockBy(movingRock, jetDeltaX, 0)

    if (rockFits(jetPropelledRock)) {
      movingRock = jetPropelledRock
      // console.log('jet moved the rock')
      // draw(movingRock)
    } else {
      // console.log('jet cannot move')
    }

    const gravityPropelledRock = moveRockBy(movingRock, 0, -1)
    if (rockFits(gravityPropelledRock)) {
      // console.log('moved rock down')
      movingRock = gravityPropelledRock
      // draw(movingRock)
    } else {
      movingRock.forEach(({x, y}) => {
        settledRockMap[`${x},${y}`] = {x, y}
      })
      movingRock = getNextRock()
      rockCount++
      // console.log('settled new rock')
      // draw(movingRock)
    }
  } while (rockCount<2023)



  return Math.max(...Object.values(settledRockMap).map(({y}) => y)) + 1
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
