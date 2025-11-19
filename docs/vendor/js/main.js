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


    /* ------------------------------------------------------------------------------------------------------------------------------
   POPUP SLIDER
    ----------------------------------------------------------------------------------------------------------------*/

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
   CUSTOM SLIDER + BANNERS TOUCH + MOUSE SLIDER (mobile only) with link-disable during drag + edge delay
    ----------------------------------------------------------------------------------------------------------------*/
    // --- FULL robust slider JS with snapping, returning and wiggle ---
    // Expects CSS to use: transform: translateX(var(--bannersPos));
    // and classes: .dragging, .returning, .at-edge, .wiggle-slow
    // CSS must define transition for .returning (using --animationDuration), wiggle-slow is keyframes.

    (function () {
        const customSlider = document.querySelector(".custom-slider");
        if (!customSlider) return;

        // config
        const startPercent = -31.85;
        let currentPercent = startPercent;
        const minPercent = -65;
        const maxPercent = 1.4;
        const sensitivity = 2.0; // multiplier for drag sensitivity
        const holdDuration = 5000; // ms to hold at edge

        // internal state
        let isDown = false;
        let moved = false;
        let startX = 0;
        let dragStartPercent = startPercent;
        let edgeTimeout = null;
        let returnTimer = null; // timer for finishing return and adding wiggle

        const sliderLinks = customSlider.querySelectorAll("a");

        // read animation duration from CSS variable, robust parsing
        function readAnimationDuration() {
            const raw = getComputedStyle(customSlider).getPropertyValue("--animationDuration")
                || getComputedStyle(document.documentElement).getPropertyValue("--animationDuration")
                || "";
            const s = raw.trim();
            if (!s) return 1000;
            if (s.endsWith("ms")) return parseFloat(s);
            if (s.endsWith("s")) return parseFloat(s) * 1000;
            // fallback numeric
            const n = parseFloat(s);
            return Number.isFinite(n) ? n : 1000;
        }

        // helper to set CSS variable position
        function setPos(percent) {
            customSlider.style.setProperty("--bannersPos", percent + "%");

        }

        function clearReturnTimer() {
            if (returnTimer) {
                clearTimeout(returnTimer);
                returnTimer = null;
            }
        }
        function clearEdgeTimeout() {
            if (edgeTimeout) {
                clearTimeout(edgeTimeout);
                edgeTimeout = null;
            }
        }

        // === START DRAG ===
        function startDrag(x) {
            isDown = true;
            moved = false;

            // stop any auto-return / wiggle timers and classes
            clearEdgeTimeout();
            clearReturnTimer();
            customSlider.classList.remove("returning", "wiggle-slow", "at-edge");

            startX = x;
            dragStartPercent = currentPercent;

            // visual state
            customSlider.classList.add("dragging");
        }

        // === MOVE DRAG ===
        function moveDrag(x) {
            if (!isDown) return;

            const delta = x - startX;
            if (Math.abs(delta) > 2) moved = true;

            // disable links while dragging
            sliderLinks.forEach(a => (a.style.pointerEvents = "none"));

            let deltaPercent = (delta / customSlider.offsetWidth) * 100;
            deltaPercent *= sensitivity;

            currentPercent = dragStartPercent + deltaPercent;

            if (currentPercent < minPercent) currentPercent = minPercent;
            if (currentPercent > maxPercent) currentPercent = maxPercent;

            setPos(currentPercent);
        }

        // === ANIMATE RETURN TO CENTER (uses CSS .returning) ===
        function animateReturnToCenter() {
            // stop timers
            clearEdgeTimeout();
            clearReturnTimer();

            // set logical state
            currentPercent = startPercent;
            dragStartPercent = startPercent;
            moved = false;

            // set CSS variable and trigger transition class
            setPos(startPercent);

            // add returning class which must have CSS transition for transform
            customSlider.classList.add("returning");

            // schedule end-of-transition actions based on CSS duration
            const duration = readAnimationDuration();
            const safety = 40; // small extra ms

            // clear previous timer if any
            clearReturnTimer();

            returnTimer = setTimeout(() => {
                returnTimer = null;
                customSlider.classList.remove("returning");
                // after smooth return, start wiggle animation (CSS keyframes)
                customSlider.classList.add("wiggle-slow");
                // remove inline transform control? we keep using --bannersPos, wiggle CSS should use transform relative to original position
                // note: we intentionally keep --bannersPos set to startPercent so keyframe can reference it if needed
            }, Math.max(0, duration) + safety);
        }

        // === SNAP TO EDGE (animate to min/max then hold) ===
        function snapToEdge(edgePercent) {
            // stop timers
            clearEdgeTimeout();
            clearReturnTimer();

            // set target
            currentPercent = edgePercent;
            dragStartPercent = edgePercent;
            moved = false;

            // apply pos and add returning class to animate
            setPos(edgePercent);
            customSlider.classList.add("returning");

            // when snapped, mark at-edge and start hold timer
            // wait for transition to finish (use CSS duration + safety)
            const duration = readAnimationDuration();
            const safety = 40;

            // schedule: after transition -> remove returning, set at-edge state (no wiggle yet)
            clearReturnTimer();
            returnTimer = setTimeout(() => {
                returnTimer = null;
                customSlider.classList.remove("returning");
                customSlider.classList.remove("wiggle-slow"); // ensure wiggle not active while holding
                customSlider.classList.add("at-edge");

                // hold for holdDuration then return to center
                clearEdgeTimeout();
                edgeTimeout = setTimeout(() => {
                    customSlider.classList.remove("at-edge");
                    edgeTimeout = null;
                    animateReturnToCenter();
                }, holdDuration);
            }, Math.max(0, duration) + safety);
        }

        // === END DRAG with snapping logic ===
        function endDrag() {
            if (!isDown) return;
            isDown = false;

            // re-enable links
            sliderLinks.forEach(a => (a.style.pointerEvents = ""));

            customSlider.classList.remove("dragging");

            // compute snap thresholds (midpoints)
            const leftSnapPoint = (startPercent + minPercent) / 2;
            const rightSnapPoint = (startPercent + maxPercent) / 2;

            if (currentPercent <= leftSnapPoint) {
                // snap left
                snapToEdge(minPercent);
                return;
            } else if (currentPercent >= rightSnapPoint) {
                // snap right
                snapToEdge(maxPercent);
                return;
            } else {
                // didn't reach half -> return center
                animateReturnToCenter();
                return;
            }
        }

        // === CLICK HANDLER: if simple click while at-edge -> cancel hold and return ===
        function clickHandler(e) {
            if (moved) {
                e.preventDefault();
                return;
            }

            if (customSlider.classList.contains("at-edge")) {
                // cancel hold and go to center immediately
                clearEdgeTimeout();
                customSlider.classList.remove("at-edge");
                animateReturnToCenter();
                e.preventDefault();
            }
        }

        // === Event wrappers ===
        function touchStart(e) { if (e.touches && e.touches[0]) startDrag(e.touches[0].clientX); }
        function touchMove(e) { if (e.touches && e.touches[0]) { e.preventDefault(); moveDrag(e.touches[0].clientX); } }
        function touchEnd() { endDrag(); }

        function mouseStart(e) {
            startDrag(e.clientX);
            document.addEventListener("mousemove", mouseMove);
            document.addEventListener("mouseup", mouseEnd);
        }
        function mouseMove(e) { moveDrag(e.clientX); }
        function mouseEnd(e) {
            endDrag();
            document.removeEventListener("mousemove", mouseMove);
            document.removeEventListener("mouseup", mouseEnd);
        }

        // === Enable / Disable ===
        function enableSlider() {
            // initialize CSS var and classes
            setPos(startPercent);

            customSlider.classList.remove("returning", "dragging", "at-edge");
            customSlider.classList.add("wiggle-slow");

            // listeners
            customSlider.addEventListener("touchstart", touchStart, { passive: false });
            customSlider.addEventListener("touchmove", touchMove, { passive: false });
            customSlider.addEventListener("touchend", touchEnd);

            customSlider.addEventListener("mousedown", mouseStart);
            customSlider.addEventListener("click", clickHandler);
        }

        function disableSlider() {
            customSlider.removeEventListener("touchstart", touchStart);
            customSlider.removeEventListener("touchmove", touchMove);
            customSlider.removeEventListener("touchend", touchEnd);

            customSlider.removeEventListener("mousedown", mouseStart);
            customSlider.removeEventListener("click", clickHandler);

            customSlider.classList.remove("dragging", "returning", "at-edge", "wiggle-slow");
            customSlider.style.removeProperty("--bannersPos");

            clearEdgeTimeout();
            clearReturnTimer();
        }

        // === Screen check (mobile only) ===
        function handleScreen() {
            if (window.matchMedia("(max-width: 576px)").matches) enableSlider();
            else disableSlider();
        }

        // init
        window.addEventListener("load", handleScreen);
        window.addEventListener("resize", handleScreen);
        window.addEventListener("orientationchange", handleScreen);

    })();

})