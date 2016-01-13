Presets = new Mongo.Collection("presets");

PresetsIndex = new EasySearch.Index({
  collection: Presets,
  fields: ["title"],
  defaultSearchOptions: {
    limit: 10
  },
  engine: new EasySearch.Minimongo({
    sort: function (){
      return  { "title": 1};
    }
  })
});

if(Meteor.isClient){
  Template.presets.onCreated(function(){
    this.subscribe("presetsAndUnits");
  });

  Template.presets.helpers({
    presetsIndex: function(){
      return PresetsIndex;
    },
    presetsSearchAttributes: function(){
      return {"id": "icon_prefix", "class": "search-table validate", "type": "text" };
    }
  });

  Template.presets.events({
    "click #preset_create": function(event, template){
      Session.set("currentMethod", "create");
      template.find("form").reset();

      $("select").val("");
      $('select').material_select();
    }
  });

  Template.preset.events({
    "click #retailpreset_delete": function(event){
      var currentId = this._id;
      var r = confirm("Delete?");
      if(r === true){
        Meteor.call("deletePreset", currentId, function(error, result){
          if(error){
            console.log(error.reason);
          }
        });
      }
    },
    "click #retailpreset_update": function(event){
      var currentId = this._id;
      Session.set("currentId", currentId);
      Session.set("currentMethod", "update");
      $("#register")[0].reset();

      $("#retail_title").val(this.title);
      $("#retail_desc").val(this.description);
      $("#retail_value").val(this.value);

      $("select").val(this.unit);
      $("select").material_select();

      $("#retailpreset_modal").openModal();
    }
  });

  Template.presetUnit.helpers({
    units: function(){
      var currentUser = Meteor.userId();
      return Units.find({"createdBy": currentUser});
    }
  });

  Template.presetsList.helpers({
    presetsIndex: function(){
      return PresetsIndex;
    },
    presetsCount: function(){
      return PresetsIndex.getComponentDict().get("count");
    }
  });

  Template.presetModal.events({
    "submit form": function(event, template){
      event.preventDefault();

      var validator = $("#register").validate();
      var valid = $("#register").valid();
      var currentMethod = Session.get("currentMethod");

      if(valid){
        if(currentMethod === "create"){
          createPreset(validator);
        }
        if(currentMethod === "update"){
          updatePreset(Session.get("currentId"), validator);
        }
      }
    }
  });
}

function getFields(){
  var currentUser = Meteor.userId();
  var title = $("#retail_title").val();
  var description = $("#retail_desc").val();
  var value = $("#retail_value").val();
  var unit = $("select").val();

  var object = {
    title: title,
    description: description,
    value: value,
    unit: unit,
    createdBy: currentUser
  };

  return object;
}

function createPreset(validator){
  Meteor.call("createPreset", getFields(), function(error, result){
    if(error){
      //do something
    } else{
      var form = validator.currentForm;

      $("select").val("");
      $('select').material_select();
      form.reset();
    }
  });
}

function updatePreset(currentId, validator){
  var object = getFields();

  Meteor.call("updatePreset", currentId, object, function(error, result){
    if(error){
      //do something
    } else{
      $("#retailpreset_modal").closeModal();
    }
  });
}

function isSafe(object){
  var safe = Match.test(object, {
    title: String,
    description: String,
    value: String,
    unit: String,
    createdBy: String
  });

  if(safe){
    return true;
  } else {
    return false;
  }
}

if(Meteor.isServer){
  Meteor.publish("presetsAndUnits", function(argument){
      var currentUser = this.userId;
      if(Meteor.myFunctions.isAdmin(currentUser)){
        return [
          Presets.find({"createdBy": currentUser}),
          Units.find({"createdBy": currentUser})
        ];
      }
  });

  Meteor.methods({
    createPreset: function(object){
      var currentUser = Meteor.userId();

      if(Meteor.myFunctions.isAdmin(currentUser)){
        if(!isSafe(object)){
          console.log("not safe");
        } else {
          try {
            Presets.insert(object);
          } catch(e) {
            console.log(e);
          }
        }
      }
    },
    updatePreset: function(currentId, object){
      var currentUser = Meteor.userId();

      if(Meteor.myFunctions.isAdmin(currentUser)){
        if(!isSafe(object)){
          console.log("not safe");
        } else {
          try{
            Presets.update({"_id": currentId}, {$set: {
              "title": object.title,
              "description": object.description,
              "value": object.value,
              "unit": object.unit
            }});
          } catch(e){
            console.log(e);
          }
        }
      }
    },
    deletePreset: function(currentId){
      var currentUser = Meteor.userId();

      if(Meteor.myFunctions.isAdmin(currentUser)){
        Presets.remove({"_id":currentId, "createdBy": currentUser});
      }
    }
  });
}
