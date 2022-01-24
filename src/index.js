const Adextopa = require('adextopa');

const {
  CommandParser,
  createParserContext,
} = require('./parser');

const {
  coerceValue,
  isEmpty,
  buildPositionalArguments,
} = require('./utils');

function parseCommand(command) {
  if (!command)
    return [];

  try {
    var context = createParserContext();
    var parser  = new Adextopa.Parser(command);

    parser.tokenize(CommandParser(), context);

    return context.results;
  } catch (error) {
    if (parser)
      parser.displayErrors(error);
  }
}

function _parseCommand(_command) {
  const stripQuotes = (str) => {
    return str.trim().replace(/^['"]/, '').replace(/['"]$/, '');
  }

  const maskedPart = (m) => {
    var index = maskedParts.length;
    maskedParts.push(m);
    return `@@@@@${index}@@@@@`;
  };

  const expandMaskedPart = (str, helper) => {
    return str.replace(/@@@@@(\d+)@@@@@/g, function(m, _index) {
      var index = parseInt(_index, 10);
      var part  = maskedParts[index];

      if (part.match(/@@@@@(\d+)@@@@@/))
        part = expandMaskedPart(part, helper);

      if (typeof helper === 'function')
        part = helper(part);

      return part;
    });
  };

  const createEmptyStringOfLength = (len, char) => {
    var parts = new Array(len);
    for (var i = 0; i < len; i++) {
      parts[i] = (char) ? char : ' ';
    }

    return parts.join('');
  };

  const convertToSpaces = (str) => {
    return createEmptyStringOfLength(str.length);
  }

  const extraAttributesHelper = (part) => {
    var firstChar = part.charAt(0);
    if (firstChar === '(') {
      description = part.substring(1, part.length - 1);
      return '';
    }

    if (firstChar === '{') {
      choices = part.substring(1, part.length - 1);
      choices = choices.split(/,/g).map((part) => stripQuotes(expandMaskedPart(part)))
      return '';
    }

    return part;
  };

  const emptyAttributesHelper = (part) => {
    var firstChar = part.charAt(0);
    if (firstChar === '(' || firstChar === '{')
      return '';

    if (firstChar === '"' || firstChar === "'")
      return stripQuotes(part);

    return part;
  };

  const throwErrors = (errors) => {
    var positionsString = '';
    var lastOffset      = 0;

    for (var i = 0, il = errors.length; i < il; i++) {
      var error   = errors[i];
      var offset  = error.offset;
      var chunk   = error.chunk;

      if (lastOffset < offset)
        positionsString = `${positionsString}${createEmptyStringOfLength(offset - lastOffset, ' ')}`;

      positionsString = `${positionsString}${createEmptyStringOfLength(chunk.length, '^')}`;

      lastOffset = offset + chunk.length;
    }

    if (lastOffset < originalCommand.length)
      positionsString = `${positionsString}${createEmptyStringOfLength(originalCommand.length - lastOffset, ' ')}`;

    var errorString = [ "Error in command string:", `  ${originalCommand}`, `  ${positionsString}` ];
    throw new Error(errorString.join('\n'));
  };

  const validateCommandString = (command) => {
    var validate = command
                    .replace(/\n+/gm,               convertToSpaces)
                    .replace(stringCaptureRE,       convertToSpaces)
                    .replace(parenthesisCaptureRE,  convertToSpaces)
                    .replace(curlyBraceCaptureRE,   convertToSpaces)
                    .replace(commandCaptureRE,      convertToSpaces)
                    .replace(argumentCaptureRE,     convertToSpaces);

    var errors = [];
    validate.replace(/\S+/g, function(chunk, offset) {
      errors.push({ chunk, offset });
    });

    if (errors.length)
      throwErrors(errors);
  };

  const stringCaptureRE       = /(["])(\\\1|[^\1])*?\1/g;
  const parenthesisCaptureRE  = /\((\\\)|[^)])*?\)/g;
  const curlyBraceCaptureRE   = /\{(\\\}|[^}])*?\}/g;
  const commandCaptureRE      = /^\s*([@\d\w?-]+[\s,]*)+/g;
  const argumentCaptureRE     = /[<\[]((?:\\:|\\>|\\\]|[^:>\]])+)(:[\w\d_@]+)?(\s*)(=?(?:\\>|[^>\]])+)?[>\]]/g;
  var command                 = ('' + _command);
  var originalCommand         = command;

  // Validate syntax
  validateCommandString(originalCommand);

  var maskedParts = [];
  var args        = [];
  var description;
  var choices;

  command = command
    .replace(/\n/gm, ' ')
    .replace(stringCaptureRE, maskedPart)
    .replace(parenthesisCaptureRE, maskedPart)
    .replace(curlyBraceCaptureRE, maskedPart)
    .replace(commandCaptureRE, function(m, name, offset) {
      description = null;

      var kind      = 'command';
      var hidden    = (name.indexOf('?') >= 0);
      var names     = name.split(',').map((part) => expandMaskedPart(part, extraAttributesHelper).replace(/[^\w-]+/g, '')).reverse();

      args.push({
        description,
        hidden,
        kind,
        names,
        offset,
      });

      return createEmptyStringOfLength(m.length);
    })
    .replace(argumentCaptureRE, function(m, _name, _type, _ws, _defaultValues, offset) {
      var name = _name;

      // Validate name
      expandMaskedPart(name, emptyAttributesHelper).replace(/(?:[^\w.,?-])+/g, function(chunk, subOffset) {
        if (!chunk.match(/\S/))
          return m;

        throwErrors([ { chunk, offset: offset + subOffset + 1 } ]);
      });

      description = null;
      choices = null;

      name = name.trim();

      var kind            = (expandMaskedPart(name, emptyAttributesHelper).trim().match(/^-/)) ? 'option' : 'argument';
      var hidden          = (name.indexOf('?') >= 0);
      var variadic        = (kind !== 'option' && name.indexOf('...') >= 0);
      var names           = name.split(',').map((part) => expandMaskedPart(part, extraAttributesHelper).replace(/^-+/, '').replace(/[^\w_-]+/g, '')).reverse();
      var type            = _type;
      var optional        = (m.charAt(0) === '[');
      var defaultValues   = _defaultValues;
      var nameDescription = description;

      description = null;
      choices     = null;

      if (type)
        type = expandMaskedPart(type, extraAttributesHelper).replace(/[^\w\d_]+/g, '');
      else
        type = 'string';

      if (defaultValues) {
        // Validate
        var startOffset = [ _name, _type, _ws ].filter(Boolean).join('').length + 1;
        if (defaultValues.match(/^=[(){}\[\]]/))
          throwErrors([ { chunk: defaultValues.substring(1, 2), offset: offset + startOffset + 1 } ]);

        expandMaskedPart(defaultValues, extraAttributesHelper).replace(/\s*=(.*)/, function(m, values) {
          var values = values.split('|').map((part) => stripQuotes(expandMaskedPart(part)));
          defaultValues = values;
        });
      } else {
        defaultValues = null;
      }

      if (defaultValues) {
        var hasENV = (defaultValues.findIndex((value) => !!value.match(/\$[A-Z0-9_]+/)) >= 0);
        if (!hasENV && defaultValues.length === 1) {
          defaultValues = defaultValues[0];
          if (type && type !== 'array')
            defaultValues = coerceValue(defaultValues, (type === 'count') ? 'integer' : type);
        }
      }

      if (choices && !choices.length)
        choices = null;

      var defaultDescription = description;
      if (!nameDescription) {
        description = defaultDescription;
        defaultDescription = null;
      } else {
        description = nameDescription;
      }

      if (choices && type && type !== 'array')
        choices = choices.map((value) => coerceValue(value, type));

      args.push({
        choices,
        defaultDescription,
        defaultValues,
        description,
        hidden,
        kind,
        names,
        offset,
        optional,
        type,
        variadic,
      });

      return createEmptyStringOfLength(m.length);
    });

  args = args.sort((a, b) => {
    var x = a.offset;
    var y = b.offset;

    if (x === y)
      return 0;

    return (x < y) ? -1 : 1;
  });

  var hasCommand = (args[0].kind === 'command');
  if (!hasCommand) {
    args = [
      {
        description:  null,
        hidden:       false,
        kind:         'command',
        names:        [ '$0' ],
      }
    ].concat(args);
  }

  return args.map((arg) => {
    delete arg.offset;
    return Object.assign({}, arg);
  });
}



function buildCommands(yargs, _context, _commandStrings, _opts) {
  const createDefaultFunc = (type, defaultValues) => {
    return function() {
      for (var i = 0, il = defaultValues.length; i < il; i++) {
        var defaultValue = defaultValues[i];
        if (defaultValue.indexOf('$') >= 0) {
          defaultValue = ` ${defaultValue}`.replace(/([^\\])(\$[A-Z0-9_]+)/g, function(m, prefix, name) {
            var value = process.env[name];
            if (!value)
              value = '';

            return `${prefix}${value}`;
          }).substring(1);
        }

        if (isEmpty(defaultValue))
          continue;

        return coerceValue(defaultValue, (type === 'array') ? 'string' : type);
      }
    };
  };

  const createBuilder = (commandParts) => {
    return (thisYargs) => {
      for (var j = 1, jl = commandParts.length; j < jl; j++) {
        var part = commandParts[j];
        var {
          choices,
          defaultValues,
          description,
          defaultDescription,
          hidden,
          kind,
          names,
          optional,
          type,
          variadic,
        } = part;

        if (!description)
          description = false;

        if (!defaultDescription)
          defaultDescription = false;

        var originalType  = type;
        var yargsType     = type;

        if (type === 'count') {
          type = 'number';
        } else if (type === 'bool') {
          type = 'boolean';
          yargsType = 'boolean';
        } else if (type === 'int' || type === 'integer') {
          yargsType = 'number';
        } else if (type === 'bigint') {
          yargsType = undefined;
        }

        var alias = names.slice(1);
        if (!alias.length)
          alias = undefined;

        var coerce = undefined;
        if (type) {
          coerce = ((type) => (value) => {
            return coerceValue(value, type);
          })(type);
        }

        if (variadic && coerce) {
          var originalCoerce = coerce;
          coerce = ((originalCoerce) => (value) => value.map(originalCoerce))(originalCoerce);
        }

        if (typeof argumentHelper === 'function') {
          var result = argumentHelper.call(context, thisYargs, Object.assign({}, part, { alias, coerce, type, originalType }));

          if (result) {
            thisYargs = result;
            continue;
          }
        }

        if (defaultValues && defaultValues instanceof Array)
          defaultValues = createDefaultFunc(type, defaultValues);

        if (defaultValues == null)
          defaultValues = undefined;

        if (kind === 'argument') {
          if (!description) {
            if (forceDescriptions === 'error')
              throw new Error(`Error: argument '${names[0]}' is missing a description`);
            else if (forceDescriptions === true)
              description = `${names[0]} argument`;
          }

          thisYargs.positional(names[0], {
            'default':    defaultValues,
            description:  (hidden) ? false : description,
            type:         yargsType,
            alias,
            choices,
            coerce,
            defaultDescription,
          });
        } else if (kind === 'option') {
          if (!description) {
            if (forceDescriptions === 'error')
              throw new Error(`Error: option '${names[0]}' is missing a description`);
            else if (forceDescriptions === true)
              description = `${names[0]} option`;
          }

          thisYargs.option(names[0], {
            'default':    defaultValues,
            demandOption: !optional,
            global:       true,
            type:         yargsType,
            alias,
            choices,
            coerce,
            defaultDescription,
            description,
            hidden,
          });
        }
      }
    };
  };

  var context           = _context || {};
  var opts              = _opts || {};
  var commandStrings    = _commandStrings;
  var currentCommand    = yargs;
  var commandHelper     = opts.commandHelper;
  var argumentHelper    = opts.argumentHelper;
  var actionHelper      = opts.actionHelper;
  var forceDescriptions = (opts.forceDescriptions == null) ? 'error' : opts.forceDescriptions;

  if (typeof context === 'function')
    context = {};

  if (!(commandStrings instanceof Array))
    commandStrings = [ commandStrings ];

  for (var i = 0, il = commandStrings.length; i < il; i++) {
    var command = commandStrings[i];
    if (!command)
      continue;

    var commandParts      = parseCommand(command);
    var thisCommand       = commandParts[0];
    var commandAliases    = thisCommand.names.slice(1);
    var actionMethodName  = thisCommand.names[0];

    if (actionMethodName === '$0')
      actionMethodName = '_default';

    var actionMethod;

    if (typeof actionHelper === 'function')
      actionMethod = actionHelper.call(context, actionMethodName, thisCommand, yargs);
    else
      actionMethod = (typeof _context === 'function') ? _context.bind(context, actionMethodName) : context[actionMethodName].bind(context);

    if (!thisCommand.description) {
      if (forceDescriptions === 'error')
        throw new Error(`Error: command '${thisCommand.names[0]}' is missing a description`);
      else if (forceDescriptions === true)
        thisCommand.description = `${thisCommand.names[0]} command`;
    }

    currentCommand = yargs.command(
      [ `${thisCommand.names[0]} ${buildPositionalArguments(commandParts)}` ].concat(commandAliases),
      (thisCommand.hidden) ? false : (thisCommand.description || false),
      createBuilder(commandParts),
      actionMethod,
    );

    if (typeof commandHelper === 'function')
      commandHelper.call(context, thisYargs, thisCommand, commandParts.slice(1));
  }

  return yargs;
}

console.log('RESULT: ', parseCommand(`mm,makemigrations(Just a test (command\\)) <-p?,-preview...:boolean>`));

module.exports = {
  coerceValue,
  parseCommand,
  buildPositionalArguments,
  buildCommands,
};
