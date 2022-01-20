# simple-yargs

[yargs](https://www.npmjs.com/package/yargs) made simple

## Description
<hr>

`simple-yargs` is a simple and small parser wrapped around `yargs` to make it easier to use.

All you need to do is specify your commands with all their arguments as simple strings, and this library will take care of the rest for you.

## Install
<hr>

```bash
npm i simple-yargs
```

## Usage
<hr>

#### **Simple Example:**

```javascript
const yargs       = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const SimpleYargs = require('simple-yargs');

const context = {
  'echo': (argv) => {
    console.log.apply(console, argv.args);
  },
  'greet': ({ first_name, last_name, day }) => {
    console.log(`Hello ${first_name} ${last_name}, how are you ${day}?`);
  }
};

SimpleYargs.buildCommands(
  yargs(hideBin(process.argv).concat('')),
  context,
  [
    'echo(Echo arguments back to stdout) [args...:string(Arguments to echo)]',
    `greet(Greet user by name)
      [--first_name:string(User's first name)="John"]
      [--last_name:string(User's last name)="Bob"]
      [--day:string(Specify day to greet on)="today"]
    `,
  ]
).parse();
```

#### **Class Example:**

```javascript
const yargs       = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const SimpleYargs = require('simple-yargs');

class MyCommandClass {
  constructor(argv) {
    SimpleYargs.buildCommands(
      argv,
      this, // context is "this" (the class instance)
      [
        'echo(Echo arguments back to stdout) [args...:string(Arguments to echo)]',
        `greet(Greet user by name)
          [--first_name:string(User's first name)="John"]
          [--last_name:string(User's last name)="Bob"]
          [--day:string(Specify day to greet on)="today"]
        `,
      ]
    ).parse();
  }

  echo(argv) {
    console.log.apply(console, argv.args);
  }

  greet({ first_name, last_name, day }) {
    console.log(`Hello ${first_name} ${last_name}, how are you ${day}?`);
  }
}

new MyCommandClass(yargs(hideBin(process.argv).concat('')));
```

```bash
$ node my-entry.js echo some arguments to echo
some arguments to echo
```

```bash
$ node my-entry.js greet --first_name "Mr." --last_name "Fish" --day="tomorrow"
Hello Mr. Fish, how are you tomorrow?
```

## Command string declarations
<hr>

Command strings follow a simple format:
* `command` **Command**: The first words in the command declaration are the name(s) of the command. The name of the command can be a comma separated list of names. The first names in the list are aliases to the command name, with the final name in the list being the "real" name of the command.
* `<arg>` **Required**: The `<*>` syntax means you are declaring an argument or option that is **required**.
* `[arg]` **Optional**: The `[*]` syntax means you are declaring an argument or option that is **optional**.
* `<a,arg>` **Aliases**: A comma separated list of argument or option names declares that you are specifying aliases for this argument/option. Aliases come first in the list. The final name in the list of names will be the "real" argument or option name. This also works for the `command`.
* `(description)` **Description**: The `(*)` syntax means you are declaring a description for the item preceeding the description.
* `{choices}` **Choices**: The `{item1,item2,item3}` syntax means you are defining a list of comma separated choices for this argument.
* `<arg:type>` **Type**: The `arg:type` syntax means your are defining an argument to have a specific type. Types supported are: `string`, `boolean`, `integer`, `number`, `bigint`, `array` (only for options), `count` (only for options).
* `<-e,-env>` **Option**: When an argument declaration starts with one or more hyphens (`-`) then the argument will be treated as an "option". More than one can be specified if they are comma separated. The first names in the list will be treated as aliases. The final name is treated as the "real" name of the argument/option. <br>*Note: yargs adds the hyphens to options by default, so the final option hyphens may not be exactly what you declared.*
* `<arg=$NODE_ENV|"development">` **Default values**: The `<arg=value1|value2>` syntax means you are defining a default value for this argument or option. Any value that starts with a `$` and is followed by all uppercase alpha-numeric characters is treated as an environment variable, and will be expanded as the default value from the environment. The `|` pipe allows you to specify more than one default, which really only makes sense when using environment variables. You can follow the default value list with parenthesis to declare a description for the default value. i.e. `<-e,-env:string=$NODE_ENV|development(Default "development")>`
* `<arg?>` **Hidden**: Adding a question mark `?` to any argument or option name will hide this argument from the generated help menu.
* `<arg...:string>` **Variadic argument**: Adding three dots `...` to the name of any argument specifies that you want to collect the remaining arguments passed to the command. <br>*Note: Variadic arguments must be the last argument defined in the command.*

## More command string examples
<hr>

Example command to add a user, aliasing the command "add-user" with the alias "add", requiring a first and last name, but also allowing an optional middle name, and user role, with choices, defaulting the user role to `"user"`:

`add,add-user <first_name:string(First name of user)> <last_name:string(Last name of user)> [--middle_name:string(Middle name of user)] [--role:string(User role){"user","admin","superadmin"}=user(Default "user")]`

Choices need not be wrapped in quotes:
`[--role:string(User role){user,admin,superadmin}=user(Default "user")]`

Example echo command that will echo all arguments provided back to stdout:

`echo <args...:string>`

Quotes are optional:

`"do-something" <"a","arg":string="something">`

Is the same as:

`do-something <a,arg:string=something>`

But quotes can be useful if you need to "escape" critical characters (`<>`, `[]`, `()`, or `{}`):

`do-something <arg:string="<value>">`

However, you can also just add a backslash to escape if you want to:

`do-something <arg:string=\<value\>>`

## Notes

* Quotes are not required, but are useful when you need to use format characters (`<>`, `[]`, `()`, or `{}`). Only double-quotes are supported.
* If you do not prefix your command string with a command name, then `$0` (the executable itself) will be the command.
* Following `yargs` convention, if you don't declare a description (for anything), then it will be hidden from the help menu.
* "Why the `.concat('')` on `yargs(hideBin(process.argv).concat(''))`?"... because of [this bug](https://github.com/yargs/yargs/issues/1848).
* You can specify your command using multiple lines:
  ```javascript
  var command = `
  command-name (A command description)
    <arg1:string> (arg1 desciption)
    <arg2:number=0> (arg2 description)
    [--option1=something] (option description)
  `;
  ```

## API
<hr>

### function **SimpleYargs.buildCommands**(*yargs: yargs, context: Object, commands: Array[string], [opts: Object]*)

#### Description

Build command(s) specified via the command strings parsed from `commands`.

#### Arguments

* **yargs** (*yargs instance*) - Instance of yargs to work off of to build the commands
* **context** (*Object*) - A simple object used to fetch "action" handler methods from. The name of the command (the "real" name) is used as a key to find the action handler method for each command. Commands that have no name (`$0` commands) look for the key `_default` for their action. This can be a `this` instance of a class, where your class method names are the same as your command names.<br>*Note: Each action method found is automatically bound to `context`: `actionMethod.bind(context)`.*
* **commands** (*Array[string]*)- An array of command strings to parse and turn into commands.
* **optional [opts]** (*Object*) - Optional options to pass to the command builder.
  * `opts` schema:<br>
    `argumentHelper`: *(function(yargs, argumentObject))* - If defined, this method will be called for every argument and option proccessed. `yargs` is the yarg command that was already created. `argumentObject` is the fully parsed argument or option in object form. It contains keys like `names: [string]`, `optional: boolean`, `hidden: boolean`, `kind: string`, etc... If this method returns nothing, then the argument or option will be built as usual. If this returns a truthy value, then the default argument or option building will be skipped. The `context` given to `buildCommands` is given as `this` to the method.<br>
    `commandHelper`: *(function(yargsCommand, commandObject, arguments))* - If defined, this method will be called with every command built. The `yargsCommand` is the final command built. The `commandObject` is the command itself as parsed, in object form. The `arguments` are the remaining arguments of the specified command.<br>*Note: The `context` given to `buildCommands` is given as `this` to the method.*

<hr>

### function **SimpleYargs.parseCommand**(*command: string*)

#### Description

Parse a command and return an array of command/argument objects. This method will throw an error if it detects invalid command string syntax. This method will return an array of command or argument/option objects. The command object is always first in the array, with any arguments/options following. i.e. `[ commandObject, argumentOrOptionObject, argumentOrOptionObject, ...]`.

#### Arguments
* **command** (*string*) - Command to parse.

<hr>

### function **SimpleYargs.coerceValue**(*value: any, [type: string]*)

#### Description

Coerce a value to the specified type. If `type` is not specified, then this method will "guess" the type.

#### Arguments
* **value** (*any*) - The value to coerce.
* **optional [type]** (*string*) - Type to coerce to. This can be one of `integer`, `number`, `boolean`, `bigint`, or `string`.

<hr>

### Object schema for parsed `command`

#### Description

This is the schema for a command object after a command is parsed. **SimpleYargs.parseCommand** will always return one of these, at index `[0]` in the returned array. This is the name of the command itself. If no command name was specified, then the name of the command will be `names: [ '$0' ]`.

* command object schema:

  * `description` *(string | null)*: The description specified for the argument or option, or `null` if none was specified.
  * `hidden` *(boolean)*: `true` if the argument or option was specified as hidden (`?` was added to the name of the argument or option).
  * `kind` *(string)*: Will always be `"command"`.
  * `names` *(Array[string])*: An array of names as strings. The first, at index `[0]`, will always be the full "real" name of the command. Any remaining values in this array will be aliases for the name.

<hr>

### Object schema for parsed `argument` or `option`

#### Description

This is the schema for an argument/option object after a command is parsed. **SimpleYargs.parseCommand** will return an array of these objects.

* argument/option object schema:

  * `choices` *(Array[string] | null)*: An array of choices, or `null` if no choices specified.
  * `defaultDescription` *(string | null)*: The description specified for the default value to an argument or option, or `null` if none was specified.
  * `defaultValues` *(any | Array[string] | null)*: The default value, after being coerced, or an array of strings if there is more than one default value. This will be `null` if no default value was specified.
  * `description` *(string | null)*: The description specified for the argument or option, or `null` if none was specified.
  * `hidden` *(boolean)*: `true` if the argument or option was specified as hidden (`?` was added to the name of the argument or option).
  * `kind` *(string)*: Will be one of `"argument"` or `"option"`.
  * `names` *(Array[string])*: An array of names as strings. The first, at index `[0]`, will always be the full "real" name of the argument or option. Any remaining values in this array will be aliases for the name.
  * `optional` *(boolean)*: `true` if this is an optional argument or option.
  * `type` *(string)*: A string specifying the data type of the argument or option. Valid types are `integer`, `number`, `bigint`, `boolean`, `string`, `count`, or `array`.
  * `variadic` *(boolean)*: `true` if the argument was specified as variadic (the arguments name contains `...`).
