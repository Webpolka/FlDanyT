/* -------------------------------------------------------------------------------------------------------------------------------------------------
AutoREM - функция для установки масштабирования в автоматическом режиме (на всю ширину экрана) 
-----------------------------------------------------------------------------------------------------------------------------------------------------*/
function autoREM(baseSiteWidth, baseFontSize) {
	const htmlElement = document.documentElement;

	function updateFontSize() {
		const screenWidth = window.innerWidth;
		// Вычисляем масштабный коэффициент
		const scaleFactor = screenWidth / baseSiteWidth;
		// Новой размер шрифта
		const newFontSize = baseFontSize * scaleFactor;

		if (screenWidth >= baseSiteWidth) {
			// Устанавливаем размер шрифта для <html>
			htmlElement.style.fontSize = `${newFontSize}px`;
		}
	}

	// Обновляем при загрузке и при изменении окна
	window.addEventListener("resize", updateFontSize);
	// Инициализация при загрузке страницы
	updateFontSize();
};

autoREM(1440, 16);


/* -------------------------------------------------------------------------------------------------------------------------------------------------
MobileChecker  -  Класс для проверки мобильного браузера.
-----------------------------------------------------------------------------------------------------------------------------------------------------*/

class MobileChecker {
	static userAgent = navigator.userAgent;

	/**
	 * Проверяет, является ли устройство Android.
	 * @returns {boolean} true, если устройство Android, в противном случае false.
	 */
	static get isAndroid() {
		return Boolean(MobileChecker.userAgent.match(/Android/i));
	}

	/**
	 * Проверяет, является ли устройство BlackBerry.
	 * @returns {boolean} true, если устройство BlackBerry, в противном случае false.
	 */
	static get isBlackBerry() {
		return Boolean(MobileChecker.userAgent.match(/BlackBerry/i));
	}

	/**
	 * Проверяет, является ли устройство iOS (iPhone, iPad или iPod).
	 * @returns {boolean} true, если устройство iOS, в противном случае false.
	 */
	static get isAppleOS() {
		return Boolean(MobileChecker.userAgent.match(/iPhone|iPad|iPod/i));
	}

	/**
	 * Проверяет, является ли устройство Opera Mini.
	 * @returns {boolean} true, если устройство Opera Mini, в противном случае false.
	 */
	static get isOpera() {
		return Boolean(MobileChecker.userAgent.match(/Opera Mini/i));
	}

	/**
	 * Проверяет, является ли устройство Windows.
	 * @returns {boolean} true, если устройство Windows, в противном случае false.
	 */
	static get isWindows() {
		return Boolean(MobileChecker.userAgent.match(/IEMobile/i));
	}

	/**
	 * Проверяет, является ли устройство любым из поддерживаемых типов (Android, BlackBerry, iOS, Opera Mini, Windows).
	 * @returns {boolean} true, если устройство является любым из поддерживаемых типов, в противном случае false.
	 */
	static get isAny() {
		return (
			MobileChecker.isAndroid ||
			MobileChecker.isBlackBerry ||
			MobileChecker.isAppleOS ||
			MobileChecker.isOpera ||
			MobileChecker.isWindows
		);
	}
}

/* -------------------------------------------------------------------------------------------------------------------------------------------------
BaseHelpers
-----------------------------------------------------------------------------------------------------------------------------------------------------*/

class BaseHelpers {
	static html = document.documentElement;
	static addTouchClass() {
		if (MobileChecker.isAny) {
			BaseHelpers.html.classList.add('touch');
		}
	}
	static addLoadedClass() {
		window.addEventListener('load', () => {
			setTimeout(() => {
				BaseHelpers.html.classList.add('loaded');
			}, 0);
		});
	}
	static get getHash() {
		return location.hash?.replace('#', '');
	}
	static calcScrollbarWidth() {
		const scrollbarWidth = (window.innerWidth - document.body.clientWidth) / 16 + 'rem';
		BaseHelpers.html.style.setProperty('--bh-scrollbar-width', scrollbarWidth);
	}
}

/* -------------------------------------------------------------------------------------------------------------------------------------------------
Init 
-----------------------------------------------------------------------------------------------------------------------------------------------------*/
BaseHelpers.addLoadedClass();
BaseHelpers.calcScrollbarWidth();
BaseHelpers.addTouchClass();



/* -------------------------------------------------------------------------------------------------------------------------------------------------
 Back to top button
-----------------------------------------------------------------------------------------------------------------------------------------------------*/
class BackToTop {
	constructor(el, opts = {}) {

		// Проверка елемента на его тип, и коррекция... 
		if (typeof el === 'string') {
			this.button = document.querySelector(el);
		} else if (el instanceof Element) {
			this.button = el;
		} else {
			throw new Error('Неверный тип аргумента');
		}
		if (!this.button) {
			throw new Error('Элемент не найден');
		}

		// Дефолтные опции
		const defaultConfig = {
			breakpoint: 500,
			activeClass: "is-active",
		};
		this.options = Object.assign(defaultConfig, opts);
		this.listener();
	}

	// Функция прокрутки
	scrollToTop(e) {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	// Отслеживание кликов и скролинга
	listener() {
		this.button.addEventListener("click", (e) => this.scrollToTop(e));
		window.addEventListener("scroll", (e) => this.checkPosition(e));
		window.addEventListener('resize', this.updateSiteWidth);
		this.updateSiteWidth();
	}
	updateSiteWidth() {
		const container = document.querySelector('.container'); // твой главный блок
		const width = container.offsetWidth;
		document.documentElement.style.setProperty('--dynamic-site-width', width + 'px');
	}

	// Функция реагирования на положение скролинга
	checkPosition(e) {
		if (window.scrollY > this.options.breakpoint) {
			this.button.classList.add(this.options.activeClass);
		} else {
			this.button.classList.remove(this.options.activeClass);
		}
	}
}


const BackToTopBtn = document.querySelector("#back-to-top");
BackToTopBtn && new BackToTop(BackToTopBtn, {
	// Рубеж в пикселях от верха экрана, при котором срабатывает появление и исчизновение кнопки
	breakpoint: 700,
	// Активный класс, который добавляется при прохождении рубежа (breakpoint)
	activeClass: "is-active",
});