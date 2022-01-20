const Commander = require('commander');
const Lib       = require('../src');

const program = new Commander.Command();
program.version('0.0.1', '-V, --version', 'output the current version');

const commandContext = {
  'echo': (...args) => {

  },
};

Lib.buildCommands(Commander, program, commandContext, [
  'echo <...args(Arguments to echo)>'
]);
