draggability = {
	cursorPosition: [0, 0],
	elements: [],
	draggedElement: null,

	dragMouseDown: function(event, test) {
		if (event.button) return // Ignore every button but left
		event.preventDefault()
		
		// get the mouse cursor position at startup:
		draggability.cursorPosition[0] = event.clientX
		draggability.cursorPosition[1] = event.clientY
		
		document.addEventListener("mouseup", draggability.closeDragElement)
		document.addEventListener("mousemove", draggability.elementDrag)

		draggability.draggedElement = draggability.elements.find(item => (item[1].contains(event.target) || item[1] == event.target))[0]
		if(!draggability.draggedElement.style.transform) draggability.draggedElement.style.transform = "translate(0px, 0px)"
		
		draggability.draggedElement.dispatchEvent(new Event("dragStart"))
		draggability.draggedElement.classList.add("isDragged")
	},

	elementDrag: function(event) {
		event.preventDefault()

		// set the element's new position:
		let prev = /translate\((-?[0-9]+)px, (-?[0-9]+)px\)/.exec(draggability.draggedElement.style.transform)
		let newTranslation = [prev[1] - (draggability.cursorPosition[0] - event.clientX), prev[2] - (draggability.cursorPosition[1] - event.clientY)]
		draggability.draggedElement.style.transform = `translate(${newTranslation[0]}px, ${newTranslation[1]}px)`
		
		draggability.cursorPosition[0] = event.clientX
		draggability.cursorPosition[1] = event.clientY
	},

	closeDragElement: function(event) {
		draggability.draggedElement.dispatchEvent(new Event("dragEnd"))

		document.removeEventListener("mouseup", draggability.closeDragElement)
		document.removeEventListener("mousemove", draggability.elementDrag)

		draggability.draggedElement.classList.remove("isDragged")
	},

	register: function(element, handle){
		handle = handle || element
		draggability.elements.push([element, handle, [0, 0]])

		handle.addEventListener("mousedown", draggability.dragMouseDown)
	},

	// unregister: function(element){
	// 	let handle = draggability.elements.find(item => item[0] == element)[1]
	// 	handle.removeEventListener("mousedown", draggability.dragMouseDown)

	// 	draggability.reset(element)

	// 	draggability.elements = draggability.elements.filter(item => item[0] != element)
	// },

	reset: function(element){
		element.style.transform = "translate(0px, 0px)"
	}
}