function fixDates() {
  const TIME_OFFSET = 2 - /GMT((\+|-)[0-9]+)/.exec(new Date())[1].substring(0, 3);

  TIME_OFFSET ? (() => {
    let dates = document.querySelectorAll('.postDate');
    for (let i = 0; i < dates.length; i++) {
      let hours = /([0-9]+):[0-9]+/.exec(dates[i].innerHTML)[1];
      dates[i].innerHTML = dates[i].innerHTML.replace(hours, hours - - TIME_OFFSET);
    }
  })() : false;
}

fixDates();


// function alternativeDates(){
//   let postDate = Date.parse(postDate + ' ' + /GMT(\+|-)[0-9]+/.exec(new Date())[0]);
//   const DIFFERENCE = (+new Date - postDate) / 60000; // In minutes
// }
