Categories = new Mongo.Collection("categories");

CategoriesIndex = new EasySearch.Index({
  collection: Categories,
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
  Template.categories.onCreated(function (){
    this.subscribe("categories");
  });

  Template.categories.helpers({
    categoriesIndex: function(){
      return CategoriesIndex;
    },
    categoriesSearchAttributes: function(){
      return {"id": "icon_prefix", "class": "search-table validate", "type": "text" };
    }
  });

  Template.categories.events({
    "click #category_create": function(event, template){
      Session.set("currentMethod", "create");
      template.find("form").reset();
    }
  });

  Template.category.events({
    "click #category_delete": function(event){
       var currentId = this._id;
       var r = confirm("Delete?");
       if(r === true){
         Meteor.call("deleteCategory", currentId, function(error, result){
           if(error){
             console.log(error.reason);
           }
         });
       }
    },
    "click #category_update": function(event){
      var currentId = this._id;
      Session.set("currentId", currentId);
      Session.set("currentMethod", "update");
      $("#register")[0].reset();

      $("#category_name").val(this.name);
      $("#category_shortname").val(this.shortname);

      $("#category_modal").openModal();
    }
  });

  Template.categoriesList.helpers({
    categoriesIndex: function(){
      return CategoriesIndex;
    },
    categoriesCount: function(){
      return CategoriesIndex.getComponentDict().get("count");
    }
  });

  Template.categoryModal.events({
    "submit form": function(event, template){
      event.preventDefault();

      var validator = $("#register").validate();
      var valid = $("#register").valid();
      var currentMethod = Session.get("currentMethod");

      if(valid){
        if(currentMethod === "create"){
          createCategory(validator);
        }
        if(currentMethod === "update"){
          updateCategory(Session.get("currentId"), validator);
        }
      }
    }
  });
}

function getFields(){
  var currentUser = Meteor.userId();
  var name = $("#category_name").val();
  var shortname = $("#category_shortname").val();

  var object = {
    name: name,
    shortname: shortname,
    createdBy: currentUser
  };

  return object;
}

function createCategory(validator){
  Meteor.call("createCategory", getFields(), function(error, result){
    if(error){
      if(error.error === "duplicate-shortname"){
        validator.showErrors({
          category_shortname: error.reason
        });
      }
    } else{
      var form = validator.currentForm;
      form.reset();
    }
  });
}

function updateCategory(currentId, validator){
  var object = getFields();

  Meteor.call("updateCategory", currentId, object, function(error, result){
    if(error){
      if(error.error === "duplicate-shortname"){
        validator.showErrors({
          category_shortname: error.reason
        });
      }
    } else{
      $("#category_modal").closeModal();
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
  Categories._ensureIndex({shortname: 1}, {unique: 1});

  Meteor.publish("categories", function(argument){
      var currentUser = this.userId;
      if(Meteor.myFunctions.isAdmin(currentUser)){
        return Categories.find({"createdBy": currentUser});
      }
  });

  Meteor.methods({
    createCategory: function(object){
      var currentUser = Meteor.userId();

      if(Meteor.myFunctions.isAdmin(currentUser)){
        if(!isSafe(object)){
          console.log("not safe");
        } else {
          try {
            Categories.insert(object);
          } catch(e) {
            if(e.toString().indexOf("shortname") > - 1){
              throw new Meteor.Error("duplicate-shortname", "Short name is already taken.");
            }
            //do name
          }
        }
      }
    },
    updateCategory: function(currentId, object){
      var currentUser = Meteor.userId();

      if(Meteor.myFunctions.isAdmin(currentUser)){
        if(!isSafe(object)){
          console.log("not safe");
        } else {
          try{
            Categories.update({"_id": currentId}, {$set: {
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
    deleteCategory: function(currentId){
      var currentUser = Meteor.userId();

      if(Meteor.myFunctions.isAdmin(currentUser)){
        Categories.remove({"_id":currentId, "createdBy": currentUser});
      }
    }
  });
}
