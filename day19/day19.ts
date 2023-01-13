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
  buildHistory: RobotFactoryAction[]
  actionCount: number
  debugLog: string[]
}

const blankCosts: CountByMaterial = {
  ore: 0,
  clay: 0,
  obsidian: 0,
  geode: 0,
}

const subtractMaterials = (materials: CountByMaterial, materials2: CountByMaterial): CountByMaterial => {
  return {
    ore: (materials['ore'] ?? 0) - (materials2['ore'] ?? 0),
    clay: (materials['clay'] ?? 0) - (materials2['clay'] ?? 0),
    obsidian: (materials['obsidian'] ?? 0) - (materials2['obsidian'] ?? 0),
    geode: (materials['geode'] ?? 0) - (materials2['geode'] ?? 0),
  }
}
// const subtractMaterials = (materials: CountByMaterial, materials2: CountByMaterial): CountByMaterial => {
//   return Object.fromEntries(Object.entries(materials).map(([material, counts]) => {
//     return [material, counts - materials2[material as Material] ?? 0]
//   })) as CountByMaterial
// }

const incrementMaterials = (materialCounts: CountByMaterial, robotCounts: CountByMaterial) => {
  Object.keys(robotCounts).forEach((robot: Material) => {
    materialCounts[robot] = (materialCounts[robot] ?? 0) + 1
  })
}
const collectMaterials = (materialCounts: CountByMaterial, robotCounts: CountByMaterial): CountByMaterial => {

  return Object.fromEntries(Object.keys(robotCounts).map((robot) => {
    return ([robot, (materialCounts[robot as Material] || 0) + robotCounts[robot as Material]])
  })) as CountByMaterial
}


type RobotFactoryAction = Material | 'none'
type ActionsWithCosts = Partial<Record<RobotFactoryAction, CountByMaterial>>
const getPossibleFactoryBuildActions = (materialCounts: CountByMaterial, blueprint: Blueprint, forceItem: RobotFactoryAction | undefined): ActionsWithCosts => {
  const actionsAndLeftoverMaterial: ActionsWithCosts = Object.entries(blueprint.robotCosts)
    .reduce((buildItems: Record<RobotFactoryAction, CountByMaterial>, [robot, costs]) => {

      if (forceItem && robot !== forceItem) { return buildItems }
      const leftovers = subtractMaterials(materialCounts, costs)
      const overLimits = Object.entries(leftovers).filter(([, count]) => count < 0)
      if (overLimits.length === 0) {
        buildItems[robot as Material] = leftovers
      }
      return buildItems
    }, {})
  if (!forceItem || forceItem === 'none'){
    actionsAndLeftoverMaterial['none'] = materialCounts
  }

  return actionsAndLeftoverMaterial
}

function part1(input: string) {
  const blueprints: Blueprint[] = input.split('\n').map((line) => {
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

  const robotCounts = { ...blankCosts, ore: 1 }
  const materialCounts = { ...blankCosts }


  const queue: QueueItem[] = blueprints.map((blueprint) => {
    return {
      blueprint,
      robotCounts: {...robotCounts},
      materialCounts: {...materialCounts},
      buildHistory: [],
      actionCount: 0,
      debugLog: []
    }
  })

  // const mock: (RobotFactoryAction)[] = [
  //   'none',
  //   'none',
  //   'clay',
  //   'none',
  //   'clay',
  //   'none',
  //   'clay',
  //   'none',
  //   'none',
  //   'none',
  //   'obsidian',
  //   'clay',
  //   'none',
  //   'none',
  //   'obsidian',
  //   'none',
  //   'none',
  //   'geode',
  //   'none',
  //   'none',
  //   'geode',
  //   'none',
  //   'none',
  //   'none',
  // ]

  let maxGeodes = 0
  let maxGeodesHistory: RobotFactoryAction[] = []

  const maxGeodesByBlueprintId: Record<number, number> = {}

  let i=0
  while (queue.length > 0) {
    i++

    const queueItem = queue.pop()!

    const history = queueItem.buildHistory.join('>')
    if (i % 1000000 === 0) {
      console.log(`> ${i}, MINUTE ${queueItem.buildHistory.length+1} (${history}), blueprint: ${queueItem.blueprint.no}, queue length: ${queue.length}, max: ${maxGeodes}`)

      console.log({i, robots: queueItem.robotCounts, materials: queueItem.materialCounts})
      console.log({maxGeodesByBlueprintId})
    }

    // const mockChoice = mock[queueItem.buildHistory.length]

    let toBuild = getPossibleFactoryBuildActions(
      queueItem.materialCounts,
      queueItem.blueprint,
      undefined,
      // mockChoice
    )

    // skip none and ore if can build something else
    if (toBuild['ore'] && queueItem.materialCounts['ore'] > 10 && toBuild['clay']) {
      delete toBuild['none']
      delete toBuild['ore']
    }

    // only build geode if can
    if (toBuild['geode']) {
      toBuild = {geode: toBuild['geode']}
    }

    if (queueItem.materialCounts['clay'] > 20 && toBuild['obsidian']) {
      delete toBuild['none']
      delete toBuild['clay']
      delete toBuild['ore']
    }


    if (i % 1000000 === 0) {
      console.log({materialCounts:queueItem.materialCounts})
      console.log({toBuild})
    }

    Object.entries(toBuild).forEach(([factoryBuildAction, newMaterialCounts]) => {
      const newLogItems = [`== Minute ${queueItem.buildHistory.length+1} ==`]

      const newRobotCounts = {...queueItem.robotCounts}

      let material = null
      if (factoryBuildAction !== 'none') {
        material = factoryBuildAction as Material
        // console.log(`  > Action: ${factoryBuildAction}`)
        newLogItems.push(`Spend ${JSON.stringify(queueItem.blueprint.robotCosts[material])} to start building a ${material}-collecting robot `)
        newRobotCounts[factoryBuildAction as Material]++
      }


      const newMaterialCounts2 = collectMaterials(newMaterialCounts, queueItem.robotCounts)
      // incrementMaterials(newMaterialCounts, queueItem.robotCounts)
      // Object.entries(newMaterialCounts).forEach(([material, newCount]) => {
      //   const added = newCount - newMaterialCounts[material as Material]
      //   newLogItems.push(`${queueItem.robotCounts[material as Material]} ${material}-collecting robots collect ${added} ${material}; you now have ${newCount} ${material} `)
      // })

      // const newHistory = [...queueItem.buildHistory, factoryBuildAction as RobotFactoryAction]
      if (queueItem.actionCount < 24) {
        // console.log(`  > New robots count: ${JSON.stringify(newRobotCounts)}`)
        // console.log(`  > New material count: ${JSON.stringify(newMaterialCounts)}`)
        // console.log(`  > History: ${JSON.stringify(newHistory)}`)
        if (material) {
          // newLogItems.push(`The new ${material}-collecting robot is ready. You now have ${newRobotCounts[material]} of them`)
        } else {
          // newLogItems.push(`Did not build anything this minute`)
        }
        queue.push({
          blueprint: queueItem.blueprint,
          robotCounts: newRobotCounts,
          materialCounts: newMaterialCounts2,
          actionCount: queueItem.actionCount + 1,
          buildHistory: [], //newHistory,
          debugLog: [], //[...queueItem.debugLog, '', ...newLogItems],
        })
      } else {
        // console.log({newMaterialCounts2})
        if (newMaterialCounts.geode >= (maxGeodesByBlueprintId[queueItem.blueprint.no] ?? 0)) {
          maxGeodesByBlueprintId[queueItem.blueprint.no] = newMaterialCounts.geode
        }
        // if (newMaterialCounts.geode > maxGeodes) {
        //   maxGeodes = newMaterialCounts.geode
        //   maxGeodesHistory = newHistory
        // }
      }
    })
    // todo: skip wait if there are resources to build geode robots?
    if (i>10) {
      // Deno.exit()
    }
  }

  console.log('Done')
  console.log({maxGeodesByBlueprintId})

  const qualityLevels = Object.entries(maxGeodesByBlueprintId).map(([blueprint, max]) => {
    return Number(blueprint) * max
  })
  console.log({qualityLevels})

  const sum = qualityLevels.reduce((acc, level) => acc + level)
  console.log({sum})
  return sum
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
