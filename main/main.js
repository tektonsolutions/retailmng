if(Meteor.isServer){
  Meteor.startup(function(){
    if(Meteor.users.find().count() === 0){
      var userObject = {
        username: "admin",
        password: "admin"
      };
      var id = Accounts.createUser(userObject);
      if(id){
        Roles.addUsersToRoles(id, roles.admin.key);
      }
    }
  });
}

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
Router.route("/sales");
Router.route("/employees", {
  name: "employees",
  template: "employeeMain"
});

//retailmng html
Router.route("/retailmng");

function loggedIn(){
  var currentUser = Meteor.userId();
  if(!currentUser){
    throw new Meteor.Error("not-logged-in", "You're not logged-in.");
  }
}
