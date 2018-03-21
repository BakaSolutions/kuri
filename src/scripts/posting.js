function sendPost(e){
	e.preventDefault();
	// TODO: Проверка валидности всех полей

	// Получаем uri для постинга и список полей ввода
	let uri = document.querySelector('#postForm').action,
			inputs = document.querySelectorAll("#postForm input, #postForm textarea");

	// Записываем значения всех полей в formData
  let formData = new FormData();
	for(let inp of inputs) formData.append(inp.name, inp.value);

	// Асинхронная отправка
	let xhr = new XMLHttpRequest();
	xhr.onload = () => console.log(xhr.responseText);
  xhr.open("POST", uri);
	xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
  xhr.send(formData);
};
