Areas = new Mongo.Collection("deliveryAreas");

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
  Template.deliveryAreas.onCreated(function(){
    this.subscribe("deliveryAreas");
  });

  Template.deliveryAreas.helpers({
    areasIndex: function(){
      return AreasIndex;
    },
    areasSearchAttributes: function(){
      return {"id": "icon_prefix", "class": "search-table validate", "type": "text" };
    }
  });

  Template.deliveryAreas.events({
    "click #areas_create": function(event){
      var validator = $("#register").validate({
        submitHandler: function(event){
          console.log("create");
          // createArea(validator);
        }
      });

      $("#area_name").val("");
      $("#area_fee").val("");
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

      var validator = $("#register").validate({
        submitHandler: function(event){
          console.log("update");
          // updateArea(Session.get("currentId"), validator);
        }
      });

      $("#area_name").val(this.name);
      $("#area_fee").val(this.fee);

      $("#areas_modal").openModal();
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

  Template.areasModal.events({
    "submit form": function(event, template){
      event.preventDefault();
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
      console.log(error.reason);
    } else{
      var form = validator.currentForm;
      form.reset();

      $("#areas_modal").closeModal();
    }
  });
}

function updateArea(currentId, validator){
  var object = getFields();

  Meteor.call("updateArea", currentId, object, function(error, result){
    if(error){
      console.log(error.reason);
    } else{
      $("#areas_modal").closeModal();
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
