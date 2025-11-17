/* -------------------------------------------------------------------------------------------------------------------------------------------------
AutoREM - функция для установки масштабирования в автоматическом режиме (на всю ширину экрана) 
-----------------------------------------------------------------------------------------------------------------------------------------------------*/
function autoREM(baseSiteWidth, baseFontSize){
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

// autoREM(1440, 16);


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