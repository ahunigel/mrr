$("#username").html(currentUser.name);
function initMain(){
 var tabs = $( "#content" ).tabs();
 var tabTemplate = "<li><a href='#tabs-admin'>Admin</a></li>";      
	if(currentUser.role=="ADMIN"){		
		var li=$(tabTemplate);
		tabs.find( ".ui-tabs-nav" ).append( li );
		tabs.append( "<div id='tabs-admin'><table id='meetingroom'></table><div id='meetingRoomPager'></div></div>" );
		tabs.tabs( "refresh" );
		$.get( "html/mr.html", function( data ) {
			$("#tabs-admin").html(data);}
		);
		//initAdmin();
	}else
	{
		
	}
}
function initAdmin(){
	jQuery("#meetingroom").jqGrid({        
	   	url:'ws/meetingrooms',
	   	height:'100%',
		datatype: "json",
	   	colNames:['Name','Floor','Location','Seats'],
	   	colModel:[
	   		{name:'name',index:'name', editable:true, width:150},
	   		{name:'floor',index:'floor', editable:true, width:150},
		   	{name:'location',index:'location', editable:true, width:150},
		   	{name:'seats',index:'seats', editable:true, width:150}      
	   		],
	   	rowNum:30,
	   	rowList:[10,20,30],
		pager: '#meetingRoomPager',
	   	sortname: 'id',
	    viewrecords: true,
	    sortorder: "desc",
	    caption:"Meeting Rooms",
	    editurl:"ws/meetingrooms",
	    subGrid: false
	});
}