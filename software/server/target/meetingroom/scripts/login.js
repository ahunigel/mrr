$( "#loginForm" ).submit(function( event ) {
 
  // Stop form from submitting normally
  event.preventDefault();
 
  // Get some values from elements on the page:
 
    url ="ws/users/login";
 
  // Send the data using post
  var posting = $.post( url, $( this ).serialize() );
  
  // Put the results in a div
  posting.done(function( data ) {
    if(data){

    	$("#errorMessage").html("");
    	$("#loginForm").remove();
    	$("#main").html(data.name);
    	
    }else{
    	$("#errorMessage").html("Invalid Username or Password.");
    }
   
  });
});