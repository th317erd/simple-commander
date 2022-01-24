const Adextopa = require('adextopa');

const {
  $BREAK,
  $DISCARD,
  $ENFORCE,
  $EQUALS,
  $GROUP,
  $LOOP,
  $MATCHES,
  $OPTIONAL,
  $PROGRAM,
  $SWITCH,
  $WS,
} = Adextopa.GenericTokens;

const Whitespace = (opts) => ((opts) ? $WS(Object.assign({ typeName: 'Whitespace' }, opts)) : $WS({ typeName: 'Whitespace', optional: true }));

const NextNameCheck = (matcher, typeName) => (
  $DISCARD(
    $PROGRAM(
      Whitespace(),
      $EQUALS(','),
      $ENFORCE(matcher, { consume: false }),
      { typeName },
    )
  )
);

const DescriptionCheck = (kind, typeName) => (
  $DISCARD(
    $PROGRAM(
      Whitespace(),
      $ENFORCE(Description({ kind }), { consume: false }),
      { typeName },
    )
  )
);

const Description = (opts) => (
  $GROUP(
    '(', ')', '\\',
    Object.assign({}, opts, {
      typeName: 'Description',
      finalize: ({ context, options, token }) => {
        var { commandContext }        = context;
        var currentCommandOrArgument  = (options.kind === 'command') ? commandContext.currentCommand : commandContext.currentArgument;

        currentCommandOrArgument.description = token.body.value;

        return token;
      }
    })
  )
);

const CommandName = () => (
  $MATCHES(
    /\$0|\w[\w-]*\??/,
    { typeName: 'CommandName' },
  )
);

const CommandNames = () => (
  $LOOP(
    $PROGRAM(
      Whitespace(),
      CommandName(),
      $SWITCH(
        NextNameCheck(CommandName(), 'NextCommandNameCheck'),
        $BREAK(),
        { typeName: 'CheckNextCommandName' }
      ),
      {
        typeName: 'NextCommandName',
        finalize: ({ token }) => {
          return token.children[0];
        },
      },
    ),
    {
      typeName: 'CommandNames',
      min:      1,
      // debug:    true,
      finalize: ({ context, token }) => {
        var { commandContext }  = context;
        var currentCommand      = commandContext.currentCommand;
        var hidden              = false;

        var names = token.children.map((child) => {
          var name = child[0];

          if (name.indexOf('?') >= 0)
            hidden = true;

          return name;
        }).reverse();

        currentCommand.names  = names;
        currentCommand.hidden = hidden;

        return token;
      },
    },
  )
);

const ArgumentName = () => (
  $MATCHES(
    /([\w-]+)(\?|\.\.\.)?/,
    { typeName: 'ArgumentName' },
  )
);

const ArgumentType = () => (
  $MATCHES(
    /:([\w-]+)/,
    {
      typeName: 'ArgumentType',
      finalize: ({ context, token }) => {
        var { commandContext }  = context;
        var currentArgument     = commandContext.currentArgument;

        currentArgument.type = token[1];

        return token;
      },
    },
  )
);

const ArgumentTypeCheck = () => (
  $PROGRAM(
    Whitespace(),
    $EQUALS(':'),
    $ENFORCE(ArgumentType, { consume: false }),
    { typeName: 'ArgumentTypeCheck' },
  )
);

const ArgumentNames = () => (
  $LOOP(
    $PROGRAM(
      Whitespace(),
      ArgumentName(),
      $SWITCH(
        NextNameCheck(ArgumentName(), 'NextArgumentNameCheck'),
        $BREAK(),
      ),
      {
        finalize: ({ token }) => {
          return token.children[0];
        },
      },
    ),
    {
      typeName: 'ArgumentNames',
      min:      1,
      // debug:    true,
      finalize: ({ context, token }) => {
        var { commandContext }  = context;
        var currentArgument     = commandContext.currentArgument;
        var hidden              = false;
        var option              = false;
        var variadic            = false;

        var names = token.children.map((child) => {
          var name = child[1];

          if (name.charAt(0) === '-')
            option = true;

          if (child[2] === '?')
            hidden = true;
          else if (child[2] === '...')
            variadic = true;

          return name;
        }).reverse();

        currentArgument.names     = names;
        currentArgument.hidden    = hidden;
        currentArgument.kind      = (option) ? 'option' : 'argument';
        currentArgument.variadic  = variadic;
        currentArgument.optional  = !context.requiredArgument;

        return token;
      },
    },
  )
);

const ArgumentOrOption = () => (
  $PROGRAM(
    ArgumentNames(),
    $OPTIONAL(ArgumentType()),
  )
);

const ReuiredArgument = () => (
  $PROGRAM(
    Whitespace(),
    $MATCHES(/</),
    ArgumentOrOption(),
    Whitespace(),
    $MATCHES(/>/),
    { typeName: 'ReuiredArgument', context: { requiredArgument: true } }
  )
);

const OptionalArgument = () => (
  $PROGRAM(
    Whitespace(),
    $MATCHES(/\[/),
    ArgumentOrOption(),
    Whitespace(),
    $MATCHES(/\]/),
    { typeName: 'OptionalArgument', context: { requiredArgument: false } }
  )
);

const Arguments = () => (
  $LOOP(
    $SWITCH(
      ReuiredArgument(),
      OptionalArgument(),
    ),
    { typeName: "Arguments" },
  )
);

const CommandParser = () => (
  $PROGRAM(
    CommandNames(),
    Whitespace(),
    $OPTIONAL(Description({ kind: 'command' })),
    Whitespace(),
    Arguments(),
  )
);

function createParserContext() {
  const newCommand = (opts) => {
    var command = Object.assign({
      description:  null,
      hidden:       false,
      kind:         "command",
      names:        [],
    }, opts || {});

    results.push(command);

    return command;
  };

  const newArgument = (opts) => {
    var argument = Object.assign({
      choices:            null,
      defaultDescription: null,
      defaultValues:      null,
      description:        null,
      hidden:             false,
      kind:               "argument",
      names:              [],
      optional:           false,
      type:               null,
      variadic:           false,
    }, opts || {});

    results.push(argument);

    return argument;
  };

  var results = [];
  var _currentCommand;
  var _currentArgument;

  var commandContext = {
    newCommand,
    newArgument,
  };

  Object.defineProperties(commandContext, {
    'currentCommand': {
      enumberable:  false,
      configurable: true,
      get:          () => {
        if (!_currentCommand)
          _currentCommand = newCommand();

        return _currentCommand;
      },
      set:          (command) => {
        _currentCommand = command;
        return command;
      },
    },
    'currentArgument': {
      enumberable:  false,
      configurable: true,
      get:          () => {
        if (!_currentArgument)
          _currentArgument = newArgument();

        return _currentArgument;
      },
      set:          (argument) => {
        _currentArgument = argument;
        return argument;
      },
    },
  });

  return { results, commandContext, debugLevel: 1 };
}

module.exports = {
  CommandParser,
  createParserContext,
};
