document.addEventListener("DOMContentLoaded", () => {
    // === Основные слайдеры на странице ===
    document.querySelectorAll(".slider").forEach((sliderEl) => {
        const swiperContainer = sliderEl.querySelector(".swiper");
        const arrowLeft = sliderEl.querySelector(".swiper-button-prev");
        const arrowRight = sliderEl.querySelector(".swiper-button-next");
        const dots = sliderEl.querySelector(".swiper-pagination");

        const swiper = new Swiper(swiperContainer, {
            slidesPerView: 4,
            spaceBetween: 20,
            navigation: {
                nextEl: arrowRight,
                prevEl: arrowLeft,
            },
            pagination: {
                el: dots,
                clickable: true,
                type: "bullets",
            },
            autoplay: {
                delay: 3000,
                disableOnInteraction: false,
            },
            breakpoints: {
                0: {
                    slidesPerView: 2,
                    spaceBetween: 10,
                },
                576: {
                    slidesPerView: 3,
                    spaceBetween: 15,
                },
                768: {
                    slidesPerView: 4,
                    spaceBetween: 20,
                },
            },
        });

        // Hover для остановки автопрокрутки
        sliderEl.addEventListener("mouseenter", () => swiper.autoplay.stop());
        sliderEl.addEventListener("mouseleave", () => swiper.autoplay.start());

        // Слушаем движение мыши по документу
        document.addEventListener('mousemove', (event) => handleMouseMove(event, sliderEl));
    });

    // === Popup слайдер ===
    let popupSwiper = null;
    const popup = document.getElementById("popup");
    const popupSliderEl = document.querySelector("#popupSlider .swiper-wrapper");
    const popupTitle = document.getElementById("popupTitle");
    const popupClose = popup.querySelector(".popup__close");

    function openPopup(images, title) {
        popupTitle.textContent = title;
        popupSliderEl.innerHTML = "";

        if (popupSwiper) popupSwiper.destroy(true, true);


        // Добавляем слайды
        let loaded = 0;
        images.forEach((src) => {
            const slide = document.createElement("div");
            const variant = document.createElement("div");
            variant.className = "product-variant";
            slide.className = "swiper-slide";

            const img = document.createElement("img");
            img.src = src;
            img.onload = () => {
                loaded++;
                if (loaded === images.length) initSwiper(); // запускаем только когда ВСЕ картинки загружены
            };
            variant.appendChild(img);

            slide.appendChild(variant);
            popupSliderEl.appendChild(slide);
        });


        popup.classList.add("show");


        function initSwiper() {
            // Теперь и только теперь инициализируем Swiper
            popupSwiper = new Swiper("#popupSlider", {
                slidesPerView: 1,
                spaceBetween: 20,
                slidesPerGroup: 1,
                centeredSlides: false,               
                navigation: {
                    nextEl: popup.querySelector(".swiper-button-next"),
                    prevEl: popup.querySelector(".swiper-button-prev")
                },
                pagination: {
                    el: popup.querySelector(".swiper-pagination"),
                    clickable: true
                },
                breakpoints: {
                    0: { slidesPerView: 1, spaceBetween: 10 },
                    440: { slidesPerView: 2, spaceBetween: 15 },
                    768: { slidesPerView: 3, spaceBetween: 20 }
                }

            });
        }
        // Скролл
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function closePopup() {
        popup.classList.remove("show");
        setTimeout(() => { popupTitle.textContent = "" }, 650);

    }

    document.querySelectorAll(".product-slide").forEach((item) => {
        item.addEventListener("click", () => {
            document.querySelectorAll(".product-slide").forEach((p) =>
                p.classList.remove("clicked")
            );
            item.classList.add("clicked");

            const images = JSON.parse(item.dataset.images);
            const title = item.dataset.title || "";
            openPopup(images, title);
        });
    });

    popupClose.addEventListener("click", closePopup);


    // Функция для проверки положения курсора
    function handleMouseMove(event, sliderContainer) {
        const rect = sliderContainer.getBoundingClientRect();
        const mouseY = event.clientY;

        // Проверяем, находится ли курсор внутри контейнера по вертикали
        if (mouseY >= rect.top && mouseY <= rect.bottom) {
            sliderContainer.classList.add('hovered');
        } else {
            sliderContainer.classList.remove('hovered');
        }
    }


});