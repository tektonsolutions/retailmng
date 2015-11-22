if(Meteor.isClient){

}

if(Meteor.isServer){
  Meteor.methods({
    "createEmployee":function(userObject){
       var currentUser = Meteor.userId();
       
    }
  });
}
