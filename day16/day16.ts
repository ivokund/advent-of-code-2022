import { Graph } from 'https://esm.sh/graphology'
import {dijkstra} from 'https://esm.sh/graphology-shortest-path';

const testInput = `Valve AA has flow rate=0; tunnels lead to valves DD, II, BB
Valve BB has flow rate=13; tunnels lead to valves CC, AA
Valve CC has flow rate=2; tunnels lead to valves DD, BB
Valve DD has flow rate=20; tunnels lead to valves CC, AA, EE
Valve EE has flow rate=3; tunnels lead to valves FF, DD
Valve FF has flow rate=0; tunnels lead to valves EE, GG
Valve GG has flow rate=0; tunnels lead to valves FF, HH
Valve HH has flow rate=22; tunnel leads to valve GG
Valve II has flow rate=0; tunnels lead to valves AA, JJ
Valve JJ has flow rate=21; tunnel leads to valve II`
const input = Deno.readTextFileSync('./input.txt')

type ValveId = string
type Config = Record<ValveId, {
  rate: number
  to: string[]
}>

interface QueueItem {
  position: ValveId
  valvesOpenedAtMinute: Record<ValveId, number>
  currentMinute: number
}

const parseConfig = (input: string): Config => {
  return input.split('\n').reduce((config: Config, line) => {
    const matches = line.match(/Valve (\w+) has flow rate=(\d+); tunnels? leads? to valves? (.*)/)!
    config[matches[1]] = {
      rate: Number(matches[2]),
      to: matches[3].split(', ')
    }
    return config
  }, {})
}

function doRuns(config: Config, maxMinutes: number) {
  const queue: QueueItem[] = [
    { position: 'AA', valvesOpenedAtMinute: {}, currentMinute: 0 }
  ]

  const highRateValves = Object.entries(config)
    .map(([id, { rate }]) => ({ id, rate }))
    .filter(({ rate }) => rate > 0)
    .sort((a, b) => b.rate - a.rate)

  const bitValveMap = highRateValves.reduce((acc: Record<string,number>, valveId, index) => {
    const num = Math.pow(2, index)
    acc[valveId.id] = num
    return acc
  }, {})

  const graph = new Graph()
  Object.keys(config).forEach((id) => graph.addNode(id))
  Object.entries(config).forEach(([id, { to }]) => {
    to.forEach((id2) => {
      graph.addEdge(id, id2)
    })
  })

  const getPathToValve = (from: ValveId, to: ValveId) => {
    return dijkstra.bidirectional(graph, from, to)
  }

  const paths: Record<string, ValveId[]> = {}
  Object.keys(config).forEach((fromId) => {
    highRateValves.map(({id}) => id)
      .forEach((toId) => {
        paths[`${fromId}_${toId}`] = getPathToValve(fromId, toId)
      })
  })

  const createIndex = (valves: ValveId[]) => [...valves].sort().join(',')

  const maxPressureByValves: Record<string,number> = {}

  const handleEnd = (queueItem: QueueItem) => {
    const totalPressure = Object.entries(queueItem.valvesOpenedAtMinute)
      .reduce((total, [valveId, atMinute]) => {
        return total + config[valveId].rate * (maxMinutes - atMinute )
      }, 0)

    const index = createIndex(Object.keys(queueItem.valvesOpenedAtMinute))
    if (!maxPressureByValves[index] || maxPressureByValves[index] < totalPressure) {
      maxPressureByValves[index] = totalPressure
    }
  }

  while (queue.length > 0) {
    const queueItem = queue.pop()!

    if (queueItem.currentMinute === maxMinutes) {
      handleEnd(queueItem)
      continue
    }

    const highRateOpenValveIds = highRateValves
      .map(({id}) => id)
      .filter((id) => queueItem.valvesOpenedAtMinute[id] === undefined)
      .filter((id) => id !== queueItem.position)

    const possiblePaths = highRateOpenValveIds.map((toId) => {
      const position = queueItem.position
      return paths[`${position}_${toId}`]
    }).filter((path) => queueItem.currentMinute + path.length -1 < maxMinutes)
      .filter((path) => path.length > 1)

    // wait in the same spot until the end, required for part 2
    queue.push({
      position: queueItem.position,
      valvesOpenedAtMinute: Object.assign({}, queueItem.valvesOpenedAtMinute),
      currentMinute: maxMinutes
    })

    let wentSomewhere = false

    possiblePaths.forEach((totalPath) => {
      const [_current, ...path] = totalPath
      const finalPosition = path[path.length - 1]

      const isNotStuck = config[finalPosition].rate > 0
      const isNotOpened = queueItem.valvesOpenedAtMinute[finalPosition] === undefined

      if (isNotStuck && isNotOpened) {
        // valve is closed, create a queue item where it's open
        wentSomewhere = true
        queue.push({
          position: finalPosition,
          valvesOpenedAtMinute: {
            ...queueItem.valvesOpenedAtMinute,
            [finalPosition]: queueItem.currentMinute + path.length + 1
          },
          currentMinute: queueItem.currentMinute + path.length + 1
        })
      } else {
        // move but don't open the valve
        queue.push({
          position: finalPosition,
          valvesOpenedAtMinute: {...queueItem.valvesOpenedAtMinute},
          currentMinute: queueItem.currentMinute + path.length
        })
      }
    })
    if (!wentSomewhere) {
      handleEnd(queueItem)
    }
  }

  const allRuns: { bits:number, pressure: number }[] = Object.entries(maxPressureByValves)
    .map(([valveCsv, pressure]) => {
      const valves = valveCsv.split(',')
      const bits = valves.reduce((acc, valveId) => acc | bitValveMap[valveId], 0)
      return { bits, pressure}
    })

  return allRuns
}


const doParts = (input: string) => {
  const config = parseConfig(input)

  const part1Runs = doRuns(config, 30)
  const part2Runs = doRuns(config, 26)

  let maxDistjointSum = 0
  for (const r1 of part2Runs) {
    for (const r2 of part2Runs) {
      if ((r1.bits & r2.bits) === 0 && r1.pressure + r2.pressure > maxDistjointSum) {
        maxDistjointSum = r1.pressure + r2.pressure
      }
    }
  }

  return {
    part1: Math.max(...part1Runs.map((item) => item.pressure)),
    part2: maxDistjointSum
  }
}


console.log('-- test input')
console.log(doParts(testInput))

console.log('-- real input')
console.log(doParts(input))
