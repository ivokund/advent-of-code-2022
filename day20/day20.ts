const testInput = `1
2
-3
3
-2
0
4`
const input = Deno.readTextFileSync('./input.txt')

interface ListItem {
  origValue: number
  next?: ListItem
  prev?: ListItem
  nextInOrder?: ListItem
}
const DEBUG = false

const _cl = console.debug
console.debug = (msg: string) => {
  if (DEBUG) {
    _cl(msg)
  }
}

const prevBy = (element: ListItem, count: number) => {
  const len = Math.abs(count)
  for (let i=0; i<=len; i++) {
    element = element.prev!
  }
  return element
}
const nextBy = (element: ListItem, count: number) => {
  const len = Math.abs(count)
  for (let i=0; i<len; i++) {
    element = element.next!
  }
  return element
}

const moveBy = (element: ListItem, count: number) => {
  if (count > 0) {
    return nextBy(element, count)
  } else {
    return prevBy(element, count)
  }
}

const draw = (label: string, head: ListItem, len: number) => {
  const items = []
  for (let i=0; i<len; i++) {
    items.push(head.origValue)
    head = head.next!
  }
  console.debug(label + items.join(', '))
}

const createList = (values: number[]): ListItem[] => {
  const len = values.length
  const list: ListItem[] = values.map((origValue) => {
    return {
      origValue,
    }
  })

  for (let idx = 0; idx < len; idx++) {
    list[idx].prev = list[idx-1]
    list[idx].next = list[idx+1]
    list[idx].nextInOrder = list[idx+1]
  }
  list[0].prev = list[len-1]
  list[len-1].next = list[0]
  return list
}

const mix = (list: ListItem[], head: ListItem): ListItem => {
  const len = list.length

  let element: ListItem | undefined = head

  do {
    if (!element) {
      throw new Error('for compiler')
    }

    console.debug(`  > Moving ${element.origValue}`)

    if (element.origValue === 0) {
      element = element.nextInOrder
      continue
    }

    const prev = element.prev!
    const next = element.next!
    console.debug(`    > Moving from between ${prev.origValue} and ${next.origValue}`)

    prev.next = next
    next.prev = prev

    const futurePrev = moveBy(element, element.origValue % (len - 1))
    const futureNext = futurePrev.next!

    element.next = futureNext
    element.prev = futurePrev

    next.prev = prev
    prev.next = next

    futurePrev.next = element
    futureNext.prev = element

    if (element === head) {
      head = next
    }

    element = element.nextInOrder
    draw(`  > END: `, head, len)

  } while (element)
  draw(`> ROUND END: `, head, len)

  return head
}

const getAnswer = (list: ListItem[]) => {
  const zeroValIdx = list.findIndex(({origValue}) => origValue === 0)
  const val1 = nextBy(list[zeroValIdx], 1000)
  const val2 = nextBy(val1, 1000)
  const val3 = nextBy(val2, 1000)

  const returnValues = [val1.origValue, val2.origValue, val3.origValue]
  return returnValues.reduce((sum, val) => sum + val)
}

function part1(input: string) {
  const values = input.split('\n').map(Number)
  const list = createList(values)
  mix(list, list[0])
  return getAnswer(list)
}

function part2(input: string) {
  const KEY = 811589153
  const values = input.split('\n')
    .map((val) => (Number(val) * KEY))

  const list = createList(values)

  const head = list[0]
  for (let mixCount = 0; mixCount < 10; mixCount++) {
    mix(list, head)
  }

  return getAnswer(list)
}

console.log('-- test input')
console.log({ part1: part1(testInput) })
console.log({ part2: part2(testInput) })

console.log('-- real input')
console.log({ part1: part1(input) })
console.log({ part2: part2(input) })
