const draw = (coords: number[][]) => {
    const maxX = Math.max(...coords.map(([x, y]) => x))
    const minX = Math.min(...coords.map(([x, y]) => x))
    const minY = Math.min(...coords.map(([x, y]) => y))
    const maxY = Math.max(...coords.map(([x, y]) => y))
    for (let y=minY; y <= maxY; y++) {
        const line = []
        for (let x = minX; x <= maxX; x++) {
            const a = coords.findIndex(([rx, ry]) => rx === x && ry === y)
            if (a === -1) {
                line.push('.')
            } else {
                line.push(a === 0 ? 'H' : a)
            }
        }
        console.log(line.join(''))
    }
    console.log('\n')
}