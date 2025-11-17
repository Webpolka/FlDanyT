
export default class StarRating {
	constructor(options = {}) {
		const defaultConfig = {
			container: ".rating-stars",
			hiddenInput: "#rating-stars",
		};
		this.options = Object.assign(defaultConfig, options);

		this.container = document.querySelector(this.options.container);
		this.input = document.querySelector(this.options.hiddenInput);

		this.starCount = 5;
		this.stars = [];
		this.isLocked = false;
		this.init();
	}

	init = () => {
		// Создаем звезды
		const allStars = document.querySelector(this.options.container).querySelectorAll(".rating-stars__item");
		allStars.forEach((star, i) => {
			star.setAttribute("data-value", i + 1);
			this.stars.push(star);

			// Наведение мыши
			star.addEventListener("mouseenter", () => {
				if (this.isLocked) return;
				this.highlightStars(i + 1);
			});

			// Убрать подсветку
			star.addEventListener("mouseleave", () => {
				if (this.isLocked) return;
				const currentRating = parseInt(this.input.value);
				this.highlightStars(currentRating);
			});

			// Клик по звезде
			star.addEventListener("click", () => {
				if (this.input) {
					this.input.value = i + 1;
				}
				this.fillStars(i + 1);
				this.isLocked = true;
			});
		}, this);

		// Изначально подсветим выбранный рейтинг
		const initialRating = parseInt(this.input.value);
		this.fillStars(initialRating);
	};

	highlightStars(rating) {
		this.stars.forEach((star, index) => {
			if (index < rating) {
				star.classList.add("filled");
			} else {
				star.classList.remove("filled");
			}
		});
	}

	fillStars(rating) {
		this.highlightStars(rating);
	}
}

/* --------------------------------------------------------------------------------------------------------------------------
Рейтинг на странице продукта (выбор кол-ва звезд в форме ОПЫТ ПОЛЬЗОВАТЕЛЯ)
-----------------------------------------------------------------------------------------------------------------------------*/
// import StarRating from "./modules/rating-stars.js";
// new StarRating();
