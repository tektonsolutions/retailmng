Suppliers = new Mongo.Collection("suppliers");

SuppliersIndex = new EasySearch.Index({
  collection: Suppliers,
  fields: ["name"],
  defaultSearchOptions: {
    limit: 10
  },
  engine: new EasySearch.Minimongo({
    sort: function (){
      return  { "name": 1};
    }
  })
});

if(Meteor.isClient){
  Template.suppliers.onCreated(function(){
    this.subscribe("suppliers");
  });

  Template.suppliers.helpers({
    suppliersIndex: function(){
      return SuppliersIndex;
    },
    suppliersSearchAttributes: function(){
      return {"id": "icon_prefix", "class": "search-table validate", "type": "text" };
    }
  });

  Template.suppliers.events({
    "click #sup_create": function(event, template){
      Session.set("currentMethod", "create");
      template.find("form").reset();
    }
  });

  Template.supplier.events({
    "click #sup_delete": function(event){
      var currentId = this._id;
      var r = confirm("Delete?");
      if(r === true){
        Meteor.call("deleteSupplier", currentId, function(error, result){
          if(error){
            console.log(error.reason);
          }
        });
      }
    },
    "click #sup_update": function(event){
      var currentId = this._id;
      Session.set("currentId", currentId);
      Session.set("currentMethod", "update");
      $("#register")[0].reset();

      $("#sup_name").val(this.name);
      $("#sup_tin").val(this.tin);
      $("#sup_email").val(this.email_address);
      $("#sup_address").val(this.address);
      $("#sup_person").val(this.contact_person);
      $("#sup_contact").val(this.contact_no);
      $("#sup_fax").val(this.fax_no);

      $("#sup_modal").openModal();
    }
  });

  Template.suppliersList.helpers({
    suppliersIndex: function(){
      return SuppliersIndex;
    },
    suppliersCount: function(){
      return SuppliersIndex.getComponentDict().get("count");
    }
  });

  Template.supplierModal.events({
    "submit form": function(event, template){
      event.preventDefault();

      var validator = $("#register").validate();
      var valid = $("#register").valid();
      var currentMethod = Session.get("currentMethod");

      if(valid){
        if(currentMethod === "create"){
          createSupplier(validator);
        }
        if(currentMethod === "update"){
          updateSupplier(Session.get("currentId"), validator);
        }
      }
    }
  });
}

function getFields(){
  var currentUser = Meteor.userId();
  var name = $("#sup_name").val();
  var tin = $("#sup_tin").val();
  var email_address = $("#sup_email").val();
  var address = $("#sup_address").val();
  var contact_person = $("#sup_person").val();
  var contact_no = $("#sup_contact").val();
  var fax_no = $("#sup_fax").val();

  var object = {
    name: name,
    tin: tin,
    email_address: email_address,
    address: address,
    contact_person: contact_person,
    contact_no: contact_no,
    fax_no: fax_no,
    createdBy: currentUser
  };

  return object;
}

function createSupplier(validator){
  Meteor.call("createSupplier", getFields(), function(error, result){
    if(error){
      //do something
    } else{
      var form = validator.currentForm;
      form.reset();
    }
  });
}

function updateSupplier(currentId, validator){
  var object = getFields();

  Meteor.call("updateSupplier", currentId, object, function(error, result){
    if(error){
      //do something
    } else{
      $("#sup_modal").closeModal();
    }
  });
}

function isSafe(object){
  var safe = Match.test(object, {
    name: String,
    tin: String,
    email_address: String,
    address: String,
    contact_person: String,
    contact_no: String,
    fax_no: String,
    createdBy: String
  });

  if(safe){
    return true;
  } else {
    return false;
  }
}

if(Meteor.isServer){
  Meteor.publish("suppliers", function(argument){
      var currentUser = this.userId;
      if(Meteor.myFunctions.isAdmin(currentUser)){
        return Suppliers.find({"createdBy": currentUser});
      }
  });

  Meteor.methods({
    createSupplier: function(object){
      var currentUser = Meteor.userId();

      if(Meteor.myFunctions.isAdmin(currentUser)){
        if(!isSafe(object)){
          console.log("not safe");
        } else {
          try {
            Suppliers.insert(object);
          } catch(e) {
            console.log(e);
          }
        }
      }
    },
    updateSupplier: function(currentId, object){
      var currentUser = Meteor.userId();

      if(Meteor.myFunctions.isAdmin(currentUser)){
        if(!isSafe(object)){
          console.log("not safe");
        } else {
          try{
            Suppliers.update({"_id": currentId}, {$set: {
              "name": object.name,
              "tin": object.tin,
              "email_address": object.email_address,
              "address": object.address,
              "contact_person": object.contact_person,
              "contact_no": object.contact_no,
              "fax_no": object.fax_no
            }});
          } catch(e){
            console.log(e);
          }
        }
      }
    },
    deleteSupplier: function(currentId){
      var currentUser = Meteor.userId();

      if(Meteor.myFunctions.isAdmin(currentUser)){
        Suppliers.remove({"_id":currentId, "createdBy": currentUser});
      }
    }
  });
}
