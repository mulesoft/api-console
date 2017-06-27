# Guide for Contributors

The API Console is open and we encourage the community to contribute in the project. However, it is very important to follow couple of simple rules when you create an issue report or send a pull request.

## Reporting an issue

**If this is feature request**, please provide a clear description of the feature. I've created a [document][87714bdc] that may help you fill up a feature request. But basically you should answer this questions:

- Who will benefit from this feature? _("Someone who is trying to...")_
- What's the use cases (when the feature will be used)? _("When API specification contains...")_
- What the user gain by having this feature? _("I should be able to see...")_

An overview of the feature would be nice as well.

**When you're filling a bug report**, please be as much specific as you can, and add a clear description of the bug, console logs if available and your expectations. You're welcome to use following template:

```markdown
HTTP method documentation is missing property in the properties documentation table. The property is defined inline after the body inherits from a type.

## Expected outcome

There should be a documentation for all inherited properties from the type and property defined inline in body declaration.

## Actual outcome

Only inherited from the type properties are displayed in the documentation table.

## Steps to reproduce

1. Load this test API https://domain.com/api.raml
2. Go to Resource > POST
3. Go to request body > properties documentation.

## Was this working before?

- [ ] Yes, it was working before
- [ ] No, it was already broken
- [x] I don't know / not sure

## Affected browsers

- [x] All or I don't know
- [ ] Chrome
- [ ] Firefox
- [ ] Internet Explorer <\3
- [ ] Edge
- [ ] Safari
- [ ] Other (please, specify)
```

## Submitting Pull Requests

API Console uses ARC (Advanced REST Client) elements so **while developing**, be sure that you follow the [design guidelines] for ARC.

**Before creating a pull request**, fill up `changelog.md` file with changes made by you. It is the best way of keeping track of change reasons. Try be very specific and put there only essential information about the changes.

Then a good idea is to test your code. Use [Web Component Tester], a great tool created by the Polymer team, to test your code. Each element contains it's own test. Check how it works and design the test case for your changes.

Please ensure that an issue exists for the corresponding change in the pull request that you intend to make. **If an issue does not exist, please create one per the guidelines above**. The goal is to discuss the design and necessity of the proposed change with API Console / ARC authors and community before diving into a pull request.

When submitting pull requests, please provide:

1. **A reference to the corresponding issue** or issues that will be closed by the pull request. Please refer to these issues using the following syntax:

 ```markdown
 (For a single issue)
 Fixes #20

 (For multiple issues)
 Fixes #32, #40
 ```

 Github automatically close the issues after merging it to the master. So please, keep the format.

 2. **A succinct description of the design** used to fix any related issues. For example:

 ```markdown
 This fixes #20 by removing styles that leaked which would cause the page to turn pink whenever `some-element` is clicked.
 ```

 3. **At least one test for each bug fixed or feature added** as part of the pull request. Pull requests that fix bugs or add features without accompanying tests will not be considered.

If a proposed change contains multiple commits, please [squash commits](http://blog.steveklabnik.com/posts/2012-11-08-how-to-squash-commits-in-a-github-pull-request) to as few as is necessary to succinctly express the change.


  [87714bdc]: https://docs.google.com/document/d/10OPWl9Hagk6Oz--VUztQBTOpm3QP2Vv__PrH3zZ7wFQ/edit?usp=sharing "Feature request file"
  [Design guidelines]: https://github.com/jarrodek/ChromeRestClient/wiki/design
  [Web Component Tester]: https://github.com/Polymer/web-component-tester
