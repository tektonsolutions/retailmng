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
    "click #unit_create": function(event){
      var validator = $("#register").validate({
        submitHandler: function(event){
          registerUnit(validator);
        }
      });
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

function registerUnit(validator){
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
    updateUnit: function(){

    },
    deleteUnit: function(){

    }
  });
}
