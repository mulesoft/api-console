describe("RAML.Controllers.toggle", function() {
  var storeSpy;

  beforeEach(function() {
    storeSpy = jasmine.createSpyObj('store', ['get', 'set']);
    this.toggleModel = {};
    this.controller = new RAML.Controllers.toggle({ keyBase: 'key-base', toggleModel: this.toggleModel }, storeSpy);
  });

  describe("upon initialization", function() {
    it("sets toggle items to an empty array", function() {
      expect(this.controller.toggleItems).toEqual([]);
    });
  });

  describe("adding a toggle item to the controller", function() {
    var toggleItem1, toggleItem2;

    beforeEach(function() {
      toggleItem1 = { heading: 'toggle item1' };
      toggleItem2 = { heading: 'toggle item2' };
      spyOn(this.controller, 'select').andCallThrough();
    });

    it("adds the toggle item to the array of toggle items", function() {
      this.controller.addToggleItem(toggleItem1);
      expect(this.controller.toggleItems).toEqual([toggleItem1]);
    });

    describe("with an empty toggle", function() {
      it('selects the added toggle item', function() {
        this.controller.addToggleItem(toggleItem1);
        expect(this.controller.select).toHaveBeenCalledWith(toggleItem1, true);
      });
    });

    describe("with a non-empty toggle", function() {
      beforeEach(function() {
        this.controller.addToggleItem(toggleItem1);
      });

      it('does not select the added toggle item by default', function() {
        this.controller.addToggleItem(toggleItem2);
        expect(this.controller.select).not.toHaveBeenCalledWith(toggleItem2, true);
      });

      describe('when the new toggle item is active in the store', function() {
        beforeEach(function() {
          storeSpy.get.andReturn('toggle item2');
        });

        it('selects the added toggle item', function() {
          this.controller.addToggleItem(toggleItem2);
          expect(this.controller.select).toHaveBeenCalledWith(toggleItem2, true);
        });
      });
    });
  });

  describe("selecting a toggle item", function() {
    var toggleItem1, toggleItem2;

    beforeEach(function() {
      toggleItem1 = {
        active: true,
        heading: 'toggleItem1'
      }
      toggleItem2 = {
        active: false,
        heading: 'toggleItem2'
      }
      this.controller.toggleItems = [ toggleItem1, toggleItem2 ];
    });

    describe("by default", function() {
      beforeEach(function() {
        this.controller.select(toggleItem2);
      });

      it("marks all other toggle items as inactive", function() {
        expect(toggleItem1.active).toBeFalsy();
      });

      it("marks the selected toggle item as active", function() {
        expect(toggleItem2.active).toBeTruthy();
      });

      it("updates the store", function() {
        expect(storeSpy.set).toHaveBeenCalledWith('key-base:toggle', 'toggleItem2');
      });

      it("it updates the toggle model", function() {
        expect(this.toggleModel.selected).toEqual(toggleItem2.heading);
      });
    });

    describe('when dontPersist is passed', function() {
      it('does not update the store', function() {
        this.controller.select(toggleItem2, true);
        expect(storeSpy.set).not.toHaveBeenCalled();
      });
    });
  });
});
