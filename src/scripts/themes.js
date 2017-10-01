let defaultTheme = {
	"text_primary": "#e1efff",
	"text_secondary": "#e1efff",
	
	"link_primary": "#79bde2",
	"link_secondary": "#5496b9",
	
	"btn_primary": "#141e27",
	"btn_secondary": "#18252f",

	"bg_primary": "#10161f",
	"bg_secondary": "#141e27",

	"border_primary": "#e1efff"
}

/*function setTheme(name) {
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
})() : setTheme('Tumbach');*/