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
    Session.set("div_password", "attached");
    this.subscribe("employees");
  });

  Template.employeeMain.helpers({
    employeesIndex: function(){
      return EmployeesIndex;
    },
    employeeSearchAttributes: function(){
      return {"id": "icon_prefix", "class": "search-table validate", "type": "text" };
    }
  });

  Template.employeeMain.events({
    "click #emp_create": function(event){
      if(Session.equals("div_password", "detached")){
        //change namespace for production
        $div_password.appendTo("#div_row_password");
        Session.set("div_password", "attached");
      }

      var validator = $("#register").validate({
        submitHandler: function(event){
          registerEmployee(validator);
        }
      });

      $("#emp_username").val("");
      $("#emp_name").val("");
      $("#emp_birthdate").val("");
      $("#emp_contact").val("");
      $("#emp_address").val("");

      $("select").val("");
      $('select').material_select();
    }
  });

  Template.employeePosition.helpers({
    positions: [
      {name: roles.supervisor.name, role: roles.supervisor.key},
      {name: roles.sales.name, role: roles.sales.key}
    ]
  });

  Template.employeeList.helpers({
    employeesIndex: function(){
      return EmployeesIndex;
    },
    employeesCount: function(){
      return EmployeesIndex.getComponentDict().get("count");
    }
  });

  Template.employeeModal.events({
    "submit form": function(event, template){
      event.preventDefault();
    }
  });

  Template.employee.events({
    "click #emp_delete": function(event){
      var currentId = this._id;
      var r = confirm("Delete?");
      if (r === true) {
        Meteor.call("deleteEmployee", currentId, function(error, result){
          if(error){
            console.log(error.reason);
          }
        });
      }
    },
    "click #emp_update": function(event){
      var currentId = this._id;

      if(Session.equals("div_password", "attached")){
        //change namespace for production
        $div_password = $("#div_password").detach();
        Session.set("div_password", "detached");
      }

      var validator = $("#register").validate({
        submitHandler: function(event){
          updateEmployee(currentId, validator);
        }
      });

      $("#emp_username").val(this.username);
      $("#emp_name").val(this.profile.name);
      $("#emp_birthdate").val(this.profile.birthdate);
      $("#emp_contact").val(this.profile.contactNo);
      $("#emp_address").val(this.profile.address);

      $("select").val(this.roles[0]);
      $("select").material_select();

      $("#emp_modal").openModal();
    },
    "click #emp_change_pw": function(event){
      var currentId = this._id;

      var validator = $("#changePassword").validate({
        submitHandler: function(event){
          var confirm_password = $("#emp_new_conf_pw").val();
          changeEmployeePassword(currentId, confirm_password, validator);
        }
      });

      $("#changePassword")[0].reset();
      $("#emp_password_modal").openModal();
    }
  });

  Template.employeePasswordModal.events({
    "submit form": function(event){
       event.preventDefault();
    }
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
      confirm_password:{
        equalTo: "#emp_new_pw"
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
        minlength: "Username must be at least {0} characters."
      },
      password:{
        required: "You must enter a password.",
        minlength: "Password must be at least {0} characters."
      },
      confirm_password:{
        equalTo: "Please enter the same password."
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

function getFields(){
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

  return {userObject: userObject, role: role};
}

function registerEmployee(validator){
  Meteor.call("createEmployee", getFields().userObject, getFields().role, function(error, result){
    if(error){
      if(error.reason == "Username already exists."){
        validator.showErrors({
          username: error.reason
        });
      }
    } else{
      var form = validator.currentForm;

      $("select").val("");
      $('select').material_select();
      form.reset();
    }
  });
}

function updateEmployee(currentId, validator){
  var userObject = getFields().userObject;
  userObject.password = "";

  Meteor.call("updateEmployee", currentId, userObject, getFields().role, function(error, result){
    if(error){
      if(error.reason == "Username already exists."){
        validator.showErrors({
          username: error.reason
        });
      }
    } else {
      var form = validator.currentForm;

      $("select").val("");
      $('select').material_select();
      form.reset();
    }
  });
}

function changeEmployeePassword(currentId, password, validator){
  Meteor.call("changeEmployeePassword", currentId, password, function(error, result){
    if(error){
      validator.showErrors({
        password: error.reason
      });
    } else{
      var form = validator.currentForm;
      form.reset();
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
        {fields:{"username": 1, "profile": 1, "roles": 1}});
      }
  });

  Meteor.methods({
    createEmployee: function(userObject, role){
       var currentUser = Meteor.userId();

       if(Meteor.myFunctions.isAdmin(currentUser)){
         if(!isEmployeeObjectSafe(userObject, role)){
           console.log("not safe");
         } else {
           var result = Accounts.createUser(userObject);
           if(result){
             Roles.addUsersToRoles(result, role);
           }
           return result;
         }
       }
    },
    deleteEmployee: function(userObject){
      var currentUser = Meteor.userId();

      if(Meteor.myFunctions.isAdmin(currentUser)){
        Meteor.users.update({"_id": userObject}, {"$set": { "softDelete": true }});
      }
    },
    updateEmployee: function(currentId, userObject, role){
      var currentUser = Meteor.userId();

      if(Meteor.myFunctions.isAdmin(currentUser)){
        if(!isEmployeeObjectSafe(userObject, role)){
          console.log("not safe");
        } else {
          Accounts.setUsername(currentId, userObject.username);
          Meteor.users.update({_id:currentId}, {$set:{
            "profile.name": userObject.profile.name,
            "profile.birthdate": userObject.profile.birthdate,
            "profile.contactNo": userObject.profile.contactNo,
            "profile.address": userObject.profile.address,
            "roles": [role]
          }});
        }
      }
    },
    changeEmployeePassword: function(currentId, password){
      var currentUser = Meteor.userId();

      if(Meteor.myFunctions.isAdmin(currentUser)){
        var safe = Match.test(password, String);
        if(!safe){
          console.log("not safe");
        } else {
          Accounts.setPassword(currentId, password);
        }
      }
    }
  });
}
