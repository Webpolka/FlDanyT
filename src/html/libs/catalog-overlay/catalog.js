export default class CatalogOverlay {
	constructor(options = {}) {
		const defaultConfig = {
			header: ".header",
			parent: "#catalog-overlay",
			openBtn: "#catalog-open-btn",
			button: "data-catalog-cat",
			sub: "data-catalog-sub",
			back: "data-catalog-back",
			delay: 10,
		};

		this.options = Object.assign(defaultConfig, options);
		this.timer;

		this.parent = document.querySelector(this.options.parent);
		if (!this.parent) {
			return;
		}
		this.openBtn = document.querySelector(this.options.openBtn);
		this.header = document.querySelector(this.options.header);

		// Делегируем события внутри родительского элемента
		this.parent.addEventListener("click", (e) => this.delegateMobile(e));
		this.parent.addEventListener("mouseover", (e) => this.delegateDesktop(e));

		// Обработчик высоты меню от высоты хедера
		this.setHeaderHeightValue();
		window.onresize = (e) => this.setHeaderHeightValue();
		window.onchange = (e) => this.setHeaderHeightValue();

		// Обработчик для кнопки открытия (если она есть)
		if (this.openBtn) {
			this.openBtn.addEventListener("click", () => {
				this.openBtn.classList.toggle("active");
				this.parent.classList.toggle("active");
				if (!this.openBtn.classList.contains("active")) {
					this.closeAllLists();
				}
			});
		}
	}

	// устанавливаем максимальную высоту меню отталкиваясь от высоты шапки
	setHeaderHeightValue() {
		if (this.header) {
			const height = this.header.clientHeight / 16 + 3;
			this.parent.setAttribute("style", `--header-height: ${height}rem`);
		}
	}

	/*-------------------------------------- ОБРАБОТЧИКИ ДЛЯ ДЕСКТОПНОЙ ВЕРСИИ МЕНЮ --------------------------------------*/
	delegateDesktop(e) {
		const target = e.target;

		if (window.innerWidth <= 992) return;

		// Обработка кнопок вкладок
		const buttonAttr = this.options.button;
		const tabBtn = target.closest(`[${buttonAttr}]`);
		if (tabBtn) {
			clearTimeout(this.timer);
			this.timer = setTimeout(() => {
				this.removeDesktopActive();
				tabBtn.classList.add("active");
				this.tabsChangerDesktop({ currentTarget: tabBtn });
			}, this.options.delay);
			return;
		}
	}
	// Снятие ховера при десктопном меню
	removeDesktopActive() {
		this.parent.querySelectorAll(`[${this.options.button}]`).forEach((btn) => {
			btn.classList.remove("active");
		});
	}

	tabsChangerDesktop(e) {
		const tabId = e.currentTarget.getAttribute(this.options.button);
		this.showTabDesktop(tabId);
	}

	showTabDesktop(tabId) {
		this.lists = this.parent.querySelectorAll(`[${this.options.sub}]`);
		this.lists.forEach((sub) => sub.classList.remove("active"));
		this.lists.forEach((sub) => {
			if (sub.getAttribute(this.options.sub) == tabId) {
				sub.classList.add("active");
			}
		});
	}

	/*-------------------------------------- ОБРАБОТЧИКИ ДЛЯ МОБИЛЬНОЙ ВЕРСИИ МЕНЮ --------------------------------------*/
	delegateMobile(e) {
		const target = e.target;

		// Проверяем, кликнули ли по кнопке открытия (если кнопка внутри parent)
		if (target.matches(this.options.openBtn)) {
			// Обработка уже сделана отдельно, можно оставить пустым или вернуть
			return;
		}

		// Обработка кнопок вкладок
		const buttonAttr = this.options.button;
		const tabBtn = target.closest(`[${buttonAttr}]`);
		if (tabBtn) {
			this.tabsChangerMobile({ currentTarget: tabBtn });
			return;
		}

		// Обработка кнопок "назад"
		const backAttr = this.options.back;
		const backBtn = target.closest(`[${backAttr}]`);
		if (backBtn) {
			this.closeAllListsMobile();
			return;
		}
	}

	// Метод для изменения вкладки
	tabsChangerMobile(e) {
		const tabId = e.currentTarget.getAttribute(this.options.button);
		this.showTabMobile(tabId);
	}

	showTabMobile(tabId) {
		this.lists = this.parent.querySelectorAll(`[${this.options.sub}]`);
		this.lists.forEach((sub) => sub.classList.remove("active-lg"));
		this.lists.forEach((sub) => {
			if (sub.getAttribute(this.options.sub) == tabId) {
				sub.classList.add("active-lg");
			}
		});
	}

	closeAllListsMobile() {
		if (!this.lists) {
			this.lists = this.parent.querySelectorAll(`[${this.options.sub}]`);
		}
		this.lists.forEach((sub) => {
			sub.classList.remove("active-lg");
		});
	}
}


/* ------------------------------------------------------------------------------------------------------------------------------
How to use in main.js
--------------------------------------------------------------------------------------------------------------------------------*/
// import CatalogOverlay from "./modules/catalog";
// new CatalogOverlay({
// 	parent: "#catalog-overlay",
// });
