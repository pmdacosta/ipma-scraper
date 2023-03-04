const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = str => new Promise(resolve => rl.question(str, resolve));
const wait = (ms) => new Promise(res => setTimeout(res, ms));

module.exports = {
  ask, wait
};