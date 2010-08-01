var tabFiller = "	";

chrome.extension.sendRequest("options", function(response) {
	tabFiller = response.tab_filler;
});

	
$("textarea").live("keydown", function(event) {
	
	var textarea = $(this).get(0);
	var selStart = textarea.selectionStart;
	var selEnd = textarea.selectionEnd;
	
	//tab key
	if(event.which == 9) {
		
		//right shift
		if(!event.shiftKey) {
			
			//no selection
			if(selStart == selEnd) {
				
				textarea.value = textarea.value.substring(0, textarea.selectionStart) + tabFiller + textarea.value.substring(textarea.selectionStart, textarea.value.length);
				textarea.selectionStart = selStart + tabFiller.length;
				textarea.selectionEnd = selEnd + tabFiller.length;
			} else {
				//block selected
				
				//find first line
				var firstLinePos = textarea.value.substring(0,selStart).lastIndexOf("\n") + 1;
				
				var tabbedBlock = textarea.value.substring(firstLinePos, selEnd);
				
				//insert tabs
				var tabInserts = tabbedBlock.match(/\n/g) != null ? tabbedBlock.match(/\n/g).length + 1 : 1;
				tabbedBlock = tabFiller + tabbedBlock.replace(/\n/g,"\n" + tabFiller);
				
				//put block back
				textarea.value = textarea.value.substring(0, firstLinePos) + tabbedBlock + textarea.value.substring(selEnd, textarea.value.length);
				textarea.selectionStart = selStart + tabFiller.length;
				textarea.selectionEnd = selEnd + tabInserts * tabFiller.length;
			}
		} else {
			//left shift
			
			//find first line
			var firstLinePos = textarea.value.substring(0,selStart).lastIndexOf("\n") + 1;
			
			var tabbedBlock = textarea.value.substring(firstLinePos, selEnd);
			
			var fillerPattern = new RegExp("\n"+tabFiller, "g");
			
			//proceed if block starts with tab filler
			if(tabbedBlock.indexOf(tabFiller) == 0) {
				tabbedBlock = tabbedBlock.substring(tabFiller.length);
				
				//count tab removes
				var tabRemoves = tabbedBlock.match(fillerPattern) != null ? tabbedBlock.match(fillerPattern).length + 1: 1;
			
				//remove other tabs
				tabbedBlock = tabbedBlock.replace(fillerPattern,"\n");
				
				//put block back
				textarea.value = textarea.value.substring(0, firstLinePos) + tabbedBlock + textarea.value.substring(selEnd, textarea.value.length);
				textarea.selectionStart = selStart - tabFiller.length;
				textarea.selectionEnd = selEnd - tabRemoves * tabFiller.length;
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
				newLineFiller += tabFiller;
			}
			
			textarea.value = textarea.value.substring(0, selStart) + "\n" + newLineFiller + textarea.value.substring(selEnd, textarea.value.length);
			textarea.selectionStart = selStart + newLineFiller.length + 1;
			textarea.selectionEnd = textarea.selectionStart;
			return false;
		}
	} else if(event.which == 8){
		//backspace
		
		//no selection and tabfiller is found before cursor
		if(selStart == selEnd && selStart > tabFiller.length && textarea.value.substring(selStart - tabFiller.length, selStart) == tabFiller) {
			textarea.value = textarea.value.substring(0, selStart - tabFiller.length) + textarea.value.substring(selEnd, textarea.value.length);
			textarea.selectionStart = selStart - tabFiller.length;
			textarea.selectionEnd = textarea.selectionStart;
			return false;
		}
		
	}
});
		
