/*
//	Class works as a decorator and makes element draggable
//	Usage: new Draggable(<element to be dragged>, <(optional) handle>, <(optional) flags>)
//	Supported flags: 
//		"boundToViewport" — element can't be dragged beyond the viewport
*/
class Draggable {
	constructor(element, handle, ...options) {
		this.element = element
		this.handle = handle || element
		this.options = options

		let computedStyle = window.getComputedStyle(this.element)
		this.initialPosition = [parseInt(computedStyle.getPropertyValue("left")) || 0, parseInt(computedStyle.getPropertyValue("top")) || 0]
		this.position = this.initialPosition
		this.element.style.transform = "translate(0px, 0px)"

		this.mouseUpHandler = this._mouseUpHandler.bind(this)
		this.dragHandler = this._dragHandler.bind(this)
		
		this.handle.addEventListener("mousedown", this.mouseDownHandler.bind(this))
	}

	get cursorPosition() {
		return window._cursorPosition
	}

	set cursorPosition(value) {
		return window._cursorPosition = value
	}

	mouseDownHandler(event){
		if (event.button) return // Ignore if not left click
		event.preventDefault()

		if (this.ondragstart) this.ondragstart(event) // Call custom event handler

		this.cursorPosition = [event.clientX, event.clientY]

		document.addEventListener("mousemove", this.dragHandler)
		document.addEventListener("mouseup", this.mouseUpHandler)
	}

	_mouseUpHandler(event){
		if (event.button) return // Ignore if not left click
		event.preventDefault()

		if (this.ondragend) this.ondragend(event) // Call custom event handler

		document.removeEventListener("mousemove", this.dragHandler)
		document.removeEventListener("mouseup", this.mouseUpHandler)

		if (this.options.includes("boundToViewport")) this.normalize()
	}

	_dragHandler(event){
		event.preventDefault()

		this.position = [this.position[0] + event.clientX - this.cursorPosition[0], this.position[1] + event.clientY - this.cursorPosition[1]]
		this.move()
		
		this.cursorPosition = [event.clientX, event.clientY]
	}

	move(){
		let computedStyle = window.getComputedStyle(this.element),
			delta = [this.position[0] - parseInt(computedStyle.getPropertyValue("left")), this.position[1] - parseInt(computedStyle.getPropertyValue("top"))]

		if (this.options.includes("boundToViewport")){
			for(let i in delta){
				let overHighBound = this.position[i] + parseInt(computedStyle.getPropertyValue(["width", "height"][i])) - document.documentElement[["clientWidth", "clientHeight"][i]]
				
				if(this.position[i] < 0){
					delta[i] -= this.position[i]
				} else if (overHighBound > 0){
					delta[i] -= overHighBound
				}
			}
		}

		this.element.style.transform = `translate(${delta[0]}px, ${delta[1]}px)`
	}

	normalize(){
		let computedStyle = window.getComputedStyle(this.element)
		
		for(let i in this.position){
			let highBound = document.documentElement[["clientWidth", "clientHeight"][i]] - parseInt(computedStyle.getPropertyValue(["width", "height"][i]))
			
			if(this.position[i] < 0){
				this.position[i] = 0
			} else if (this.position[i] > highBound){
				this.position[i] = highBound
			}
		}
	}

	reset(){
		this.position = this.initialPosition
		this.element.style.transform = `translate(0px, 0px)`
	}
}