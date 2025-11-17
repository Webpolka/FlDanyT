export default class PopupManager {
	constructor() {
		this.modals = new Map();
		this.init();
	}

	init() {
		// Обработка кнопок открытия
		document.querySelectorAll("[data-popup-open]").forEach((btn) => {
			if (btn) {
				btn.addEventListener("click", () => {
					const modalName = btn.getAttribute("data-popup-open");
					if (modalName) {
						this.openModal(modalName);
					}
				});
			}
		});

		// Обработка кнопок закрытия
		document.querySelectorAll("[data-popup-close]").forEach((btn) => {
			if (btn) {
				btn.addEventListener("click", () => {
					this.closeAllModals();
				});
			}
		});

		// Инициализация модальных окон по атрибуту data-popup
		document.querySelectorAll("[data-popup]").forEach((modal) => {
			if (modal) {
				const name = modal.getAttribute("data-popup");
				if (name) {
					this.modals.set(name, modal);
				}
			}
		});
	}

	openModal(name) {
		if (!name) return; // ничего не делаем, если имя не передано
		const modal = this.modals.get(name);
		if (modal) {
			if (!modal.classList.contains("popup--show")) {
				modal.classList.add("popup--show");
			}
		}
	}

	closeAllModals() {
		this.modals.forEach((modal) => {
			if (modal.classList.contains("popup--show")) {
				modal.classList.remove("popup--show");
			}
		});
	}
}

/* ------------------------------------------------------------------------------------------------------------------------------
How to use in main.js
--------------------------------------------------------------------------------------------------------------------------------*/
// import PopupManager from "./modules/popup";
// new PopupManager();
