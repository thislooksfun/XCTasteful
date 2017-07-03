#!/usr/bin/env node

// See http://mochajs.org/#spec for design

// Parse input options:
// var a1 = process.args[1]
// console.log(a1)
var a1 = process.argv[2]
var a2 = process.argv[3]
var useReporter = 'spec'
var listReporters = false
var showHelp = false
if (a1 === '--xct-help') {
  showHelp = true
} else if (a1 === '--xct-version') {
  print('XCTasteful version 0.1.0')
  process.exit(0)
} else if (a1 === '--xct-reporter') {
  useReporter = a2
} else if (a1 === '--xct-list-reporters') {
  listReporters = true
} else if (a1 !== undefined) {
  // Invalid argument
  showHelp = true
}

if (showHelp) {
  print('XCTasteful help')
  print('  --xct-help                   view this help')
  print('  --xct-version                display the XCTasteful version')
  print('  --xct-reporter [reporter]    select a reporter to use')
  print('  --xct-list-reporters         list all available reporters')
  process.exit(0)
}


Array.prototype.last = function() {
  return this[this.length-1];
}

var spinnerStopped = '⣿'
var spinnerPlace = 0
var spinner = '⣷⣯⣟⡿⢿⣻⣽⣾'.split('')
var spinnerID = null

// regex
var startRegex      = /^Test Suite 'All tests' started at (\d{4}-\d\d-\d\d \d\d:\d\d:\d\d.\d\d\d)$/
var endRegex        = /^Test Suite 'All tests' (?:passed|failed) at (\d{4}-\d\d-\d\d \d\d:\d\d:\d\d.\d\d\d)\.$/
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
var green  = esc + '32m'   // dark green
var red    = esc + '31m'   // dark red
var yellow = esc + '33m'   // dark yellow
var gray   = esc + '30;1m' // bright black (gray)
var white  = esc + '37;1m' // bright white
var cyan   = esc + '36m'   // dark cyan

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
var startTime = ''
var endTime = ''
// var totalDuration = 0

var slowWarn = 200
var slowErr  = 1000

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

var reporters = {
  spec: {
    prep: function() {
      print(hideCursor)
      writeIndent()
      write(cyan + spinnerStopped + white + ' Initializing' + reset + '\r')
      startSpinner()
    },
    logPreInit: function(msg) {
      print('> ' + msg)
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
    caseDone: function(passed, duration) {
      stopSpinner()
      writeIndent()
      write(passed ? green : red)
      write(passed ? passPrefix : failCount+')')
      write(passed ? gray : red)
      write(' ')
      write(names.last())
      writeDuration(duration)
      print(reset)
    },
    summarize: function() {
      write('\n\n  ')
      if (failCount == 0) {
        var time = endTime - startTime
        print(green + passPrefix + ' ' + testCount + ' tests completed ' + gray + '(' + time + 'ms)')
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
    },
    indentLevel: function() { return names.length }
  },
  
  dots: {
    prep: function() {
      print(hideCursor)
      write(cyan + spinnerStopped + white + ' Initializing' + reset + '\r')
      startSpinner()
    },
    logPreInit: function(msg) {},
    suiteStart: function() {},
    caseStart: function() {},
    caseDone: function(passed, duration) {
      write(passed ? gray : red)
      write('.')
      write(reset)
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
    },
    indentLevel: function() { return 1 }
  },
  
  tap: {
    prep: function() {
      print(hideCursor)
    },
    logPreInit: function(msg) {},
    suiteStart: function() {},
    caseStart: function() {},
    caseDone: function(passed, duration) {
      if (!passed) {
        write('not ')
      }
      write('ok ' + testCount)
      var secondLast = names[names.length-2]
      print(' - ' + secondLast + '.' + names.last())
    },
    summarize: function() {
      print('1..'+testCount)
    },
    indentLevel: function() { return 1 }
  },
  
  list: {
    prep: function() { reporters.spec.prep() },
    logPreInit: function(msg) { reporters.spec.logPreInit(msg) },
    suiteStart: function() {},
    caseStart: function() {
      write('  ')
      write(cyan + spinnerStopped + reset)
      write(' ')
      write(gray + names.slice(1).join('.') + reset)
      write('\r')
      startSpinner()
    },
    caseDone: function(passed, duration) {
      stopSpinner()
      write('  ')
      write(passed ? green : red)
      write(passed ? passPrefix : failCount+')')
      write(passed ? gray : red)
      write(' ')
      write(names.slice(1).join('.'))
      writeDuration(duration)
      print(reset)
    },
    summarize: function() { reporters.spec.summarize() },
    indentLevel: function() { return 1 }
  },
  
  json: {
    //TODO
    unimplemented: true,
    prep: function() {
      print(red + '\nJSON reporter not yet implemented' + reset)
      process.exit(1)
    },
    logPreInit: function(msg) {},
    suiteStart: function() {},
    caseStart: function() {},
    caseDone: function(passed, duration) {},
    summarize: function() {},
    indentLevel: function() { return 1 }
  },
}

if (listReporters) {
  print(white)
  print(' XCTasteful reporters:')
  for (var n in reporters) {
    write(' ' + white + ' - ')
    
    if (reporters[n].unimplemented) {
      write(reset + red + n + gray + ' (unimplemented)')
    } else {
      write(n)
    }
    
    if (n == useReporter) {
      write(gray + ' (default)')
    }
    print()
  }
  print(reset)
  process.exit(0)
}

if (useReporter === undefined) {
  print(red)
  print('  You must specify a reporter to use.')
  print('  Use --xct-help for more info')
  print(reset)
  process.exit(1)
}
reporter = reporters[useReporter]
if (reporter === undefined) {
  print()
  print(red + '\'' + gray + useReporter + red + '\' is not a valid reporter.')
  print('Use --xct-list-reporters fot a list of supported reporters')
  print(reset)
  process.exit(1)
}


function writeIndent() {
  for (var i = 1; i <= reporter.indentLevel(); i++) {
    write('  ')
  }
}

function writeDuration(duration) {
  if (duration > slowErr) {
    write(red + ' ('+duration+'ms)' + reset)
  } else if (duration > slowWarn) {
    write(yellow + ' ('+duration+'ms)' + reset)
  }
}

function parseLine(line) {
  var re = null
  if (re = startRegex.exec(line)) {
    startTime = new Date(re[1])
    if (spinnerID !== null) {
      stopSpinner()
      writeIndent()
      print(green + passPrefix + gray + ' Initializing' + reset)
    }
    hasStarted = true
    print('')
    names.push('All tests')
    reporter.suiteStart()
  } else if (re = endRegex.exec(line)) {
    endTime = new Date(re[1])
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
    var passed = (re[1] === 'passed')
    var duration = parseInt(re[2].replace('.', ''))
    testCount++
    if (!passed) {
      failCount++
      wereErrors = false
    }
    reporter.caseDone(passed, duration)
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

// This *does not* need to be called manually
function cleanup() {
  print(reset + showCursor);
  stopSpinner();
}

process.on('exit', cleanup)
process.on('SIGINT', cleanup)

reporter.prep()

// Start test
var spawn = require('child_process').spawn,
    st    = spawn('swift', ['test']);
st.stdout.on('data', handleData);
st.stderr.on('data', handleData);
st.on('exit', function(code) {
  reporter.summarize()
  if ((code === 0 && failCount !== 0) || (code !== 0 && failCount === 0)) {
    write(red)
    print('\n\nError code mismatch. `swift test` exited with code ' + code + ', but `failCount` is ' + failCount)
    print('If you see this error, please create a new issue at https://github.com/thislooksfun/XCTasteful\n\n')
    write(reset)
    process.exit(1)
  }
  process.exit(failCount)
});
