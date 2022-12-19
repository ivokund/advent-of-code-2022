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
}

interface Side {
  from: Cube
  to: Cube
}

type SideMap = Record<string, Side>

const sideTransformation = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
  [-1, 0, 0],
  [0, -1, 0],
  [0, 0, -1],
]
const toCoords = ({x, y, z}: Cube) => `${x},${y},${z}`
const isBetweenIncl = (x: number, min: number, max: number) => {
  return x >= min && x <= max
}

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
  return cubes.map((cube) => toCoords(cube)).join(':')
}

const getFreeSideCount = (cubes: Cube[]) => {
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
    sideTransformation.forEach(([dx, dy, dz]) => {
      const otherSideCube: Cube = {
        x: cube.x + dx,
        y: cube.y + dy,
        z: cube.z + dz,
      }
      const neighbours = orderCubes(cube, otherSideCube)
      const sideId = getOrderedIndex(neighbours)
      if (!connectedSides[sideId]) {
        sides[sideId] = { from: neighbours[0], to: neighbours[1]}
      }
    })
    return sides
  }, {})

  return Object.values(freeSideIndexMap).length
}

function solve(input: string) {
  const cubes = input.split('\n')
    .map((line) => line.split(',').map(Number))
    .map(([x, y, z]) => ({ x, y, z}))

  const freeSideCount = getFreeSideCount(cubes)

  const minX = Math.min(...cubes.map((cube) => cube.x)) - 1
  const maxX = Math.max(...cubes.map((cube) => cube.x)) + 1
  const minY = Math.min(...cubes.map((cube) => cube.y)) - 1
  const maxY = Math.max(...cubes.map((cube) => cube.y)) + 1
  const minZ = Math.min(...cubes.map((cube) => cube.z)) - 1
  const maxZ = Math.max(...cubes.map((cube) => cube.z)) + 1

  const cubeSet = new Set(cubes.map(({x, y, z}) => `${x},${y},${z}`))
  const parsedCoordsSet = new Set()
  const fillSet = new Set()
  const queue: Cube[] = [{x: minX, y: minY, z: minZ}]

  while (queue.length > 0) {
    const cube = queue.pop()!
    const coords = toCoords(cube)
    fillSet.add(coords)
    parsedCoordsSet.add(coords)

    for (const [dx, dy, dz] of sideTransformation) {
      const newCube: Cube = {x: cube.x + dx, y: cube.y + dy, z: cube.z + dz}
      const newCubeCoords = toCoords(newCube)
      if (!isBetweenIncl(newCube.x, minX, maxX)) {
        continue // outside X bounds
      }
      if (!isBetweenIncl(newCube.y, minY, maxY)) {
        continue // outside Y bounds
      }
      if (!isBetweenIncl(newCube.z, minZ, maxZ)) {
        continue // outside Z bounds
      }
      if (cubeSet.has(newCubeCoords)) {
        continue // part of cube
      }
      if (parsedCoordsSet.has(newCubeCoords)) {
        continue // already parsed
      }

      queue.push(newCube)
    }
  }

  const airPocketSet = new Set<string>()
  // find out air pockets
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      for (let z = minZ; z <= maxZ; z++) {
        const coord = `${x},${y},${z}`
        if (!cubeSet.has(coord) && !fillSet.has(coord)) {
          airPocketSet.add(coord)
        }
      }
    }
  }
  const airPocketCubes: Cube[] = [...airPocketSet].map((coords) => {
    const [x, y, z] = coords.split(',').map(Number)
    return { x, y, z }
  })

  const airPocketSideCount = getFreeSideCount(airPocketCubes)

  return {
    part1: freeSideCount,
    part2: freeSideCount - airPocketSideCount
  }
}

console.log('-- test input')
console.log(solve(testInput))

console.log('-- real input')
console.log(solve(input))
