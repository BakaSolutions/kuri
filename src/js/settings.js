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
		style += 'row-reverse } #hideSidebarCheckbox:checked + #sidebar{ margin-left: -280px } #sidebar{ left: 0px } .actionIcon.spoilSidebar{ right: 3px }';
	} else{
		style += 'row } #hideSidebarCheckbox:checked + #sidebar{ margin-right: -280px } #sidebar{ right: 0px } .actionIcon.spoilSidebar{ left: 3px }';
	}

	// Insert
	stylesheet.innerHTML = style;
	HEAD.appendChild(stylesheet);
}

// On script load move sidebar as said in localStorage
moveSidebar(localStorage.bodyFlexDirection || 'row-reverse');