function truncate(fullStr, strLen) {
	if (fullStr.length <= strLen) return fullStr;

	const CHARS_TO_SHOW = strLen - 3,
				FRONT_CHARS = Math.ceil(CHARS_TO_SHOW/2),
				BACK_CHARS = Math.floor(CHARS_TO_SHOW/2);

	return fullStr.substr(0, FRONT_CHARS) + '...' + fullStr.substr(fullStr.length - BACK_CHARS);
}
