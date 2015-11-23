if(Meteor.isClient){
  Template.register.events({
    "submit form": function(event){
      event.preventDefault();
    }
  });

  Template.register.onRendered(function(){
    var validator = $(".register").validate({
      errorClass: 'invalid',
      errorPlacement: function (error, element) {
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
      submitHandler: function(event){
        var username = $("[name=username]").val();
        var password = $("[name=password]").val();
        var userObject = {
          username: username,
          password: password
        };
        var id = Accounts.createUser(userObject, function(error){
           if(error){
             validator.showErrors({
               username: error.reason
             });
           }
        });
        Roles.addUsersToRoles(id, roles.admin.key);
        Router.go("sales");
      }
    });
  });
}
