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

function loggedIn(){
  var currentUser = Meteor.userId();
  if(!currentUser){
    throw new Meteor.Error("not-logged-in", "You're not logged-in.");
  }
}
