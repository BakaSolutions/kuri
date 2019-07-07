const marker = {
	Post: function(board, thread, number) {
		this.board = board
		this.thread = thread
		this.number = number
	},

	init: function() {
		let json = localStorage.getItem("postMarks")
		
		if (json){
			this._marks = JSON.parse(json)

			this.markPosts(...document.querySelectorAll(".post"))
			this.markLinks(...document.querySelectorAll(".postLink"))
		} else {
			this._marks = {}
		}
	},

	toggleMark: function(board, thread, number, name) {
		if (name in this._marks && this._marks[name].find((mark) => (mark.board === board && mark.number === number)) !== undefined){
			// Remove mark

			if (!(name in this._marks)) {
				return
			}
			
			this._marks[name] = this._marks[name].filter((mark) => !(mark.board === board && mark.number === number))
		} else{
			// Add mark

			let post = new this.Post(board, thread, number)

			if (name in this._marks) {
				this._marks[name].push(post)
			} else {
				this._marks[name] = [post]
			}
		}

		localStorage.setItem("postMarks", JSON.stringify(this._marks)) // Commit

		this.markPosts(...document.querySelectorAll(`.post[data-board=${board}][data-number="${number}"]`)) 	// Display changes on posts
		this.markLinks(...document.querySelectorAll(`.postLink[data-board=${board}][data-number="${number}"]`)) // Display changes on post links
	},

	getPostsList: function(name) {
		return this._marks[name]
	},

	markPosts: function(...posts) {
		for (post of posts) {
			let data = post.dataset,
				marks = []

			for (name in this._marks) {
				if (this._marks[name].find((mark) => (data.board === mark.board && data.number === mark.number)) !== undefined){
					marks.push(name)
				}
			}

			if(storage.get("settings.superSpoiling") && marks.includes("hidden")){
				post.remove()
			} else{
				let marksString = marks.join(" ")
				
				post.dataset.marks = marksString
				if (post.dataset.op === "true") post.parentNode.dataset.marks = marksString
			}
		}
	},

	markLinks: function(...links) {
		for (link of links) {
			let data = link.dataset,
				marks = []

			for (name in this._marks) {
				if (this._marks[name].find((mark) => (data.board === mark.board && data.number === mark.number)) !== undefined) {
					marks.push(name)
				}
			}

			if (marks.length > 0){
				link.dataset.marks = marks.join(" ")
			}
		}
	}
}