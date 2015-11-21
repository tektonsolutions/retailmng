if(Meteor.isClient){
  Template.login.events({
    "submit form": function(event){
      event.preventDefault();
    }
  });

  Template.login.onRendered(function(){
    var validator = $(".login").validate({
      wrapper: "li",
      errorLabelContainer: "#errorBox",
      rules:{
        username: {
          required: true,
          minlength: 6
        },
        password: {
          required: true,
          minlength: 6
        }
      },
      messages:{
        username: {
          required: "You must enter a username.",
          minlength: "Your username must be at least {0} characters."
        },
        password: {
          required: "You must enter a password.",
          minlength: "Your password must be at least {0} characters."
        }
      },
      submitHandler: function(){
        var username = $("[name=username]").val();
        var password = $("[name=password]").val();
        Meteor.loginWithPassword(username, password, function(error){
          if(error){
            if(error.reason == "User not found"){
              console.log(error.reason);
              validator.showErrors({
                username: error.reason
              });
            }
            if(error.reason == "Incorrect password"){
              validator.showErrors({
                password: error.reason
              });
            }
          } else{
            console.log(Meteor.userId());
            //do something
          }
        });
      }
    });
  });
}
