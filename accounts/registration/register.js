if(Meteor.isClient){
  Template.register.events({
    "submit form": function(event){
      event.preventDefault();
    }
  });

  Template.register.onRendered(function(){
    var validator = $(".register").validate({
      submitHandler: function(event){
        var username = $("[name=username]").val();
        var password = $("[name=password]").val();
        var userObject = {
          username: username,
          password: password
        };

        Accounts.createUser(userObject, function(error){
           if(error){
             if(error.reason == "Username already exists."){
               validator.showErrors({
                 username: error.reason
               });
             }
           }else {
             Meteor.call("registerRole", function(error, result){
               if(error){
                 console.log(error.reason);
               } else {
                 Router.go("sales");
               }
             });
           }
        });
      }
    });
  });
}

if(Meteor.isServer){
  Meteor.methods({
    "registerRole": function(){
      Roles.addUsersToRoles(Meteor.userId(), roles.admin.key);
    }
  });
}
