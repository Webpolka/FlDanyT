document.addEventListener("DOMContentLoaded", () => {
    const swipers = [];
    const directions = [];
    let autoplayEnabled = window.innerWidth <= 768; // включено ли сейчас авто-листание

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
        directions.push(1);

        window.addEventListener('mousemove', (event) => {
            handleMouseMove(event, sliderEl);
        });
    });

    // следим за ресайзом окна
    window.addEventListener("resize", () => {
        autoplayEnabled = window.innerWidth <= 768;
    });

    // функция ping-pong с проверкой ширины
    async function runSequencePingPong() {
        while (true) {

            // Если экран > 992, ждём и ничего не листаем
            if (!autoplayEnabled) {
                await new Promise(res => setTimeout(res, 300));
                continue;
            }

            for (let i = 0; i < swipers.length; i++) {
                const swiper = swipers[i];

                if (swiper.slides.length <= swiper.params.slidesPerView) continue;

                if (directions[i] === 1 && swiper.isEnd) {
                    directions[i] = -1;
                } else if (directions[i] === -1 && swiper.isBeginning) {
                    directions[i] = 1;
                }

                directions[i] === 1 ? swiper.slideNext() : swiper.slidePrev();

                await new Promise(res => setTimeout(res, 2000));
            }
        }
    }

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

        // --- CONFIG ---
        const positions = { left: -65, center: -31.85, right: 1.4 };
        let currentPos = positions.center;
        const sensitivity = 2.0;
        const holdDuration = 5000;

        // --- STATE ---
        let isDown = false;
        let moved = false;
        let startX = 0;
        let dragStartPos = positions.center;
        let edgeTimeout = null;
        let returnTimer = null;

        const sliderLinks = customSlider.querySelectorAll("a");

        // --- HELPERS ---
        function setPos(percent) {
            customSlider.style.setProperty("--bannersPos", percent + "%");
        }

        function clearTimers() {
            if (edgeTimeout) { clearTimeout(edgeTimeout); edgeTimeout = null; }
            if (returnTimer) { clearTimeout(returnTimer); returnTimer = null; }
        }

        function readAnimationDuration() {
            const raw = getComputedStyle(customSlider).getPropertyValue("--animationDuration")
                || getComputedStyle(document.documentElement).getPropertyValue("--animationDuration") || "";
            const s = raw.trim();
            if (!s) return 1000;
            if (s.endsWith("ms")) return parseFloat(s);
            if (s.endsWith("s")) return parseFloat(s) * 1000;
            const n = parseFloat(s);
            return Number.isFinite(n) ? n : 1000;
        }

        // --- ANIMATION FUNCTIONS ---
        function animateTo(pos, callback) {
            clearTimers();
            currentPos = pos;
            dragStartPos = pos;
            moved = false;

            setPos(pos);
            customSlider.classList.add("returning");
            customSlider.classList.remove("wiggle-slow", "at-edge");

            const duration = readAnimationDuration();
            const safety = 40;

            returnTimer = setTimeout(() => {
                customSlider.classList.remove("returning");
                returnTimer = null;
                if (callback) callback();
            }, duration + safety);
        }

        function animateReturnToCenter() {
            animateTo(positions.center, () => {
                customSlider.classList.add("wiggle-slow");
            });
        }

        function holdAtEdge(pos) {
            animateTo(pos, () => {
                customSlider.classList.add("at-edge");
                edgeTimeout = setTimeout(() => {
                    customSlider.classList.remove("at-edge");
                    edgeTimeout = null;
                    animateReturnToCenter();
                }, holdDuration);
            });
        }

        // --- DRAG HANDLERS ---
        function startDrag(x) {
            isDown = true;
            moved = false;
            clearTimers();

            customSlider.classList.remove("returning", "wiggle-slow", "at-edge");
            customSlider.classList.add("dragging");

            startX = x;
            dragStartPos = currentPos;
        }

        function moveDrag(x) {
            if (!isDown) return;

            const delta = x - startX;
            if (Math.abs(delta) > 2) moved = true;

            sliderLinks.forEach(a => a.style.pointerEvents = "none");

            let deltaPercent = (delta / customSlider.offsetWidth) * 100 * sensitivity;
            currentPos = dragStartPos + deltaPercent;

            if (currentPos < positions.left) currentPos = positions.left;
            if (currentPos > positions.right) currentPos = positions.right;

            setPos(currentPos);
        }

        function endDrag() {
            if (!isDown) return;
            isDown = false;

            sliderLinks.forEach(a => a.style.pointerEvents = "");
            customSlider.classList.remove("dragging");

            // Если не было движения — ничего не делаем
            if (!moved) return;

            const delta = currentPos - dragStartPos;

            // --- ДОПУСТИМЫЕ НАПРАВЛЕНИЯ ---
            const canSwipeLeft = dragStartPos !== positions.left;
            const canSwipeRight = dragStartPos !== positions.right;

            // Свайп влево
            if (delta < 0 && canSwipeLeft) {
                if (dragStartPos === positions.center) {
                    holdAtEdge(positions.left);
                } else if (dragStartPos === positions.right) {
                    animateReturnToCenter();
                }
            }
            // Свайп вправо
            else if (delta > 0 && canSwipeRight) {
                if (dragStartPos === positions.center) {
                    holdAtEdge(positions.right);
                } else if (dragStartPos === positions.left) {
                    animateReturnToCenter();
                }
            }
            // Свайпы в сторону, где край уже достигнут — ничего не делаем
        }

        // --- CLICK HANDLER ---
        function clickHandler(e) {
            // Если не было движения — игнорируем клик
            if (!moved) return;

            if (customSlider.classList.contains("at-edge")) {
                clearTimers();
                customSlider.classList.remove("at-edge");
                animateReturnToCenter();
                e.preventDefault();
            }
        }

        // --- TOUCH & MOUSE EVENTS ---
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

        // --- ENABLE/DISABLE ---
        function enableSlider() {
            setPos(positions.center);
            customSlider.classList.remove("returning", "dragging", "at-edge");
            customSlider.classList.add("wiggle-slow");

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

            clearTimers();
        }

        // --- SCREEN CHECK ---
        function handleScreen() {
            if (window.matchMedia("(max-width: 576px)").matches) enableSlider();
            else disableSlider();
        }

        // --- INIT ---
        window.addEventListener("load", handleScreen);
        window.addEventListener("resize", handleScreen);
        window.addEventListener("orientationchange", handleScreen);
    })();


})