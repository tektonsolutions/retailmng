// Search functionality
EmployeesIndex = new EasySearch.Index({
  collection: Meteor.users,
  fields: ["profile.name"],
  defaultSearchOptions: {
    limit: 10
  },
  engine: new EasySearch.Minimongo({
    sort: function (){
      return  { "profile.name": 1};
    }
  })
});

if(Meteor.isClient){
  Template.employeeMain.onCreated(function () {
    this.subscribe("employees");
  });

  Template.employeeMain.helpers({
    "employeesIndex": function(){
      return EmployeesIndex;
    },
    "employeeSearchAttributes": function(){
      return {"id": "icon_prefix", "class": "search-table validate", "type": "text" };
    }
  });

  Template.employeePosition.helpers({
    positions: [
      {name: roles.supervisor.name, role: roles.supervisor.key},
      {name: roles.sales.name, role: roles.sales.key}
    ]
  });

  Template.employeeList.helpers({
    "employeesIndex": function(){
      return EmployeesIndex;
    },
    "employeesCount": function(){
      return EmployeesIndex.getComponentDict().get("count");
    }
  });

  Template.employeeCreate.events({
    "submit form": function(event, template){
      event.preventDefault();
    }
  });

  Template.employee.events({
    "click #emp_delete": function(event){
      var userObject = this._id;
      var r = confirm("Delete?");
      if (r === true) {
        Meteor.call("deleteEmployee", userObject, function(error, result){
          if(error){
            console.log(error.reason);
          }
        });
      }
    }
  });

  Template.employeeCreate.onRendered(function(){
    var validator = $(".register").validate({
      submitHandler: function(event){
        var currentUser = Meteor.userId();

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
            address: address,
            managedBy: currentUser
          }
        };

        Meteor.call("createEmployee", userObject, role, function(error, result){
          if(error){
            if(error.reason == "Username already exists."){
              validator.showErrors({
                username: error.reason
              });
            }
          } else{
            var form = validator.currentForm;
            form.reset();
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
        $(element)
        .closest("form")
        .find("p[class='selectErrorContainer']")
        .text(error.text());
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

function isEmployeeObjectSafe(userObject, role){
  var safe1 = Match.test(userObject, {
    username: String,
    password: String,
    profile : {
      name: String,
      birthdate: String,
      contactNo: String,
      address: String,
      managedBy: String
    }
  });

  var safe2 = Match.test(role, String);

  if(safe1 && safe2){
    return true;
  } else{
    return false;
  }
}

if(Meteor.isServer){
  Meteor.publish("employees", function(){
      var currentUser = this.userId;
      if(Meteor.myFunctions.isAdmin(currentUser)){
        return Meteor.users.find({"$and": [{"profile.managedBy": currentUser}, {"softDelete": false}]},
        {fields:{"profile": 1}});
      }
  });

  Meteor.methods({
    "createEmployee": function(userObject, role){
       var currentUser = Meteor.userId();

       if(Meteor.myFunctions.isAdmin(currentUser)){
         if(!isEmployeeObjectSafe(userObject, role)){
           console.log("server error");
         } else {
           var result = Accounts.createUser(userObject);
           if(result){
             Roles.addUsersToRoles(result, role);
           }
           return result;
         }
       }
    },
    "deleteEmployee": function(userObject){
      var currentUser = Meteor.userId();

      if(Meteor.myFunctions.isAdmin(currentUser)){
        Meteor.users.update({"_id": userObject}, {"$set": { "softDelete": true }});
      }
    }
  });
}
