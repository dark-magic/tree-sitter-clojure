module.exports = grammar({
  name: 'Clojure',

  extras: $=> [$._whitespace, $.comment],
  supertypes: $=> [
    $._expression, 
    $._collection, 
    $._identifier,
    $._symbol,
    $._literal, 
    $._numericLiteral,
    $._characterLiteral
  ],

  rules: {
    source_file: $=> repeat($.sExpression),

    // -- Expressions --- //
    sExpression: $=> seq(
      '(', field('op', $._identifier), field('operands', repeat($._expression)), ')'
    ),
    anonymousFunctionExpression: $=> seq('#', field('body', $.sExpression)),
    unaryOp: $=> /('|~|`|~@)/,
    unaryExpression: $=> seq(
      field('op', $.unaryOp),
      field('expr', choice(
        $.sExpression, $.anonymousFunctionExpression, $._collection, $._identifier, $._literal
      ))
    ),
    _expression: $=> choice(
      $.unaryExpression, 
      $.sExpression, 
      $.anonymousFunctionExpression,
      $._collection, 
      $._identifier, 
      $._literal
    ),

    // -- Collections --- //
    _collection: $=> choice($.list, $.vector, $.set, $.map),
    list: $=> seq('\'(', repeat($._expression), ')'),
    vector: $=> seq(
      '[', 
      repeat($._expression), 
      optional(seq('&', choice($._identifier, $._collection))), 
      optional(seq(':as', $._symbol)), 
      ']'
    ),
    set: $=> seq('#{', repeat($._expression), '}'),
    map: $=> seq('{', repeat($.mapEntry), '}'),

    mapEntry: $=> seq($._expression, $._expression),

    // -- Symbols --- //
    _identifier: $=> choice($._symbol, $.keyword),
    _symbol: $=> choice(prec(2, $.specialSymbol), prec(1, $.basicSymbol)),
    specialSymbol: $=> /nil|true|false/,
    basicSymbol: $=> /[^:#(){}\[\]\d"\\\s,;][^(){}\[\]\s,;]*/,
    keyword: $=> /:[^(){}\[\]"\\\s,;]*/,

    // --- Literals --- //
    _literal: $=> choice($._numericLiteral, $._characterLiteral),

    _numericLiteral: $=> choice($.integer, $.floatingPoint, $.ratio),
    integer: $=> /[+\-]?(0[0-7]+|0x[a-fA-F0-9]+|\d+)N?|\d\d?r[a-zA-Z0-9]+/,
    floatingPoint: $=> /[+\-]?\d+(\.\d*)?(e[+\-]?\d+)M?|##Inf|##-Inf|##NaN/,
    ratio: $=> /\d+\/\d+/,

    _characterLiteral: $=> choice($.string, $.character, $.regex),
    string: $=> /"[^\r\n"]*?"/,
    character: $=> /\\[^\s]|\\u\d{4}|\\o\d{3}|\\newline|\\return|\\space|\\tab/,
    regex: $=> /#"[^\r\n"]*?"/,

    // --- Extras --- //
    _whitespace: $=> /[\s,]+/,
    comment: $=> /;.*?\r?\n/,
  }
});
