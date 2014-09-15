var currentUser=null;

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
    	currentUser=data;
    	$("#errorMessage").html("");
//    	$("#loginForm").remove();
    	$('body').load('main.html');
    }else{
    	currentUser=null;
    	$("#errorMessage").html("Invalid Username or Password.");
    }
   
  });
});