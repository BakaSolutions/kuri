function moveSidebar(direction) {
	const HEAD = document.querySelector('head');
	const OLD_STYLESHEET = document.querySelector('#sidebarLocation');
	if (OLD_STYLESHEET) HEAD.removeChild(OLD_STYLESHEET);

	localStorage.sidebar = direction || localStorage.sidebar;
	const STYLESHEET = createElement('style', {
		id: 'sidebarLocation'
	});

	let style = 'body{flex-direction:';

	if (localStorage.sidebar == 'row') {
		style += 'row-reverse} #hideSidebarCheckbox:checked + #sidebar{ left: -225px } #sidebar{ left: 0px }';
	} else{
		style += 'row} #hideSidebarCheckbox:checked + #sidebar{ right: -225px } #sidebar{ right: 0px }';
	}

	STYLESHEET.innerHTML = style;
	HEAD.appendChild(STYLESHEET);
}

moveSidebar(localStorage.sidebar || 'row-reverse');