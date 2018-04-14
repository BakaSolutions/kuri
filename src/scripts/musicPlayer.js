const pauseButton = document.querySelector("#musicPlayer #pause");


pauseButton.addEventListener("click", (event) => {
	pauseButton.innerHTML = pauseButton.innerHTML == "pause" ? "play_arrow" : "pause";
})