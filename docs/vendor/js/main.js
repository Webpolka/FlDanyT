document.addEventListener("DOMContentLoaded", () => {
    const swipers = [];
    const directions = []; // направление движения каждого слайдера

    // Инициализация слайдеров
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
            loop: false,
            autoplay: false,
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

        swipers.push(swiper);
        directions.push(1); // изначально движение вперёд
    });

    // Последовательное движение туда-сюда
    async function runSequencePingPong() {
        while (true) {
            for (let i = 0; i < swipers.length; i++) {
                const swiper = swipers[i];

                // Проверяем, есть ли вообще возможность листать
                if (swiper.slides.length <= swiper.params.slidesPerView) {
                    continue; // пропускаем этот слайдер, он не листается
                }

                // Проверяем направление и границы
                if (directions[i] === 1 && swiper.isEnd) {
                    directions[i] = -1; // достиг конца → меняем направление на назад
                } else if (directions[i] === -1 && swiper.isBeginning) {
                    directions[i] = 1; // достиг начала → меняем направление на вперёд
                }

                // Листаем в нужном направлении
                if (directions[i] === 1) {
                    swiper.slideNext();
                } else {
                    swiper.slidePrev();
                }

                // Ждём 2 секунды только если этот слайдер листался
                await new Promise(res => setTimeout(res, 2000));
            }
        }
    }


    // Запуск
    runSequencePingPong();

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

    /* ------------------------------------------------------------------------------------------------------------------------------
    BANNERS TOUCH + MOUSE SLIDER (mobile only) with link-disable during drag
    ----------------------------------------------------------------------------------------------------------------*/
    // const touchSlider = document.querySelector(".custom-group");

    // let startPercent = -31.85;
    // let currentPercent = startPercent;
    // const minPercent = -65;
    // const maxPercent = 1.4;
    // const sensitivity = 2.0;

    // let isDown = false;
    // let moved = false;
    // let startX = 0;

    // // Получаем все ссылки внутри слайдера
    // const sliderLinks = touchSlider.querySelectorAll("a");

    // // Получаем ширину контейнера
    // function getContainerWidth() {
    //     return touchSlider.offsetWidth;
    // }

    // // === ОБЩИЕ ФУНКЦИИ ДЛЯ ДВИЖЕНИЯ ===
    // function startDrag(x) {
    //     isDown = true;
    //     moved = false;
    //     startX = x;

    //     touchSlider.classList.remove("wiggle-slow");
    //     touchSlider.style.removeProperty("transition");


    //     setTimeout(() => {
    //         if (!moved) {
    //             touchSlider.classList.add("wiggle-slow");
    //         }
    //     }, 500);
    // }



    // function moveDrag(x) {
    //     if (!isDown) return;

    //     const deltaPx = x - startX;
    //     if (Math.abs(deltaPx) > 2) moved = true;

    //     // отключаем ссылки только если движение реально началось
    //     sliderLinks.forEach(link => {
    //         link.style.pointerEvents = "none";
    //     });

    //     const containerWidth = getContainerWidth();
    //     let deltaPercent = (deltaPx / containerWidth) * 100;
    //     deltaPercent *= sensitivity;

    //     currentPercent = startPercent + deltaPercent;

    //     if (currentPercent < minPercent) currentPercent = minPercent;
    //     if (currentPercent > maxPercent) currentPercent = maxPercent;

    //     touchSlider.style.transform = `translateX(${currentPercent}%)`;
    // }

    // function endDrag() {
    //     if (!isDown) return;
    //     isDown = false;

    //     touchSlider.style.transition = "transform 0.3s ease";
    //     touchSlider.style.transform = `translateX(${startPercent}%)`;

    //     const onTransitionEnd = () => {
    //         touchSlider.classList.add("wiggle-slow");
    //         touchSlider.removeEventListener("transitionend", onTransitionEnd);
    //         touchSlider.style.removeProperty("transform");
    //         touchSlider.style.removeProperty("transition");
    //     };
    //     touchSlider.addEventListener("transitionend", onTransitionEnd);

    //     currentPercent = startPercent;
    //     // включаем ссылки обратно
    //     sliderLinks.forEach(link => {
    //         link.style.pointerEvents = "";
    //     });
    // }

    // // === TOUCH EVENT HANDLERS ===
    // function touchStartHandler(e) {
    //     startDrag(e.touches[0].clientX);
    // }

    // function touchMoveHandler(e) {
    //     e.preventDefault();
    //     moveDrag(e.touches[0].clientX);
    // }

    // function touchEndHandler() {
    //     endDrag();
    // }

    // // === MOUSE EVENT HANDLERS ===
    // function mouseDownHandler(e) {
    //     startDrag(e.clientX);
    //     document.addEventListener("mousemove", mouseMoveHandler);
    //     document.addEventListener("mouseup", mouseUpHandler);
    // }

    // function mouseMoveHandler(e) {
    //     moveDrag(e.clientX);
    // }

    // function mouseUpHandler(e) {
    //     endDrag();
    //     document.removeEventListener("mousemove", mouseMoveHandler);
    //     document.removeEventListener("mouseup", mouseUpHandler);
    // }

    // // === CLICK PREVENT IF DRAGGED ===
    // function clickHandler(e) {
    //     if (moved) {
    //         e.preventDefault();
    //         e.stopImmediatePropagation();
    //     }
    // }

    // // === ENABLE / DISABLE LISTENERS ===
    // function enableSlider() {
    //     touchSlider.style.transform = `translateX(${startPercent}%)`;

    //     // TOUCH
    //     touchSlider.addEventListener("touchstart", touchStartHandler, { passive: false });
    //     touchSlider.addEventListener("touchmove", touchMoveHandler, { passive: false });
    //     touchSlider.addEventListener("touchend", touchEndHandler);

    //     // MOUSE
    //     touchSlider.addEventListener("mousedown", mouseDownHandler);

    //     // CLICK
    //     touchSlider.addEventListener("click", clickHandler);
    // }

    // function disableSlider() {
    //     // TOUCH
    //     touchSlider.removeEventListener("touchstart", touchStartHandler);
    //     touchSlider.removeEventListener("touchmove", touchMoveHandler);
    //     touchSlider.removeEventListener("touchend", touchEndHandler);

    //     // MOUSE
    //     touchSlider.removeEventListener("mousedown", mouseDownHandler);

    //     // CLICK
    //     touchSlider.removeEventListener("click", clickHandler);

    //     // Inline styles
    //     touchSlider.style.removeProperty("transform");
    //     touchSlider.style.removeProperty("transition");

    // }

    // // === MOBILE CHECK ===
    // function handleScreenChange() {
    //     if (window.matchMedia("(max-width: 576px)").matches) {
    //         enableSlider();
    //     } else {
    //         disableSlider();
    //     }
    // }

    // // Инициализация
    // window.addEventListener("load", handleScreenChange);
    // window.addEventListener("resize", handleScreenChange);
    // window.addEventListener("orientationchange", handleScreenChange);



    /* ------------------------------------------------------------------------------------------------------------------------------
    BANNERS TOUCH + MOUSE SLIDER (mobile only) with link-disable during drag + edge delay
    ----------------------------------------------------------------------------------------------------------------*/
    /* ------------------------------------------------------------------------------------------------------------------------------
    BANNERS TOUCH + MOUSE SLIDER (mobile only) with link-disable during drag + edge delay + current position drag
    ----------------------------------------------------------------------------------------------------------------*/
    const touchSlider = document.querySelector(".custom-group");

    let startPercent = -31.85;
    let currentPercent = startPercent;
    const minPercent = -65;
    const maxPercent = 1.4;
    const sensitivity = 2.0;

    let isDown = false;
    let moved = false;
    let startX = 0;
    let dragStartPercent = startPercent; // добавляем переменную для drag
    let edgeTimeout = null; // таймер для задержки на краю

    // Получаем все ссылки внутри слайдера
    const sliderLinks = touchSlider.querySelectorAll("a");

    // Получаем ширину контейнера
    function getContainerWidth() {
        return touchSlider.offsetWidth;
    }

    // === ОБЩИЕ ФУНКЦИИ ДЛЯ ДВИЖЕНИЯ ===
    function startDrag(x) {
        isDown = true;
        moved = false;

        // если был таймер для возврата, отменяем
        if (edgeTimeout) {
            clearTimeout(edgeTimeout);
            edgeTimeout = null;
        }

        startX = x;
        dragStartPercent = currentPercent; // берём текущее положение как стартовую точку drag

        touchSlider.classList.remove("wiggle-slow");
        touchSlider.style.removeProperty("transition");

        setTimeout(() => {
            if (!moved) {
                touchSlider.classList.add("wiggle-slow");
            }
        }, 500);
    }

    function moveDrag(x) {
        if (!isDown) return;

        const deltaPx = x - startX;
        if (Math.abs(deltaPx) > 2) moved = true;

        // отключаем ссылки только если движение реально началось
        sliderLinks.forEach(link => {
            link.style.pointerEvents = "none";
        });

        const containerWidth = getContainerWidth();
        let deltaPercent = (deltaPx / containerWidth) * 100;
        deltaPercent *= sensitivity;

        currentPercent = dragStartPercent + deltaPercent; // используем dragStartPercent вместо startPercent

        if (currentPercent < minPercent) currentPercent = minPercent;
        if (currentPercent > maxPercent) currentPercent = maxPercent;

        touchSlider.style.transform = `translateX(${currentPercent}%)`;
    }

    function endDrag() {
        if (!isDown) return;
        isDown = false;

        // включаем ссылки обратно
        sliderLinks.forEach(link => {
            link.style.pointerEvents = "";
        });

        // если дотянули до края — задержка 3 сек
        if (currentPercent === minPercent || currentPercent === maxPercent) {
            edgeTimeout = setTimeout(() => {
                touchSlider.style.transition = "transform 0.3s ease";
                touchSlider.style.transform = `translateX(${startPercent}%)`;

                const onTransitionEnd = () => {
                    touchSlider.classList.add("wiggle-slow");
                    touchSlider.removeEventListener("transitionend", onTransitionEnd);
                    touchSlider.style.removeProperty("transform");
                    touchSlider.style.removeProperty("transition");
                };
                touchSlider.addEventListener("transitionend", onTransitionEnd);

                currentPercent = startPercent;
                edgeTimeout = null;
            }, 5000); // 3 секунды задержка
        } else {
            // обычный возврат сразу
            touchSlider.style.transition = "transform 0.3s ease";
            touchSlider.style.transform = `translateX(${startPercent}%)`;

            const onTransitionEnd = () => {
                touchSlider.classList.add("wiggle-slow");
                touchSlider.removeEventListener("transitionend", onTransitionEnd);
                touchSlider.style.removeProperty("transform");
                touchSlider.style.removeProperty("transition");
            };
            touchSlider.addEventListener("transitionend", onTransitionEnd);

            currentPercent = startPercent;
        }
    }

    // === TOUCH EVENT HANDLERS ===
    function touchStartHandler(e) {
        startDrag(e.touches[0].clientX);
    }

    function touchMoveHandler(e) {
        e.preventDefault();
        moveDrag(e.touches[0].clientX);
    }

    function touchEndHandler() {
        endDrag();
    }

    // === MOUSE EVENT HANDLERS ===
    function mouseDownHandler(e) {
        startDrag(e.clientX);
        document.addEventListener("mousemove", mouseMoveHandler);
        document.addEventListener("mouseup", mouseUpHandler);
    }

    function mouseMoveHandler(e) {
        moveDrag(e.clientX);
    }

    function mouseUpHandler(e) {
        endDrag();
        document.removeEventListener("mousemove", mouseMoveHandler);
        document.removeEventListener("mouseup", mouseUpHandler);
    }

    // === CLICK PREVENT IF DRAGGED ===
    function clickHandler(e) {
        if (moved) {
            e.preventDefault();
            e.stopImmediatePropagation();
        }
    }

    // === ENABLE / DISABLE LISTENERS ===
    function enableSlider() {
        touchSlider.style.transform = `translateX(${startPercent}%)`;

        // TOUCH
        touchSlider.addEventListener("touchstart", touchStartHandler, { passive: false });
        touchSlider.addEventListener("touchmove", touchMoveHandler, { passive: false });
        touchSlider.addEventListener("touchend", touchEndHandler);

        // MOUSE
        touchSlider.addEventListener("mousedown", mouseDownHandler);

        // CLICK
        touchSlider.addEventListener("click", clickHandler);
    }

    function disableSlider() {
        // TOUCH
        touchSlider.removeEventListener("touchstart", touchStartHandler);
        touchSlider.removeEventListener("touchmove", touchMoveHandler);
        touchSlider.removeEventListener("touchend", touchEndHandler);

        // MOUSE
        touchSlider.removeEventListener("mousedown", mouseDownHandler);

        // CLICK
        touchSlider.removeEventListener("click", clickHandler);

        // Inline styles
        touchSlider.style.removeProperty("transform");
        touchSlider.style.removeProperty("transition");

        // если был таймер — сбрасываем
        if (edgeTimeout) {
            clearTimeout(edgeTimeout);
            edgeTimeout = null;
        }
    }

    // === MOBILE CHECK ===
    function handleScreenChange() {
        if (window.matchMedia("(max-width: 576px)").matches) {
            enableSlider();
        } else {
            disableSlider();
        }
    }

    // Инициализация
    window.addEventListener("load", handleScreenChange);
    window.addEventListener("resize", handleScreenChange);
    window.addEventListener("orientationchange", handleScreenChange);

})