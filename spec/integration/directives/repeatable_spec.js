describe("RAML.Directives.repeatable", function() {
  var scope, el;

  beforeEach(module('ramlConsoleApp'));

  describe("repeatable", function() {
    var html =
      '<div repeatable="canBeRepeated" repeatable-model="repeatableModel">' +
        '<span>some content</span>' +
        '<repeatable-add></repeatable-add>' +
        '<repeatable-remove></repeatable-remove>' +
      '</div>'

    describe("when true", function() {
      beforeEach(function() {
        scope = createScope(function(scope) {
          scope.canBeRepeated = true;
          scope.repeatableModel = [undefined];
        });
        el = compileTemplate(html, scope);
        setFixtures(el);
      });

      describe("initially", function() {
        it("shows the add button", function() {
          expect(el.find('repeatable-add i')).toBeVisible();
        });

        it("shows the content once", function() {
          expect(el.find('span')).toBeVisible();
          expect(el.find('span').length).toEqual(1);
        });

        it("does not show the remove button on the first item", function() {
          expect(el.find('repeatable-remove i')).not.toBeVisible();
        });
      });

      describe("when add is clicked", function() {
        beforeEach(function() {
          click(el.find('repeatable-add i'))
        });

        it("repeats", function() {
          expect(el.find('span').length).toEqual(2);
        });

        it("shows the add button only on the last item", function() {
          expect(el.find('> div').eq(0).find('repeatable-add i')).not.toBeVisible();
          expect(el.find('> div').eq(1).find('repeatable-add i')).toBeVisible();
        });

        it("shows the remove button on all items", function() {
          expect(el.find('repeatable-remove').length).toEqual(2);
          expect(el.find('repeatable-remove').eq(0)).toBeVisible();
          expect(el.find('repeatable-remove').eq(1)).toBeVisible();
        });
      });

      describe("when remove is clicked", function() {
        beforeEach(function() {
          click(el.find('repeatable-add i').eq(0))
          click(el.find('repeatable-add i').eq(0))

          click(el.find('repeatable-remove i').eq(1))
        });

        it("removes the repeated item", function() {
          expect(el.find('span').length).toEqual(2);
        });

        it("hides the remove button when only one item is left", function() {
          click(el.find('repeatable-remove i').eq(0))
          expect(el.find('repeatable-remove i')).not.toBeVisible();
        });
      });
    });

    describe("when false", function() {
      beforeEach(function() {
        scope = createScope(function(scope) {
          scope.canBeRepeated = false;
          scope.repeatableModel = [undefined];
        });
        el = compileTemplate(html, scope);
        setFixtures(el);
      });

      it("shows the content once", function() {
        expect(el.find('span')).toBeVisible();
        expect(el.find('span').length).toEqual(1);
      });

      it("does not show the add button", function() {
        expect(el.find('repeatable-add i')).not.toBeVisible();
      });

      it("does not show the remove button", function() {
        expect(el.find('repeatable-remove i')).not.toBeVisible();
      });
    });
  });

  describe("repeatableModel", function() {
    var html =
      '<div repeatable repeatable-model="someModel">' +
        '<input ng-model="repeatableModel[$index]"></input>' +
        '<repeatable-add></repeatable-add>' +
        '<repeatable-remove></repeatable-remove>' +
      '</div>'

    describe('by default', function() {
      beforeEach(function() {
        scope = createScope(function(scope) {
          scope.someModel = [undefined];
        });
        el = compileTemplate(html, scope);
        setFixtures(el);
      });

      describe('adding a few new values', function() {
        beforeEach(function() {
          click(el.find('repeatable-add i').eq(0))

          el.find('input').eq(0).fillIn('firstValue');
          el.find('input').eq(1).fillIn('secondValue');
        });

        it('updates the model', function() {
          expect(scope.someModel).toEqual(['firstValue', 'secondValue']);
        });
      });

      describe('removing a few new values', function() {
        beforeEach(function() {
          click(el.find('repeatable-add i').eq(0))
          click(el.find('repeatable-add i').eq(0))

          el.find('input').eq(0).fillIn('firstValue');
          el.find('input').eq(1).fillIn('secondValue');
          el.find('input').eq(2).fillIn('thirdValue');

          click(el.find('repeatable-remove i').eq(1))
        });

        it('removes the correct item', function() {
          expect(scope.someModel).toEqual(['firstValue', 'thirdValue']);
          expect(el.find('input').eq(0).val()).toEqual('firstValue');
          expect(el.find('input').eq(1).val()).toEqual('thirdValue');
        });
      });
    });

    describe('with data in the model', function() {
      beforeEach(function() {
        scope = createScope(function(scope) {
          scope.someModel = ['cats', 'dogs', 'pizza'];
        });
        el = compileTemplate(html, scope);
        setFixtures(el);
      });

      it('sets up the repeatable with the existing values', function() {
        expect(el.find('input').eq(0).val()).toEqual('cats');
        expect(el.find('input').eq(1).val()).toEqual('dogs');
        expect(el.find('input').eq(2).val()).toEqual('pizza');
      });
    });
  });
});
