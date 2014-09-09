$("#username").html(currentUser.name);
function initMain(){
 var tabs = $( "#content" ).tabs();
 var tabTemplate = "<li><a href='#tabs-admin'>Admin</a></li>";      
	if(currentUser.role=="ADMIN"){		
		var li=$(tabTemplate);
		tabs.find( ".ui-tabs-nav" ).append( li );
		tabs.append( "<div id='tabs-admin'><p>Admin</p></div>" );
		tabs.tabs( "refresh" );
	}else
	{
		
	}
}