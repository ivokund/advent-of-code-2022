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
type ValveAction = ValveId | 'open'
type Config = Record<ValveId, {
  rate: number
  to: string[]
}>

interface QueueItem {
  history: ValveAction[]
  valvesOpenedAtMinute: Record<ValveId, number>
  currentMinute: number
}

const getLastPos = (history: ValveAction[]): ValveId => {
  if (history[history.length-1] === 'open') {
    return history[history.length-2]
  }
  return history[history.length-1]
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

function part1(input: string) {
  const config = parseConfig(input)
  const queue: QueueItem[] = [
    { history: ['AA'], valvesOpenedAtMinute: {}, currentMinute: 0 }
  ]

  let mostPressure = 0

  const highRateValves = Object.entries(config)
    .map(([id, { rate }]) => ({ id, rate }))
    .filter(({ rate }) => rate > 0)
    .sort((a, b) => b.rate - a.rate)

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

  while (queue.length > 0) {
    const queueItem = queue.pop()!

    if (queueItem.currentMinute === 30) {
      const totalPressure = Object.entries(queueItem.valvesOpenedAtMinute)
        .reduce((total, [valveId, atMinute]) => {
            return total + config[valveId].rate * (30 - atMinute )
        }, 0)
      if (totalPressure > mostPressure) {
        mostPressure = totalPressure
      }
      continue
    }

    const highRateOpenValveIds = highRateValves
      .map(({id}) => id)
      .filter((id) => queueItem.valvesOpenedAtMinute[id] === undefined)
      .filter((id) => id !== getLastPos(queueItem.history))

    const possiblePaths = highRateOpenValveIds.map((toId) => {
      const position = getLastPos(queueItem.history)
      return paths[`${position}_${toId}`]
    }).filter((path) => queueItem.currentMinute + path.length -1 < 30)
      .filter((path) => path.length > 1)

    if (possiblePaths.length === 0 && queueItem.currentMinute < 30) {
      // wait until the end
      queue.push({
        history: [...queueItem.history],
        valvesOpenedAtMinute: Object.assign({}, queueItem.valvesOpenedAtMinute),
        currentMinute: 30
      })
      // no more reasonable moves to make
    }

    possiblePaths.forEach((totalPath) => {
      const [_current, ...path] = totalPath
      const finalPosition = path[path.length - 1]
      const newHistory = [...queueItem.history, ...path]

      const isNotStuck = config[finalPosition].rate > 0
      const isNotOpened = queueItem.valvesOpenedAtMinute[finalPosition] === undefined

      if (isNotStuck && isNotOpened) {
        // valve is closed, create a queue item where it's open
        queue.push({
          history: [...newHistory, 'open'],
          valvesOpenedAtMinute: {
            ...queueItem.valvesOpenedAtMinute,
            [finalPosition]: queueItem.currentMinute + path.length + 1
          },
          currentMinute: queueItem.currentMinute + path.length + 1
        })
      } else {
        queue.push({
          history: newHistory,
          valvesOpenedAtMinute: Object.assign({}, queueItem.valvesOpenedAtMinute),
          currentMinute: queueItem.currentMinute + path.length
        })
      }
    })
  }

  return mostPressure
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
