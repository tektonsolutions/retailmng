if(Meteor.isClient){
  Template.employeePosition.helpers({
    positions: [
      {name: roles.supervisor.name, role: roles.supervisor.key},
      {name: roles.sales.name, role: roles.sales.key}
    ]
  });

  Template.employeeCreate.events({
    "submit form": function(event, template){
      event.preventDefault();
    }
  });

  Template.employeeCreate.onRendered(function(){
    var validator = $(".register").validate({
      submitHandler: function(event){
        var username = $("#emp_username").val();
        var password = $("#emp_pw").val();

        var name = $("#emp_name").val();
        var birthdate = $("#emp_birthdate").val();
        var contactNo = $("#emp_contact").val();
        var address = $("#emp_address").val();

        var role = $("select").val();

        var userObject = {
          username: username,
          password: password,
          profile: {
            name: name,
            birthdate: birthdate,
            contactNo: contactNo,
            address: address
          }
        };
        Meteor.call("createEmployee", userObject, role, function(error, result){
          if(error){
            console.log(error.reason);
          }
          if(result){
            validator.resetForm();
          }
        });
      }
    });
  });

  $.validator.setDefaults({
    ignore: [],
    errorClass: 'invalid',
    errorPlacement: function (error, element) {
      var select = $("select").get(0);
      if(select === element.get(0)){
        $("#selectErrorContainer").text(error.text());
      }else {
        $(element)
        .closest("form")
        .find("label[for='" + element.attr("id") + "']")
        .attr('data-error', error.text());
      }
     },
     rules:{
      username:{
        required: true,
        minlength: 5
      },
      password:{
        required: true,
        minlength: 5
      },
      name:{
        required: true
      },
      role: {
        required: true
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
      },
      name:{
        required: "You must enter a name."
      },
      role:{
        required: "Please select a position."
      }
    }
  });
}

function checkEmployeeObject(userObject, role){
  check(userObject.username, String);
  //check(userObject.password, String);
  check(userObject.profile.name, String);
  check(userObject.profile.birthdate, String);
  check(userObject.profile.contactNo, String);
  check(userObject.profile.address, String);

  check(role, roles);
}

if(Meteor.isServer){
  Meteor.methods({
    "createEmployee":function(userObject, role){
       var currentUser = Meteor.userId();

       checkEmployeeObject(userObject, role);
       loggedIn();
    }
  });
}
