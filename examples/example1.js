const yargs       = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const Lib         = require('../src');

const context = {
  'echo': (argv) => {
    console.log.apply(console, argv.args);
  },
  'greet': (argv) => {
    console.log(`Hello ${argv.first_name} ${argv.last_name}, how are you ${argv.day}?`);
  }
};

Lib.buildCommands(
  yargs(hideBin(process.argv).concat('')),
  context,
  [
    'echo(Echo arguments back to stdout) [args...:string(Arguments to echo)]',
    'greet(Greet user by name) [--first_name:string(User\'s first name)="John"] [--last_name:string(User\'s last name)="Bob"] [--day:string(Specify day to greet on)="today"]',
  ]
).parse();
