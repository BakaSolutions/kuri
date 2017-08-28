function createNewFileInput() {
	if (fileInputCounter >= config.fileUpload.maxFiles) return false;

	fileInputCounter++

	const TIMESTAMP = (+new Date).toString().slice(-5);
	const DIV = document.createElement('div');
	DIV.id = `fileInput${TIMESTAMP}`;
	DIV.className = 'row';
	DIV.innerHTML = `
		<input type="file" name="file${TIMESTAMP}" id="file${TIMESTAMP}">
		<label for="file${TIMESTAMP}">
			<div class="actionIcon uploadButton"></div><span class="fileName">Нет файла</span>
		</label>
		<input name="encodedFile${TIMESTAMP}" id="encodedFile${TIMESTAMP}" class="hidden">
		<i class="actionIcon delete" onclick="removeFileInput('${TIMESTAMP}')"></i>
		<input type="checkbox" class="hidden" name="file${TIMESTAMP}Rating" id="file${TIMESTAMP}Rating">
		<label class="iconCheckbox nsfw" for="file${TIMESTAMP}Rating">
	`

	DIV.addEventListener("change", handleFiles);

	lastFileInput = TIMESTAMP;
	document.querySelector('#replyForm .column:nth-child(2)').appendChild(DIV);
}

function removeFileInput(timestamp) {
	const EMPTY = document.querySelector(`#file${timestamp}`).files[0] || document.querySelector(`#encodedFile${lastFileInput}`).value ? false : true;
	if (EMPTY) return false;

	document.querySelector(`#fileInput${timestamp}`).outerHTML = '';
	fileInputCounter--;
	fullFileInputCounter--;

	if (fileInputCounter == fullFileInputCounter) createNewFileInput();
}

function createThread(e, boardName){
	e.preventDefault();
	e.stopPropagation();
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
		const THREAD_NUMBER_INPUT = document.createElement('input');
		document.querySelector('#replyForm').appendChild(THREAD_NUMBER_INPUT);
		THREAD_NUMBER_INPUT.outerHTML = `<input type="hidden" id="threadNumber" name="threadNumber" value="${threadNumber}">`
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
		if (file.type) {
			(new Notification(`Тип файла "${file.type}" не поддерживается!`, 'error')).show();
		} else {
			(new Notification(`Файл поврежден!`, 'error')).show();
		}
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
	e.preventDefault();
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
				const IMG = document.createElement('img');
				IMG.src = e.target.result;
				IMG.className = 'thumb';

				target.appendChild(IMG);
			};
		})(file);

		READER.readAsDataURL(file);
	} else{
		const DIV = document.createElement('div');
		DIV.innerHTML = file.name.split('.').pop();
		DIV.className = 'thumb';

		target.appendChild(DIV);
	}
}

(() => {
	// Замена nojs полей для файлов на красивенькие
	const INPUTS_TO_REMOVE = document.querySelectorAll('.row.removeMe');

	while (document.querySelector('.row.removeMe')) {
		console.log('Removed file input!');
		document.querySelector('.row.removeMe').outerHTML = '';
	}

	createNewFileInput();


	const DROPZONE = document.querySelector('#dropZone');

// Появление формы дропа
	document.addEventListener('dragenter', () => {
		if (counter++ === 0) DROPZONE.classList.add('shown');
	});

	document.addEventListener('dragleave', () => {
	  if (--counter === 0) DROPZONE.classList.remove('shown');
	});

// Функционал формы дропа
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
})();
