$(document).ready(function(){
	loadOptions();
});

function saveOptions() {
			
	var space_cnt = $("#space_cnt").val();
	
	//check spaces count
	if(space_cnt.length == 0 || space_cnt == "0" || !space_cnt.match(/^\d+$/)) {
		alert("Please enter positive numeric value");
		$("#space_cnt").focus();
		return false;
	}
	
	//save space count
	localStorage["space_cnt"] = space_cnt;
	
	//save tab filler
	localStorage["tab_filler"] = $("input[name=tab_filler]:checked").val(); 
	
	//save default state
	localStorage["default_state"] = $("input[name=default_state]:checked").val();

	//save icon
	localStorage["icon"] = $("input[name=icon]:checked").val();
	
	$("#form_status").show();
	setTimeout(function() {
		$("#form_status").fadeOut("slow");
	}, 1000);

}

function loadOptions() {
	var tab_filler = localStorage["tab_filler"];
	var space_cnt = localStorage["space_cnt"];
	var default_state = localStorage["default_state"];
	var icon = localStorage["icon"];
	
	if(tab_filler == "space") {
		$("#tab_filler_space").attr("checked", true);
	} else {
		$("#tab_filler_tab").attr("checked", true);
	}
	
	if(space_cnt != null) {
		$("#space_cnt").val(space_cnt);
	}
	
	if(default_state == "disabled") {
		$("#default_state_disabled").attr("checked", true);
	} else {
		$("#default_state_enabled").attr("checked", true);
	}
	
	if(icon == "show") {
		$("#icon_show").attr("checked", true);
	} else if(icon == "hide") {
		$("#icon_hide").attr("checked", true);
	} else {
		$("#icon_focus").attr("checked", true);
	}
	
  
}