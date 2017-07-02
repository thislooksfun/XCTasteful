#!/usr/bin/env node

// See http://mochajs.org/#spec for design

Array.prototype.last = function() {
  return this[this.length-1];
}

var spinnerStopped = '⣿'
var spinnerPlace = 0
var spinner = '⣷⣯⣟⡿⢿⣻⣽⣾'.split('')
var spinnerID = null

// regex
var startRegex      = /^Test Suite 'All tests' started at \d{4}-\d\d-\d\d \d\d:\d\d:\d\d.\d\d\d$/
var endRegex        = /^Test Suite 'All tests' (?:passed|failed) at \d{4}-\d\d-\d\d \d\d:\d\d:\d\d.\d\d\d\.$/
var suiteStartRegex = /^Test Suite '([A-Z][a-zA-Z]*Tests)' started at \d{4}-\d\d-\d\d \d\d:\d\d:\d\d.\d\d\d$/
var suiteEndRegex   = /^Test Suite '[A-Z][a-zA-Z]*Tests' (?:passed|failed) at \d{4}-\d\d-\d\d \d\d:\d\d:\d\d.\d\d\d\.$/
var caseStartRegex  = /^Test Case '-\[[A-Z][a-zA-Z]*\.[A-Z][a-zA-Z]* (test[A-Z][a-zA-Z]*)\]' started\.$/
var caseEndRegex    = /^Test Case '-\[[A-Z][a-zA-Z]*\.[A-Z][a-zA-Z]* test[A-Z][a-zA-Z]*\]' (passed|failed) \((\d+\.\d\d\d) seconds\)\.$/
var errorRegex      = /^(?:\/[a-zA-Z0-9](?:[a-zA-Z0-9]|\\ )*)*\/([a-zA-Z0-9]*)\.swift:(\d+): error: -\[[A-Z][a-zA-Z]*\.[A-Z][a-zA-Z]* test[A-Z][a-zA-Z]*\] : ?(XCTAssert[A-Za-z]*)? failed:? (.*)$/

var XCTAssertRegexes = {
  XCTAssert:                     /^- (.*)$/,
  XCTAssertEqual:                /^"([^"]*)" is not equal to "([^"]*)" - (.*)$/,
  XCTAssertEqualWithAccuracy:    /^"([^"]*)" is not equal to "([^"]*)" +\/- "([^"]*)" - (.*)$/,
  XCTAssertFalse:                /^- (.*)$/,
  XCTAssertGreaterThan:          /^"([^"]*)" is not greater than "([^"]*)" - (.*)$/,
  XCTAssertGreaterThanOrEqual:   /^"([^"]*)" is less than "([^"]*)" - (.*)$/,
  XCTAssertLessThan:             /^"([^"]*)" is not less than "([^"]*)" - (.*)$/,
  XCTAssertLessThanOrEqual:      /^"([^"]*)" is greater than "([^"]*)" - (.*)$/,
  XCTAssertNil:                  /^"([^"]*)" - (.*)$/,
  XCTAssertNoThrow:              /^threw error "([^"]*)" - (.*)$/,
  XCTAssertNotEqual:             /^"([^"]*)" is equal to "([^"]*)" - (.*)$/,
  XCTAssertNotEqualWithAccuracy: /^"([^"]*)" is equal to "([^"]*)" +\/- "([^"]*)" - (.*)$/,
  XCTAssertNotNil:               /^- (.*)$/,
  XCTAssertThrowsError:          /^did not throw an error - (.*)$/,
  XCTAssertTrue:                 /^- (.*)$/,
  XCTFail:                       /^- (.*)$/,
}

var XCTAssertParsers = {
  XCTAssert:                     function(data) {},
  XCTAssertEqual:                function(data) {},
  XCTAssertEqualWithAccuracy:    function(data) {},
  XCTAssertFalse:                function(data) {},
  XCTAssertGreaterThan:          function(data) {},
  XCTAssertGreaterThanOrEqual:   function(data) {},
  XCTAssertLessThan:             function(data) {},
  XCTAssertLessThanOrEqual:      function(data) {},
  XCTAssertNil:                  function(data) {},
  XCTAssertNoThrow:              function(data) {},
  XCTAssertNotEqual:             function(data) {},
  XCTAssertNotEqualWithAccuracy: function(data) {},
  XCTAssertNotNil:               function(data) {},
  XCTAssertThrowsError:          function(data) {},
  XCTAssertTrue:                 function(data) {},
  XCTFail:                       function(data) {},
}

// Ansi
var esc = '\033['

// Colors
var green = esc + '32m'   // dark green
var red   = esc + '31m'   // dark red
var gray  = esc + '30;1m' // bright black (gray)
var white = esc + '37;1m' // bright white
var cyan  = esc + '36m'   // dark cyan

// Special
var reset = esc + '0m'
var hideCursor = esc + '?25l'
var showCursor = esc + '?25h'

// Symbols
var passPrefix = '✔'
var failPrefix = '✖'

// Storage
var hasStarted = false
var names = []
var errors = []
var wereErrors = false
var testCount = 0
var failCount = 0

// Convenience methods
function write(str = '') { process.stdout.write(str) }
function print(str = '') { console.log(str) }

function handleData(data) {
  var str = data.toString()
  var lines = str.split('\n')
  for (var i = 0; i < lines.length; i++) {
    if (lines[i].length > 0) {
      parseLine(lines[i])
    }
  }
}

function writeIndent() {
  for (var i = 1; i <= names.length; i++) {
    write('  ')
  }
}

var reporters = {
  spec: {
    prep: function() {
      print(hideCursor)
      write(cyan + spinnerStopped + white + ' Initializing' + reset + '\r')
      startSpinner()
    },
    logPreInit: function(msg) {
      print(msg)
    },
    suiteStart: function() {
      writeIndent()
      print(white + names.last() + reset)
    },
    caseStart: function() {
      writeIndent()
      write(cyan + spinnerStopped + reset)
      write(' ')
      write(gray + names.last() + reset)
      write('\r')
      startSpinner()
    },
    caseDone: function(status) {
      stopSpinner()
      testCount++
      if (!status) {
        failCount++
        wereErrors = false
      }
      
      writeIndent()
      write(status ? green : red)
      write(status ? passPrefix : failCount+')')
      write(status ? gray : red)
      write(' ')
      write(names.last())
      print(reset)
    },
    summarize: function() {
      write('\n\n  ')
      if (failCount == 0) {
        var time = '' //TODO: Implement this
        print(green + passPrefix + ' ' + testCount + ' tests completed (' + time + ')')
      } else {
        print(red + failPrefix + ' ' + failCount + ' of ' + testCount + ' tests failed' + gray + ':')
      }
      print(reset)
      
      for (var i = 0; i < errors.length; i++) {
        write('  ' + white + (i+1) + ')' + reset)
        for (var j = 0; j < errors[i].length; j++) {
          if (j != 0) {
            write('    ')
          }
          err = errors[i][j]
          print(red + ' ' + err.type + ' failed: ' + err.msg + ' '+gray+'(' + err.file + '.swift:' + err.line + ')' + reset)
        }
      }
      
      cleanup()
    },
  },
}

var reporter = reporters.spec


function parseLine(line) {
  var re = null
  if (startRegex.test(line)) {
    stopSpinner()
    hasStarted = true
    print(green + passPrefix + gray + ' Initializing' + reset)
    print('')
    names.push('All tests')
    reporter.suiteStart()
  } else if (endRegex.test(line)) {
    names.pop()
  } else if (re = suiteStartRegex.exec(line)) {
    names.push(re[1])
    reporter.suiteStart()
  } else if (re = suiteEndRegex.exec(line)) {
    names.pop()
  } else if (re = caseStartRegex.exec(line)) {
    names.push(re[1])
    reporter.caseStart()
  } else if (re = caseEndRegex.exec(line)) {
    reporter.caseDone(re[1] === 'passed')
    names.pop()
  } else if (re = errorRegex.exec(line)) {
    //TODO: Parse msg?
    var err = {file: re[1], line: re[2], type: re[3], msg: re[4]}
    if (wereErrors) {
      errors[failCount].push(err)
    } else {
      errors.push([err])
    }
    wereErrors = true
  } else {
    if (!hasStarted) {
      // Log build stuff
      reporter.logPreInit(line)
    }
  }
}

function advanceSpinner() {
  writeIndent()
  write(cyan + spinner[spinnerPlace])
  if (!hasStarted) {
    write(white + ' Initializing')
  }
  write(reset + '\r')
  if (++spinnerPlace == spinner.length) {
    spinnerPlace = 0
  }
}

function startSpinner() {
  spinnerID = setInterval(advanceSpinner, 100)
}

function stopSpinner() {
  clearInterval(spinnerID)
}

function cleanup(code) { print(reset + showCursor); stopSpinner() }

process.on('exit', cleanup)
process.on('SIGINT', cleanup)
process.on('uncaughtException', cleanup)

reporter.prep()

// Start test
var spawn = require('child_process').spawn,
    st    = spawn('swift', ['test']);
st.stdout.on('data', handleData);
st.stderr.on('data', handleData);
st.on('exit', reporter.summarize);
