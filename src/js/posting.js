function createNewFileInput() {
	// Skip function execution if input maximum count is already reached
	if (fileInputCounter >= config.fileUpload.maxFiles) return false;

	// Used in enerating new unique file inputs
	const TIMESTAMP = (+new Date).toString().slice(-5);

	// New file input generation
	let row = createElement('div', {
		className: 'row',
		id: `fileInput${TIMESTAMP}`,
		innerHTML: `
			<input type="file" name="file${TIMESTAMP}" id="file${TIMESTAMP}">
			<label for="file${TIMESTAMP}">
				<div class="actionIcon uploadButton"></div><span class="fileName">Нет файла</span>
			</label>
			<input name="encodedFile${TIMESTAMP}" id="encodedFile${TIMESTAMP}" class="hidden">
			<i class="actionIcon delete" onclick="removeFileInput('${TIMESTAMP}')"></i>
			<input type="checkbox" class="hidden" name="file${TIMESTAMP}Rating" id="file${TIMESTAMP}Rating">
			<label class="iconCheckbox nsfw" for="file${TIMESTAMP}Rating"></label>
		`
	});
	
	document.querySelector('#replyForm .column:nth-child(2)').appendChild(row);
	row.onchange = handleFiles;
	
	fileInputCounter++
	lastFileInput = TIMESTAMP;
}

function removeFileInput(timestamp) {
	// Ignore attempts to delete empty file input
	let notEmpty = document.querySelector(`#file${timestamp}`).files[0] || document.querySelector(`#encodedFile${timestamp}`).value;
	if (!notEmpty) return false;

	// Remove
	document.querySelector(`#fileInput${timestamp}`).outerHTML = '';
	fileInputCounter--;
	fullFileInputCounter--;

	// If there're no epty imputs, create a new one
	if (fileInputCounter == fullFileInputCounter) createNewFileInput();
}

function createThread(e, boardName){
	// Ignore link made for schizos with no js
	e.preventDefault();

	// Show reply form
	document.querySelector("#replyFormShow").checked = true;

	// Change widget title
	document.querySelector('#replyForm .boxHandle').innerHTML = 'Новый тред<label for="replyFormShow" class="actionIcon close"></label>';

	// Remove treadNumber input
	if (document.querySelector('input#threadNumber')) document.querySelector('input#threadNumber').outerHTML = '';
};

function quickReply(postNumber, threadNumber) {
	document.querySelector("#replyFormShow").checked = true;

	document.querySelector('#replyForm .boxHandle').innerHTML = 'Новый пост<label for="replyFormShow" class="actionIcon close"></label>';

	if (!document.querySelector('input#threadNumber')) {
		const THREAD_NUMBER_INPUT = createElement('input', {
			type: "hidden",
			id: "threadNumber",
			name: "threadNumber",
			value: threadNumber
		});
		document.querySelector('#replyForm').appendChild(THREAD_NUMBER_INPUT);
	};

	document.querySelector('#replyForm textarea').innerHTML += `>>${postNumber}\n`;
};

let fileInputCounter = 0,
		fullFileInputCounter = 0,
		lastFileInput = '',
		counter = 0;

const BOX_CONTENT = document.querySelector('#replyForm .boxContent');

function checkFile(file) {
	if(config.fileUpload.allowedTypes.indexOf(file.type) > -1){
		return true
	} else{
		(new Notification(file.type ? `Тип файла "${file.type}" не поддерживается!` : `Файл поврежден!`, 'error')).show();
	}
}

function encodeToString(file, target){
	const READER = new FileReader();

	READER.onload = (file => {
		return e => target = e.target.result;
	})(file);

	READER.readAsDataURL(file);
}

function handleFiles(e) {
	e.stopPropagation();
	console.log(e);

	if ((!e.target.files && !e.dataTransfer) || (e.dataTransfer && !e.dataTransfer.files[0])) return false;

	const FILE = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
	if (checkFile(FILE)){
		if (e.dataTransfer) encodeToString(FILE, document.querySelector(`#encodedFile${lastFileInput}`).value);

		fullFileInputCounter++;

		const BUTTON = document.querySelector(`#fileInput${lastFileInput} .uploadButton`);
		const SPAN = document.querySelector(`#fileInput${lastFileInput} span.fileName`);

		document.querySelector(`#fileInput${lastFileInput} label`).style.pointerEvents = 'none';
		SPAN.innerHTML = truncate(FILE.name, 13);

		renderPreview(FILE, BUTTON)

		createNewFileInput();
	}
}

function renderPreview(file, target) {
	if (file.type.match('image.*')) {
		const READER = new FileReader();

		READER.onload = (file => {
			return e => {
				const IMG = createElement('img', {
					src: e.target.result,
					className: 'thumb'
				});

				target.appendChild(IMG);
			};
		})(file);

		READER.readAsDataURL(file);
	} else{
		const DIV = createElement('div', {
			innerHTML: file.name.split('.').pop(),
			className: 'thumb'
		});

		target.appendChild(DIV);
	}
};

function checkReplyForm() {
	if (document.querySelector("#replyForm textarea").value){
		return true
	} else {
		(new Notification('Текст поста не может быть пустым', 'error')).show();
	}
}

function sendPost(){
	// Get posting url and form elements
	const URL = document.querySelector('#replyForm').action,
				INPUTS = document.querySelectorAll("#replyForm input, #replyForm textarea");

	// Create and fill formData
  let formData = new FormData();
	for(let i = 0; i < INPUTS.length; i++){
    formData.append(INPUTS[i].name, INPUTS[i].value);
  }

	checkReplyForm() ? (() => {
		// Create and fulfill XMLHttpRequest
		const XHR = new XMLHttpRequest();
		XHR.onload = () => {
			console.log(XHR.responseText);
		};
	  XHR.open("POST", URL);
	  XHR.send(formData);
	})() : false;
};

// Init
function init() {

}
(() => {
	const DROPZONE = document.querySelector('#dropZone');
	if (DROPZONE) {
		// Replace non-js file inputs with cool ones
		let inputsToRemove = document.querySelectorAll('.row.removeMe');
		for (let i = 0; i < inputsToRemove.length; i++) inputsToRemove[i].outerHTML = '';
		createNewFileInput();
		
		// Init drop zone
		document.addEventListener('dragenter', () => {
			if (counter++ === 0) DROPZONE.classList.add('shown');
		});

		document.addEventListener('dragleave', () => {
		  if (--counter === 0) DROPZONE.classList.remove('shown');
		});	

		DROPZONE.addEventListener('dragover', e => {
			e.preventDefault();
			e.stopPropagation();
			e.dataTransfer.dropEffect = 'copy';
		});

		DROPZONE.addEventListener('drop', e => {
			counter = 0;
			DROPZONE.classList.remove('shown');
			handleFiles(e);
		});

		// Replace form sending with an async function
		document.querySelector('#replyForm button').onclick = (e) => {
			e.preventDefault();
			sendPost();
		}
	}
})();
