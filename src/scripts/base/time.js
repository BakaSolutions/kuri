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
		for (let node of document.querySelectorAll(".postDetails time")) {
			node.innerText = ((date) => {
				let d = date.getDate(),
					month = ["Янв", "Фев", "Мар", "Апр", "Мая", "Июня", "Июля", "Авг", "Сен", "Окт", "Ноя", "Дек"][date.getMonth()],
					yyyy = date.getFullYear(),
					hh = date.getHours().toString().padStart(2, 0),
					mm = date.getMinutes().toString().padStart(2, 0)

				node.title = `${d} ${month} ${yyyy} ${hh}:${mm}`

				let diff = +new Date() - date

				// console.log(Math.round(diff / 8.64e7), Math.round(diff / 3.6e6), Math.round(diff / 6e+4))

				if (diff < 4e4){
					return "Только что"
				}

				let minutes = Math.round(diff / 6e4)
				if (minutes < 50){
					return `${minutes} ${this.num2Word(minutes, ["минуту", "минуты", "минут"])} назад`
				}

				let hours = Math.round(diff / 3.6e6)
				if (hours < 20){
					return `${hours} ${this.num2Word(hours, ["час", "часа", "часов"])} назад`
				}

				let days = Math.round(diff / 8.64e7)
				if (days == 1){
					return "Вчера"	
				}

				if (days <= 7){
					return `${days} ${this.num2Word(days, ["день", "дня", "дней"])} назад`
				}

				return `${d} ${month} ${yyyy}`
			})(new Date(+new Date(node.title)))
		}
	}
}