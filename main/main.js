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
