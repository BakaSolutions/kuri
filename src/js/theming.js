let themes = {
    'Tumbach': {
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

  'Tumbach Light': {
  	'text-color': '#000',
  	'link-color': '#08F',
  	'link-hover-color': '#038',
  	'background-color': '#fff',
  	'foreground-color': '#ccecf4',
  	'header-color': '#b2e2ee',
  },

  'Myata': {
  	'text-color': '#dedede',
  	'link-color': '#37c999',
  	'link-hover-color': 'white',
  	'background-color': 'black',
  	'foreground-color': 'rgba(51, 70, 78, .9)',
  	'header-color': '#454f5f',
  	'background-image': 'url(../images/myata.png)',
  	'sidebar-color': 'none',
  }
}

function setTheme(name) {
  let stylesheet = '';

  for (let key in themes[name]) {
    stylesheet += `--${key}:${themes[name][key]};`;
  }

  stylesheet += '';

  document.querySelector('style#theme').innerHTML = `:root{${stylesheet}}`;
  document.querySelector('#themeEditor').value = stylesheet.replace(/:/g, ': ').replace(/;/g, ';\n');
  localStorage.theme = stylesheet;
};

// Recover theme from local storage on load
localStorage.theme ? (() => {
  document.querySelector('style#theme').innerHTML = `:root{${localStorage.theme}}`;
  document.querySelector('#themeEditor').value = localStorage.theme.replace(/:/g, ': ').replace(/;/g, ';\n');
})() : setTheme('Tumbach');

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
