const testInput = `Blueprint 1: Each ore robot costs 4 ore. Each clay robot costs 2 ore. Each obsidian robot costs 3 ore and 14 clay. Each geode robot costs 2 ore and 7 obsidian.
Blueprint 2: Each ore robot costs 2 ore. Each clay robot costs 3 ore. Each obsidian robot costs 3 ore and 8 clay. Each geode robot costs 3 ore and 12 obsidian.`
const input = Deno.readTextFileSync('./input.txt')
type RobotCosts = Record<Material, CountByMaterial>
interface Blueprint {
  no: number
  robotCosts: RobotCosts
}

type Material = 'ore' | 'clay' | 'obsidian' | 'geode'
type CountByMaterial = Partial<Record<Material, number>>

interface QueueItem {
  materialCounts: CountByMaterial
  robotCounts: CountByMaterial
  blueprint: Blueprint
  actionCount: number
}

const blankCosts: CountByMaterial = {
  ore: 0,
  clay: 0,
  obsidian: 0,
  geode: 0,
}
const incrementMaterials = (materialCounts: CountByMaterial, robotCounts: CountByMaterial) => {
  Object.keys(robotCounts).forEach((robot: Material) => {
    materialCounts[robot] = (materialCounts[robot] ?? 0) + 1
  })
}
const subtractMaterials = (materials: CountByMaterial, materials2: CountByMaterial): CountByMaterial => {
  return {
    ore: (materials['ore'] ?? 0) - (materials2['ore'] ?? 0),
    clay: (materials['clay'] ?? 0) - (materials2['clay'] ?? 0),
    obsidian: (materials['obsidian'] ?? 0) - (materials2['obsidian'] ?? 0),
    geode: (materials['geode'] ?? 0) - (materials2['geode'] ?? 0),
  }
}

const collectMaterials = (materialCounts: CountByMaterial, robotCounts: CountByMaterial): CountByMaterial => {
  return Object.fromEntries(Object.keys(robotCounts).map((robot) => {
    return ([robot, (materialCounts[robot as Material] || 0) + robotCounts[robot as Material]])
  })) as CountByMaterial
}


type RobotFactoryAction = Material | 'none'
type ActionsWithCosts = Partial<Record<RobotFactoryAction, CountByMaterial>>
const getPossibleFactoryBuildActions = (materialCounts: CountByMaterial, blueprint: Blueprint): ActionsWithCosts => {
  const actionsAndLeftoverMaterial: ActionsWithCosts = Object.entries(blueprint.robotCosts)
    .reduce((buildItems: Record<RobotFactoryAction, CountByMaterial>, [robot, costs]) => {
      const leftovers = subtractMaterials(materialCounts, costs)
      const overLimits = Object.entries(leftovers).filter(([, count]) => count < 0)
      if (overLimits.length === 0) {
        buildItems[robot as Material] = leftovers
      }
      return buildItems
    }, {})
  actionsAndLeftoverMaterial['none'] = materialCounts

  return actionsAndLeftoverMaterial
}

const parseBlueprints = (input: string): Blueprint[] => {
  return input.split('\n').map((line) => {
    const matches = line.match(/(\d+)/g)!.map(Number)
    return ({
      no: matches[0],
      robotCosts: {
        geode: { ...blankCosts, ore: matches[5], obsidian: matches[6] },
        obsidian: { ...blankCosts, ore: matches[3], clay: matches[4] },
        clay: { ...blankCosts, ore: matches[2] },
        ore: { ...blankCosts, ore: matches[1] },
      },
    })
  })
}

const run = (blueprints: Blueprint[], minutes: number) => {
  const robotCounts = { ...blankCosts, ore: 1 }
  const materialCounts = { ...blankCosts }

  const queue: QueueItem[] = blueprints.map((blueprint) => {
    return {
      blueprint,
      robotCounts: {...robotCounts},
      materialCounts: {...materialCounts},
      actionCount: 0,
      debugLog: []
    }
  })

  const maxGeodesByBlueprintId: Record<number, number> = {}

  while (queue.length > 0) {
    const queueItem = queue.pop()!

    let toBuild = getPossibleFactoryBuildActions(
      queueItem.materialCounts,
      queueItem.blueprint,
    )

    // skip none and ore if can build something else
    if (toBuild['ore'] && queueItem.materialCounts['ore']! > 10 && toBuild['clay']) {
      delete toBuild['none']
      delete toBuild['ore']
    }

    // only build geode if can
    if (toBuild['geode']) {
      toBuild = {geode: toBuild['geode']}
    }
    // if there's plenty of clay and we could build obsidian, do it
    if (queueItem.materialCounts['clay']! > 20 && toBuild['obsidian']) {
      delete toBuild['none']
      delete toBuild['clay']
      delete toBuild['ore']
    }

    Object.entries(toBuild).forEach(([factoryBuildAction, newMaterialCounts]) => {
      const newRobotCounts = {...queueItem.robotCounts}

      if (factoryBuildAction !== 'none') {
        newRobotCounts[factoryBuildAction as Material]!++
      }

      const newMaterialCounts2 = collectMaterials(newMaterialCounts, queueItem.robotCounts)
      if (queueItem.actionCount < minutes) {
        queue.push({
          blueprint: queueItem.blueprint,
          robotCounts: newRobotCounts,
          materialCounts: newMaterialCounts2,
          actionCount: queueItem.actionCount + 1,
        })
      } else {
        if (newMaterialCounts.geode! >= (maxGeodesByBlueprintId[queueItem.blueprint.no] ?? 0)) {
          maxGeodesByBlueprintId[queueItem.blueprint.no] = newMaterialCounts.geode!
        }
      }
    })
  }
  return maxGeodesByBlueprintId
}

function part1(input: string) {
  const blueprints = parseBlueprints(input)
  const maxGeodesByBlueprintId = run(blueprints, 24)
  const qualityLevels = Object.entries(maxGeodesByBlueprintId)
    .map(([blueprint, max]) => Number(blueprint) * max)

  return qualityLevels.reduce((acc, level) => acc + level)
}

function part2(input: string) {
  const blueprints = parseBlueprints(input).slice(0, 3)
  const maxGeodesByBlueprintId = run(blueprints, 32)

  return Object.values(maxGeodesByBlueprintId)
    .reduce((acc, max) => acc * max)
}


console.log('-- test input')
console.log({ part1: part1(testInput) })
console.log({ part2: part2(testInput) })

console.log('-- real input')
console.log({ part1: part1(input) })
console.log({ part2: part2(input) })
