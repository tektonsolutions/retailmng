Areas = new Mongo.Collection("areas");

AreasIndex = new EasySearch.Index({
  collection: Areas,
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
  Template.areas.onCreated(function(){
    this.subscribe("areas");
  });

  Template.areas.helpers({
    areasIndex: function(){
      return AreasIndex;
    },
    areasSearchAttributes: function(){
      return {"id": "icon_prefix", "class": "search-table validate", "type": "text" };
    }
  });

  Template.areas.events({
    "click #area_create": function(event, template){
      Session.set("currentMethod", "create");
      template.find("form").reset();
    }
  });

  Template.area.events({
    "click #area_delete": function(event){
      var currentId = this._id;
      var r = confirm("Delete?");
      if(r === true){
        Meteor.call("deleteArea", currentId, function(error, result){
          if(error){
            console.log(error.reason);
          }
        });
      }
    },
    "click #area_update": function(event){
      var currentId = this._id;
      Session.set("currentId", currentId);
      Session.set("currentMethod", "update");
      $("#register")[0].reset();

      $("#area_name").val(this.name);
      $("#area_fee").val(this.fee);

      $("#area_modal").openModal();
    }
  });

  Template.areasList.helpers({
    areasIndex: function(){
      return AreasIndex;
    },
    areasCount: function(){
      return AreasIndex.getComponentDict().get("count");
    }
  });

  Template.areaModal.events({
    "submit form": function(event, template){
      event.preventDefault();

      var validator = $("#register").validate();
      var valid = $("#register").valid();
      var currentMethod = Session.get("currentMethod");

      if(valid){
        if(currentMethod === "create"){
          createArea(validator);
        }
        if(currentMethod === "update"){
          updateArea(Session.get("currentId"), validator);
        }
      }
    }
  });
}

function getFields(){
  var currentUser = Meteor.userId();
  var name = $("#area_name").val();
  var fee = $("#area_fee").val();

  var object = {
    name: name,
    fee: fee,
    createdBy: currentUser
  };

  return object;
}

function createArea(validator){
  Meteor.call("createArea", getFields(), function(error, result){
    if(error){
      validator.showErrors({
        area_name: error.reason
      });
    } else{
      var form = validator.currentForm;
      form.reset();
    }
  });
}

function updateArea(currentId, validator){
  var object = getFields();

  Meteor.call("updateArea", currentId, object, function(error, result){
    if(error){
      validator.showErrors({
        area_name: error.reason
      });
    } else{
      $("#area_modal").closeModal();
    }
  });
}

function isSafe(object){
  var safe = Match.test(object, {
    name: String,
    fee: String,
    createdBy: String
  });

  if(safe){
    return true;
  } else {
    return false;
  }
}

if(Meteor.isServer){
  Meteor.publish("deliveryAreas", function(argument){
      var currentUser = this.userId;
      if(Meteor.myFunctions.isAdmin(currentUser)){
        return Areas.find({"createdBy": currentUser});
      }
  });

  Meteor.methods({
    createArea: function(object){
      var currentUser = Meteor.userId();

      if(Meteor.myFunctions.isAdmin(currentUser)){
        if(!isSafe(object)){
          console.log("not safe");
        } else {
          try {
            Areas.insert(object);
          } catch(e) {
            console.log(e);
          }
        }
      }
    },
    updateArea: function(currentId, object){
      var currentUser = Meteor.userId();

      if(Meteor.myFunctions.isAdmin(currentUser)){
        if(!isSafe(object)){
          console.log("not safe");
        } else {
          try{
            Areas.update({"_id": currentId}, {$set: {
              "name": object.name,
              "fee": object.fee
            }});
          } catch(e){
            console.log(e);
          }
        }
      }
    },
    deleteArea: function(currentId){
      var currentUser = Meteor.userId();

      if(Meteor.myFunctions.isAdmin(currentUser)){
        Areas.remove({"_id":currentId, "createdBy": currentUser});
      }
    }
  });
}
