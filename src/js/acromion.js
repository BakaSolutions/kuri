(() => {
	function getFileExtension(str){
		let a = str.split('.');

/*		a.shift();
		let result = '';
		for (let i = 0; i < a.length; i++) {
			if (a[i].length > 5 || !/^[a-z][1-4]?$/i.test(a[i])) {
				result = '';
			} else{
				result += '.' + a[i];
			}
		}
*/
		return '.' + a.pop();
	}

	function getFileName(str){
		return str.replace(getFileExtension(str), '');
	}

	function truncate(fullStr, strLen) {
		if (fullStr.length <= strLen) return fullStr;

		const CHARS_TO_SHOW = strLen - 3,
					FRONT_CHARS = Math.ceil(CHARS_TO_SHOW/2),
					BACK_CHARS = Math.floor(CHARS_TO_SHOW/2);

		return fullStr.substr(0, FRONT_CHARS) + '...' + fullStr.substr(fullStr.length - BACK_CHARS);
	}

	window.acromion = {getFileExtension, getFileName, truncate};
})();
