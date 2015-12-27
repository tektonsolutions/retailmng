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
  Template.employees.onCreated(function () {
    Session.set("div_password", "attached");
    this.subscribe("employees");
  });

  Template.employees.helpers({
    employeesIndex: function(){
      return EmployeesIndex;
    },
    employeeSearchAttributes: function(){
      return {"id": "icon_prefix", "class": "search-table validate", "type": "text" };
    }
  });

  Template.employees.events({
    "click #emp_create": function(event, template){
      if(Session.equals("div_password", "detached")){
        //change namespace for production
        $div_password.appendTo("#div_row_username_password");
        Session.set("div_password", "attached");
      }

      Session.set("currentMethod", "create");
      template.find("form").reset();

      $("select").val("");
      $('select').material_select();
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
      if(Session.equals("div_password", "attached")){
        //change namespace for production
        $div_password = $("#div_password").detach();
        Session.set("div_password", "detached");
      }

      var currentId = this._id;
      Session.set("currentId", currentId);
      Session.set("currentMethod", "update");
      $("#register")[0].reset();

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
      Session.set("currentId", currentId);
      Session.set("currentMethod", "changepw");
      $("#register")[0].reset();

      $("#changePassword")[0].reset();
      $("#emp_password_modal").openModal();
    }
  });

  Template.employeePosition.helpers({
    positions: [
      {name: roles.supervisor.name, role: roles.supervisor.key},
      {name: roles.sales.name, role: roles.sales.key}
    ]
  });

  Template.employeesList.helpers({
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

      var validator = $("#register").validate();
      var valid = $("#register").valid();
      var currentMethod = Session.get("currentMethod");

      if(valid){
        if(currentMethod === "create"){
          createEmployee(validator);
        }
        if(currentMethod === "update"){
          updateEmployee(Session.get("currentId"), validator);
        }
      }
    }
  });

  Template.employeePasswordModal.events({
    "submit form": function(event){
       event.preventDefault();

       var validator = $("#changePassword").validate();
       var valid = $("#changePassword").valid();
       var currentMethod = Session.get("currentMethod");

       if(valid){
         if(currentMethod === "changepw"){
           var confirm_password = $("#emp_new_conf_pw").val();
           changeEmployeePassword(Session.get("currentId"), confirm_password, validator);
         }
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

function createEmployee(validator){
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
      $("#emp_modal").closeModal();
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
    deleteEmployee: function(currentId){
      var currentUser = Meteor.userId();

      if(Meteor.myFunctions.isAdmin(currentUser)){
        Meteor.users.update({"_id": currentId}, {"$set": { "softDelete": true }});
      }
    },
    updateEmployee: function(currentId, userObject, role){
      var currentUser = Meteor.userId();

      if(Meteor.myFunctions.isAdmin(currentUser)){
        if(!isEmployeeObjectSafe(userObject, role)){
          console.log("not safe");
        } else {
          Accounts.setUsername(currentId, userObject.username);
          Meteor.users.update({"_id":currentId}, {$set:{
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
