const Lib = require('../src');

describe("simple-commander", function () {
  describe("coerceValue", function () {
    it('should be able to coerce to boolean (without type)', function () {
      expect(Lib.coerceValue(undefined)).toBe(undefined);
      expect(Lib.coerceValue(null)).toBe(null);
      expect(Lib.coerceValue(true)).toBe(true);
      expect(Lib.coerceValue(false)).toBe(false);
      expect(Lib.coerceValue('True')).toBe(true);
      expect(Lib.coerceValue('true')).toBe(true);
      expect(Lib.coerceValue('"TRUE"')).toBe(true);
      expect(Lib.coerceValue('"true"')).toBe(true);
      expect(Lib.coerceValue("'true'")).toBe(true);
      expect(Lib.coerceValue('false')).toBe(false);
      expect(Lib.coerceValue('False')).toBe(false);
      expect(Lib.coerceValue('"false"')).toBe(false);
      expect(Lib.coerceValue('"FALSE"')).toBe(false);
      expect(Lib.coerceValue("'false'")).toBe(false);
    });

    it('should be able to coerce to boolean (with type)', function () {
      expect(Lib.coerceValue(undefined, 'boolean')).toBe(false);
      expect(Lib.coerceValue(null, 'boolean')).toBe(false);
      expect(Lib.coerceValue(true, 'boolean')).toBe(true);
      expect(Lib.coerceValue(false, 'boolean')).toBe(false);
      expect(Lib.coerceValue(0, 'boolean')).toBe(false);
      expect(Lib.coerceValue(1, 'boolean')).toBe(true);
      expect(Lib.coerceValue(-1, 'boolean')).toBe(true);
      expect(Lib.coerceValue(NaN, 'boolean')).toBe(false);
      expect(Lib.coerceValue(Infinity, 'boolean')).toBe(true);
      expect(Lib.coerceValue(BigInt(0), 'boolean')).toBe(false);
      expect(Lib.coerceValue(BigInt(1), 'boolean')).toBe(true);
      expect(Lib.coerceValue(BigInt(-1), 'boolean')).toBe(true);
      expect(Lib.coerceValue('True', 'boolean')).toBe(true);
      expect(Lib.coerceValue('true', 'boolean')).toBe(true);
      expect(Lib.coerceValue('"TRUE"', 'boolean')).toBe(true);
      expect(Lib.coerceValue('"true"', 'boolean')).toBe(true);
      expect(Lib.coerceValue("'true'", 'boolean')).toBe(true);
      expect(Lib.coerceValue('false', 'boolean')).toBe(false);
      expect(Lib.coerceValue('False', 'boolean')).toBe(false);
      expect(Lib.coerceValue('"false"', 'boolean')).toBe(false);
      expect(Lib.coerceValue('"FALSE"', 'boolean')).toBe(false);
      expect(Lib.coerceValue("'false'", 'boolean')).toBe(false);
    });

    it('should be able to coerce to number (without type)', function () {
      expect(Lib.coerceValue(undefined)).toBe(undefined);
      expect(Lib.coerceValue(null)).toBe(null);
      expect(Lib.coerceValue(0)).toBe(0);
      expect(Lib.coerceValue(10)).toBe(10);
      expect(Lib.coerceValue('0')).toBe(0);
      expect(Lib.coerceValue('5')).toBe(5);
      expect(Lib.coerceValue('15.5')).toBe(15.5);
      expect(Lib.coerceValue("'15.5'")).toBe('15.5');
      expect(Lib.coerceValue('"10.52:234"')).toBe('10.52:234');
    });

    it('should be able to coerce to number (with type)', function () {
      expect(Lib.coerceValue(undefined, 'integer')).toBe(0);
      expect(Lib.coerceValue(null, 'integer')).toBe(0);
      expect(Lib.coerceValue(0, 'integer')).toBe(0);
      expect(Lib.coerceValue(10, 'integer')).toBe(10);
      expect(Lib.coerceValue(10.4, 'integer')).toBe(10);
      expect(Lib.coerceValue(10.6, 'integer')).toBe(11);
      expect(Lib.coerceValue('0', 'integer')).toBe(0);
      expect(Lib.coerceValue('5', 'integer')).toBe(5);
      expect(Lib.coerceValue('15.5', 'integer')).toBe(16);
      expect(Lib.coerceValue("'15.4'", 'integer')).toBe(15);
      expect(Lib.coerceValue('"10.52:234"', 'integer')).toBe(11);

      expect(Lib.coerceValue('10.4', 'number')).toBe(10.4);
      expect(Lib.coerceValue('10.6', 'number')).toBe(10.6);
      expect(Lib.coerceValue('"10.6"', 'number')).toBe(10.6);
      expect(Lib.coerceValue("'10.6'", 'number')).toBe(10.6);
      expect(Lib.coerceValue("'10.6:234.3'", 'number')).toBe(10.6);
      expect(Lib.coerceValue("1e-7", 'number')).toEqual(1 / 10000000);

      expect(Lib.coerceValue('0', 'bigint')).toEqual(BigInt(0));
      expect(Lib.coerceValue('1', 'bigint')).toEqual(BigInt(1));
      expect(Lib.coerceValue('1.1', 'bigint')).toEqual(BigInt(1));
      expect(Lib.coerceValue('1.5', 'bigint')).toEqual(BigInt(2));
      expect(Lib.coerceValue('"1.5"', 'bigint')).toEqual(BigInt(2));
      expect(Lib.coerceValue('"1.5:5.6"', 'bigint')).toEqual(BigInt(2));
    });

    it('should be able to coerce to string (without type)', function () {
      var func = () => {};
      var array = [];
      var obj = {};

      expect(Lib.coerceValue(undefined)).toBe(undefined);
      expect(Lib.coerceValue(null)).toBe(null);
      expect(Lib.coerceValue(true)).toBe(true);
      expect(Lib.coerceValue(false)).toBe(false);
      expect(Lib.coerceValue(10)).toBe(10);
      expect(Lib.coerceValue(func)).toBe(func);
      expect(Lib.coerceValue(array)).toBe(array);
      expect(Lib.coerceValue(obj)).toBe(obj);
      expect(Lib.coerceValue('derp')).toBe('derp');
      expect(Lib.coerceValue('"hello"')).toBe("hello");
      expect(Lib.coerceValue('""hello""')).toBe('"hello"');
    });

    it('should be able to coerce to string (with type)', function () {
      expect(Lib.coerceValue(undefined, 'string')).toBe('');
      expect(Lib.coerceValue(null, 'string')).toBe('');
      expect(Lib.coerceValue(() => {}, 'string')).toBe('');
      expect(Lib.coerceValue([], 'string')).toBe('');
      expect(Lib.coerceValue({}, 'string')).toBe('');
      expect(Lib.coerceValue(true, 'string')).toBe('true');
      expect(Lib.coerceValue(false, 'string')).toBe('false');
      expect(Lib.coerceValue(10, 'string')).toBe('10');
      expect(Lib.coerceValue(BigInt(10), 'string')).toBe('10');
      expect(Lib.coerceValue('derp', 'string')).toBe('derp');
      expect(Lib.coerceValue('"hello"', 'string')).toBe("hello");
      expect(Lib.coerceValue('""hello""', 'string')).toBe('"hello"');
    });
  });

  describe("buildPositionalArguments", function () {
    it("should be able to build positional arguments", function () {
      var parts = Lib.parseCommand('command <--e,--env> <name> [age] [test] <derp> [files...]');
      expect(Lib.buildPositionalArguments(parts)).toEqual('<name> [age] [test] <derp> [files...]');
    });
  });

  describe("parseCommand", function () {
    it("should be able to parse command strings with extra spaces", function () {
      var parts = Lib.parseCommand('command <--e,--env : string = $NODE_ENV | "default" (Specify environment)>');
      expect(parts).toEqual([
        {
          "description":    null,
          "hidden":         false,
          "kind":           "command",
          "names":          [ "command" ],
        },
        {
          "choices":            null,
          "defaultDescription": null,
          "defaultValues":      [ "$NODE_ENV", "default" ],
          "description":        "Specify environment",
          "hidden":             false,
          "kind":               "option",
          "names":              [ "env", "e" ],
          "optional":           false,
          "type":               "string",
          "variadic":           false,
        }
      ]);
    });

    it("should be able to parse command strings with no command name", function () {
      var parts = Lib.parseCommand('<"--e","--env" (Specify environment): string = $NODE_ENV | "default" (default "development")>');
      expect(parts).toEqual([
        {
          "description":    null,
          "hidden":         false,
          "kind":           "command",
          "names":          [ "$0" ],
        },
        {
          "choices":            null,
          "defaultDescription": 'default "development"',
          "defaultValues":      [ "$NODE_ENV", "default" ],
          "description":        "Specify environment",
          "hidden":             false,
          "kind":               "option",
          "names":              [ "env", "e" ],
          "optional":           false,
          "type":               "string",
          "variadic":           false,
        }
      ]);
    });

    it("should be able to parse command strings with hidden arguments", function () {
      var parts = Lib.parseCommand('add-user <name?:string(Name of person)> [--a,--age:integer = 0(Specify user age)]');
      expect(parts).toEqual([
        {
          "description":    null,
          "hidden":         false,
          "kind":           "command",
          "names":          [ "add-user" ],
        },
        {
          "choices":            null,
          "defaultDescription": null,
          "defaultValues":      null,
          "description":        "Name of person",
          "hidden":             true,
          "kind":               "argument",
          "names":              [ "name" ],
          "optional":           false,
          "type":               "string",
          "variadic":           false,
        },
        {
          "choices":            null,
          "defaultDescription": null,
          "defaultValues":      0,
          "description":        "Specify user age",
          "hidden":             false,
          "kind":               "option",
          "names":              [ "age", "a" ],
          "optional":           true,
          "type":               "integer",
          "variadic":           false,
        }
      ]);
    });

    it("should be able to parse command strings with hidden arguments", function () {
      var parts = Lib.parseCommand('add-user [--a,--age:integer = 0(Specify user age)] <name?:string(Name of person)> <meta...:string>');
      expect(parts).toEqual([{
          "description":  null,
          "hidden":       false,
          "kind":         "command",
          "names":        [ "add-user" ],
        },
        {
          "choices":            null,
          "defaultDescription": null,
          "defaultValues":      0,
          "description":        "Specify user age",
          "hidden":             false,
          "kind":               "option",
          "names":              [ "age", "a" ],
          "optional":           true,
          "type":               "integer",
          "variadic":           false,
        },
        {
          "choices":            null,
          "defaultDescription": null,
          "defaultValues":      null,
          "description":        "Name of person",
          "hidden":             true,
          "kind":               "argument",
          "names":              [ "name" ],
          "optional":           false,
          "type":               "string",
          "variadic":           false,
        },
        {
          "choices":            null,
          "defaultDescription": null,
          "defaultValues":      null,
          "description":        null,
          "hidden":             false,
          "kind":               "argument",
          "names":              [ "meta" ],
          "optional":           false,
          "type":               "string",
          "variadic":           true,
        }
      ]);
    });

    it("should be able to parse command strings with choices", function () {
      var parts = Lib.parseCommand('create-pizza <toppings...:string{"cheese","pepperoni","sausage","mushrooms"}(Specify toppings for pizza)>');
      expect(parts).toEqual([{
          "description":  null,
          "hidden":       false,
          "kind":         "command",
          "names":        [ "create-pizza" ],
        },
        {
          "choices":            [ "cheese", "pepperoni", "sausage", "mushrooms" ],
          "defaultDescription": null,
          "defaultValues":      null,
          "description":        "Specify toppings for pizza",
          "hidden":             false,
          "kind":               "argument",
          "names":              [ "toppings" ],
          "optional":           false,
          "type":               "string",
          "variadic":           true,
        },
      ]);
    });

    it("should error on invalid pattern", function () {
      expect(function() {
        Lib.parseCommand('create-pizza <argument');
      }).toThrow(new Error("Error in command string:\n  create-pizza <argument\n               ^^^^^^^^^"));

      expect(function() {
        Lib.parseCommand('create-pizza <argument(Desc>');
      }).toThrow(new Error("Error in command string:\n  create-pizza <argument(Desc>\n                        ^     "));

      expect(function() {
        Lib.parseCommand('create-pizza <argument:string=(Desc>');
      }).toThrow(new Error("Error in command string:\n  create-pizza <argument:string=(Desc>\n                                ^     "));
    });
  });
});
