# XCTasteful
A tasteful take on XCTest

Have you ever had to run XCTests from the command line? Maybe you're running CI tests, maybe you're developing in Swift on Linux and thus don't have XCode, or maybe you were just curious as to what the output was. Regardless of the reason behind it, if you've seen the XCTest output, you know how hard to understand it can be.

Don't get me wrong, it's a very useful format jam-packed with information; but there is such a thing as too much information.

XCTasteful aims to change that. It draws on the popular 'spec' formatting to make your XCTests clean and simple to understand at a glance.

But why describe it when I can show it?

### Passing tests:
![XCTest Passing Tests](http://i.imgur.com/wfvD7U9.png)
![XCTasteful Passing Tests](http://i.imgur.com/opIGTUZ.png)

### Failing tests:
![XCTest Failing Tests](http://i.imgur.com/BzxEbq6.png)
![XCTasteful Failing Tests](http://i.imgur.com/IwDOvwr.png)


**Disclaimer 1**: XCTasteful is still decently early in development, so any feedback/ideas would be more than welcome.
**Disclaimer 2**: XCTasteful currently only works with swift, as it directly calls `swift test`. If enough people want Obj-C support I can try to figure that out.

## To install:
1. [Download XCTasteful.js](https://raw.githubusercontent.com/thislooksfun/XCTasteful/master/xctasteful.js)
2. `cd` to your swift project (only works with swift for now)
3. Run the file (you may need to run `chmod +x` on it first)
4. Enjoy your legible XCTest output!


## Roadmap for XCTasteful:
- [ ] Create `swift-test` shim for automated support
- [ ] Add more reporter types:
      - [x] Spec
      - [x] Dot matrix
      - [ ] [TAP](http://testanything.org/)
      - [ ] List
      - [ ] JSON
      - [ ] JSON Stream?
      - [ ] Min?
- [ ] Debugging!
- [ ] Obj-C support?
