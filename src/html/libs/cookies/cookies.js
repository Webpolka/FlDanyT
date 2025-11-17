export default function checkCookies(opts = {}) {
	const defOptions = {
		days: 365,
	};

	const options = Object.assign(defOptions, opts);

	let cookieNote = document.querySelector(".cookies-popup");
	let cookieBtnAccept = cookieNote.querySelector(".cookies-popup__btn");

	// Если куки cookies_policy нет или она просрочена, то показываем уведомление
	if (!getCookie("cookies_policy") && cookieNote) {
		cookieNote.classList.add("cookies-popup--show");
	}

	// При клике на кнопку устанавливаем куку cookies_policy на один год
	if (cookieNote && cookieBtnAccept) {
		cookieBtnAccept.addEventListener("click", function () {
			setCookie("cookies_policy", "true", options.days);
			cookieNote.classList.remove("cookies-popup--show");
		});
	}
}

function setCookie(name, value, days) {
	let expires = "";
	if (days) {
		let date = new Date();
		date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
		expires = "; expires=" + date.toUTCString();
	}
	document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
	let matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") + "=([^;]*)"));
	return matches ? decodeURIComponent(matches[1]) : undefined;
}

/* ------------------------------------------------------------------------------------------------------------------------------
How to use in main.js
--------------------------------------------------------------------------------------------------------------------------------*/
// import checkCookies from "./modules/cookies";
// checkCookies({
// 	days: 365,
// });
