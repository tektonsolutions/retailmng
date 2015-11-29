
if(Meteor.isClient){
  Template.login.events({
    "submit form": function(event){
      event.preventDefault();
    }
  });

  Template.login.onRendered(function(){
    var validator = $(".login").validate({
      errorClass: 'invalid',
      errorPlacement: function (error, element) {
        
        // Materialize.toast(error.text(), 4000);
        $(element)
        .closest("form")
        .find("label[for='" + element.attr("id") + "']")
        .attr('data-error', error.text());
      },
      rules:{
        username:{
          required: true,
          minlength: 5
        },
        password:{
          required: true,
          minlength: 5
        }
      },
      messages:{
        username:{
          required: "You must enter a username.",
          minlength: "Your username must be at least {0} characters."
        },
        password:{
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
            Router.go("sales");
          }
        });
      }
    });
  });
}
