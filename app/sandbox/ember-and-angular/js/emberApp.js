App = Ember.Application.create();

App.Router.map(function() {
  // put your routes here
});

App.IndexRoute = Ember.Route.extend({
  model: function() {
    return ['red', 'yellow', 'blue'];
  }
});

App.IndexView = Ember.View.extend({
    didInsertElement: function () {
        angular.bootstrap(document, ['apiconsolemod']);
    }
})
