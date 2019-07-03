import * as Prism from 'prismjs';

// HTML NODE CONSTANTS
const editorContainer = document.getElementById('editorContainer');
const editor          = document.getElementById('editor');
const lineNoArea      = document.getElementById('lineNoArea');
const textInputArea   = document.getElementById('textInputArea') ;
const cursor          = document.getElementById('cursor');
const cursorWrapper   = document.getElementById('cursorWrapper');

// CONSTANT MEASURMENTS
const CURSOR_HEIGHT = 15;
const CHAR_WIDTH    = 7.8275;
const EDITOR_HEIGHT = CURSOR_HEIGHT*50;
const EDITOR_WIDTH  = CHAR_WIDTH*130;
let lineGutterWidth = 30;

const editorContent   = [];
let currentLineNo     = 0;
let current_line_node = null;

let editBuffer = true;

// SET HIGHT AND WIDTH OF THE EDITOR
editorContainer.style.height = `${window.innerHeight}px`;
editorContainer.style.width  = `${window.innerWidth}px`;
lineNoArea.style.minHeight   = `${window.innerHeight}px`;
lineNoArea.style.width       = `${lineGutterWidth}px`;
editor.style.left            = `${lineGutterWidth+5}px`;
editor.style.minWidth        = `${EDITOR_WIDTH-lineGutterWidth + 5}px`;


// CURSOR BLINKER FUNCTION AND VARIABLES ----------------
let cursorVisibilityToggle = 1;
let blinkerId = null;
let cursorBlinkDelay = 600;
const cursorBlinker = (flag) => {
	if(flag){

		blinkerId = setInterval(() => {
			if(cursorVisibilityToggle){
				cursorWrapper.style.visibility = 'hidden';
				cursorVisibilityToggle = 0;
			}
			else{
				cursorWrapper.style.visibility = '';
				cursorVisibilityToggle = 1;
			}
		},cursorBlinkDelay);
	}
	else{
		clearInterval(blinkerId);
		cursorWrapper.style.visibility = '';
	}
};
// -------------------------------------------------------

const removeCharAtIndex = (str, index) => {
	if(index < str.length){
		str = str.slice(0,index) + str.slice(index+1);
		return str;
	}
};

const removeCharAtCursor = (str, cp) => {
	if(cp <= str.length){
		cp = cp-1;
		str = str.slice(0,cp) + str.slice(cp+1);
		return str;
	}
};

const insertAtCursor = (str, char_, cp) => {
	if(cp <= str.length){
		str = str.slice(0,cp) + char_ + str.slice(cp);
		return str;
	}
};


const addNewLine = () => {
	
	// ADDING LINE NUMBERS ------------------
	let lineNoElement = document.createElement('pre');
	if(currentLineNo < lineNoArea.children.length){
		lineNoElement.innerHTML = lineNoArea.children.length+1;
	}
	else{
		lineNoElement.innerHTML = currentLineNo+1;
	}
	lineNoArea.appendChild(lineNoElement);
	// --------------------------------------

	let lineElement = document.createElement("pre");
	let temp_content = {
		cursorPosition : 0,
		buffer         : '',
		bufferHtml: ''
	}

	lineElement.setAttribute('class','line');

	
	if(currentLineNo == editorContent.length){
		currentLineNo++;
		cursor.style.top = `${(currentLineNo-1)*CURSOR_HEIGHT}px`;
		cursor.style.left = '0px';
		
		editorContent.push(temp_content);
		// textInputArea.innerHTML = html;
		textInputArea.appendChild(lineElement);
	}
	else{
		let prevLineSlice = editorContent[currentLineNo-1].buffer.slice(editorContent[currentLineNo-1].cursorPosition);
		editorContent[currentLineNo-1].buffer = editorContent[currentLineNo-1].buffer.slice(0, editorContent[currentLineNo-1].cursorPosition);
		editorContent[currentLineNo-1].bufferHtml = Prism.highlight(editorContent[currentLineNo-1].buffer, Prism.languages.javascript, 'javascript');
		textInputArea.childNodes[currentLineNo].innerHTML = editorContent[currentLineNo-1].bufferHtml;
		
		let ibn = textInputArea.childNodes[currentLineNo + 1];
		lineElement.innerHTML = prevLineSlice;
		temp_content.buffer = prevLineSlice;

		textInputArea.insertBefore(lineElement, ibn);
		editorContent.splice(currentLineNo, 0, temp_content);
		currentLineNo++;

		cursor.style.top = `${(currentLineNo-1)*CURSOR_HEIGHT}px`;
		cursor.style.left = '0px';
	}
	
}


cursorBlinker(true);
addNewLine();

let ketExclusionList = [27,91,18,17,20];

function handleKeyboardInput(event){
	// console.log(event);
	cursorBlinker(false);

	let input  = event.key;
	let key;
	for(key of ketExclusionList){
		if(event.keyCode === key){
			editBuffer = false;
			event.preventDefault();
			break;
		}
	}
	

	// ENTER KET IS PRESSED
	if(event.keyCode == 13){
		addNewLine();		

		editBuffer = false;
	}
	// DELETE KEY IS PRESSED
	else if(event.keyCode == 8){
		if(editorContent[currentLineNo-1].cursorPosition != 0){

			editorContent[currentLineNo-1].buffer = removeCharAtCursor(editorContent[currentLineNo-1].buffer,editorContent[currentLineNo-1].cursorPosition);
			editorContent[currentLineNo-1].bufferHtml = Prism.highlight(editorContent[currentLineNo-1].buffer, Prism.languages.javascript, 'javascript');

			textInputArea.childNodes[currentLineNo].innerHTML = editorContent[currentLineNo-1].bufferHtml;
			editorContent[currentLineNo-1].cursorPosition--;

			cursor.style.left = `${CHAR_WIDTH*editorContent[currentLineNo-1].cursorPosition}px`;

		}
		else if(currentLineNo != 1){

			let lastLineNoNode = lineNoArea.childNodes[lineNoArea.children.length -1];
			lineNoArea.removeChild(lastLineNoNode);

			let ntbr = textInputArea.childNodes[currentLineNo];
			let ntbrText = editorContent[currentLineNo-1].buffer;
			textInputArea.removeChild(ntbr);
			editorContent.splice(currentLineNo-1, 1);

			currentLineNo--;
			editorContent[currentLineNo-1].cursorPosition = editorContent[currentLineNo-1].buffer.length;
			editorContent[currentLineNo-1].buffer += ntbrText;
			editorContent[currentLineNo-1].bufferHtml = Prism.highlight(editorContent[currentLineNo-1].buffer, Prism.languages.javascript, 'javascript');
			textInputArea.childNodes[currentLineNo].innerHTML = editorContent[currentLineNo-1].bufferHtml;

			cursor.style.top = `${(currentLineNo-1)*CURSOR_HEIGHT}px`;
			cursor.style.left = `${ editorContent[currentLineNo-1].cursorPosition*CHAR_WIDTH }px`;

		}
		editBuffer = false;
	}
	// DOWN KEY IS PRESSED
	else if(event.keyCode == 40){
		if(currentLineNo != editorContent.length){
			currentLineNo++;
			cursor.style.top = `${(currentLineNo-1)*CURSOR_HEIGHT}px`;
			cursor.style.left = `${ editorContent[currentLineNo-1].cursorPosition*CHAR_WIDTH }px`;
		}

		editBuffer = false;
	}
	// UP KEY IS PRESSED
	else if(event.keyCode == 38){
		if(currentLineNo != 1){
			currentLineNo--;
			cursor.style.top = `${(currentLineNo-1)*CURSOR_HEIGHT}px`;
			cursor.style.left = `${ editorContent[currentLineNo-1].cursorPosition*CHAR_WIDTH }px`;

			// console.log(editorContent[currentLineNo-1]);
		}

		editBuffer = false;
	}
	// LEFT KEY IS PRESSED
	else if(event.keyCode == 37){
		if(editorContent[currentLineNo-1].cursorPosition > 0){
			editorContent[currentLineNo-1].cursorPosition--;
			cursor.style.left = `${ editorContent[currentLineNo-1].cursorPosition*CHAR_WIDTH }px`;
		}

		editBuffer = false;
	}
	// RIGHT KEY IS PRESSED
	else if(event.keyCode == 39){
		if(editorContent[currentLineNo-1].buffer.length != editorContent[currentLineNo-1].cursorPosition){
			editorContent[currentLineNo-1].cursorPosition++;
			cursor.style.left = `${ editorContent[currentLineNo-1].cursorPosition*CHAR_WIDTH }px`;

		}

		editBuffer = false;
		console.log(editorContent[currentLineNo-1]);
	}
	else if(event.keyCode == 9){
		event.preventDefault();
		input = '    ';
	}
	// SHIFT KEY IS PRESSED
	else if(event.shiftKey){
		console.log('asidalsdasd');
		if(event.keyCode != 16){
			input = event.key;
		}
		else{
			editBuffer = false
		}
	}

	if(editBuffer){
		let effectiveLineNo = currentLineNo-1;

		editorContent[effectiveLineNo].buffer = insertAtCursor(editorContent[effectiveLineNo].buffer, input, editorContent[effectiveLineNo].cursorPosition ) ;
		editorContent[effectiveLineNo].bufferHtml = Prism.highlight(editorContent[effectiveLineNo].buffer, Prism.languages.javascript, 'javascript');
		editorContent[effectiveLineNo].cursorPosition += input.length;

		// console.log(editorContent);

		cursor.style.left = `${CHAR_WIDTH*editorContent[effectiveLineNo].cursorPosition}px`;
		cursor.style.top = `${effectiveLineNo*CURSOR_HEIGHT}px`;

		// console.log(cursor.style.left);
		// console.log(CHAR_WIDTH*editorContent[effectiveLineNo].cursorPosition);
		textInputArea.childNodes[currentLineNo].innerHTML = editorContent[effectiveLineNo].bufferHtml;
		
		// navigator.clipboard.readText().then(text => {console.log(text);});	


	}

	editBuffer = true;
	cursorBlinker(true);
}

// function handleClickEvent(event){
	// // console.log(event);
	// console.log(Math.ceil(event.layerX/CHAR_WIDTH));
	// console.log(Math.ceil(event.layerY/CURSOR_HEIGHT));

	// let cursorLineNo = Math.ceil(event.layerY/CHAR_WIDTH);
	// let cursorCharNo = Math.ceil(event.layerX/CURSOR_HEIGHT);
	
	// currentLineNo = cursorLineNo;
	// editorContent[currentLineNo-1].cursorPosition = cursorCharNo;

	// cursor.style.left = `${CHAR_WIDTH*editorContent[currentLineNo-1].cursorPosition}px`;
	// cursor.style.top = `${( currentLineNo-1)*CURSOR_HEIGHT}px`;


	
// }

window.addEventListener('keydown',handleKeyboardInput);
// editor.addEventListener('click', handleClickEvent);
