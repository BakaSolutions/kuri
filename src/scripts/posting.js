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
		let message = xhr.responseText;
		try {
      let r = JSON.parse(xhr.responseText);
      message = r.message || r.error;
      if (xhr.status < 400) {
        asyncLoadPage(`/${r.boardName}/res/${r.threadNumber}.html#${r.number}`);
      }
    } catch (e) {
			//
		} finally {
      notifications.add({
        text: message,
        timeout: 10000,
        class: 'notification'
      });
    }
  };
	xhr.onerror = () => {
	  let message = "CORS problems?";
    try {
      let r = JSON.parse(xhr.responseText);
      if (r.error) {
        message =  r.message || r.error;
      }
    } catch (e) {
      //
    }
    notifications.add({
      text: message,
      timeout: 10000,
      class: 'notification'
    });
  };
  xhr.open("POST", uri);
	xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
  xhr.send(formData);
}
