/**
 * Safe, educational Step-by-Step JavaScript Execution Interpreter.
 * Emits a structured Execution Trace for the visualizer.
 */

const MAX_STEPS = 600;
const MAX_CALL_DEPTH = 30;

function deepClone(val) {
  if (val === null || typeof val !== 'object') return val;
  if (Array.isArray(val)) return val.map(deepClone);
  const out = {};
  for (const k of Object.keys(val)) {
    out[k] = deepClone(val[k]);
  }
  return out;
}

function getType(val) {
  if (val === null) return 'Null';
  if (val === undefined) return 'Undefined';
  if (Array.isArray(val)) return 'Array';
  if (typeof val === 'number') return 'Number';
  if (typeof val === 'string') return 'String';
  if (typeof val === 'boolean') return 'Boolean';
  if (typeof val === 'function') return 'Function';
  return 'Object';
}

function formatVal(val) {
  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (typeof val === 'string') return `"${val}"`;
  if (typeof val === 'function') return `[Function: ${val.name || 'anonymous'}]`;
  if (Array.isArray(val)) return `[${val.map(formatVal).join(', ')}]`;
  if (typeof val === 'object') {
    try {
      return JSON.stringify(val);
    } catch {
      return '[Object]';
    }
  }
  return String(val);
}

class Environment {
  constructor(parent = null, name = 'block') {
    this.parent = parent;
    this.name = name;
    this.bindings = new Map();
  }

  declare(name, value) {
    this.bindings.set(name, value);
  }

  set(name, value) {
    if (this.bindings.has(name)) {
      this.bindings.set(name, value);
      return true;
    }
    if (this.parent) {
      return this.parent.set(name, value);
    }
    this.bindings.set(name, value);
    return true;
  }

  get(name) {
    if (this.bindings.has(name)) {
      return this.bindings.get(name);
    }
    if (this.parent) {
      return this.parent.get(name);
    }
    return undefined;
  }

  has(name) {
    if (this.bindings.has(name)) return true;
    if (this.parent) return this.parent.has(name);
    return false;
  }

  getAllVariables() {
    const all = {};
    if (this.parent) {
      Object.assign(all, this.parent.getAllVariables());
    }
    for (const [k, v] of this.bindings.entries()) {
      if (typeof v !== 'function') {
        all[k] = deepClone(v);
      }
    }
    return all;
  }
}

export function execute(ast) {
  const trace = [];
  const consoleOutput = [];
  let stepCount = 0;
  const startTime = Date.now();

  const globalEnv = new Environment(null, 'global');

  // Pre-populate standard safe built-ins
  globalEnv.declare('Math', {
    floor: Math.floor,
    ceil: Math.ceil,
    round: Math.round,
    abs: Math.abs,
    max: Math.max,
    min: Math.min,
    random: () => 0.5, // deterministic mock for educational predictability
  });

  const callStack = [{ name: '<main>', line: 1, depth: 0, args: {} }];
  let prevVariables = {};

  function addStep({
    line,
    type,
    expression = '',
    result = null,
    beginnerWhy = '',
    technicalWhy = '',
    activeDetails = {},
    changedVar = null,
    prevVal = null
  }) {
    if (stepCount >= MAX_STEPS) {
      throw new Error(`Execution limit reached (${MAX_STEPS} steps). Infinite loop or recursion detected.`);
    }
    if (Date.now() - startTime > 3000) {
      throw new Error('Execution timeout: execution exceeded 3000ms.');
    }

    stepCount++;
    const currentVars = currentEnv.getAllVariables();
    const formattedVars = {};

    for (const [k, val] of Object.entries(currentVars)) {
      formattedVars[k] = {
        name: k,
        value: val,
        formatted: formatVal(val),
        type: getType(val),
        changed: changedVar === k,
        previousValue: changedVar === k ? prevVal : (prevVariables[k]?.value ?? null)
      };
    }
    prevVariables = deepClone(formattedVars);

    trace.push({
      step: stepCount,
      line: line || 1,
      type,
      expression,
      result,
      variables: formattedVars,
      callStack: deepClone(callStack),
      consoleOutput: [...consoleOutput],
      why: {
        beginner: beginnerWhy,
        technical: technicalWhy
      },
      activeDetails: deepClone(activeDetails)
    });
  }

  let currentEnv = globalEnv;

  // Track loop nesting for outer/inner loop diagrams
  const loopStack = [];

  function evaluate(node) {
    if (!node) return undefined;

    switch (node.type) {
      case 'Program': {
        // Hoist function declarations first
        for (const stmt of node.body) {
          if (stmt.type === 'FunctionDeclaration') {
            const fn = function (...args) {
              return executeFunction(stmt, args);
            };
            fn.astNode = stmt;
            fn.fnName = stmt.id.name;
            currentEnv.declare(stmt.id.name, fn);
          }
        }

        for (const stmt of node.body) {
          if (stmt.type !== 'FunctionDeclaration') {
            const res = evaluate(stmt);
            if (res && res.__isReturn) return res.value;
          }
        }
        return undefined;
      }

      case 'BlockStatement': {
        const prevEnv = currentEnv;
        currentEnv = new Environment(prevEnv, 'block');
        try {
          for (const stmt of node.body) {
            const res = evaluate(stmt);
            if (res && (res.__isReturn || res.__isBreak || res.__isContinue)) {
              return res;
            }
          }
        } finally {
          currentEnv = prevEnv;
        }
        return undefined;
      }

      case 'VariableDeclaration': {
        for (const decl of node.declarations) {
          const varName = decl.id.name;
          let initVal = undefined;

          if (decl.init) {
            initVal = evaluate(decl.init);
          }

          currentEnv.declare(varName, initVal);

          addStep({
            line: node.line,
            type: 'variable-init',
            expression: `${node.kind} ${varName} = ${formatVal(initVal)}`,
            result: initVal,
            changedVar: varName,
            prevVal: undefined,
            beginnerWhy: `Created new variable "${varName}" with initial value ${formatVal(initVal)} (${getType(initVal)}).`,
            technicalWhy: `Allocated identifier "${varName}" in current lexical environment with binding initialized to ${formatVal(initVal)}.`,
            activeDetails: {
              variable: varName,
              value: initVal,
              type: getType(initVal),
              action: 'declare'
            }
          });
        }
        return undefined;
      }

      case 'AssignmentExpression': {
        const rightVal = evaluate(node.right);
        let leftName = '';
        let oldVal = undefined;
        let finalVal = rightVal;

        if (node.left.type === 'Identifier') {
          leftName = node.left.name;
          oldVal = currentEnv.get(leftName);

          if (node.operator === '+=') finalVal = oldVal + rightVal;
          else if (node.operator === '-=') finalVal = oldVal - rightVal;
          else if (node.operator === '*=') finalVal = oldVal * rightVal;
          else if (node.operator === '/=') finalVal = oldVal / rightVal;
          else if (node.operator === '%=') finalVal = oldVal % rightVal;
          else finalVal = rightVal;

          currentEnv.set(leftName, finalVal);

          addStep({
            line: node.line,
            type: 'variable-change',
            expression: `${leftName} ${node.operator} ${formatVal(rightVal)} → ${formatVal(finalVal)}`,
            result: finalVal,
            changedVar: leftName,
            prevVal: oldVal,
            beginnerWhy: `Variable "${leftName}" was updated from ${formatVal(oldVal)} to ${formatVal(finalVal)}.`,
            technicalWhy: `Assignment operator "${node.operator}" evaluated right-hand expression and mutated binding "${leftName}".`,
            activeDetails: {
              variable: leftName,
              oldValue: oldVal,
              newValue: finalVal,
              operator: node.operator,
              action: 'assign'
            }
          });
          return finalVal;
        }

        if (node.left.type === 'MemberExpression') {
          const targetObj = evaluate(node.left.object);
          let propKey = node.left.property.name;
          if (node.left.computed) {
            propKey = evaluate(node.left.property);
          }

          if (targetObj === undefined || targetObj === null) {
            throw new Error(`Cannot set property '${propKey}' of ${targetObj} at line ${node.line}`);
          }

          oldVal = targetObj[propKey];

          if (node.operator === '+=') finalVal = oldVal + rightVal;
          else if (node.operator === '-=') finalVal = oldVal - rightVal;
          else if (node.operator === '*=') finalVal = oldVal * rightVal;
          else if (node.operator === '/=') finalVal = oldVal / rightVal;
          else if (node.operator === '%=') finalVal = oldVal % rightVal;
          else finalVal = rightVal;

          targetObj[propKey] = finalVal;

          const isArr = Array.isArray(targetObj);
          addStep({
            line: node.line,
            type: isArr ? 'array-mutate' : 'object-mutate',
            expression: `${isArr ? 'array' : 'object'}[${formatVal(propKey)}] = ${formatVal(finalVal)}`,
            result: finalVal,
            beginnerWhy: isArr
              ? `Array element at index [${propKey}] changed from ${formatVal(oldVal)} to ${formatVal(finalVal)}.`
              : `Object property "${propKey}" set to ${formatVal(finalVal)}.`,
            technicalWhy: `Member mutation executed on target ${isArr ? 'Array' : 'Object'} with key "${propKey}".`,
            activeDetails: {
              target: targetObj,
              key: propKey,
              oldValue: oldVal,
              newValue: finalVal,
              action: isArr ? 'array-set' : 'object-set'
            }
          });
          return finalVal;
        }

        return finalVal;
      }

      case 'UpdateExpression': {
        if (node.argument.type === 'Identifier') {
          const varName = node.argument.name;
          const oldVal = currentEnv.get(varName);
          const delta = node.operator === '++' ? 1 : -1;
          const newVal = Number(oldVal) + delta;
          currentEnv.set(varName, newVal);

          addStep({
            line: node.line,
            type: 'loop-step',
            expression: `${varName}${node.operator} (${oldVal} → ${newVal})`,
            result: newVal,
            changedVar: varName,
            prevVal: oldVal,
            beginnerWhy: `Incremented ${varName} by ${delta}. Value changed from ${oldVal} to ${newVal}.`,
            technicalWhy: `Unary ${node.operator} operation modified binding "${varName}" with arithmetic delta ${delta}.`,
            activeDetails: {
              variable: varName,
              oldValue: oldVal,
              newValue: newVal,
              action: 'update'
            }
          });

          return node.prefix ? newVal : oldVal;
        }
        return undefined;
      }

      case 'IfStatement': {
        const conditionVal = Boolean(evaluate(node.test));

        addStep({
          line: node.line,
          type: 'condition-check',
          expression: `if (${conditionVal ? 'true' : 'false'})`,
          result: conditionVal,
          beginnerWhy: conditionVal
            ? `The condition evaluated to TRUE. Entering the IF block.`
            : `The condition evaluated to FALSE. ${node.alternate ? 'Entering the ELSE block.' : 'Skipping the IF block.'}`,
          technicalWhy: `Branch evaluation on line ${node.line}: condition resolved to boolean ${conditionVal}. Diverting control flow to ${conditionVal ? 'Consequent' : 'Alternate'}.`,
          activeDetails: {
            conditionResult: conditionVal,
            branchTaken: conditionVal ? 'if' : 'else',
            hasElse: Boolean(node.alternate)
          }
        });

        if (conditionVal) {
          return evaluate(node.consequent);
        } else if (node.alternate) {
          return evaluate(node.alternate);
        }
        return undefined;
      }

      case 'ForStatement': {
        const loopId = `for_L${node.line}`;
        const prevEnv = currentEnv;
        currentEnv = new Environment(prevEnv, 'for-loop');
        loopStack.push({ id: loopId, line: node.line, iteration: 0 });

        try {
          if (node.init) {
            evaluate(node.init);
          }

          while (true) {
            const currentLoop = loopStack[loopStack.length - 1];
            currentLoop.iteration++;

            let condVal = true;
            if (node.test) {
              condVal = Boolean(evaluate(node.test));
              addStep({
                line: node.line,
                type: 'condition-check',
                expression: `For loop condition: ${condVal}`,
                result: condVal,
                beginnerWhy: condVal
                  ? `Loop condition is TRUE. Running iteration #${currentLoop.iteration}.`
                  : `Loop condition is FALSE. Exiting for-loop after ${currentLoop.iteration - 1} iterations.`,
                technicalWhy: `ForStatement condition checked; boolean ${condVal}. ${condVal ? 'Executing loop body.' : 'Terminating loop.'}`,
                activeDetails: {
                  loopId,
                  iteration: currentLoop.iteration,
                  conditionResult: condVal,
                  isOuter: loopStack.length === 1,
                  isInner: loopStack.length > 1,
                  nestingDepth: loopStack.length
                }
              });
            }

            if (!condVal) break;

            const bodyResult = evaluate(node.body);
            if (bodyResult && bodyResult.__isBreak) {
              addStep({
                line: node.line,
                type: 'break',
                expression: 'break;',
                beginnerWhy: `Encountered "break". Loop terminated immediately.`,
                technicalWhy: `BreakStatement caught. Control transferred out of loop at iteration ${currentLoop.iteration}.`
              });
              break;
            }
            if (bodyResult && bodyResult.__isReturn) {
              return bodyResult;
            }

            if (node.update) {
              evaluate(node.update);
            }
          }
        } finally {
          loopStack.pop();
          currentEnv = prevEnv;
        }
        return undefined;
      }

      case 'WhileStatement': {
        const loopId = `while_L${node.line}`;
        loopStack.push({ id: loopId, line: node.line, iteration: 0 });

        try {
          while (true) {
            const currentLoop = loopStack[loopStack.length - 1];
            currentLoop.iteration++;

            const condVal = Boolean(evaluate(node.test));
            addStep({
              line: node.line,
              type: 'condition-check',
              expression: `while (${condVal})`,
              result: condVal,
              beginnerWhy: condVal
                ? `While condition is TRUE. Proceeding with iteration #${currentLoop.iteration}.`
                : `While condition is FALSE. Loop finishes now.`,
              technicalWhy: `WhileStatement condition evaluated to ${condVal}. Control ${condVal ? 'proceeds into body' : 'escapes loop'}.`,
              activeDetails: {
                loopId,
                iteration: currentLoop.iteration,
                conditionResult: condVal,
                nestingDepth: loopStack.length
              }
            });

            if (!condVal) break;

            const bodyResult = evaluate(node.body);
            if (bodyResult && bodyResult.__isBreak) {
              addStep({
                line: node.line,
                type: 'break',
                expression: 'break;',
                beginnerWhy: 'Loop stopped because of a break statement.',
                technicalWhy: 'BreakStatement execution.'
              });
              break;
            }
            if (bodyResult && bodyResult.__isReturn) return bodyResult;
          }
        } finally {
          loopStack.pop();
        }
        return undefined;
      }

      case 'DoWhileStatement': {
        const loopId = `doWhile_L${node.line}`;
        loopStack.push({ id: loopId, line: node.line, iteration: 0 });

        try {
          while (true) {
            const currentLoop = loopStack[loopStack.length - 1];
            currentLoop.iteration++;

            addStep({
              line: node.line,
              type: 'loop-iteration',
              expression: `do { ... } (Iteration #${currentLoop.iteration})`,
              beginnerWhy: `In a do...while loop, the body runs FIRST before the condition is checked.`,
              technicalWhy: `DoWhileStatement guarantees at least one unconditioned body execution before test evaluation.`,
              activeDetails: {
                loopId,
                iteration: currentLoop.iteration,
                note: 'Executes body before condition check'
              }
            });

            const bodyResult = evaluate(node.body);
            if (bodyResult && bodyResult.__isBreak) break;
            if (bodyResult && bodyResult.__isReturn) return bodyResult;

            const condVal = Boolean(evaluate(node.test));
            addStep({
              line: node.line,
              type: 'condition-check',
              expression: `while condition: ${condVal}`,
              result: condVal,
              beginnerWhy: condVal
                ? `Condition is TRUE. Running the do...while body again.`
                : `Condition is FALSE. Loop terminated.`,
              technicalWhy: `DoWhile condition checked at end of cycle #${currentLoop.iteration}: ${condVal}.`
            });

            if (!condVal) break;
          }
        } finally {
          loopStack.pop();
        }
        return undefined;
      }

      case 'BreakStatement': {
        return { __isBreak: true };
      }

      case 'ContinueStatement': {
        addStep({
          line: node.line,
          type: 'continue',
          expression: 'continue;',
          beginnerWhy: `Skipped remaining code in current iteration and moved to next iteration.`,
          technicalWhy: `ContinueStatement transferred control directly to loop step/condition.`
        });
        return { __isContinue: true };
      }

      case 'ReturnStatement': {
        const retVal = node.argument ? evaluate(node.argument) : undefined;
        addStep({
          line: node.line,
          type: 'return',
          expression: `return ${formatVal(retVal)}`,
          result: retVal,
          beginnerWhy: `Function returned ${formatVal(retVal)}. Destroying this function call frame and returning to caller.`,
          technicalWhy: `ReturnStatement evaluated argument ${formatVal(retVal)} and initiated stack frame pop.`,
          activeDetails: {
            returnValue: retVal,
            action: 'return'
          }
        });
        return { __isReturn: true, value: retVal };
      }

      case 'ExpressionStatement': {
        return evaluate(node.expression);
      }

      case 'BinaryExpression': {
        const left = evaluate(node.left);
        const right = evaluate(node.right);
        let res;

        switch (node.operator) {
          case '+': res = left + right; break;
          case '-': res = left - right; break;
          case '*': res = left * right; break;
          case '/': res = left / right; break;
          case '%': res = left % right; break;
          case '===': res = left === right; break;
          case '!==': res = left !== right; break;
          case '==': res = left == right; break;
          case '!=': res = left != right; break;
          case '<': res = left < right; break;
          case '<=': res = left <= right; break;
          case '>': res = left > right; break;
          case '>=': res = left >= right; break;
          default: res = undefined;
        }

        // Add operator evaluation step if this is a notable calculation
        if (['+', '-', '*', '/', '%', '<', '<=', '>', '>=', '===', '!==', '==', '!='].includes(node.operator)) {
          addStep({
            line: node.line,
            type: 'operator-eval',
            expression: `${formatVal(left)} ${node.operator} ${formatVal(right)} → ${formatVal(res)}`,
            result: res,
            beginnerWhy: `Evaluated ${formatVal(left)} ${node.operator} ${formatVal(right)}, which equals ${formatVal(res)}.`,
            technicalWhy: `Binary expression with operator "${node.operator}" evaluated to ${formatVal(res)}.`,
            activeDetails: {
              leftVal: left,
              rightVal: right,
              operator: node.operator,
              result: res
            }
          });
        }
        return res;
      }

      case 'LogicalExpression': {
        const left = evaluate(node.left);
        if (node.operator === '&&') {
          if (!left) return left;
          return evaluate(node.right);
        }
        if (node.operator === '||') {
          if (left) return left;
          return evaluate(node.right);
        }
        return undefined;
      }

      case 'UnaryExpression': {
        const arg = evaluate(node.argument);
        if (node.operator === '!') return !arg;
        if (node.operator === '-') return -arg;
        if (node.operator === '+') return +arg;
        if (node.operator === 'typeof') return typeof arg;
        return undefined;
      }

      case 'CallExpression': {
        // Special case: console.log
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.name === 'console' &&
          node.callee.property.name === 'log'
        ) {
          const evaluatedArgs = node.arguments.map(arg => evaluate(arg));
          const text = evaluatedArgs.map(formatVal).join(' ');
          consoleOutput.push(text);

          addStep({
            line: node.line,
            type: 'console',
            expression: `console.log(${evaluatedArgs.map(formatVal).join(', ')})`,
            result: text,
            beginnerWhy: `Printed to console: ${text}`,
            technicalWhy: `Console standard output stream emitted: "${text}".`,
            activeDetails: {
              output: text,
              args: evaluatedArgs
            }
          });
          return undefined;
        }

        // General function call
        let calleeFn;
        let fnName = '<anonymous>';

        if (node.callee.type === 'Identifier') {
          fnName = node.callee.name;
          calleeFn = currentEnv.get(fnName);
        } else if (node.callee.type === 'MemberExpression') {
          const obj = evaluate(node.callee.object);
          const prop = node.callee.computed ? evaluate(node.callee.property) : node.callee.property.name;

          // Array push/pop helper
          if (Array.isArray(obj)) {
            if (prop === 'push') {
              const argVals = node.arguments.map(evaluate);
              obj.push(...argVals);
              addStep({
                line: node.line,
                type: 'array-mutate',
                expression: `array.push(${argVals.map(formatVal).join(', ')})`,
                beginnerWhy: `Pushed item(s) to end of array: ${argVals.map(formatVal).join(', ')}.`,
                technicalWhy: `Invoked Array.prototype.push. Length is now ${obj.length}.`,
                activeDetails: { array: obj, action: 'push', pushed: argVals }
              });
              return obj.length;
            }
            if (prop === 'pop') {
              const popped = obj.pop();
              addStep({
                line: node.line,
                type: 'array-mutate',
                expression: `array.pop() → ${formatVal(popped)}`,
                beginnerWhy: `Popped last element from array: ${formatVal(popped)}.`,
                technicalWhy: `Invoked Array.prototype.pop. Removed element ${formatVal(popped)}.`,
                activeDetails: { array: obj, action: 'pop', popped }
              });
              return popped;
            }
          }

          if (obj && typeof obj[prop] === 'function') {
            calleeFn = obj[prop];
            fnName = `${node.callee.object.name || 'obj'}.${prop}`;
          }
        }

        if (typeof calleeFn !== 'function') {
          throw new Error(`"${fnName}" is not a function at line ${node.line}`);
        }

        const evaluatedArgs = node.arguments.map(arg => evaluate(arg));

        // If it's a native/built-in function (e.g. Math.floor)
        if (!calleeFn.astNode) {
          return calleeFn(...evaluatedArgs);
        }

        // Custom user function execution with Call Stack tracing!
        return executeFunction(calleeFn.astNode, evaluatedArgs);
      }

      case 'MemberExpression': {
        const obj = evaluate(node.object);
        let prop;
        if (node.computed) {
          prop = evaluate(node.property);
        } else {
          prop = node.property.name;
        }

        if (obj === undefined || obj === null) {
          throw new Error(`Cannot read property '${prop}' of ${obj} at line ${node.line}`);
        }

        const val = obj[prop];

        if (Array.isArray(obj)) {
          addStep({
            line: node.line,
            type: 'array-access',
            expression: `array[${prop}] → ${formatVal(val)}`,
            result: val,
            beginnerWhy: `Looked up index [${prop}] in the array. Found value: ${formatVal(val)}.`,
            technicalWhy: `Indexed lookup on Array at subscript ${prop}; resolved to ${formatVal(val)}.`,
            activeDetails: {
              index: prop,
              value: val,
              array: obj,
              action: 'access'
            }
          });
        }
        return val;
      }

      case 'ArrayExpression': {
        const arr = [];
        for (const el of node.elements) {
          arr.push(evaluate(el));
        }
        return arr;
      }

      case 'ObjectExpression': {
        const obj = {};
        for (const prop of node.properties) {
          const keyName = prop.key.type === 'Identifier' ? prop.key.name : prop.key.value;
          obj[keyName] = evaluate(prop.value);
        }
        return obj;
      }

      case 'Identifier': {
        if (node.name === 'undefined') return undefined;
        if (node.name === 'null') return null;
        if (node.name === 'NaN') return NaN;
        if (!currentEnv.has(node.name)) {
          throw new Error(`ReferenceError: "${node.name}" is not defined at line ${node.line}`);
        }
        return currentEnv.get(node.name);
      }

      case 'Literal': {
        return node.value;
      }

      default:
        return undefined;
    }
  }

  function executeFunction(fnAst, args) {
    if (callStack.length >= MAX_CALL_DEPTH) {
      throw new Error(`Maximum call stack size exceeded (${MAX_CALL_DEPTH} frames). Infinite recursion detected.`);
    }

    const fnName = fnAst.id.name;
    const parentEnv = globalEnv;
    const fnEnv = new Environment(parentEnv, `fn:${fnName}`);

    const argsRecord = {};
    fnAst.params.forEach((param, idx) => {
      const pVal = args[idx] !== undefined ? args[idx] : undefined;
      fnEnv.declare(param.name, pVal);
      argsRecord[param.name] = pVal;
    });

    const isRecursive = callStack.some(f => f.name === fnName);
    const frameDepth = callStack.length;

    callStack.push({
      name: fnName,
      line: fnAst.line,
      depth: frameDepth,
      args: argsRecord,
      locals: {}
    });

    addStep({
      line: fnAst.line,
      type: isRecursive ? 'recursion-call' : 'call',
      expression: `${fnName}(${Object.values(argsRecord).map(formatVal).join(', ')})`,
      result: null,
      beginnerWhy: isRecursive
        ? `Recursive call! ${fnName} called itself again with (${Object.entries(argsRecord).map(([k, v]) => `${k}=${formatVal(v)}`).join(', ')}). Call stack grew to depth ${frameDepth}.`
        : `Function "${fnName}" called with parameter(s): ${Object.entries(argsRecord).map(([k, v]) => `${k} = ${formatVal(v)}`).join(', ')}. Created new execution context on call stack.`,
      technicalWhy: `Activation record created for "${fnName}" with arguments { ${Object.entries(argsRecord).map(([k, v]) => `${k}: ${formatVal(v)}`).join(', ')} }. Stack depth is now ${frameDepth}.`,
      activeDetails: {
        funcName: fnName,
        args: argsRecord,
        isRecursive,
        depth: frameDepth,
        action: 'call'
      }
    });

    const prevEnv = currentEnv;
    currentEnv = fnEnv;

    try {
      const res = evaluate(fnAst.body);
      const returnVal = res && res.__isReturn ? res.value : undefined;
      return returnVal;
    } finally {
      currentEnv = prevEnv;
      callStack.pop();

      addStep({
        line: fnAst.line,
        type: isRecursive ? 'recursion-return' : 'return',
        expression: `Finished ${fnName}()`,
        beginnerWhy: `Call stack frame for ${fnName}() removed. Control returned to caller.`,
        technicalWhy: `Activation record for "${fnName}" popped. Environment restored to caller context.`,
        activeDetails: {
          funcName: fnName,
          depth: callStack.length,
          action: 'pop'
        }
      });
    }
  }

  // Execute AST
  evaluate(ast);

  return {
    trace,
    totalSteps: trace.length,
    finalVariables: currentEnv.getAllVariables(),
    consoleOutput
  };
}
