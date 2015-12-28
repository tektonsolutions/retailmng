if(Meteor.isClient){
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
      } else {
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
      //employees
      emp_name:{
        required: true
      },
      role: {
        required: true
      },
      //units
      unit_shortname:{
        required: true,
        minlength: 1
      },
      //delivery areas
      area_name: {
        required: true
      },
      area_fee: {
        required: true
      },
      //suppliers
      sup_name:{
        required: true
      },
      sup_contact:{
        required: true
      },
      sup_address:{
        required: true
      },
      sup_person:{
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
        equalTo: "Passwords don't match."
      },
      //employees
      emp_name:{
        required: "You must enter a name."
      },
      role:{
        required: "Please select a position."
      },
      //units
      unit_shortname:{
        required: "You must enter a short name.",
        minlength: "Short name must be at least {0} character."
      },
      //delivery areas
      area_name: {
        required: "You must enter the area name."
      },
      area_fee: {
        required: "You must enter a fee."
      },
      //suppliers
      sup_name:{
        required: "You must enter a name."
      },
      sup_contact:{
        required: "You must enter a contact number."
      },
      sup_address:{
        required: "You must enter an address."
      },
      sup_person:{
        required: "You must enter a contact person."
      }
    }
  });
}
