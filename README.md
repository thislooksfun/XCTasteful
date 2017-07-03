# XCTasteful
A tasteful take on XCTest

Have you ever had to run XCTests from the command line? Maybe you're running CI tests, maybe you're developing in Swift on Linux and thus don't have XCode, or maybe you were just curious as to what the output was. Regardless of the reason behind it, if you've seen the XCTest output, you know how hard to understand it can be.

Don't get me wrong, it's a very useful format jam-packed with information; but there is such a thing as too much information.

XCTasteful aims to change that. It draws on the popular 'spec' formatting to make your XCTests clean and simple to understand at a glance.

But why describe what I can show?

### Passing tests:
![XCTest Passing Tests](http://i.imgur.com/9Zyf25I.png)

![XCTasteful Passing Tests](http://i.imgur.com/gAu12HU.png)


### Failing tests:
![XCTest Failing Tests](http://i.imgur.com/oApbbJH.png)

![XCTasteful Failing Tests](http://i.imgur.com/amsSIrN.png)


**Disclaimer 1**: XCTasteful is still decently early in development, so any feedback/ideas would be more than welcome.
**Disclaimer 2**: XCTasteful currently only works with swift, as it directly calls `swift test`. If enough people want Obj-C support I can try to figure that out.

## Installation:
1. Download and run the [install script](https://raw.githubusercontent.com/thislooksfun/XCTasteful/master/installer.sh)
2. `cd` to your swift project (Obj-C is currently unsupported)
3. Run `XCTasteful`
4. Enjoy your legible XCTest output!


## Roadmap for XCTasteful:
- [ ] Add more reporter types:
    - [x] Spec
    - [x] Dot matrix
    - [x] [TAP](http://testanything.org/)
    - [x] List
    - [ ] JSON
    - [ ] JSON Stream?
    - [ ] Min?
- [ ] Debugging!
- [ ] Obj-C support?
