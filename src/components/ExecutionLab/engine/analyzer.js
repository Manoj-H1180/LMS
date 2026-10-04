/**
 * Static Complexity and Structure Analyzer for educational code.
 * Analyzes loop nesting, recursion patterns, and auxiliary data structures.
 */

export function analyzeComplexity(ast) {
  let maxLoopNesting = 0;
  let hasRecursion = false;
  let maxSelfCallsInAnyFunction = 0;
  let hasBinaryDivision = false;
  let auxiliaryArrayCreated = false;
  let auxiliaryObjectCreated = false;

  function walk(node, currentLoopDepth = 0) {
    if (!node) return;

    if (node.type === 'ForStatement' || node.type === 'WhileStatement' || node.type === 'DoWhileStatement') {
      const newDepth = currentLoopDepth + 1;
      if (newDepth > maxLoopNesting) {
        maxLoopNesting = newDepth;
      }
      walk(node.body, newDepth);
      return;
    }

    if (node.type === 'FunctionDeclaration') {
      const fnName = node.id.name;
      let selfCallsInBody = 0;

      function countSelfCalls(subNode) {
        if (!subNode) return;
        if (subNode.type === 'CallExpression' && subNode.callee.type === 'Identifier' && subNode.callee.name === fnName) {
          selfCallsInBody++;
        }
        for (const k of Object.keys(subNode)) {
          if (Array.isArray(subNode[k])) {
            for (const item of subNode[k]) countSelfCalls(item);
          } else if (subNode[k] && typeof subNode[k] === 'object' && subNode[k].type) {
            countSelfCalls(subNode[k]);
          }
        }
      }

      countSelfCalls(node.body);

      if (selfCallsInBody > 0) {
        hasRecursion = true;
        if (selfCallsInBody > maxSelfCallsInAnyFunction) {
          maxSelfCallsInAnyFunction = selfCallsInBody;
        }
      }
    }

    if (node.type === 'ArrayExpression' && node.elements.length > 0) {
      auxiliaryArrayCreated = true;
    }

    if (node.type === 'ObjectExpression' && node.properties.length > 0) {
      auxiliaryObjectCreated = true;
    }

    // Check for binary search division patterns (e.g., Math.floor((low + high) / 2) or / 2)
    if (node.type === 'BinaryExpression' && node.operator === '/' && node.right?.value === 2) {
      hasBinaryDivision = true;
    }

    // Recursively walk children
    for (const key of Object.keys(node)) {
      if (key === 'body' && Array.isArray(node[key])) {
        for (const child of node[key]) walk(child, currentLoopDepth);
      } else if (node[key] && typeof node[key] === 'object' && node[key].type) {
        walk(node[key], currentLoopDepth);
      }
    }
  }

  walk(ast, 0);

  // Time Complexity estimation
  let timeComplexity = 'O(1)';
  let timeDetail = 'Constant time: The program executes a fixed sequence of operations regardless of input size.';

  if (hasRecursion) {
    if (maxSelfCallsInAnyFunction >= 2) {
      timeComplexity = 'O(2ⁿ)';
      timeDetail = 'Exponential time: Each recursive call branches into two or more sub-calls, doubling the workload at each level.';
    } else {
      timeComplexity = 'O(n)';
      timeDetail = 'Linear recursive time: The function invokes itself recursively once per step until reaching the base case.';
    }
  } else if (maxLoopNesting >= 3) {
    timeComplexity = 'O(n³)';
    timeDetail = `Cubic time: Detected 3 nested loops (${maxLoopNesting} levels). Each additional loop multiplies execution steps by n.`;
  } else if (maxLoopNesting === 2) {
    timeComplexity = 'O(n²)';
    timeDetail = 'Quadratic time: An outer loop iterates n times, and for each iteration, the inner loop iterates up to n times (n × n operations).';
  } else if (maxLoopNesting === 1) {
    if (hasBinaryDivision) {
      timeComplexity = 'O(log n)';
      timeDetail = 'Logarithmic time: In each iteration, the search interval is halved (divided by 2), drastically reducing iterations.';
    } else {
      timeComplexity = 'O(n)';
      timeDetail = 'Linear time: A single loop traverses through the elements once, running approximately n iterations.';
    }
  }

  // Space Complexity estimation
  let spaceComplexity = 'O(1)';
  let spaceDetail = 'Constant auxiliary space: Variables occupy fixed memory slots without allocating dynamic scaling structures.';

  if (hasRecursion) {
    spaceComplexity = 'O(n)';
    spaceDetail = 'Linear call stack space: Every recursive call adds a stack frame to memory until the base case returns.';
  } else if (auxiliaryArrayCreated || auxiliaryObjectCreated) {
    spaceComplexity = 'O(n)';
    spaceDetail = 'Linear space: Creates auxiliary array or hash map memory that stores elements proportional to input size.';
  }

  return {
    timeComplexity,
    timeDetail,
    spaceComplexity,
    spaceDetail,
    maxLoopNesting,
    hasRecursion,
    hasBinaryDivision
  };
}
