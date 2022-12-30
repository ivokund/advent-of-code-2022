const testInput = `root: pppw + sjmn
dbpl: 5
cczh: sllz + lgvd
zczc: 2
ptdq: humn - dvpt
dvpt: 3
lfqf: 4
humn: 5
ljgn: 2
sjmn: drzm * dbpl
sllz: 4
pppw: cczh / lfqf
lgvd: ljgn * ptdq
drzm: hmdt - zczc
hmdt: 32`

const input = Deno.readTextFileSync('./input.txt')

type Operation = '*' | '/' | '+' | '-'

interface Expression {
  name: string
  a?: string
  b?: string
  op?: Operation
  value?: number
}

const tryEvaluate = (expressions: Expression[], name: string): number => {
  let replaced = true
  while (replaced) {
    replaced = false

    const mapOfValues = Object.fromEntries(expressions
      .filter(({ value }) => value !== undefined)
      .map(({ name, value }) => [name, value]))

    // find and evaluate any expression for which number values exist
    const expr = expressions.find(({a, b, value}) => {
      return value === undefined && mapOfValues[a!] !== undefined && mapOfValues[b!] !== undefined
    })

    if (expr !== undefined) {
      replaced = true
      expr.value = evalExpression(expr.op!, mapOfValues[expr.a!]!, mapOfValues[expr.b!]!)
    }
  }

  const element = expressions.find((expr) => expr.name === name && expr.value !== undefined)
  if (!element) {
    throw new Error(`Could not resolve element ${name}`)
  }
  return element.value!
}

const createExpressions = (name: string, a: string, b: string, op: Operation): Expression[] => {
  const expressions: Expression[] = []
  expressions.push({name, op, a, b})
  switch (op) {
    case '+': 
      expressions.push({ name: a, op: '-', a: name, b})
      expressions.push({ name: b, op: '-', a: name, b: a})
      break
    case '-':
      expressions.push({ name: a, op: '+', a: name, b})
      expressions.push({ name: b, op: '-', a, b: name})
      break
    case '*':
      expressions.push({ name: a, op: '/', a: name, b})
      expressions.push({ name: b, op: '/', a: name, b: a})
      break
    case '/':
      expressions.push({ name: a, op: '*', a: name, b})
      expressions.push({ name: b, op: '/', a, b: name})
      break
  }
  return expressions
}

const parseExpressions = (input: string): Expression[] => {
  return input.split(`\n`).reduce((expressions: Expression[], line) => {
    const [name, expr] = line.split(': ')
    if (expr.match(/^\d+$/)) {
      expressions.push({ name, value: Number(expr) })
    } else {
      const [_, a, op, b] = line.match(/(\w{4}) ([*/+-]) (\w{4})/)!
      expressions.push(...createExpressions(name, a, b, op as Operation))
    }
    return expressions
  }, [])
}

const evalExpression = (op: Operation, a: number, b: number) => {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new Error('cannot eval')
  }
  switch (op) {
    case '+': return a + b
    case '-': return a - b
    case '*': return a * b
    case '/': return a / b
    default: throw new Error('unsupported op')
  }
}

function part1(input: string) {
  const expressions = parseExpressions(input)
  return tryEvaluate(expressions, 'root')
}

function part2(input: string) {
  const expressions = parseExpressions(input)
    .filter((expr) => !(expr.name === 'humn' && typeof expr.value === 'number'))

  const rootExpr = expressions.find(({name}) => name === 'root')!


  try {
    const half = tryEvaluate(expressions, rootExpr.a!)
    expressions.push({name: rootExpr.b!, value: half})
  } catch (e) {
    const half = tryEvaluate(expressions, rootExpr.b!)
    expressions.push({name: rootExpr.a!, value: half})
  }

  return tryEvaluate(expressions, 'humn')
}

console.log('-- test input')
console.log({ part1: part1(testInput) })
console.log({ part2: part2(testInput) })

console.log('-- real input')
console.log({ part1: part1(input) })
console.log({ part2: part2(input) })
