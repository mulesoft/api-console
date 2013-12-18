describe("RAML.Directives.repeatable", function() {
  var scope, el;

  beforeEach(module('ramlConsoleApp'));

  describe("repeatable", function() {
    var html =
      '<div repeatable="canBeRepeated">' +
        '<span>some content</span>' +
        '<repeatable-add></repeatable-add>' +
        '<repeatable-remove></repeatable-remove>' +
      '</div>'

    describe("when true", function() {
      beforeEach(function() {
        scope = createScope(function(scope) {
          scope.canBeRepeated = true;
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
          el.find('repeatable-add i').click();
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
          el.find('repeatable-add i').eq(0).click();
          el.find('repeatable-add i').eq(0).click();

          el.find('repeatable-remove i').eq(1).click();
        });

        it("removes the repeated item", function() {
          expect(el.find('span').length).toEqual(2);
        });

        it("hides the remove button when only one item is left", function() {
          el.find('repeatable-remove i').eq(0).click();
          expect(el.find('repeatable-remove i')).not.toBeVisible();
        });
      });
    });

    describe("when false", function() {
      beforeEach(function() {
        scope = createScope(function(scope) {
          scope.canBeRepeated = false;
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

    beforeEach(function() {
      scope = createScope(function(scope) {
        scope.someModel = [];
      });
      el = compileTemplate(html, scope);
      setFixtures(el);

      el.find('repeatable-add i').eq(0).click();
      el.find('repeatable-add i').eq(0).click();

      el.find('input').eq(0).fillIn('firstValue');
      el.find('input').eq(1).fillIn('secondValue');
      el.find('input').eq(2).fillIn('thirdValue');
    });

    it('updates the model', function() {
      expect(scope.someModel).toEqual(['firstValue', 'secondValue', 'thirdValue']);
    });

    it('removes the correct item', function() {
      el.find('repeatable-remove i').eq(1).click();
      expect(scope.someModel).toEqual(['firstValue', 'thirdValue']);
      expect(el.find('input').eq(0).val()).toEqual('firstValue');
      expect(el.find('input').eq(1).val()).toEqual('thirdValue');
    });
  });
});
