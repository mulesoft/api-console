describe("RAML.Controllers.tabset", function() {

  beforeEach(function() {
    this.controller = new RAML.Controllers.tabset({});
  });

  describe("upon initialization", function() {
    it("sets tabs to an empty array", function() {
      expect(this.controller.tabs).toEqual([]);
    });
  });

  describe("adding a tab to the controller", function() {
    var tab1, tab2;

    beforeEach(function() {
      tab1 = jasmine.createSpy();
      tab2 = jasmine.createSpy();
      spyOn(this.controller, 'select');
    });

    it("adds the tab to the array of tabs", function() {
      this.controller.addTab(tab1);
      expect(this.controller.tabs).toEqual([tab1]);
    });

    describe("selecting", function() {
      describe("given no other tabs", function() {
        it('selects the added tab', function() {
          this.controller.addTab(tab1);
          expect(this.controller.select).toHaveBeenCalledWith(tab1);
        });
      });

      describe("given other tabs", function() {
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
          expect(this.controller.select).toHaveBeenCalledWith(tab2);
        });

        it('selects the added tab if it is marked active', function() {
          tab2.active = true;
          this.controller.addTab(tab2);
          expect(this.controller.select).toHaveBeenCalledWith(tab2);
        });
      });
    });
  });

  describe("selecting a tab", function() {
    var tab1, tab2;

    beforeEach(function() {
      tab1 = jasmine.createSpy();
      tab1.active = true;
      tab2 = jasmine.createSpy();
      tab2.active = false;
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

    it("ignores a disabled tab", function() {
      tab2.disabled = true;
      this.controller.select(tab2);
      expect(tab2.active).toBeFalsy();
    });
  });
});
