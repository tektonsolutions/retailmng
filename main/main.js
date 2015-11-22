if(Meteor.isServer){
  Meteor.startup(function(){
    if(Meteor.users.find().count() === 0){
      var userObject = {
        username: "admin",
        password: "admin"
      };
      var id = Accounts.createUser(userObject);
      if(id){
        Roles.addUsersToRoles(id, roles.admin);
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

//retailmng html
Router.route("/retailmng");
