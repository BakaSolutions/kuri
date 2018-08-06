const marker = {
	init: function() {
		let json = localStorage.getItem("postMarks")
		if (json){
			this.marks = JSON.parse(json)
			this.markPosts(...sel(".post"))
		} else {
			this.marks = {}
		}
	},

	markPosts: function(...posts) {
		for (post of posts) {
			if (post != undefined){
				let marksArray = this.marks[post.dataset.board][post.dataset.number]

				if (marksArray){
					post.dataset.marks = marksArray.join(" ")
					
					if (post.dataset.op){
						post.parentNode.dataset.marks = marksArray.join(" ")
					}
				}
			}
		}
	},

	markLinks: function(...links) {
		for (link of links) {
			if (link != undefined){
				let marksArray = this.marks[link.dataset.board][link.dataset.number]

				if (marksArray){
					link.dataset.marks = marksArray.join(" ")
				}
			}
		}
	},

	addMark: function(board, number, mark) {
		console.log("Marking post number", number, `in /${board}/ as`, mark)

		if (this.marks[board] == undefined) this.marks[board] = {}
		let marksArray = this.marks[board][number] || []

		if (!marksArray.includes(mark)){
			marksArray.push(mark)
			this.marks[board][number] = marksArray
			this.backup()

			this.markPosts(sel(`.post[data-board=${board}][data-number="${number}"]`))
			this.markLinks(sel(`.postLink[data-board=${board}][data-number="${number}"]`))
		} else {
			console.error("Post already has this mark")
		}
	},

	removeMark: function(board, number, mark) {
		console.log("Unmarking post number", number, `in /${board}/ as`, mark)
		let marksArray = this.marks[board][number]

		if (marksArray && marksArray.includes(mark)){
			marksArray.splice(marksArray.indexOf(mark), 1)
			this.marks[board][number] = marksArray
			this.backup()

			this.markPosts(sel(`.post[data-board=${board}][data-number="${number}"]`))
			this.markLinks(sel(`.postLink[data-board=${board}][data-number="${number}"]`))
		} else {
			console.error("Post doesn't have this mark")
		}
	},

	backup: function() {
		localStorage.setItem("postMarks", JSON.stringify(this.marks))	
	},

	toggleMark: function(board, number, mark) {
		if (this.marks[board] == undefined) this.marks[board] = {}
		let marksArray = this.marks[board][number] || []

		if (marksArray.includes(mark)){
			this.removeMark(board, number, mark)
		} else {
			this.addMark(board, number, mark)
		}
	},
}