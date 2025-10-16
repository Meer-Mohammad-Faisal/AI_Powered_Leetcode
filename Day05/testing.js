const json = {
  "title": "Add Two Numbers",
  "description": "Write a function that takes two integers as input and returns their sum.",
  "difficulty": "easy",
  "tags": "array",
  "visibleTestCases": [
    {
      "input": "2 3",
      "output": "5",
      "explanation": "2 + 3 = 5"
    },
    {
      "input": "-1 5",
      "output": "4",
      "explanation": "-1 + 5 = 4"
    }
  ],
  "hiddenTestCases": [
    {
      "input": "10 20",
      "output": "30"
    },
    {
      "input": "-5 -7",
      "output": "-12"
    }
  ],
  "startCode": [
    {
      "language": "cpp",
      "initialCode": "#include <bits/stdc++.h>\nusing namespace std;\nint main(){\n    int a, b;\n    cin >> a >> b;\n    // Write your code here\n    return 0;\n}"
    },
    {
      "language": "python",
      "initialCode": "a, b = map(int, input().split())\n# Write your code here"
    },
    {
      "language": "javascript",
      "initialCode": "const input = require('fs').readFileSync(0, 'utf-8').trim().split(' ');\nconst a = parseInt(input[0]);\nconst b = parseInt(input[1]);\n// Write your code here"
    }
  ],
  "refrenceSolution": [
    {
      "language": "cpp",
      "completeCode": "#include <bits/stdc++.h>\nusing namespace std;\nint main(){\n    int a, b;\n    cin >> a >> b;\n    cout << a + b;\n    return 0;\n}"
    },
    {
      "language": "python",
      "completeCode": "a, b = map(int, input().split())\nprint(a + b)"
    },
    {
      "language": "javascript",
      "completeCode": "const input = require('fs').readFileSync(0, 'utf-8').trim().split(' ');\nconst a = parseInt(input[0]);\nconst b = parseInt(input[1]);\nconsole.log(a + b);"
    }
  ]
}
