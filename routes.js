//Guests Routes
Router.configure({
  layoutTemplate:"main",
  loadingTemplate: "loading"
});

Router.route("/", {
  name: "login",
  template: "login",
  onBeforeAction: function(){
    var currentUser = Meteor.userId();
    if(currentUser){
      Router.go("sales");
    } else{
      this.next();
    }
  }
});
Router.route("/register");

//Inventory Routes
Router.route("/inventory");
Router.route("/inventory-entry");
Router.route("/inventory-perform");
Router.route("/inventory-count");

//Delivery Routes
Router.route("/delivery-registry");
Router.route("/delivery-entry");
Router.route("/delivery-areas");

//Sales Route
Router.route("/sales");

//Preset Route
Router.route("/presets");

//Units Route
Router.route("/units");

//Suppliers Route
Router.route("/suppliers");

//Categories Route
Router.route("/categories");

//Employees Route
Router.route("/employees", {
  name: "employees",
  template: "employeeMain"
});

//retailmng html
Router.route("/retailmng");