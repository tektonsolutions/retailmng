Units = new Mongo.Collection("units");

UnitsIndex = new EasySearch.Index({
  collection: Units,
  fields: ["name", "shortname"],
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
  Template.unitsMain.onCreated(function (){
    this.subscribe("units");
  });

  Template.unitsMain.helpers({
    unitsIndex: function(){
      return UnitsIndex;
    },
    unitsSearchAttributes: function(){
      return {"id": "icon_prefix", "class": "search-table validate", "type": "text" };
    }
  });

  Template.unitsMain.events({
    "click #unit_create": function(event, template){
      Session.set("currentMethod", "create");
      template.find("form").reset();
    }
  });

  Template.unit.events({
    "click #unit_delete": function(event){
       var currentId = this._id;
       var r = confirm("Delete?");
       if(r === true){
         Meteor.call("deleteUnit", currentId, function(error, result){
           if(error){
             console.log(error.reason);
           }
         });
       }
    },
    "click #unit_update": function(event){
      var currentId = this._id;
      Session.set("currentId", currentId);
      Session.set("currentMethod", "update");
      $("#register")[0].reset();

      $("#unit_name").val(this.name);
      $("#unit_shortname").val(this.shortname);

      $("#units_modal").openModal();
    }
  });

  Template.unitsList.helpers({
    unitsIndex: function(){
      return UnitsIndex;
    },
    unitsCount: function(){
      return UnitsIndex.getComponentDict().get("count");
    }
  });

  Template.unitsModal.events({
    "submit form": function(event, template){
      event.preventDefault();

      var validator = $("#register").validate();
      var valid = $("#register").valid();
      var currentMethod = Session.get("currentMethod");

      if(valid){
        if(currentMethod === "create"){
          createUnit(validator);
        }
        if(currentMethod === "update"){
          updateUnit(Session.get("currentId"), validator);
        }
      }
    }
  });
}

function getFields(){
  var currentUser = Meteor.userId();
  var name = $("#unit_name").val();
  var shortname = $("#unit_shortname").val();

  var object = {
    name: name,
    shortname: shortname,
    createdBy: currentUser
  };

  return object;
}

function createUnit(validator){
  Meteor.call("createUnit", getFields(), function(error, result){
    if(error){
      if(error.error === "duplicate-shortname"){
        validator.showErrors({
          unit_shortname: error.reason
        });
      }
    } else{
      var form = validator.currentForm;
      form.reset();
    }
  });
}

function updateUnit(currentId, validator){
  var object = getFields();

  Meteor.call("updateUnit", currentId, object, function(error, result){
    if(error){
      if(error.error === "duplicate-shortname"){
        validator.showErrors({
          unit_shortname: error.reason
        });
      }
    } else{
      $("#units_modal").closeModal();
    }
  });
}

function isSafe(object){
  var safe = Match.test(object, {
    name: String,
    shortname: String,
    createdBy: String
  });

  if(safe){
    return true;
  } else {
    return false;
  }
}

if(Meteor.isServer){
  Units._ensureIndex({shortname: 1}, {unique: 1});

  Meteor.publish("units", function(argument){
      var currentUser = this.userId;
      if(Meteor.myFunctions.isAdmin(currentUser)){
        return Units.find({"createdBy": currentUser});
      }
  });

  Meteor.methods({
    createUnit: function(object){
      var currentUser = Meteor.userId();

      if(Meteor.myFunctions.isAdmin(currentUser)){
        if(!isSafe(object)){
          console.log("not safe");
        } else {
          try {
            Units.insert(object);
          } catch(e) {
            if(e.toString().indexOf("shortname") > - 1){
              throw new Meteor.Error("duplicate-shortname", "Short name is already taken.");
            }
            //do name
          }
        }
      }
    },
    updateUnit: function(currentId, object){
      var currentUser = Meteor.userId();

      if(Meteor.myFunctions.isAdmin(currentUser)){
        if(!isSafe(object)){
          console.log("not safe");
        } else {
          try{
            Units.update({"_id": currentId}, {$set: {
              "name": object.name,
              "shortname": object.shortname
            }});
          } catch(e){
            if(e.toString().indexOf("shortname") > - 1){
              throw new Meteor.Error("duplicate-shortname", "Short name is already taken.");
            }
            //do name
          }
        }
      }
    },
    deleteUnit: function(currentId){
      var currentUser = Meteor.userId();

      if(Meteor.myFunctions.isAdmin(currentUser)){
        Units.remove({"_id":currentId, "createdBy": currentUser});
      }
    }
  });
}
