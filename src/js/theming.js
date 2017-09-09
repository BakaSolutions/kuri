let themes = {
  tumbach: {
  	'theme-name': 'Tumbach',
  	'text-color': '#e1efff',
  	'link-color': '#79bde2',
  	'link-hover-color': '#5496b9',
  	'background-color': '#10161f',
  	'foreground-color': '#141e27',
  	'header-color': '#18252f',
  	'animation-duration': '.3s',
  	'sidebar-color': 'var(--foreground-color)',
  	'sidebar-image': 'var(--foreground-image)',
  },

  tumbachLight: {
  	'theme-name': 'Tumbach Light',
  	'text-color': '#000',
  	'link-color': '#08F',
  	'link-hover-color': '#038',
  	'background-color': '#fff',
  	'foreground-color': '#ccecf4',
  	'header-color': '#b2e2ee',
  }
}

function setTheme(name) {
  let stylesheet = ':root{';

  for (let key in themes[name]) {
    stylesheet += `--${key}:${themes[name][key]};`;
  }

  stylesheet += '}';

  document.querySelector('style#theme').innerHTML = stylesheet;
  localStorage.theme = stylesheet;
};

// Recover theme from local storage on load
localStorage.theme ? (() => {
  document.querySelector('style#theme').innerHTML = localStorage.theme;
})() : setTheme('tumbach');

/*function applyColor() {
const THEME = document.querySelectorAll('[type="color"]');
const MANUAL_EDITOR = document.querySelector('#generatedTheme');
MANUAL_EDITOR.innerHTML = '';

for (let i = 0; i < THEME.length; i++){
const STRING = THEME[i];
MANUAL_EDITOR.innerHTML += `--${STRING.getAttribute('name')}: ${STRING.value};\n`;
}

document.querySelector('style#customTheme').innerHTML = `body[data-theme="custom"]{${MANUAL_EDITOR.innerHTML}}`;
};*/
