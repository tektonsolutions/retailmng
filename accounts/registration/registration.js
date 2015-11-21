if(Meteor.isClient){
  Template.register.events({
    'submit form': function(event){
       event.preventDefault();
    }
  });

  Template.register.onRendered(function(){
    $('.register').validate({
        rules: {

        },
        messages:{

        },

    });
  });
}
