Router.configure({
  layoutTemplate:"main",
  loadingTemplate: "loading"
});

Router.route("/", {
  name: "home",
  template: "home"
});
Router.route("/register");
Router.route("/login");

//retailmng html
Router.route("/someName");
