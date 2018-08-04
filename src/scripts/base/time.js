const time = {
	num2Word: (n, w) => {
		let t = n % 100
		if (n > 19) t %= 10
		
		switch (t) {
			case 1:
				return w[0]
			case 2:
			case 3:
			case 4:
				return w[1]
			default:
				return w[2]
		}
	},

	recalculate: function() {
		if (settings.getOption("RELTIME")) {
			for (let node of document.querySelectorAll(".postDetails time")) {
				node.innerText = ((date) => {
					let diff = +new Date() - date

					// console.log(Math.round(diff / 8.64e7), Math.round(diff / 3.6e6), Math.round(diff / 6e+4))

					if (diff < 4e4){
						return "Только что"
					}

					let minutes = Math.round(diff / 6e4)
					if (minutes < 40){
						return `${minutes} ${this.num2Word(minutes, ["минуту", "минуты", "минут"])} назад`
					}

					let hours = Math.round(diff / 3.6e6)
					if (hours < 20){
						return `${hours} ${this.num2Word(hours, ["час", "часа", "часов"])} назад`
					}

					let days = Math.round(diff / 8.64e7)
					return `${days} ${this.num2Word(days, ["день", "дня", "дней"])} назад`
				})(new Date(+new Date(node.dataset.unix)))
			}
		}
	}
}