function adjustPostDates(dates, countTimeSince = false) {
  const TZ_OFFSET = -(new Date()).getTimezoneOffset();
  dates = typeof dates == 'object' ? dates : [dates];

  TZ_OFFSET != 120 ? (() => {
    for (let i = 0; i < dates.length; i++) {
      let postDate = +new Date(dates[i].dataset.creationdate);
      let offset = (TZ_OFFSET - 120) * 60000;

      dates[i].innerHTML = ((date) => {
        let d = new Date(date);

        let day = d.getDate().toString().padStart(2, 0),
            month = d.getMonth().toString().padStart(2, 0),
            year = d.getFullYear(),
            hours = d.getHours().toString().padStart(2, 0),
            minutes = d.getMinutes().toString().padStart(2, 0);

        return `${day}.${month}.${year} ${hours}:${minutes}`;
      })(postDate + offset);
    }
  })() : false;

  countTimeSince ? (() => {
    function timeSince(t){
      let num2Word = (n, w) => {
    		n %= 100;
    		if (n > 19) n %= 10;
    		switch (n) {
    			case 1:
    				return w[0];
    			case 2:
    			case 3:
    			case 4:
    				return n + ' ' +w[1];
    			default:
    				return n + ' ' +w[2];
    		}
    	};

      let cd = 24 * 60 * 60 * 1000,
        ch = 60 * 60 * 1000,
        d = Math.floor(t / cd),
        h = Math.floor( (t - d * cd) / ch),
        m = Math.round( (t - d * cd - h * ch) / 60000);

      if( m === 60 ){
        h++;
        m = 0;
      }

      if( h === 24 ){
        d++;
        h = 0;
      }

      if (d) {
        return `${num2Word(d, ['день', 'дня', 'дней'])} назад`
      } else if (h){
        return `${num2Word(h, ['час', 'часа', 'часов'])} назад`
      } else if (m){
        return `${num2Word(m, ['минуту', 'минуты', 'минут'])} назад`
      } else {
        return `Только что`
      }
    }

    for (let i = 0; i < dates.length; i++) {
      let postDate = +new Date(dates[i].dataset.creationdate);
      let difference = +new Date() - postDate;
      dates[i].innerHTML = timeSince(difference);
    }
  })() : false;

}

adjustPostDates(document.querySelectorAll('.postDate'));
