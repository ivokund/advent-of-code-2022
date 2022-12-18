const testInput = `Sensor at x=2, y=18: closest beacon is at x=-2, y=15
Sensor at x=9, y=16: closest beacon is at x=10, y=16
Sensor at x=13, y=2: closest beacon is at x=15, y=3
Sensor at x=12, y=14: closest beacon is at x=10, y=16
Sensor at x=10, y=20: closest beacon is at x=10, y=16
Sensor at x=14, y=17: closest beacon is at x=10, y=16
Sensor at x=8, y=7: closest beacon is at x=2, y=10
Sensor at x=2, y=0: closest beacon is at x=2, y=10
Sensor at x=0, y=11: closest beacon is at x=2, y=10
Sensor at x=20, y=14: closest beacon is at x=25, y=17
Sensor at x=17, y=20: closest beacon is at x=21, y=22
Sensor at x=16, y=7: closest beacon is at x=15, y=3
Sensor at x=14, y=3: closest beacon is at x=15, y=3
Sensor at x=20, y=1: closest beacon is at x=15, y=3`
const input = Deno.readTextFileSync('./input.txt')

interface Coord {
  x: number
  y: number
}

interface DataPoint {
  sensor: Coord
  beacon: Coord
  radius: number
}

interface Line {
  from: Coord
  to: Coord
}

const getDistance = (a: Coord, b: Coord): number => {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}

const createDataPoints = (input: string): DataPoint[] => {
  return input.split('\n')
    .map((line) => {
      const matches =
        line.match(/Sensor at x=(-?\d+), y=(-?\d+): closest beacon is at x=(-?\d+), y=(-?\d+)/)!
      const [, sensorX, sensorY, beaconX, beaconY] = matches.map(Number)

      const sensor: Coord = { x: sensorX, y: sensorY }
      const beacon: Coord = { x: beaconX, y: beaconY }
      const radius = getDistance(sensor, beacon)
      return { sensor, beacon, radius }
    })
}


const analyzeHorizontalLine = (dataPoints: DataPoint[], lineNo: number) => {
  const coveredSegments = dataPoints.reduce((acc: Line[], {sensor, radius}) => {
    const sensorDistance = Math.abs(sensor.y - lineNo)
    if (radius >= sensorDistance) {
      const overlap = radius - sensorDistance
      acc.push({
        from: {
          x: sensor.x - overlap,
          y: lineNo
        },
        to: {
          x: sensor.x + overlap,
          y: lineNo
        }
      })
    }
    return acc
  }, [])

  coveredSegments.sort((a, b) => a.from.x - b.from.x)
  let covered = 0
  const free: number[] = []

  let x = coveredSegments[0].from.x
  for (let segmentNo = 0; segmentNo < coveredSegments.length; segmentNo++) {
    const segStart = coveredSegments[segmentNo].from.x
    const segEnd = coveredSegments[segmentNo].to.x

    // gap, adding free nodes until segment start
    if (segStart > x && segmentNo < coveredSegments.length - 1) {
      while (++x <= segStart -1 ) {
        free.push(x)
      }
    }

    // this new segment is already past our cursor, ignore and take next
    if (segEnd <= x) {
      continue
    }

    // new segment starts at or before our cursor
    if (segStart <= x) {
      const moveBy = segEnd - x
      covered += moveBy
      x += moveBy
      continue
    }
  }
  const minX = Math.min(...coveredSegments.map(({from}) => from.x))
  const maxX = Math.max(...coveredSegments.map(({to}) => to.x))
  return { minX, maxX, covered, free }
}

function part1(input: string, lineNo: number) {
  const dataPoints = createDataPoints(input)
  const { covered } = analyzeHorizontalLine(dataPoints, lineNo)
  return covered
}

function part2(input: string, coordMin: number, coordMax: number) {
  const dataPoints = createDataPoints(input)

  const minY = Math.min(...dataPoints.map((dp) => dp.beacon.y - dp.radius))
  const maxY = Math.max(...dataPoints.map((dp) => dp.beacon.y + dp.radius))

  const loopMaxY = Math.min(maxY, coordMax)

  const loopMinY = Math.max(minY, coordMin)

  for (let i=loopMinY; i<=loopMaxY; i++) {
    const { free } = analyzeHorizontalLine(dataPoints, i)

    if (free.length === 1) {
      return free[0] * 4000000 + i
    }
  }
  return input
}


console.log('-- test input')
console.log({ part1: part1(testInput, 10) })
console.log({ part2: part2(testInput, 0, 20) })

console.log('-- real input')
console.log({ part1: part1(input, 2000000) })
console.log({ part2: part2(input, 0, 4000000) })
