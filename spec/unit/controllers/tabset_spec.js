describe("RAML.Controllers.tabset", function() {
  var storeSpy;

  beforeEach(function() {
    storeSpy = jasmine.createSpyObj('store', ['get', 'set']);
    this.controller = new RAML.Controllers.tabset({ keyBase: 'key-base' }, storeSpy);
  });

  describe("upon initialization", function() {
    it("sets tabs to an empty array", function() {
      expect(this.controller.tabs).toEqual([]);
    });
  });

  describe("adding a tab to the controller", function() {
    var tab1, tab2;

    beforeEach(function() {
      tab1 = { heading: 'tab1' };
      tab2 = { heading: 'tab2' };
      spyOn(this.controller, 'select');
    });

    it("adds the tab to the array of tabs", function() {
      this.controller.addTab(tab1);
      expect(this.controller.tabs).toEqual([tab1]);
    });

    describe("with an empty tabset", function() {
      it('selects the added tab', function() {
        this.controller.addTab(tab1);
        expect(this.controller.select).toHaveBeenCalledWith(tab1, undefined);
      });
    });

    describe("with a non-empty tabset", function() {
      beforeEach(function() {
        this.controller.tabs = [ tab1 ];
      });

      it('does not select the added tab by default', function() {
        this.controller.addTab(tab2);
        expect(this.controller.select).not.toHaveBeenCalled();
      });

      it('selects the added tab if no existing tabs are enabled', function() {
        tab1.disabled = true;
        this.controller.addTab(tab2);
        expect(this.controller.select).toHaveBeenCalledWith(tab2, undefined);
      });

      describe('when the new tab is active in the store', function() {
        beforeEach(function() {
          storeSpy.get.andReturn('tab2');
        });

        it('selects the added tab', function() {
          this.controller.addTab(tab2);
          expect(this.controller.select).toHaveBeenCalledWith(tab2, tab2.heading);
        });
      });
    });
  });

  describe("selecting a tab", function() {
    var tab1, tab2;

    beforeEach(function() {
      tab1 = {
        active: true,
        heading: 'tab1'
      }
      tab2 = {
        active: false,
        heading: 'tab2'
      }
      this.controller.tabs = [ tab1, tab2 ];
    });

    it("marks all other tabs as inactive", function() {
      this.controller.select(tab2);
      expect(tab1.active).toBeFalsy();
    });

    it("marks the selected tab as active", function() {
      this.controller.select(tab2);
      expect(tab2.active).toBeTruthy();
    });

    it("updates the store", function() {
      this.controller.select(tab2);
      expect(storeSpy.set).toHaveBeenCalledWith('key-base:tabset', 'tab2');
    });

    it("ignores a disabled tab", function() {
      tab2.disabled = true;
      this.controller.select(tab2);
      expect(tab2.active).toBeFalsy();
    });

    describe('when dontPersist is passed', function() {
      it('does not update the store', function() {
        this.controller.select(tab2, true);
        expect(storeSpy.set).not.toHaveBeenCalled();
      });
    });
  });
});
