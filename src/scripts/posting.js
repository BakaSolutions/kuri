function sendPost(e){
	e.preventDefault();
	// TODO: Проверка валидности всех полей

  // Получаем uri для постинга и список полей ввода
  let form = document.querySelector("#postForm");
	let uri = form.action;

	// Записываем значения всех полей в formData
  let formData = new FormData(form);

	// Асинхронная отправка
	let xhr = new XMLHttpRequest();
	xhr.onload = () => {
		console.log(xhr.responseText);
		try {
      let r = JSON.parse(xhr.responseText);
      if (r.error) {
        throw r.message || r.error;
      }
      asyncLoadPage(`/${r.boardName}/res/${r.threadNumber}.html#${r.number}`);
    } catch (e) {
			//
		}
  };
  xhr.open("POST", uri);
	xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
  xhr.send(formData);
}
