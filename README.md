# XCTasteful
A tasteful take on XCTest

I don't know about anyone else, but I think the default XCTest output is ugly and difficult to follow. 3rd party testing frameworks—such as Quick—however, are difficult to get working, especially when running tests on Linux. So what's the solution? Write a parser of course!

**Disclaimer**: XCTasteful is still decently early in development, so any feedback/ideas would be more than welcome.


## To install:
1. (Download XCTasteful.js)[https://raw.githubusercontent.com/thislooksfun/XCTasteful/master/xctasteful.js]
2. `cd` to your swift project (only works with `swift test` for now)
3. Run the file (you may need to `chmod` it first)
4. Enjoy your legible `swift test` output!


## Roadmap for XCTasteful:
[ ] Create `swift-test` shim for automated support
[ ] Add more reporter types
[ ] Debugging!
