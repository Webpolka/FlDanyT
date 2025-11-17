/*-------------------------------------------------------------------------------------------------------------------------------------------
Импорт в main.js
---------------------------------------------------------------------------------------------------------------------------------------------*/
// import autoREM from './helpers/auto-rem';
// autoREM(1440, 16);

/* -------------------------------------------------------------------------------------------------------------------------------------------------
AutoREM - функция для установки масштабирования в автоматическом режиме (на всю ширину экрана) 
-----------------------------------------------------------------------------------------------------------------------------------------------------*/
export default function autoREM(baseSiteWidth, baseFontSize) {
	const htmlElement = document.documentElement;

	function updateFontSize() {
		const screenWidth = window.innerWidth;
		// Вычисляем масштабный коэффициент
		const scaleFactor = screenWidth / baseSiteWidth;
		// Новой размер шрифта
		const newFontSize = baseFontSize * scaleFactor;

		if (screenWidth >= baseSiteWidth ) {
			// Устанавливаем размер шрифта для <html>
			htmlElement.style.fontSize = `${newFontSize}px`;
		}
	}

	// Обновляем при загрузке и при изменении окна
	window.addEventListener("resize", updateFontSize);
	// Инициализация при загрузке страницы
	updateFontSize();
}
