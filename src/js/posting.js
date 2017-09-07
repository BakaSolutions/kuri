function createNewFileInput() {
	// Skip function fulfillment if input max count is already reached
	if (fileInputCounter >= config.fileUpload.maxFiles) return false;

	fileInputCounter++
	// Used for generating new unique file inputs
	const TIMESTAMP = (+new Date).toString().slice(-5);

	// Generation
	const DIV = createElement('div', {
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
	DIV.addEventListener("change", handleFiles);

	lastFileInput = TIMESTAMP;
	document.querySelector('#replyForm .column:nth-child(2)').appendChild(DIV);
}

function removeFileInput(timestamp) {
	const NOT_EMPTY = document.querySelector(`#file${timestamp}`).files[0] || document.querySelector(`#encodedFile${lastFileInput}`).value;
	if (!NOT_EMPTY) return false;

	document.querySelector(`#fileInput${timestamp}`).outerHTML = '';
	fileInputCounter--;
	fullFileInputCounter--;

	if (fileInputCounter == fullFileInputCounter) createNewFileInput();
}

function createThread(e, boardName){
	// Ignore link for non-js browsers
	e.preventDefault();

	// Show reply form
	document.querySelector("#replyFormShow").checked = true;

	document.querySelector('#replyForm .boxHandle').innerHTML = 'Новый тред<label for="replyFormShow" class="actionIcon close"></label>';
	if (document.querySelector('input#threadNumber')) {
		document.querySelector('input#threadNumber').outerHTML = '';
	}
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
	// Replace non-js file inputs with cool ones
	const INPUTS_TO_REMOVE = document.querySelectorAll('.row.removeMe');
	while (document.querySelector('.row.removeMe')) document.querySelector('.row.removeMe').outerHTML = '';
	createNewFileInput();

	// Init drop zone
	document.addEventListener('dragenter', () => {
		if (counter++ === 0) DROPZONE.classList.add('shown');
	});

	document.addEventListener('dragleave', () => {
	  if (--counter === 0) DROPZONE.classList.remove('shown');
	});

	const DROPZONE = document.querySelector('#dropZone');

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
})();
