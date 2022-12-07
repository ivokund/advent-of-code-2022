const testInput = `$ cd /
$ ls
dir a
14848514 b.txt
8504156 c.dat
dir d
$ cd a
$ ls
dir e
29116 f
2557 g
62596 h.lst
$ cd e
$ ls
584 i
$ cd ..
$ cd ..
$ cd d
$ ls
4060174 j
8033020 d.log
5626152 d.ext
7214296 k`

const input = Deno.readTextFileSync('./input.txt')

interface File {
  size: number
  name: string
  path: string
}

const getDirSizes = (input: string): Record<string, number> => {
  const lines = input.split('\n')
  let pwd: string[] = []
  const files: File[] = []
  const dirSizes: Record<string, number> = {}

  do {
    const line = lines.shift()
    const parts = line!.split(' ')
    if (parts[0] === '$') {
      if (parts[1] === 'cd') {
        if (parts[2] === '..') {
          pwd.pop()
        } else if (parts[2] === '/') {
          pwd = ['']
        } else {
          pwd.push(parts[2])
        }
        const path = pwd.join('/') || '/'
        dirSizes[path] = 0
      } else if (parts[1] === 'ls') {
        // nothing to do
      } else {
        throw new Error('invalid command')
      }
    } else if (parts[0] === 'dir') {
      // nothing
    } else {
      files.push({
        name: parts[1],
        size: Number(parts[0]),
        path: pwd.join('/') || '/'
      })
    }
  } while (lines.length > 0)

  files.forEach((file) => {
    Object.keys(dirSizes).forEach((dir) => {
      if (file.path.startsWith(dir)) {
        dirSizes[dir] += file.size
      }
    })
  })
  return dirSizes
}

function part1(input: string) {
  const dirSizes = getDirSizes(input)

  return Object.values(dirSizes)
    .filter((size) => size <= 100000)
    .reduce((sum, size) => sum + size)
}

function part2(input: string) {
  const TOTAL = 70000000
  const REQUIRED = 30000000

  const dirSizes = getDirSizes(input)

  const usedSpace = dirSizes['/']
  const freeSpace = TOTAL - usedSpace
  const needToFreeUp = REQUIRED - freeSpace

  const applicableFolders = Object.values(dirSizes)
    .filter((size) => size > needToFreeUp)
  return Math.min(...applicableFolders)
}


console.log('-- test input')
console.log({ part1: part1(testInput) })
console.log({ part2: part2(testInput) })

console.log('-- real input')
console.log({ part1: part1(input) })
console.log({ part2: part2(input) })
