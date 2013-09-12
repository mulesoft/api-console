
// XXX This is necessary to run the tests in PhantomJS
// See: https://github.com/restful-api-modeling-lang/console/issues/19
if(!Function.prototype.bind) {
  Function.prototype.bind = function(scope){
    var self = this;
    return function(){
      return self.apply(scope, arguments);
    };
  }
}
