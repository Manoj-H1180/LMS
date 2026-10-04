/**
 * Comprehensive Concept Registry for Code Visualizer & Execution Lab.
 * Covers JavaScript Fundamentals, Data Structures, and Algorithms.
 */

export const CONCEPT_CATEGORIES = [
  { id: 'javascript-basics', label: 'JavaScript Fundamentals', icon: 'Code2', color: '#6366f1' },
  { id: 'data-structures', label: 'Data Structures', icon: 'Layers', color: '#10b981' },
  { id: 'algorithms', label: 'Algorithms & DSA', icon: 'Cpu', color: '#f59e0b' }
];

export const CONCEPTS = [
  // ─────────────────────────────────────────────────────────────
  // 1. JAVASCRIPT FUNDAMENTALS
  // ─────────────────────────────────────────────────────────────
  {
    id: 'variables',
    title: 'Variables & Reassignment',
    category: 'javascript-basics',
    badge: 'Core',
    visualizationType: 'variable',
    summary: 'Variables are labeled containers in computer memory that hold data.',
    explanation: `When you declare a variable using "let", JavaScript reserves a spot in memory with that name.
When you reassign it with the "=" operator, the old value in memory is replaced by the new value.
Watch how the value container updates when the assignment line executes.`,
    starterCode: `let age = 26;
let name = "Manoj";
let isStudent = true;

// Reassigning variable:
age = 27;
age = 28;
console.log(name, "is now", age);`,
    complexity: {
      time: 'O(1)',
      timeDetail: 'Constant time: Memory lookup and assignment takes 1 step.',
      space: 'O(1)',
      spaceDetail: 'Constant space: Fixed number of variable slots.'
    },
    challenges: [
      {
        id: 'var-1',
        question: 'What will be the final value of "count" after all lines execute?',
        starterCode: `let count = 5;\ncount = count + 3;\ncount = count * 2;\nconsole.log(count);`,
        options: ['8', '16', '10', '13'],
        answer: '16',
        explanation: '5 + 3 = 8, then 8 * 2 = 16. The final value in memory is 16.',
        xp: 30
      }
    ]
  },
  {
    id: 'data-types',
    title: 'Data Types',
    category: 'javascript-basics',
    badge: 'Types',
    visualizationType: 'variable',
    summary: 'JavaScript values have types like Number, String, Boolean, Undefined, Null, Array, and Object.',
    explanation: `Every piece of data has a specific type:
• Number: 42, 3.14 (numeric calculations)
• String: "Hello" (text wrapped in quotes)
• Boolean: true or false (logic flags)
• Undefined: variable declared but not given a value
• Null: intentional absence of any object value
• Array & Object: collections that group multiple items together.`,
    starterCode: `let age = 26;
let title = "Software Engineer";
let isEnrolled = true;
let score = null;
let profile;

console.log("age type:", typeof age);
console.log("title type:", typeof title);
console.log("isEnrolled:", isEnrolled);`,
    complexity: {
      time: 'O(1)',
      timeDetail: 'Constant time.',
      space: 'O(1)',
      spaceDetail: 'Primitive values stored directly in execution context slots.'
    },
    challenges: [
      {
        id: 'type-1',
        question: 'What is the type of a variable declared without an initial value like "let x;"?',
        starterCode: `let x;\nconsole.log(typeof x);`,
        options: ['null', 'undefined', '0', 'NaN'],
        answer: 'undefined',
        explanation: 'In JavaScript, uninitialized variables automatically hold the primitive value "undefined".',
        xp: 30
      }
    ]
  },
  {
    id: 'operators',
    title: 'Operators & Expressions',
    category: 'javascript-basics',
    badge: 'Operators',
    visualizationType: 'variable',
    summary: 'Operators perform mathematical calculations, comparisons, and logical checks.',
    explanation: `Watch how expressions evaluate in sequence:
First, operands on the left and right are read from memory.
Then the operator computes the result.
Finally, the result is stored in the target variable.
For example: 10 + 5 becomes 15, then stored into "result".`,
    starterCode: `let a = 10;
let b = 5;

let sum = a + b;
let difference = a - b;
let product = a * b;
let remainder = a % 3;

console.log("Sum:", sum);
console.log("Remainder:", remainder);`,
    complexity: {
      time: 'O(1)',
      timeDetail: 'Constant arithmetic operations.',
      space: 'O(1)',
      spaceDetail: 'Fixed memory slots.'
    },
    challenges: [
      {
        id: 'op-1',
        question: 'What is the remainder of 17 % 5?',
        starterCode: `let rem = 17 % 5;\nconsole.log(rem);`,
        options: ['3', '2', '1', '0'],
        answer: '2',
        explanation: '5 goes into 17 three times (15) with a remainder of 2.',
        xp: 30
      }
    ]
  },
  {
    id: 'conditions',
    title: 'Conditions (if / else)',
    category: 'javascript-basics',
    badge: 'Logic',
    visualizationType: 'condition',
    summary: 'Branch execution paths based on whether a condition is true or false.',
    explanation: `The visualizer highlights:
1. The condition expression being tested (e.g., age >= 18).
2. The evaluated boolean result (true or false).
3. The branch that is TAKEN (executing its body).
4. The branch that is SKIPPED (bypassed entirely).`,
    starterCode: `let age = 26;

if (age >= 18) {
  console.log("Status: Adult");
  console.log("Eligible to vote");
} else {
  console.log("Status: Minor");
}`,
    complexity: {
      time: 'O(1)',
      timeDetail: 'Only one branch is evaluated.',
      space: 'O(1)',
      spaceDetail: 'No extra memory.'
    },
    challenges: [
      {
        id: 'cond-1',
        question: 'Which console output will be printed?',
        starterCode: `let score = 75;\nif (score >= 90) {\n  console.log("A");\n} else if (score >= 70) {\n  console.log("B");\n} else {\n  console.log("C");\n}`,
        options: ['A', 'B', 'C', 'None'],
        answer: 'B',
        explanation: '75 is not >= 90 (false), but 75 >= 70 is true, so "B" executes.',
        xp: 35
      }
    ]
  },
  {
    id: 'nested-conditions',
    title: 'Nested Conditions & Decision Trees',
    category: 'javascript-basics',
    badge: 'Logic',
    visualizationType: 'condition',
    summary: 'Multiple layers of decisions creating a branching decision tree.',
    explanation: `When an "if" statement sits inside another "if" statement, the inner check only runs IF the outer condition passed.
Follow the decision tree path to see which door opened and which remained closed.`,
    starterCode: `let age = 20;
let hasID = true;

if (age >= 18) {
  console.log("Age check passed");
  if (hasID) {
    console.log("ID verified: Access Granted!");
  } else {
    console.log("Please show valid ID");
  }
} else {
  console.log("Underage: Access Denied");
}`,
    complexity: {
      time: 'O(1)',
      timeDetail: 'Constant branching depth.',
      space: 'O(1)',
      spaceDetail: 'Constant memory.'
    },
    challenges: [
      {
        id: 'nested-cond-1',
        question: 'What is printed if age = 16 and hasID = true?',
        starterCode: `let age = 16;\nlet hasID = true;\nif (age >= 18) {\n  if (hasID) console.log("Granted");\n} else {\n  console.log("Denied");\n}`,
        options: ['Granted', 'Denied', 'Nothing', 'Error'],
        answer: 'Denied',
        explanation: 'Since age (16) is not >= 18, the outer IF fails immediately and skips straight to the ELSE.',
        xp: 35
      }
    ]
  },
  {
    id: 'for-loop',
    title: 'For Loops',
    category: 'javascript-basics',
    badge: 'Loops',
    visualizationType: 'loop',
    summary: 'Repeat a block of code a specific number of times with a counter.',
    explanation: `Every "for" loop follows 4 distinct steps:
1. Initialize counter: let i = 0 (runs only once).
2. Check condition: i < 3 (if true, execute body).
3. Execute loop body.
4. Increment counter: i++ (i becomes 1, 2, ...).
5. Repeat condition check until condition becomes FALSE!`,
    starterCode: `let sum = 0;

for (let i = 0; i < 3; i++) {
  sum = sum + i;
  console.log("Iteration i =", i, "sum =", sum);
}

console.log("Final sum:", sum);`,
    complexity: {
      time: 'O(n)',
      timeDetail: 'Linear time: The loop body runs n times (3 iterations).',
      space: 'O(1)',
      spaceDetail: 'Constant space: Counter variable i is modified in place.'
    },
    challenges: [
      {
        id: 'for-1',
        question: 'How many times will this loop execute its console.log?',
        starterCode: `for (let i = 1; i <= 4; i++) {\n  console.log(i);\n}`,
        options: ['3', '4', '5', '0'],
        answer: '4',
        explanation: 'The loop runs for i = 1, 2, 3, and 4 (since the condition is <= 4), making 4 total runs.',
        xp: 35
      }
    ]
  },
  {
    id: 'while-loop',
    title: 'While Loops',
    category: 'javascript-basics',
    badge: 'Loops',
    visualizationType: 'loop',
    summary: 'Repeat code as long as a boolean condition remains true.',
    explanation: `A while loop checks its condition BEFORE every iteration.
As long as the condition evaluates to true, the body executes.
When you update the loop variable inside the body (like i++), you prepare for the next condition check.`,
    starterCode: `let i = 0;

while (i < 3) {
  console.log("Current index:", i);
  i++;
}

console.log("Loop ended with i =", i);`,
    complexity: {
      time: 'O(n)',
      timeDetail: 'Linear time: Runs while condition holds.',
      space: 'O(1)',
      spaceDetail: 'In-place state.'
    },
    challenges: [
      {
        id: 'while-1',
        question: 'What is the final value of x after the while loop finishes?',
        starterCode: `let x = 1;\nwhile (x < 10) {\n  x = x * 2;\n}\nconsole.log(x);`,
        options: ['8', '10', '16', '12'],
        answer: '16',
        explanation: 'x starts at 1 -> 2 -> 4 -> 8 -> 16. When x is 16, 16 < 10 is false, so it terminates.',
        xp: 35
      }
    ]
  },
  {
    id: 'do-while',
    title: 'Do...While Loops',
    category: 'javascript-basics',
    badge: 'Loops',
    visualizationType: 'loop',
    summary: 'Guarantees the loop body runs AT LEAST ONCE before the condition is checked.',
    explanation: `In standard for and while loops, if the condition is initially false, the body never runs.
In a do...while loop, the body ALWAYS executes first, and only THEN is the condition tested!`,
    starterCode: `let i = 10;

// Condition (i < 3) is initially FALSE, but body executes once!
do {
  console.log("Executed body! i =", i);
  i++;
} while (i < 3);

console.log("Final i:", i);`,
    complexity: {
      time: 'O(1) to O(n)',
      timeDetail: 'Executes body at least once.',
      space: 'O(1)',
      spaceDetail: 'In-place state.'
    },
    challenges: [
      {
        id: 'dowhile-1',
        question: 'How many times does the console.log run in this do...while loop?',
        starterCode: `let n = 5;\ndo {\n  console.log(n);\n  n++;\n} while (n < 5);`,
        options: ['0', '1', '5', 'Infinite'],
        answer: '1',
        explanation: 'A do...while loop executes its body once before checking the condition (5 < 5 is false).',
        xp: 35
      }
    ]
  },
  {
    id: 'nested-loops',
    title: 'Nested Loops',
    category: 'javascript-basics',
    badge: 'Loops',
    visualizationType: 'nested-loop',
    summary: 'A loop inside another loop — the inner loop runs completely for every single outer step.',
    explanation: `This is one of the most critical concepts in programming:
For every 1 step of the OUTER loop, the INNER loop completes ALL of its iterations.
Notice how:
Outer i = 0 -> Inner j runs: 0, 1
Outer i = 1 -> Inner j runs: 0, 1
This produces Outer × Inner total operations (O(n²))!`,
    starterCode: `for (let i = 0; i < 3; i++) {
  console.log("→ OUTER loop i =", i);
  for (let j = 0; j < 2; j++) {
    console.log("   inner loop (", i, ",", j, ")");
  }
}`,
    complexity: {
      time: 'O(n²)',
      timeDetail: 'Quadratic time: Outer loop runs 3 times, inner loop runs 2 times per outer step (3 × 2 = 6 operations).',
      space: 'O(1)',
      spaceDetail: 'Constant space: Variables i and j.'
    },
    challenges: [
      {
        id: 'nested-1',
        question: 'How many times will "console.log(i, j)" run in total?',
        starterCode: `for (let i = 0; i < 3; i++) {\n  for (let j = 0; j < 4; j++) {\n    console.log(i, j);\n  }\n}`,
        options: ['7', '12', '4', '9'],
        answer: '12',
        explanation: '3 outer iterations × 4 inner iterations = 12 total iterations.',
        xp: 40
      }
    ]
  },
  {
    id: 'break-continue',
    title: 'Break and Continue',
    category: 'javascript-basics',
    badge: 'Control',
    visualizationType: 'loop',
    summary: 'Interrupt or skip loop iterations with break and continue.',
    explanation: `• break: Immediately exits the loop entirely. No further iterations run.
• continue: Skips the remaining code in the CURRENT iteration and jumps straight to the next iteration.`,
    starterCode: `console.log("--- Break Demo ---");
for (let i = 0; i < 5; i++) {
  if (i === 3) {
    console.log("Encountered break at i =", i);
    break; // Stops the loop completely
  }
  console.log("Processing i =", i);
}

console.log("--- Continue Demo ---");
for (let k = 0; k < 4; k++) {
  if (k === 1) {
    console.log("Skipping iteration k =", k);
    continue; // Skips next line for k = 1
  }
  console.log("Completed k =", k);
}`,
    complexity: {
      time: 'O(n)',
      timeDetail: 'At most n iterations; break terminates early.',
      space: 'O(1)',
      spaceDetail: 'Constant memory.'
    },
    challenges: [
      {
        id: 'bc-1',
        question: 'What is the last number printed by console.log?',
        starterCode: `for (let i = 0; i < 5; i++) {\n  if (i === 2) break;\n  console.log(i);\n}`,
        options: ['0', '1', '2', '4'],
        answer: '1',
        explanation: 'For i=0 prints 0; for i=1 prints 1; for i=2 the IF matches and break terminates before print.',
        xp: 35
      }
    ]
  },
  {
    id: 'functions',
    title: 'Functions & Execution Context',
    category: 'javascript-basics',
    badge: 'Functions',
    visualizationType: 'recursion',
    summary: 'Functions bundle reusable code into named execution blocks with local scopes.',
    explanation: `When a function is called:
1. JavaScript pauses execution in the current scope.
2. A new Execution Context (stack frame) is pushed onto the Call Stack.
3. Arguments are mapped to parameters.
4. The function body executes.
5. Upon "return", the frame is destroyed and the result is handed back to the caller!`,
    starterCode: `function add(a, b) {
  let result = a + b;
  return result;
}

let answer = add(5, 3);
console.log("Calculated answer:", answer);`,
    complexity: {
      time: 'O(1)',
      timeDetail: 'Function call overhead and arithmetic operation.',
      space: 'O(1)',
      spaceDetail: 'One activation frame on the call stack.'
    },
    challenges: [
      {
        id: 'fn-1',
        question: 'What will "multiply(4, 5)" return?',
        starterCode: `function multiply(x, y) {\n  return x * y;\n}\nlet res = multiply(4, 5);\nconsole.log(res);`,
        options: ['9', '20', '16', 'undefined'],
        answer: '20',
        explanation: 'Parameters x=4 and y=5; 4 * 5 = 20 is returned.',
        xp: 35
      }
    ]
  },
  {
    id: 'scope',
    title: 'Scope & Variable Visibility',
    category: 'javascript-basics',
    badge: 'Scope',
    visualizationType: 'variable',
    summary: 'Scope controls where variables can be accessed in your code.',
    explanation: `• Global Scope: Variables declared outside any function/block are visible everywhere.
• Function/Block Scope: Variables declared with "let" inside a function or { } block only exist INSIDE that block.
Watch how "y" exists only inside test(), while "x" is accessible both inside and outside!`,
    starterCode: `let globalX = 100;

function testScope() {
  let localY = 50;
  console.log("Inside function - globalX:", globalX);
  console.log("Inside function - localY:", localY);
}

testScope();
console.log("Outside function - globalX:", globalX);`,
    complexity: {
      time: 'O(1)',
      timeDetail: 'Scope resolution lookup.',
      space: 'O(1)',
      spaceDetail: 'Lexical environment record.'
    },
    challenges: [
      {
        id: 'scope-1',
        question: 'Can code outside a function directly access a variable declared inside it with "let"?',
        starterCode: `function demo() {\n  let secret = 42;\n}\ndemo();\n// console.log(secret);`,
        options: ['No, ReferenceError will occur', 'Yes, it is always available', 'Only in strict mode', 'Yes, as null'],
        answer: 'No, ReferenceError will occur',
        explanation: 'Variables declared with let or const inside a function are block-scoped and destroyed when the function finishes.',
        xp: 35
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 2. DATA STRUCTURES
  // ─────────────────────────────────────────────────────────────
  {
    id: 'arrays',
    title: 'Arrays & Indexing',
    category: 'data-structures',
    badge: 'Arrays',
    visualizationType: 'array',
    summary: 'Ordered list of items stored at 0-based sequential memory indices.',
    explanation: `An array stores a list of values:
• Index 0 is the first item.
• Index 1 is the second item.
• Index 2 is the third item, and so on.
Watch how the visual memory grid displays each slot with its index and current value!`,
    starterCode: `let numbers = [10, 20, 30, 40];

// Accessing elements:
let first = numbers[0];
let third = numbers[2];

console.log("First element:", first);
console.log("Third element:", third);`,
    complexity: {
      time: 'O(1)',
      timeDetail: 'Constant time: Array index access numbers[i] is immediate O(1).',
      space: 'O(n)',
      spaceDetail: 'Linear space: Stores n contiguous memory elements.'
    },
    challenges: [
      {
        id: 'arr-1',
        question: 'What is the value of numbers[3]?',
        starterCode: `let numbers = [5, 10, 15, 20, 25];\nconsole.log(numbers[3]);`,
        options: ['15', '20', '25', '10'],
        answer: '20',
        explanation: 'Index 0 is 5, index 1 is 10, index 2 is 15, and index 3 is 20.',
        xp: 35
      }
    ]
  },
  {
    id: 'array-mutation',
    title: 'Array Modification & Swapping',
    category: 'data-structures',
    badge: 'Arrays',
    visualizationType: 'array',
    summary: 'Update elements at specific indices and swap values between slots.',
    explanation: `You can change any value in an array with numbers[index] = newValue.
To swap two elements:
1. Save numbers[0] into a temporary variable "temp".
2. Copy numbers[1] into numbers[0].
3. Copy "temp" into numbers[1].
Watch the visualizer animate the swap!`,
    starterCode: `let arr = [10, 20, 30, 40];

// Modify slot 1
arr[1] = 99;
console.log("After update:", arr);

// Swap slot 0 and slot 3
let temp = arr[0];
arr[0] = arr[3];
arr[3] = temp;

console.log("After swap:", arr);`,
    complexity: {
      time: 'O(1)',
      timeDetail: 'In-place index modification and swap takes 3 O(1) steps.',
      space: 'O(1)',
      spaceDetail: 'One temporary variable.'
    },
    challenges: [
      {
        id: 'arr-mut-1',
        question: 'What is the array content after: arr[0] = arr[1]; arr[1] = 5;',
        starterCode: `let arr = [1, 2];\narr[0] = arr[1];\narr[1] = 5;\nconsole.log(arr);`,
        options: ['[2, 5]', '[1, 5]', '[2, 2]', '[5, 5]'],
        answer: '[2, 5]',
        explanation: 'arr[0] becomes 2, then arr[1] is assigned 5. Final: [2, 5].',
        xp: 35
      }
    ]
  },
  {
    id: 'objects',
    title: 'Objects & Key-Value Pairs',
    category: 'data-structures',
    badge: 'Objects',
    visualizationType: 'object',
    summary: 'Collections of named properties that map keys to values.',
    explanation: `While arrays store data by numeric index (0, 1, 2), objects store data by descriptive KEYS:
• user.name -> "Manoj"
• user.age -> 26
Watch the object cards show key-value relationships in real time!`,
    starterCode: `let user = {
  name: "Manoj",
  age: 26,
  role: "Student"
};

console.log("User name:", user.name);

// Updating property:
user.age = 27;
user.status = "Active";

console.log("Updated user:", user.name, "age:", user.age);`,
    complexity: {
      time: 'O(1)',
      timeDetail: 'Average O(1) hash map key lookup and update.',
      space: 'O(k)',
      spaceDetail: 'Memory proportional to number of keys.'
    },
    challenges: [
      {
        id: 'obj-1',
        question: 'What is the value of book.year after: book.year = 2026; book.year = 2027;',
        starterCode: `let book = { title: "JS Guide", year: 2020 };\nbook.year = 2026;\nbook.year = 2027;\nconsole.log(book.year);`,
        options: ['2020', '2026', '2027', 'undefined'],
        answer: '2027',
        explanation: 'The property "year" was reassigned from 2020 to 2026, and finally to 2027.',
        xp: 35
      }
    ]
  },
  {
    id: 'frequency-counter',
    title: 'Frequency Counter / Hash Map Pattern',
    category: 'data-structures',
    badge: 'DSA',
    visualizationType: 'object',
    summary: 'Count occurrences of items using an object hash map.',
    explanation: `This is one of the most famous algorithmic patterns in programming:
To count duplicates or word frequencies:
1. Initialize an empty object {}.
2. Loop over items.
3. If the item exists in the map, increment its count (count[item]++).
4. If not, start it at 1 (count[item] = 1).
Watch the frequency counters climb!`,
    starterCode: `let items = ["apple", "banana", "apple", "orange", "banana", "apple"];
let counts = {};

for (let i = 0; i < 6; i++) {
  let fruit = items[i];
  if (counts[fruit]) {
    counts[fruit] = counts[fruit] + 1;
  } else {
    counts[fruit] = 1;
  }
  console.log("Processed:", fruit, "→ count:", counts[fruit]);
}`,
    complexity: {
      time: 'O(n)',
      timeDetail: 'Linear time: Loops through n items, doing O(1) hash table lookups.',
      space: 'O(k)',
      spaceDetail: 'Space proportional to number of unique items (k ≤ n).'
    },
    challenges: [
      {
        id: 'freq-1',
        question: 'What will be the count of "apple" after the loop finishes?',
        starterCode: `let items = ["apple", "banana", "apple", "orange", "banana", "apple"];\n// count apple occurrences`,
        options: ['1', '2', '3', '4'],
        answer: '3',
        explanation: '"apple" appears at indices 0, 2, and 5 — a total of 3 times.',
        xp: 40
      }
    ]
  },
  {
    id: 'stack',
    title: 'Stack (LIFO - Last In First Out)',
    category: 'data-structures',
    badge: 'DSA',
    visualizationType: 'stack',
    summary: 'A stack is like a stack of plates: you can only push to the top and pop from the top.',
    explanation: `In a Stack:
• Push(val): Places an element on TOP of the stack.
• Pop(): Removes and returns the TOP element.
The last element added is ALWAYS the first one removed (LIFO).
Watch the vertical column grow and shrink from the top!`,
    starterCode: `let stack = [];

// Push items onto stack
stack.push(10);
stack.push(20);
stack.push(30);
console.log("Stack after pushes:", stack);

// Pop item from top (removes 30)
let topItem = stack.pop();
console.log("Popped top item:", topItem);
console.log("Remaining stack:", stack);`,
    complexity: {
      time: 'O(1)',
      timeDetail: 'Push and Pop at top are O(1) constant time.',
      space: 'O(n)',
      spaceDetail: 'Stores n elements.'
    },
    challenges: [
      {
        id: 'stack-1',
        question: 'If you push 1, 2, 3 and then call pop(), what value is returned?',
        starterCode: `let s = []; s.push(1); s.push(2); s.push(3); console.log(s.pop());`,
        options: ['1', '2', '3', 'undefined'],
        answer: '3',
        explanation: '3 was pushed last, so it is at the top of the stack and popped first (LIFO).',
        xp: 40
      }
    ]
  },
  {
    id: 'queue',
    title: 'Queue (FIFO - First In First Out)',
    category: 'data-structures',
    badge: 'DSA',
    visualizationType: 'queue',
    summary: 'A queue is like a checkout line: people enter at the rear and exit from the front.',
    explanation: `In a Queue:
• Enqueue: Add an element to the REAR (end) of the line.
• Dequeue: Remove an element from the FRONT (start) of the line.
The first item to arrive is the first one served (FIFO).`,
    starterCode: `let queue = [10, 20, 30];

// Enqueue 40 at the rear
queue.push(40);
console.log("Queue after enqueue 40:", queue);

// Dequeue from front
let firstServed = queue[0];
console.log("Serving front customer:", firstServed);`,
    complexity: {
      time: 'O(1)',
      timeDetail: 'Enqueue and front access are constant time operations.',
      space: 'O(n)',
      spaceDetail: 'Stores n queued items.'
    },
    challenges: [
      {
        id: 'queue-1',
        question: 'Who gets served first in a FIFO queue: the first person who joined or the last?',
        starterCode: `// Queue: First In First Out`,
        options: ['First person who joined', 'Last person who joined', 'Random person', 'Middle person'],
        answer: 'First person who joined',
        explanation: 'FIFO stands for First In, First Out — whoever arrives first is served first.',
        xp: 35
      }
    ]
  },
  {
    id: 'linked-list',
    title: 'Linked List Traversal',
    category: 'data-structures',
    badge: 'DSA',
    visualizationType: 'linked-list',
    summary: 'Nodes linked together by pointers: each node holds a value and a reference to the next node.',
    explanation: `Unlike arrays with fixed indices, a Linked List consists of individual nodes:
{ val: 10, next: { val: 20, next: { val: 30, next: null } } }
To traverse, start at "head" and follow the ".next" pointer until reaching null!`,
    starterCode: `let node3 = { val: 30, next: null };
let node2 = { val: 20, next: node3 };
let head  = { val: 10, next: node2 };

let current = head;
while (current !== null) {
  console.log("Visited node value:", current.val);
  current = current.next;
}`,
    complexity: {
      time: 'O(n)',
      timeDetail: 'Linear traversal: Visiting each node takes 1 step.',
      space: 'O(n)',
      spaceDetail: 'Each node allocates memory for value and next pointer.'
    },
    challenges: [
      {
        id: 'll-1',
        question: 'What signals the end of a singly linked list?',
        starterCode: `// Traversing until current === ?`,
        options: ['next is null', 'next is 0', 'val is -1', 'head is empty'],
        answer: 'next is null',
        explanation: 'The terminal node in a singly linked list points to null, signaling the end.',
        xp: 40
      }
    ]
  },
  {
    id: 'binary-tree',
    title: 'Binary Tree Traversal',
    category: 'data-structures',
    badge: 'DSA',
    visualizationType: 'tree',
    summary: 'Hierarchical node structure where each parent has up to two children (left and right).',
    explanation: `A binary tree has a root node and two subtrees: left and right.
Traversing visits nodes hierarchically:
• Root: 10
• Left child: 5
• Right child: 15
Watch the tree nodes illuminate as execution explores each branch!`,
    starterCode: `let root = {
  val: 10,
  left: { val: 5, left: null, right: null },
  right: { val: 15, left: null, right: null }
};

console.log("Root value:", root.val);
console.log("Left child:", root.left.val);
console.log("Right child:", root.right.val);`,
    complexity: {
      time: 'O(n)',
      timeDetail: 'Traversal visits all n nodes in the tree.',
      space: 'O(h)',
      spaceDetail: 'Call stack space proportional to height of the tree h (log n for balanced trees).'
    },
    challenges: [
      {
        id: 'tree-1',
        question: 'In a Binary Search Tree (BST), where are values smaller than the root located?',
        starterCode: `// BST rule for values < root`,
        options: ['In the left subtree', 'In the right subtree', 'At the root', 'In the parent node'],
        answer: 'In the left subtree',
        explanation: 'By definition in a BST, all nodes in the left subtree have values smaller than the parent node.',
        xp: 40
      }
    ]
  },
  {
    id: 'graph',
    title: 'Graphs & Adjacency Traversal',
    category: 'data-structures',
    badge: 'DSA',
    visualizationType: 'graph',
    summary: 'A network of vertices (nodes) connected by edges (relationships).',
    explanation: `Graphs model real-world networks like social connections, maps, and internet routing.
Nodes are connected by edges. An adjacency list represents connections for each node:
A -> [B, C]
B -> [A, D]
Watch how graph traversal visits neighboring vertices!`,
    starterCode: `let graph = {
  A: ["B", "C"],
  B: ["A", "D"],
  C: ["A", "D"],
  D: ["B", "C"]
};

let startNode = "A";
let neighbors = graph[startNode];
console.log("Neighbors of node", startNode, ":", neighbors);`,
    complexity: {
      time: 'O(V + E)',
      timeDetail: 'Visiting all vertices V and edges E in the graph.',
      space: 'O(V)',
      spaceDetail: 'Visited set and queue/stack storage.'
    },
    challenges: [
      {
        id: 'graph-1',
        question: 'What data structure is typically used to perform Breadth-First Search (BFS) on a graph?',
        starterCode: `// BFS traversal uses:`,
        options: ['Queue (FIFO)', 'Stack (LIFO)', 'Binary Tree', 'Priority Queue only'],
        answer: 'Queue (FIFO)',
        explanation: 'BFS explores vertices level by level using a Queue (First In, First Out).',
        xp: 40
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 3. ALGORITHMS & DSA
  // ─────────────────────────────────────────────────────────────
  {
    id: 'linear-search',
    title: 'Linear Search',
    category: 'algorithms',
    badge: 'Search',
    visualizationType: 'searching',
    summary: 'Search through every element one by one from left to right until target is found.',
    explanation: `Linear Search checks each slot sequentially:
1. Check index 0: Is 4 === 9? False.
2. Check index 1: Is 8 === 9? False.
3. Check index 2: Is 2 === 9? False.
4. Check index 3: Is 9 === 9? TRUE! Element FOUND at index 3!`,
    starterCode: `let numbers = [4, 8, 2, 9, 5];
let target = 9;
let foundIndex = -1;

for (let i = 0; i < 5; i++) {
  console.log("Checking index", i, "value:", numbers[i]);
  if (numbers[i] === target) {
    foundIndex = i;
    console.log("TARGET FOUND at index", i);
    break;
  }
}`,
    complexity: {
      time: 'O(n)',
      timeDetail: 'Linear time: Worst case searches through all n elements.',
      space: 'O(1)',
      spaceDetail: 'Constant auxiliary space.'
    },
    challenges: [
      {
        id: 'ls-1',
        question: 'In the worst case (element not present), how many comparisons does Linear Search make on an array of length 10?',
        starterCode: `// Linear search on 10 elements`,
        options: ['10', '5', '1', '100'],
        answer: '10',
        explanation: 'If the target is not in the array, linear search must inspect every single one of the 10 elements.',
        xp: 35
      }
    ]
  },
  {
    id: 'binary-search',
    title: 'Binary Search (Divide & Conquer)',
    category: 'algorithms',
    badge: 'Search',
    visualizationType: 'searching',
    summary: 'Exponentially faster searching on sorted arrays by repeatedly halving the search interval.',
    explanation: `Binary Search requires the array to be SORTED:
1. Look at the middle element "mid".
2. If target === numbers[mid], found!
3. If target > numbers[mid], discard the left half (low = mid + 1).
4. If target < numbers[mid], discard the right half (high = mid - 1).
Watch the search boundary shrink with every single step!`,
    starterCode: `let arr = [10, 20, 30, 40, 50, 60, 70];
let target = 60;

let low = 0;
let high = 6;
let found = -1;

while (low <= high) {
  let mid = Math.floor((low + high) / 2);
  let midVal = arr[mid];
  console.log("Checking range [", low, "..", high, "] mid =", mid, "val =", midVal);

  if (midVal === target) {
    found = mid;
    console.log("FOUND at index:", mid);
    break;
  } else if (midVal < target) {
    low = mid + 1; // Search right half
  } else {
    high = mid - 1; // Search left half
  }
}`,
    complexity: {
      time: 'O(log n)',
      timeDetail: 'Logarithmic time: Cuts the search space in half each iteration (1,000,000 items takes only 20 checks!).',
      space: 'O(1)',
      spaceDetail: 'Iterative binary search uses constant O(1) pointers.'
    },
    challenges: [
      {
        id: 'bs-1',
        question: 'What is the prerequisite for Binary Search to work correctly?',
        starterCode: `// Binary search requires:`,
        options: ['The array must be sorted', 'The array must only have even numbers', 'The array must be short', 'No prerequisite'],
        answer: 'The array must be sorted',
        explanation: 'Binary Search relies on sorted order to reliably discard half the remaining elements.',
        xp: 45
      }
    ]
  },
  {
    id: 'bubble-sort',
    title: 'Bubble Sort',
    category: 'algorithms',
    badge: 'Sorting',
    visualizationType: 'sorting',
    summary: 'Repeatedly step through the list, compare adjacent elements, and swap them if in the wrong order.',
    explanation: `Like bubbles rising to the surface:
In each pass, adjacent elements arr[j] and arr[j+1] are compared.
If arr[j] > arr[j+1], they swap places.
At the end of pass 1, the largest number has "bubbled" all the way to the right end!`,
    starterCode: `let arr = [5, 3, 8, 1, 2];
let n = 5;

for (let i = 0; i < n; i++) {
  for (let j = 0; j < n - 1; j++) {
    if (arr[j] > arr[j + 1]) {
      // Swap adjacent elements
      let temp = arr[j];
      arr[j] = arr[j + 1];
      arr[j + 1] = temp;
      console.log("Swapped", arr[j + 1], "with", arr[j]);
    }
  }
}

console.log("Sorted array:", arr);`,
    complexity: {
      time: 'O(n²)',
      timeDetail: 'Quadratic time: Compares adjacent pairs across nested loops.',
      space: 'O(1)',
      spaceDetail: 'In-place sorting algorithm.'
    },
    challenges: [
      {
        id: 'sort-1',
        question: 'After one full pass of Bubble Sort on [5, 1, 4, 2, 8], which element is guaranteed to be in its final sorted position?',
        starterCode: `let arr = [5, 1, 4, 2, 8];\n// After 1 pass of bubble sort`,
        options: ['8', '1', '5', '4'],
        answer: '8',
        explanation: 'Bubble sort bubbles the largest element (8) to the rightmost index on pass 1.',
        xp: 45
      }
    ]
  },
  {
    id: 'recursion-countdown',
    title: 'Recursion & The Call Stack',
    category: 'algorithms',
    badge: 'Recursion',
    visualizationType: 'recursion',
    summary: 'A function that solves a problem by calling itself with smaller inputs until reaching a base case.',
    explanation: `Recursion consists of two vital parts:
1. Base Case: The condition that STOPS the recursion (e.g., if n === 0 return).
2. Recursive Call: The function invoking itself with a smaller step (n - 1).
Watch the Call Stack:
Stack frames accumulate: countdown(3) -> countdown(2) -> countdown(1) -> Base Case reached -> Unwinding and returning!`,
    starterCode: `function countdown(n) {
  if (n === 0) {
    console.log("Base case reached: n === 0!");
    return 0;
  }

  console.log("Call stack pushing frame n =", n);
  countdown(n - 1);
  console.log("Unwinding frame n =", n);
}

countdown(3);`,
    complexity: {
      time: 'O(n)',
      timeDetail: 'Linear time: Calls itself n times.',
      space: 'O(n)',
      spaceDetail: 'Linear call stack depth: Stores n stack frames in memory.'
    },
    challenges: [
      {
        id: 'rec-1',
        question: 'What happens if a recursive function does NOT have a valid base case?',
        starterCode: `function loopForever(n) {\n  return loopForever(n + 1);\n}`,
        options: ['Maximum call stack size exceeded (Stack Overflow)', 'It completes normally', 'It returns 0', 'It pauses automatically'],
        answer: 'Maximum call stack size exceeded (Stack Overflow)',
        explanation: 'Without a base case, calls pile up infinitely on the Call Stack until memory is exhausted.',
        xp: 45
      }
    ]
  }
];
