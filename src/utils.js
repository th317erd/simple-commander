function coerceValue(_value, _type) {
  var value = _value;
  var type  = (_type) ? _type.toLowerCase() : _type;

  const parseBoolean = (value, strict) => {
    if (value == null)
      return (strict) ? undefined : false;

    var typeOf = typeof value;

    if (typeOf === 'boolean' || value instanceof Boolean)
      return (typeof value.valueOf === 'function') ? value.valueOf() : value;

    if (!strict && (typeOf === 'number' || typeOf === 'bigint' || value instanceof Number)) {
      if (typeOf === 'bigint')
        return !!value;

      if (!isFinite(value)) {
        if (strict)
          return;

        if (isNaN(value))
          return false;

        return true;
      }

      return !!value;
    }

    if (!(typeOf === 'string' || value instanceof String))
      return (strict) ? undefined : !!value;

    if (('' + value).match(/^['"]*true['"]*$/i))
      return true;

    if (('' + value).match(/^['"]*false['"]*$/i))
      return false;
  };

  const parseNumber = (value, strict) => {
    if (value == null)
      return (strict) ? undefined : 0;

    var typeOf = typeof value;

    if (typeOf === 'bigint')
      return parseFloat(value);

    if (typeOf === 'number' || value instanceof Number) {
      var val = (value instanceof Number) ? value.valueOf() : value;
      if (!isFinite(val))
        return (strict) ? undefined : 0;

      return val;
    }

    if (!strict && (typeOf === 'boolean' || value instanceof Boolean))
      return (value) ? 1 : 0;

    if (!(typeOf === 'string' || value instanceof String))
      return (strict) ? undefined : 0;

    if (strict && value.match(/[^\d.e-]/))
      return;

    var parts     = value.split(/[^\d.e-]+/g).map((part) => part.replace(/[^\d.e-]+/g, '')).filter(Boolean);
    var firstPart = parts[0];
    if (!firstPart)
      return (strict) ? undefined : 0;

    var val = parseFloat(firstPart);
    if (!isFinite(val))
      return (strict) ? undefined : 0;

    return val;
  };

  const parseString = (value, strict) => {
    if (value == null)
      return (strict) ? value : '';

    var typeOf = typeof value;

    if (typeOf === 'number' || value instanceof Number)
      return (isFinite(value)) ? ('' + value) : '';

    if ((typeOf === 'boolean' || value instanceof Boolean) || typeOf === 'bigint')
      return ('' + value);

    if (!(typeOf === 'string' || value instanceof String))
      return (strict) ? value : '';

    return ('' + value).replace(/^(['"])(.*)\1$/, '$2');
  };

  if (!type) {
    if (value == null)
      return value;

    var val = parseBoolean(value, true);
    if (typeof val === 'boolean')
      return val;

    val = parseNumber(value, true);
    if (typeof val === 'number')
      return val;

    if (!(typeof value === 'string' || value instanceof String))
      return value;

    return parseString(value, true);
  } else {
    if (type === 'integer' || type === 'int' || type === 'number' || type === 'bigint') {
      var coercer;
      if (type === 'integer' || type === 'int')
        coercer = Math.round;
      else if (type === 'bigint')
        coercer = (val) => BigInt(Math.round(val));

      var val = parseNumber(value);
      if (val == null)
        return;

      return (coercer) ? coercer(val) : val;
    } else if (type === 'bool' || type === 'boolean') {
      return parseBoolean(value);
    } else {
      return parseString(value);
    }
  }
}

function isEmpty(value) {
  if (value == null)
    return true;

  if (typeof value === 'string' || value instanceof String)
    return !!value.match(/[^\s\t\n]/);

  if (typeof value === 'number' || value instanceof Number)
    return isFinite(value);

  if (value instanceof Array)
    return !!value.length;

  if (value.constructor === Object.prototype.constructor)
    return !!Object.keys().length;

  return false;
}

function buildPositionalArguments(commandParts) {
  var parts = [];

  for (var i = 0, il = commandParts.length; i < il; i++) {
    var command = commandParts[i];
    if (command.kind !== 'argument')
      continue;

    var optional = command.optional;
    var variadic = command.variadic;

    var variadicStr = (variadic) ? '...' : '';
    parts.push((optional) ? `[${command.names[0]}${variadicStr}]` : `<${command.names[0]}${variadicStr}>`);
  }

  return parts.join(' ');
}

module.exports = {
  coerceValue,
  isEmpty,
  buildPositionalArguments,
};
