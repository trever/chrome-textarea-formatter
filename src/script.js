var enabled = true;

//default options
var options = {
	tab_filler : "	",
	space_cnt : 4,
	default_state : "enabled",
	icon : "focus"
};

function textareaFormatter(event) {
	
	var textarea = $(this).get(0);
	var selStart = textarea.selectionStart;
	var selEnd = textarea.selectionEnd;
	
	//tab key
	if(event.which == 9) {
		
		//right shift
		if(!event.shiftKey) {
			
			//no selection
			if(selStart == selEnd) {
				
				textarea.value = textarea.value.substring(0, textarea.selectionStart) + options.tab_filler + textarea.value.substring(textarea.selectionStart, textarea.value.length);
				textarea.selectionStart = selStart + options.tab_filler.length;
				textarea.selectionEnd = selEnd + options.tab_filler.length;
			} else {
				//block selected
				
				//find first line
				var firstLinePos = textarea.value.substring(0,selStart).lastIndexOf("\n") + 1;
				
				var tabbedBlock = textarea.value.substring(firstLinePos, selEnd);
				
				//insert tabs
				var tabInserts = tabbedBlock.match(/\n/g) != null ? tabbedBlock.match(/\n/g).length + 1 : 1;
				tabbedBlock = options.tab_filler + tabbedBlock.replace(/\n/g,"\n" + options.tab_filler);
				
				//put block back
				textarea.value = textarea.value.substring(0, firstLinePos) + tabbedBlock + textarea.value.substring(selEnd, textarea.value.length);
				textarea.selectionStart = selStart + options.tab_filler.length;
				textarea.selectionEnd = selEnd + tabInserts * options.tab_filler.length;
			}
		} else {
			//left shift
			
			//find first line
			var firstLinePos = textarea.value.substring(0,selStart).lastIndexOf("\n") + 1;
			
			var tabbedBlock = textarea.value.substring(firstLinePos, selEnd);
			
			var fillerPattern = new RegExp("\n"+options.tab_filler, "g");
			
			//proceed if block starts with tab filler
			if(tabbedBlock.indexOf(options.tab_filler) == 0) {
				tabbedBlock = tabbedBlock.substring(options.tab_filler.length);
				
				//count tab removes
				var tabRemoves = tabbedBlock.match(fillerPattern) != null ? tabbedBlock.match(fillerPattern).length + 1: 1;
			
				//remove other tabs
				tabbedBlock = tabbedBlock.replace(fillerPattern,"\n");
				
				//put block back
				textarea.value = textarea.value.substring(0, firstLinePos) + tabbedBlock + textarea.value.substring(selEnd, textarea.value.length);
				textarea.selectionStart = selStart - options.tab_filler.length;
				textarea.selectionEnd = selEnd - tabRemoves * options.tab_filler.length;
			}
		}
		return false;
	} else if(event.which == 13){
		//enter key
		
		//no selection
		if(selStart == selEnd) {
		
			//find first line
			var firstLinePos = textarea.value.substring(0,selStart).lastIndexOf("\n") + 1;
			
			//make new line filler
			var selLine = textarea.value.substring(firstLinePos, selStart);
			var newLineFiller = "";
			var fillerMatch = selLine.match(/^\s*/);
			if(fillerMatch != null) {
				newLineFiller = fillerMatch[0];
			}
			
			//check for open brackets
			if(selLine.match(/[\{\[\(]\s*$/) != null) {
				newLineFiller += options.tab_filler;
			}
			
			textarea.value = textarea.value.substring(0, selStart) + "\n" + newLineFiller + textarea.value.substring(selEnd, textarea.value.length);
			textarea.selectionStart = selStart + newLineFiller.length + 1;
			textarea.selectionEnd = textarea.selectionStart;
			return false;
		}
	} else if(event.which == 8){
		//backspace
		
		//no selection and tabfiller is found before cursor
		if(selStart == selEnd && selStart > options.tab_filler.length && textarea.value.substring(selStart - options.tab_filler.length, selStart) == options.tab_filler) {
			textarea.value = textarea.value.substring(0, selStart - options.tab_filler.length) + textarea.value.substring(selEnd, textarea.value.length);
			textarea.selectionStart = selStart - options.tab_filler.length;
			textarea.selectionEnd = textarea.selectionStart;
			return false;
		}
		
	}
}

function toggleState() {
	enabled = !enabled;
	if(enabled) {
		$("textarea").live("keydown", textareaFormatter);
	} else {
		$("textarea").die("keydown");
	}
}
		
chrome.extension.sendRequest({"cmd":"options"}, function(response) {
	options = response;
	
	if(options.default_state == "enabled") {
		$("textarea").live("keydown", textareaFormatter);
		enabled = true;
	} else {
		enabled = false; 
	}
	
	if(options.icon == "focus") {
		$("textarea").live("focus", function(event) {
			chrome.extension.sendRequest({"cmd":"show_icon","enabled":enabled});
		});
	} else if(options.icon == "show") {
		chrome.extension.sendRequest({"cmd":"show_icon","enabled":enabled});
	} 
	
});

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	if(request == "toggle_state") {
		toggleState();
		sendResponse({"enabled":enabled});
	}
}); 