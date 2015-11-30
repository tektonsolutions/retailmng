if(Meteor.isServer){
  Accounts.onCreateUser(function(options, user) {
    user.softDelete = false;
    if (options.profile)
      user.profile = options.profile;
    return user;
  });

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

Meteor.myFunctions = {
  "isAdmin": function(userId){
    if(!userId){
      throw new Meteor.Error("not-logged-in", "You're not logged-in.");
    }

    if(Roles.userIsInRole(userId, roles.admin.key)){
      return true;
    } else {
      return false;
    }
  }
}
