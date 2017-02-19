(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['dashboard'] = template({"1":function(container,depth0,helpers,partials,data) {
    var alias1=container.lambda, alias2=container.escapeExpression;

  return "<div class=\"row\">\n  <a onclick=\"route('details', "
    + alias2(alias1((depth0 != null ? depth0.id : depth0), depth0))
    + ")\">\n    <div class=\"col-offset-1 col-xs-3 col-md-2 text-right\">\n      <img src=\""
    + alias2(alias1((depth0 != null ? depth0.picture : depth0), depth0))
    + "\" width=\"64\" height=\"64\">\n      <!--<div class=\"circle-avatar\" style=\"'background-image:url('+"
    + alias2(alias1((depth0 != null ? depth0.picture : depth0), depth0))
    + "+')'\"></div>-->\n    </div>\n    <div class=\"col-xs-7 col-md-8 alignme\">\n      <span class=\"bold\">"
    + alias2(alias1((depth0 != null ? depth0.name : depth0), depth0))
    + "</span><br>\n      <span class=\"small text-light\">"
    + alias2(alias1((depth0 != null ? depth0.iss : depth0), depth0))
    + "</span>\n    </div>\n  </a>\n  <br><br>\n  <br><br>\n</div>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<div class=\"row\">\n  <div class=\"col-xs-offset-1 col-xs-10\">\n    <p>Configure your identities.</p>\n  </div>\n</div>\n<hr/>\n\n"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.identities : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "<hr/>\n\n<div class=\"row\">\n  <a class=\"col-xs-offset-1 col-xs-10\" onclick=\"route('search', 0)\">\n    <!--<img class=\"img-responsive\" src=\"assets/plusIcon.jpg\"/>-->\n    <span>Add an identity</span>\n  </a>\n  <a class=\"col-xs-offset-1 col-xs-10\" onclick=\"route('select', 0)\">\n    <!--<img class=\"img-responsive\" src=\"assets/plusIcon.jpg\"/>-->\n    <span>Select</span>\n  </a>\n</div>\n";
},"useData":true});
templates['details'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression;

  return "<div class=\"container\" *ngIf=\"identity\">\n  <div class=\"col-sm-10 col-sm-offset-1\">\n    <h2>\n      <img [src]=\"identity.picture\" width=\"64\" height=\"64\">\n      "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.identity : depth0)) != null ? stack1.name : stack1), depth0))
    + "</h2>\n    <br>\n    <div class=\"row\">\n      <label class=\"col\">name: </label>\n      <input class=\"col-2\"[(ngModel)]=\"identity.name\" placeholder=\"name\" />\n    </div>\n    <div class=\"row\">\n      <label class=\"col\">sub: </label>\n      <span class=\"col-2\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.identity : depth0)) != null ? stack1.sub : stack1), depth0))
    + "</span>\n    </div>\n    <div class=\"row\">\n      <label class=\"col\">picture: </label>\n      <span class=\"col-2\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.identity : depth0)) != null ? stack1.picture : stack1), depth0))
    + "</span>\n    </div>\n    <div class=\"row\">\n      <label class=\"col\">iss: </label>\n      <span class=\"col-2\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.identity : depth0)) != null ? stack1.iss : stack1), depth0))
    + "</span>\n    </div>\n    <div class=\"row\">\n      <label class=\"col\">proxy: </label>\n      <span class=\"col-2\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.identity : depth0)) != null ? stack1.proxy : stack1), depth0))
    + "</span>\n    </div>\n  </div>\n</div>\n<hr>\n\n<div class=\"row\">\n  <button (click)=\"goBack()\">Back</button>\n</div>\n";
},"useData":true});
templates['search'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression;

  return "<div>\n  <p>Search for a compatible Identity Provider and register a new Identity.</p>\n</div>\n<hr>\n\n\n<form name=\"search\" onsubmit=\"return searchIdpProxy(this);\">\n  <div class=\"form-group\">\n    <label>OpenID Provider</label>\n    <input type=\"text\" class=\"form-control\" name=\"idp\">\n  </div>\n  <button type=\"submit\" class=\"btn btn-warning btn-lg\">Search</button>\n</form>\n\n<div *ngIf=\"oidcConfiguration\">\n  <span>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.oidcConfiguration : depth0)) != null ? stack1.iss : stack1), depth0))
    + "</span>\n  <span>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.oidcConfiguration : depth0)) != null ? stack1.sub : stack1), depth0))
    + "</span>\n  <span>"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.oidcConfiguration : depth0)) != null ? stack1.proxy : stack1)) != null ? stack1.type : stack1), depth0))
    + "</span>\n</div>\n<hr>\n\n<div class=\"row\">\n  <button (click)=\"goBack()\">Back</button>\n</div>\n";
},"useData":true});
templates['select'] = template({"1":function(container,depth0,helpers,partials,data) {
    var alias1=container.lambda, alias2=container.escapeExpression;

  return "<div class=\"row\">\n  <a onclick=\"route('selected', "
    + alias2(alias1((depth0 != null ? depth0.id : depth0), depth0))
    + ")\">\n    <div class=\"col-offset-1 col-xs-3 col-md-2 text-right\">\n      <img src=\""
    + alias2(alias1((depth0 != null ? depth0.picture : depth0), depth0))
    + "\" width=\"64\" height=\"64\">\n      <!--<div class=\"circle-avatar\" style=\"'background-image:url('+"
    + alias2(alias1((depth0 != null ? depth0.picture : depth0), depth0))
    + "+')'\"></div>-->\n    </div>\n    <div class=\"col-xs-7 col-md-8 alignme\">\n      <span class=\"bold\">"
    + alias2(alias1((depth0 != null ? depth0.name : depth0), depth0))
    + "</span><br>\n      <span class=\"small text-light\">"
    + alias2(alias1((depth0 != null ? depth0.iss : depth0), depth0))
    + "</span>\n    </div>\n  </a>\n  <br><br>\n  <br><br>\n</div>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<div class=\"row\">\n  <div class=\"col-xs-offset-1 col-xs-10\">\n    <p>Select an identity.</p>\n  </div>\n</div>\n<hr/>\n\n"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.identities : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "<hr/>\n\n<div class=\"row\">\n  <a class=\"col-xs-offset-1 col-xs-10\" onclick=\"route('search', 0)\">\n    <!--<img class=\"img-responsive\" src=\"assets/plusIcon.jpg\"/>-->\n    <span>Add an identity</span>\n  </a>\n  <a class=\"col-xs-offset-1 col-xs-10\" onclick=\"route('select', 0)\">\n    <!--<img class=\"img-responsive\" src=\"assets/plusIcon.jpg\"/>-->\n    <span>Select</span>\n  </a>\n</div>\n";
},"useData":true});
})();