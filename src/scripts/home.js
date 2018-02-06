let scrollToScreen = (number) => {
	if(number == 0){
		document.querySelector('#scrollIndicator').classList.add('firstScreen');
		document.querySelector('#scrollIndicator').classList.remove('secondScreen');
	} else {
		document.querySelector('#scrollIndicator').classList.add('secondScreen');
		document.querySelector('#scrollIndicator').classList.remove('firstScreen');
	}

	let elementY = window.pageYOffset + document.getElementsByClassName('screen')[number].getBoundingClientRect().top,
			startingY = window.pageYOffset,
			diff = elementY - startingY,
			start,
			duration = Math.abs(diff);

  window.requestAnimationFrame(function step(timestamp) {
    start = start || timestamp;

    let time = timestamp - start,
				percent = Math.min(time / duration, 1)

    window.scrollTo(0, startingY + diff * percent);

    if (time < duration) window.requestAnimationFrame(step);
  })

}

(() => {
	// Get BG
	let url = `/static/background/${Math.floor(Math.random() * 10)}.jpg`;
	document.querySelector('body').style.backgroundImage = `url("${url}")`;

	// Get splash
	let xhr = new XMLHttpRequest();
	xhr.onload = e => {
		let list = xhr.response == "Not Found" ? ['Something\'s just not right'] : JSON.parse(xhr.response);
		document.getElementById('splash').innerHTML = list[Math.floor(Math.random() * list.length)];
	};
	xhr.open('GET', '/static/splashes.json');
	xhr.send(0);

	// ...
	document.querySelector('body').classList.add('jsAvailable');

	// Hotkeys
	document.onkeydown = (e) => {
		switch (e.which) {
			case 40: // Down
				scrollToScreen(1);
				break;
			case 38: // Up
				scrollToScreen(0);
				break;
		}
	}

	window.onwheel = (e) => {
		if(e.deltaY > 0){
			scrollToScreen(1);
		} else{
			scrollToScreen(0);
		}
	}
})();
