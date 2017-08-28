let mascotShown = false;

function mascotAnimationFix() {
	const MSCT = document.querySelector('#mascot');

	if (mascotShown){
		MSCT.style.pointerEvents = 'none';
		MSCT.classList.remove('idle');
		setTimeout(() => {
			MSCT.style.pointerEvents = 'auto';
			mascotShown = false;
		}, 600)
	} else {
		MSCT.style.pointerEvents = 'none';
		setTimeout(() => {
			mascotShown = true;
			MSCT.style.pointerEvents = 'auto';
			MSCT.classList.add('idle');
		}, 600)
	}
};
