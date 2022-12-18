const testInput = `2,2,2
1,2,2
3,2,2
2,1,2
2,3,2
2,2,1
2,2,3
2,2,4
2,2,6
1,2,5
3,2,5
2,1,5
2,3,5`
const input = Deno.readTextFileSync('./input.txt')

interface Cube {
  x: number
  y: number
  z: number
  isReal: boolean
}

interface Side {
  from: Cube
  to: Cube
}


type SideMap = Record<string, Side>

const areNeighbours = ({x: x1, y: y1, z: z1}: Cube, {x: x2, y: y2, z: z2}: Cube) => {
  const isXNeighbour = y1 === y2 && z1 === z2 && Math.abs(x1 - x2) === 1
  const isYNeighbour = x1 === x2 && z1 === z2 && Math.abs(y1 - y2) === 1
  const isZNeighbour = x1 === x2 && y1 === y2 && Math.abs(z1 - z2) === 1
  return isXNeighbour || isYNeighbour || isZNeighbour
}

const orderCubes = (cube1: Cube, cube2: Cube) => {
  return [cube1, cube2]
    .sort((a, b) => (a.x - b.x) || (a.y - b.y) || (a.z - b.z))
}

const getOrderedIndex = (cubes: Cube[]) => {
  return cubes.map((cube) => `${cube.x},${cube.y},${cube.z}`).join(':')
}

function part1(input: string) {
  const cubes = input.split('\n')
    .map((line) => line.split(',').map(Number))
    .map(([x, y, z]) => ({ x, y, z, isReal: true}))

  const getNeighbouringCubes = (cube: Cube): Cube[] => {
    return cubes.filter((neighbour) => areNeighbours(cube, neighbour))
  }

  const connectedSides = cubes.reduce((sides: SideMap, cube) => {
    getNeighbouringCubes(cube)
      .map((neighbour) => {
        const neighbours = orderCubes(cube, neighbour)
        const sideId = getOrderedIndex(neighbours)
        sides[sideId] = { from: neighbours[0], to: neighbours[1] }
      })
      return sides
  }, {})


  const freeSideIndexMap: SideMap = cubes.reduce((sides: SideMap, cube) => {
    const transformation = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
      [-1, 0, 0],
      [0, -1, 0],
      [0, 0, -1],
    ]

    transformation.forEach(([dx, dy, dz]) => {
      const otherSideCube: Cube = {
        x: cube.x + dx,
        y: cube.y + dy,
        z: cube.z + dz,
        isReal: false
      }
      const neighbours = orderCubes(cube, otherSideCube)
      const sideId = getOrderedIndex(neighbours)
      if (!connectedSides[sideId]) {
        sides[sideId] = { from: neighbours[0], to: neighbours[1]}
      }
    })
    return sides
  }, {})

  const freeSideCount = Object.values(freeSideIndexMap).length

  const minX = Math.min(...cubes.map((cube) => cube.x))
  const maxX = Math.max(...cubes.map((cube) => cube.x))
  const minY = Math.min(...cubes.map((cube) => cube.y))
  const maxY = Math.max(...cubes.map((cube) => cube.y))
  const minZ = Math.min(...cubes.map((cube) => cube.z))
  const maxZ = Math.max(...cubes.map((cube) => cube.z))


  // todo does not work
  // const isNotOnSurface = ({ x, y, z }: Cube) => {
  //
  //   return x > minX && x < maxX
  //     && y > minY && y < maxY
  //     && z > minZ && z < maxZ
  // }

  //
  // const uniqueFreeCubesNotOnSurface = Object.values(freeSideIndexMap)
  //   .reduce((nodes: Record<string, true>, {from, to}) => {
  //     if (!from.isReal && isNotOnSurface(from)) {
  //       nodes[`${from.x},${from.y}.${from.z}`] = true
  //     }
  //     if (!to.isReal && isNotOnSurface(to)) {
  //       nodes[`${to.x},${to.y}.${to.z}`] = true
  //     }
  //     return nodes
  //   }, {})

  // console.log({uniqueFreeCubesNotOnSurface})




  console.log({ minX, maxX, minY, maxY, minZ, maxZ })
  // console.log(isNotOnSurface({x: 2, y:2, z: 3}))

  //
  // const sidesInside = freeSides.reduce((sides: string[], [idx, {from, to}]) => {
  //   if (isNotOnSurface(from) || isNotOnSurface(to)) {
  //     sides.push(idx)
  //   }
  //   return sides
  // }, [])
  //
  // console.log({freeSideCount, sidesInside})


  return {
    part1: freeSideCount,
    // part2: freeSideCount - Object.values(uniqueFreeCubesNotOnSurface).length * 6
  }


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
