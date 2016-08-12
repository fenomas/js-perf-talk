
## talk: 30min


### Outline

 * 0:00 - Intro: Benchmarking parable 
   * Demo: LICM
   * Demo: DCE
   * Takeaway: "obvious" stuff doesn't work
 * 0:05 - Basics
   * old JS interpreter model
   * v8 model - compile / profile / opt / deopt
   * base compiler vs optimizing compiler
   * optimistic optimizations
   * opt deopt cycle
 * 0:10 - bailouts
   * Detecting bailouts
   * Bailout reasons 
   * Takeaway: avoiding bailouts is lowest-hanging fruit
 * 0:14 - Optimizations
   * Basics: LICM, DCE, in-lining
   * demos?
 * 0:20 - Type inference
   * SMI / floats / boxed numbers
   * Optimizer wraps implementations in assertions
   * Importance of monomorphism
 * 0:23 - Object types
   * ICs basics 
   * IC is constructed, per property assignment
   * Example: Point3D class?
   * Special case: arrays
 * 0:29 - Wrap up
   * Write small, idiomatic functions
   * Make types static and easy to guess
   * Wrap typed implementations inside flexible accessors
   * Ignore these rules when code isn't hot
   * Ignore voodoo!



