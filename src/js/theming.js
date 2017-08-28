function setTheme(name = 'tumbach') {
  document.querySelector('body').dataset.theme = name;
	document.cookie = `theme=${name}; expires=31 Dec 9999 23:59:59 GMT; path=/`;
};

function applyColor() {
	const THEME = document.querySelectorAll('[type="color"]');
	const MANUAL_EDITOR = document.querySelector('#generatedTheme');
	MANUAL_EDITOR.innerHTML = '';

	for (let i = 0; i < THEME.length; i++){
		const STRING = THEME[i];
		MANUAL_EDITOR.innerHTML += `--${STRING.getAttribute('name')}: ${STRING.value};\n`;
	}

	document.querySelector('style#customTheme').innerHTML = `body[data-theme="custom"]{${MANUAL_EDITOR.innerHTML}}`;
};

setTheme(getCookie("theme"));
