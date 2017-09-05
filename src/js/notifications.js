function Notification(text = 'Всё норм, Саня, не забудь убрать эту хуйню, а то уебу.', type = 'notification', dispelTimeout = 5000) {
	let notificationFlow;

	if (document.querySelector('#notificationFlow')){
		notificationFlow = document.querySelector('#notificationFlow');
	} else{
		notificationFlow = createElement('div', {
			id: 'notificationFlow'
		});
		document.querySelector('body').appendChild(notificationFlow);
	}

	const NOTIFICATION = createElement('div', {
		className: 'notification ' + type,
		innerHTML: text
	});

	this.show = function (){
		notificationFlow.appendChild(NOTIFICATION);
		setTimeout(function () {
			NOTIFICATION.outerHTML = '';
		}, dispelTimeout);
	}
};
