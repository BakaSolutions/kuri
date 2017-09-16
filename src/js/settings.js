function moveSidebar(direction) {
	const HEAD = document.querySelector('head');

	// Remove old stylesheet
	let oldStylesheet = document.querySelector('#sidebarLocation');
	if (oldStylesheet) HEAD.removeChild(oldStylesheet);

	// Rewrite localStorage
	localStorage.bodyFlexDirection = direction || localStorage.bodyFlexDirection;
	let stylesheet = createElement('style', {id: 'sidebarLocation'});

	// Compose stylesheet
	let style = 'body{flex-direction:';
	if (localStorage.bodyFlexDirection == 'row') {
		style += 'row-reverse } #hideSidebarCheckbox:checked + #sidebar{ left: -225px } #sidebar{ left: 0px }';
	} else{
		style += 'row } #hideSidebarCheckbox:checked + #sidebar{ right: -225px } #sidebar{ right: 0px }';
	}

	// Insert
	stylesheet.innerHTML = style;
	HEAD.appendChild(stylesheet);
}

// On script load move sidebar as said in localStorage
moveSidebar(localStorage.bodyFlexDirection || 'row-reverse');