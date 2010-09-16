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
	var scrollTop = textarea.scrollTop;
	var scrollLeft = textarea.scrollLeft;
	
	
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
			
			
			//shift block if it starts with filler or space
			if(tabbedBlock.indexOf(options.tab_filler) == 0 || tabbedBlock.search(/\s/) == 0) {
				var filler = options.tab_filler;
				var fillerPattern = new RegExp("\n"+options.tab_filler, "g");
				
				//no filler but space
				if(tabbedBlock.indexOf(options.tab_filler) != 0) {
					filler = " ";
					fillerPattern = new RegExp("\n\\s", "g");
				}
			
				tabbedBlock = tabbedBlock.substring(filler.length);
				
				//count tab removes
				var tabRemoves = tabbedBlock.match(fillerPattern) != null ? tabbedBlock.match(fillerPattern).length + 1: 1;
			
				//remove other tabs
				tabbedBlock = tabbedBlock.replace(fillerPattern,"\n");
				
				//put block back
				textarea.value = textarea.value.substring(0, firstLinePos) + tabbedBlock + textarea.value.substring(selEnd, textarea.value.length);
				textarea.selectionStart = selStart - filler.length;
				textarea.selectionEnd = selEnd - tabRemoves * filler.length;
			}
			
		}
		
		//lock scrolling
		textarea.scrollTop = scrollTop;
		textarea.scrollLeft = scrollLeft;
		
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
			
			if(newLineFiller.length > 0) {
				textarea.value = textarea.value.substring(0, selStart) + "\n" + newLineFiller + textarea.value.substring(selEnd, textarea.value.length);
				textarea.selectionStart = selStart + newLineFiller.length + 1;
				textarea.selectionEnd = textarea.selectionStart;
				
				//lock scrolling
				textarea.scrollTop = scrollTop + 16;
				textarea.scrollLeft = scrollLeft;
				
				return false;
			}
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
		
	} else if(event.altKey && !event.ctrlKey && event.which == 38){
		//move up
		
		var emptyLineAdded = false;
		
		//select block
		var firstLinePos = textarea.value.substring(0,selStart).lastIndexOf("\n") + 1;
		var lastLinePos = textarea.value.substring(selEnd, textarea.value.length).indexOf("\n");
		
		if(lastLinePos == -1) {
			textarea.value = textarea.value + "\n";
			lastLinePos = textarea.value.length;
			emptyLineAdded = true;
		} else {
			lastLinePos += selEnd + 1;
		}
		
		//find previuos line
		if(firstLinePos > 1) {
			var prevLineStart = textarea.value.substring(0,firstLinePos-1).lastIndexOf("\n") + 1;
			if(textarea.value.substring(prevLineStart, firstLinePos).length > 0) {
				//get block before prev line
				var text = textarea.value.substring(0,prevLineStart);
				
				//add selected block
				text += textarea.value.substring(firstLinePos, lastLinePos);
				
				//add prev line 
				if(!emptyLineAdded) {
					text += textarea.value.substring(prevLineStart, firstLinePos);
				} else {
					text += textarea.value.substring(prevLineStart, firstLinePos-1);
				}
				
				//add the rest
				text += textarea.value.substring(lastLinePos, textarea.value.length);
				
				textarea.value = text;
				
				textarea.selectionStart = firstLinePos - (firstLinePos - prevLineStart);
				textarea.selectionEnd = lastLinePos - (firstLinePos - prevLineStart)-1;
				
				//fix scrolling
				textarea.scrollTop = scrollTop - 16;
				textarea.scrollLeft = scrollLeft;
			}
		}
		
		
	} else if(event.altKey && !event.ctrlKey && event.which == 40){
		//move down
		
		//select block
		var firstLinePos = textarea.value.substring(0,selStart).lastIndexOf("\n") + 1;
		var lastLinePos = textarea.value.substring(selEnd, textarea.value.length).indexOf("\n");
		
		if(lastLinePos == -1) {
			lastLinePos = textarea.value.length;
		} else {
			lastLinePos += selEnd+1;
		}
		
		//find next line
		if(lastLinePos < textarea.value.length) {
			var nextLineEnd = textarea.value.substring(lastLinePos, textarea.value.length).indexOf("\n");
			var emptyLineAdded = false;
			
			if(nextLineEnd == - 1) {
				textarea.value = textarea.value + "\n";
				nextLineEnd = textarea.value.length;
				emptyLineAdded = true;
			} else {
				nextLineEnd += lastLinePos+1;
			}
			
			if(textarea.value.substring(lastLinePos, nextLineEnd).length > 0) {
				//get block before selection
				var text = textarea.value.substring(0,firstLinePos);
				
				//add next line
				text += textarea.value.substring(lastLinePos, nextLineEnd);
				
				//add selected block
				if(!emptyLineAdded) {
					text += textarea.value.substring(firstLinePos, lastLinePos);
				} else {
					text += textarea.value.substring(firstLinePos, lastLinePos-1);
				}
				
				//add the rest
				text += textarea.value.substring(nextLineEnd, textarea.value.length);
				
				textarea.value = text;
				
				textarea.selectionStart = firstLinePos + (nextLineEnd - lastLinePos);
				textarea.selectionEnd = lastLinePos + (nextLineEnd - lastLinePos) -1;
				
				//fix scrolling
				textarea.scrollTop = scrollTop + 16;
				textarea.scrollLeft = scrollLeft;
			}
		}
	} else if(event.ctrlKey && event.which == 38){
		//copy up
		
		var emptyLineAdded = false;
		
		//select block
		var firstLinePos = textarea.value.substring(0,selStart).lastIndexOf("\n") + 1;
		var lastLinePos = textarea.value.substring(selEnd, textarea.value.length).indexOf("\n");
		
		if(lastLinePos == -1) {
			textarea.value = textarea.value + "\n";
			lastLinePos = textarea.value.length;
			emptyLineAdded = true;
		} else {
			lastLinePos += selEnd + 1;
		}
			
		//get block before selected block
		var text = textarea.value.substring(0,firstLinePos);
		
		//add selected block twice
		text += textarea.value.substring(firstLinePos, lastLinePos);
		if(!emptyLineAdded) {
			text += textarea.value.substring(firstLinePos, lastLinePos);
		} else {
			text += textarea.value.substring(firstLinePos, lastLinePos-1);
		}
		
		//add the rest
		text += textarea.value.substring(lastLinePos, textarea.value.length);
		
		textarea.value = text;
		
		textarea.selectionStart = firstLinePos;
		textarea.selectionEnd = lastLinePos-1;
		
		//fix scrolling
		textarea.scrollTop = scrollTop;
		textarea.scrollLeft = scrollLeft;
		
		return false;
		
	} else if(event.ctrlKey && event.which == 40){
		//copy down
		
		var emptyLineAdded = false;
		
		//select block
		var firstLinePos = textarea.value.substring(0,selStart).lastIndexOf("\n") + 1;
		var lastLinePos = textarea.value.substring(selEnd, textarea.value.length).indexOf("\n");
		
		if(lastLinePos == -1) {
			textarea.value = textarea.value + "\n";
			lastLinePos = textarea.value.length;
			emptyLineAdded = true;
		} else {
			lastLinePos += selEnd + 1;
		}
			
		//get block before selected block
		var text = textarea.value.substring(0,firstLinePos);
		
		//add selected block twice
		text += textarea.value.substring(firstLinePos, lastLinePos);
		if(!emptyLineAdded) {
			text += textarea.value.substring(firstLinePos, lastLinePos);
		} else {
			text += textarea.value.substring(firstLinePos, lastLinePos-1);
		}
		
		//add the rest
		text += textarea.value.substring(lastLinePos, textarea.value.length);
		
		textarea.value = text;
		
		textarea.selectionStart = firstLinePos + (lastLinePos - firstLinePos);
		textarea.selectionEnd = lastLinePos + (lastLinePos - firstLinePos) - 1;
		
		//fix scrolling
		textarea.scrollTop = scrollTop + 16;
		textarea.scrollLeft = scrollLeft;
		
		return false;
		
	} else if(event.ctrlKey && event.which == 68){
		//delete line
		
		//select block
		var firstLinePos = textarea.value.substring(0,selStart).lastIndexOf("\n") + 1;
		var lastLinePos = textarea.value.substring(selEnd, textarea.value.length).indexOf("\n");
		
		if(lastLinePos == -1) {
			lastLinePos = textarea.value.length;
		} else {
			lastLinePos += selEnd + 1;
		}
			
		//get block before selected block
		var text = textarea.value.substring(0,firstLinePos);
		
		//add the rest
		text += textarea.value.substring(lastLinePos, textarea.value.length);
		
		textarea.value = text;
		
		textarea.selectionStart = firstLinePos;
		textarea.selectionEnd = textarea.selectionStart;
		
		//fix scrolling
		textarea.scrollTop = scrollTop;
		textarea.scrollLeft = scrollLeft;
		
		return false;
		
	} else if(event.which == 36 && !event.ctrlKey && !event.altKey && !event.shiftKey){
		//home
		
		//select current line
		var firstLinePos = textarea.value.substring(0,selEnd).lastIndexOf("\n") + 1;
		var lastLinePos = textarea.value.substring(selEnd, textarea.value.length).indexOf("\n");
		
		if(lastLinePos == -1) {
			lastLinePos = textarea.value.length;
		} else {
			lastLinePos += selEnd + 1;
		}
		
		var line = textarea.value.substring(firstLinePos, lastLinePos);
		
		//find first non empty char
		var firstChar = line.search(/\S/);
		
		
		//if cursor is not at this position already, otherwise default behavior
		if(firstChar!= -1 && firstLinePos + firstChar != selStart) {
		
			textarea.selectionEnd = firstLinePos + firstChar;
			textarea.selectionStart = textarea.selectionEnd;
			
			//fix scrolling
			textarea.scrollTop = scrollTop;
			textarea.scrollLeft = scrollLeft;
			
			return false;
		}
		
	} else if(event.which == 36 && event.shiftKey && !event.ctrlKey && !event.altKey ){
		//shift+home and no selection
		
		//select current line
		var firstLinePos = textarea.value.substring(0,selStart).lastIndexOf("\n") + 1;
		var lastLinePos = textarea.value.substring(selEnd, textarea.value.length).indexOf("\n");
		
		if(lastLinePos == -1) {
			lastLinePos = textarea.value.length;
		} else {
			lastLinePos += selEnd + 1;
		}
		
		var line = textarea.value.substring(firstLinePos, lastLinePos);
		
		//only if no multiline selection
		if(line.indexOf("\n") == line.lastIndexOf("\n")) {
		
			//find first non empty char
			var firstChar = line.search(/\S/);
			
			
			//if cursor is not at this position already
			if(firstChar!= -1) {
				if(firstLinePos + firstChar != selStart) {
					textarea.selectionStart = firstLinePos + firstChar;
					textarea.selectionEnd = selEnd;
				} else {
					textarea.selectionStart = firstLinePos;
					textarea.selectionEnd = selEnd;
				}
				
				//fix scrolling
				textarea.scrollTop = scrollTop;
				textarea.scrollLeft = scrollLeft;
				
				return false;
			}
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
