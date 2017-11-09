const THEMES = {
	"Tumbach": {
		"textcolor": "#e1efff",
		"textcolor_secondary": "#c1cedd",
		"linkcolor": "#79bde2",
		"linkcolor_hover": "#5496b9",
		"btncolor": "#141e27",
		"btncolor_hover": "#18252f",
		"bgcolor": "#10161f",
		"bgcolor_card": "#141e27",
		"bordercolor": "#0e1a22",
		"shadowcolor": "#000"
	},

	"Tumbach Light": {
		"textcolor": "#000",
		"textcolor_secondary": "#000",
		"linkcolor": "#08F",
		"linkcolor_hover": "#038",
		"btncolor": "#b2e2ee",
		"btncolor_hover": "#b2e2ee",
		"bgcolor": "#fff",
		"bgcolor_card": "#ccecf4",
		"bordercolor": "#0e1a22",
		"shadowcolor": "#000"
	}
}

const EDITOR = document.querySelector('#themeEditor');

let initThemes = () => setTheme(JSON.parse(localStorage.theme || "false") || THEMES["Tumbach"]);

async function setTheme(cssObj) {
	log('Applied theme:', cssObj);

	(async () => {
		localStorage.theme = JSON.stringify(cssObj);
		EDITOR.value = (() => {
			let styleString = '';
			for (let key in cssObj) styleString += `${key}: ${cssObj[key]}\n`;
			return styleString;
		})();

		return cssObj
	})().then(cssObj => {
		let css = ':root{';
		for (let key in cssObj) css += `--${key}:${cssObj[key]};`;
		css += '}';

		let node = sel('#theme');
		if (node) node.innerHTML = css
		else{
			createElement('style', {
				'type': 'text/css',
				'innerHTML': css,
				'id': 'theme'
			}).then(el => sel('head').appendChild(el))
		}
	})
}

EDITOR.onchange = async () => {
	let cssObj = {};
	for (str of EDITOR.value.split('\n')) {
		if (str) {
			let splited = str.split(': ');
			cssObj[splited[0]] = splited[1];
		}
	};

	setTheme(cssObj);
};
