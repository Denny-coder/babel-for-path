class Example {
  constructor() {
    console.log(`{
      "ctrip": {
        "group": [
          "https://github.com/Denny-coder/babel-for-path.git"
        ]
      },
      "flight": {
        "group": [
          "https://github.com/Denny-coder/babel-for-path.git"
        ],
        "ctrip": {
          "group": [
            "https://github.com/Denny-coder/babel-for-path.git"
          ]
        }
      },
      "group": [
        "https://github.com/Denny-coder/babel-for-path.git"
      ]
    }
    `)
  }
}
module.exports = Example;
