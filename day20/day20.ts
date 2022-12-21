const testInput = `1
2
-3
3
-2
0
4
16`
const input = Deno.readTextFileSync('./input.txt')

interface Num {
  value: number
  origValue: number
  moved: boolean
}

function part1(input: string) {
  const values = input.split('\n').map(Number)
  const len = values.length
  const getIndex = (idx: number) => (idx + 2 * len) % len

  const nums: Num[] = values.map((origValue) => {
    let value = getIndex(origValue)
    if (origValue < 0) {
      value--
    }
    return {
      origValue,
      value,
      moved: false,
    }
  })

  console.log({nums})

  const getFirstUnmovedIndex = (): number => {
    return nums.findIndex((val) => val.moved === false)
  }
  //
  //
  // console.log({max: Math.max(...values)})
  // console.log({min: Math.min(...values)})
  // console.log({len: values.length})
  // console.log({nums})

  let elementIdx = getFirstUnmovedIndex()

  let i=1
  while (elementIdx !== -1) {
    console.log(`> ROUND ${i++}`)
    // console.log(`  > START: ` + nums.map(({value}) => value).join(', '))

    const element = nums[elementIdx]

    // console.log(`  > Moving ${origValue}, really using ${value}`)
    if (element.value < 0) {
      throw new Error('wtf')
    }

    // console.log(`    > Adding elementIdx (${elementIdx}) + value (${value}) + ${2 * len}`)
    let newIdx = (elementIdx + element.value) + len
    // console.log(`    > New index is ${newIdx}`)
    newIdx %= len
    // console.log(`       > Taking modulo ${len}: ${newIdx}`)
    // console.log(`    > Moving between ${nums[newIdx]?.value} and ${nums[newIdx+1]?.value}`)

    // console.log(`      > Adding ${value} to splice index ${newIdx+1}`)

    // if (newIdx === -1) {
    //   newIdx = len
    // }

    nums.splice(newIdx + 1, 0, {
      ...element,
      moved: true
    })
    // console.log(`         > AFTER ADDING: ` + nums.map(({value}) => value).join(', '))


    let deleteIndex = elementIdx

    if (newIdx < elementIdx) {
      // console.log('INCREASING DELETE INDEX')
      deleteIndex++
    }

    // console.log(`      > Deleting ${nums[deleteIndex].value} from index ${deleteIndex}`)
    nums.splice(deleteIndex, 1)

    // console.log(`  > END: ` + nums.map(({value}) => value).join(', '))
if (i>7) {
  // Deno.exit()
}
    elementIdx = getFirstUnmovedIndex()
  }

  console.log({nums})
  const zeroValIdx = nums.findIndex(({value}) => value === 0)

  const returnValues = [1000, 2000, 3000].map((idx) => {
    const index = getIndex(idx + zeroValIdx)
    return nums[index].origValue
  })

  console.log({returnValues})
  return returnValues.reduce((sum, val) => sum + val)
}

function part2(input: string) {
  return input
}

// 14813
// 4813
console.log('-- test input')
console.log({ part1: part1(testInput) })
// console.log({ part2: part2(testInput) })

console.log('-- real input')
// console.log({ part1: part1(input) })
// console.log({ part2: part2(input) })
