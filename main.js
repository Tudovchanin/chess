class SliderLoop {
  constructor() { }

  initSliderLoop({
    sliderTrack,
    item,
    allItem,
    visibleSlide = 1
  }) {
    this.elemSliderTrack = sliderTrack;
    this.elementsItems = allItem;
    this.elemItem = item;

    this.slideVisible = visibleSlide;
    this.distanceMove = this.elemItem.offsetWidth;
    this.position = -this.distanceMove * this.slideVisible;
    this.currentIndex = 0;
    this.initialLengthItems = allItem.length

    this.cloneItems();
    this.initStartPosition(-this.distanceMove * this.slideVisible);
  }

  cloneItems() {
    for (let index = 0; index < this.slideVisible; index++) {
      const firstClones = this.elementsItems[index].cloneNode(true);
      firstClones.classList.add('clone');
      this.elemSliderTrack.append(firstClones);
    }

    for (let index = 1; index <= this.slideVisible; index++) {
      const lastClones = this.elementsItems[this.elementsItems.length - index].cloneNode(true);
      lastClones.classList.add('clone');
      this.elemSliderTrack.prepend(lastClones);
    }
  }

  removeCloneItems() {
    const clones = this.elemSliderTrack.querySelectorAll('.clone');
    clones.forEach(clone => clone.remove());
  }

  initStartPosition(distance) {
    this.elemSliderTrack.style.transition = 'none';
    this.animateSlider(this.elemSliderTrack, distance);
    setTimeout(() => {
      this.initTransition();
    }, 100);
  }

  initTransition(transitionValue = 'transform 0.4s linear') {
    this.elemSliderTrack.style.transition = transitionValue;
    this.valueTransition = transitionValue
  }

  moveNext() {
    this.currentIndex++;
    this.position -= this.distanceMove;
    this.animateSlider(this.elemSliderTrack, this.position);


    if (this.currentIndex > this.initialLengthItems - 1) {

      setTimeout(() => {
        this.currentIndex = 0;
        this.position = -this.distanceMove * this.slideVisible;
        this.initStartPosition(this.position);
      }, 400);

      setTimeout(() => {
        this.elemSliderTrack.style.transition = this.valueTransition;
      }, 420);
    }
  }

  movePrev() {
    this.currentIndex--;
    this.position += this.distanceMove;
    this.animateSlider(this.elemSliderTrack, this.position);
    if (this.currentIndex <= -this.slideVisible) {

      setTimeout(() => {
        this.currentIndex = this.initialLengthItems - this.slideVisible;
        this.position = -this.distanceMove * this.initialLengthItems;
        this.initStartPosition(this.position)
      }, 400);

      setTimeout(() => {
        this.elemSliderTrack.style.transition = this.valueTransition;
      }, 420);


    }
  }

  animateSlider(elem, valueTranslate) {
    requestAnimationFrame(() => {
      elem.style.transform = `translateX(${valueTranslate}px)`;
    });
  }


  reset() {

    this.distanceMove = this.elemItem.offsetWidth;
    this.currentIndex = 0;
    this.position = -this.distanceMove * this.slideVisible;
    this.elemSliderTrack.style.transform = `translateX(${this.position}px)`;
    this.removeCloneItems();
    this.cloneItems();
    this.initStartPosition(-this.distanceMove * this.slideVisible);

  }
}
class Slider {

  constructor(mediaQueries) {
    this.mediaQueries = mediaQueries;
  }

  // Метод инициализации слайдера, принимает объект с параметрами
  initSlider({ btnNext = null, btnPrev = null, sliderTrack, item, itemLength }) {
    this.flagDragDropMouse = false; // Флаг dragDrop для desktop
    this.flagDragDropTouch = false; // Флаг dragDrop для touch устройств

    this.windowWidth = document.documentElement.clientWidth; // Ширина окна

    this.elemItem = item; // Один элемент слайдера
    this.elemBtnNext = btnNext; // Кнопка для перехода к следующему слайду
    this.elemBtnPrev = btnPrev; // Кнопка для перехода к предыдущему слайду
    this.elemSliderTrack = sliderTrack; // Сам слайдер

    this.stepNumber = 1; // Текущий шаг
    this.position = 0; // Начальная позиция слайдера
    this.sliderLength = itemLength; // Количество элементов item слайдера
    this.visibleSlides = this.getVisibleSlidesMediaQueries(this.mediaQueries); // Количество видимых слайдов
    this.distance = this.updateWidthItem(); // Ширина одного элемента слайдера
    this.setTotalSteps();

    this.onResize = this.handleResize.bind(this); // обработчик события resize
    this.onDOMLoaded = this.handleDOMLoaded.bind(this); // обработчик события DOMContentLoaded

    // Установка обработчика события, когда документ полностью загружен
    document.addEventListener("DOMContentLoaded", this.onDOMLoaded);

    // Обработчик события изменения размера окна
    window.addEventListener("resize", this.onResize);

    // Установка обработчиков событий для кнопок вперед / назад
    if (this.elemBtnNext && this.elemBtnPrev) {
      this.onclickNext = this.handleClickNext.bind(this);
      this.onclickPrev = this.handleClickPrev.bind(this);

      this.elemBtnNext.addEventListener("click", this.onclickNext);
      this.elemBtnPrev.addEventListener("click", this.onclickPrev);
    }
  }

  dispatchSlideChangeEvent() {
    const event = new CustomEvent("slideChanged", {
      bubbles: true,
      detail: {
        currentStep: this.stepNumber,
        totalSteps: this.totalSteps,
      },
    });

    this.elemSliderTrack.dispatchEvent(event);
  }
  dispatchSliderMove() {
    const event = new CustomEvent("slideMove", {
      bubbles: true,
      detail: {
        currentStep: this.stepNumber,
        totalSteps: this.totalSteps,
      },
    });

    this.elemSliderTrack.dispatchEvent(event);
  }
  initStepsCallback(callBack) {
    this.callBackSteps = callBack;
  }
  initResizeCallback(callback) {
    this.callBackResize = callback;
  }

  // Удаление событий
  removeAllListener() {
    document.removeEventListener("DOMContentLoaded", this.onDOMLoaded);
    window.removeEventListener("resize", this.onResize);

    if (this.elemBtnNext && this.elemBtnPrev) {
      this.elemBtnNext.removeEventListener("click", this.onclickNext);
      this.elemBtnPrev.removeEventListener("click", this.onclickPrev);
    }

    if (this.flagDragDropMouse) {
      // Обработчики событий для мыши
      this.elemSliderTrack.removeEventListener("mousedown", this.onmousedown);

      this.elemSliderTrack.removeEventListener("mousemove", this.onmousemove);

      document.removeEventListener("mouseup", this.onmouseup);
    }

    if (this.flagDragDropTouch) {
      this.elemSliderTrack.removeEventListener("touchstart", this.ontouchstart);
      this.elemSliderTrack.removeEventListener("touchmove", this.ontouchmove);
      document.removeEventListener("touchend", this.ontouchend);
    }
  }

  handleClickNext() {
    this.moveNext();
    this.updateButtonStates();
    this.setSlideStep();
  }

  handleClickPrev() {
    this.movePrev();
    this.updateButtonStates();
    this.setSlideStep();
  }

  handleResize() {
    let newWindowWidth = document.documentElement.clientWidth;
    if (newWindowWidth === this.windowWidth) return;
    this.resetSlider();
    this.distance = this.updateWidthItem();
    this.visibleSlides = this.getVisibleSlidesMediaQueries(this.mediaQueries);
    this.updateButtonStates();
    this.setTotalSteps();
    this.windowWidth = newWindowWidth;
    this.dispatchSlideChangeEvent();
    if (this.callBackResize) {
      this.callBackResize();
    }
    if (this.callBackSteps) {
      this.callBackSteps(this.stepNumber, this.totalSteps);
    }
  }

  handleDOMLoaded() {
    this.updateButtonStates();
    this.setTotalSteps();
    this.dispatchSlideChangeEvent();
    if (this.callBackSteps) {
      this.callBackSteps(this.stepNumber, this.totalSteps);
    }
  }

  initDragDrop(desktop = false) {
    this.flagDragDropTouch = true;
    this.isDragging = false; // Флаг перетаскивания
    this.touchStart = 0; // Начальная точка касания/клика
    this.touchEnd = 0; // Конечная точка касания/клика
    this.touchMove = 0; // Текущая позиция перетаскивания
    this.ontouchstart = this.handleStart.bind(this);
    this.ontouchmove = this.handleMove.bind(this);
    this.ontouchend = this.handleEnd.bind(this);

    // Обработчик события начала касания
    this.elemSliderTrack.addEventListener("touchstart", this.ontouchstart, {
      passive: false,
    });

    // Обработчик события перемещения касания
    this.elemSliderTrack.addEventListener("touchmove", this.ontouchmove, {
      passive: false,
    });

    // Обработчик события завершения касания
    document.addEventListener("touchend", this.ontouchend);

    if (!desktop) return;
    this.flagDragDropMouse = true;

    this.onmousedown = this.handleStart.bind(this);
    this.onmousemove = this.handleMove.bind(this);
    this.onmouseup = this.handleEnd.bind(this);

    // Обработчики событий для мыши
    this.elemSliderTrack.addEventListener("mousedown", this.onmousedown, {
      passive: false,
    });

    this.elemSliderTrack.addEventListener("mousemove", this.onmousemove, {
      passive: false,
    });

    document.addEventListener("mouseup", this.onmouseup);
  }

  handleStart(e) {
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;

    this.startDragDrop(clientX);
  }

  handleMove(e) {
    if (!this.isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    this.moveDragDrop(clientX);
    this.dispatchSliderMove();
  }

  handleEnd(e) {
    if (!this.isDragging) return;
    this.endDragDrop();
  }

  // Метод начала перетаскивания
  startDragDrop(value) {
    this.isDragging = true;
    this.touchStart = value;
  }

  // Метод перемещения при перетаскивании
  moveDragDrop(value) {
    this.touchMove = value - this.touchStart + this.position;
    this.animateSlider(this.elemSliderTrack, this.touchMove);
    this.touchEnd = value;
  }

  // Метод завершения перетаскивания
  endDragDrop() {
    this.isDragging = false;
    this.position = this.touchMove;

    setTimeout(() => {
      // Если позиция больше 0, вернуться к началу
      if (this.position > 0) {
        this.animateSlider(this.elemSliderTrack, 0);
        this.position = 0;

        this.setSlideStep();

        // Если позиция меньше конца слайдера, вернуться к концу
      } else if (this.position < this.sliderEnd()) {
        this.animateSlider(this.elemSliderTrack, this.sliderEnd());
        this.position = this.sliderEnd();
        this.setSlideStep();
        // Если перетаскивание было значительным, перейти на следующий слайд
      } else if (this.touchEnd - this.touchStart < -20) {
        this.position =
          this.distance * Math.floor(this.position / this.distance);

        this.setSlideStep();
        this.animateSlider(this.elemSliderTrack, this.position);

        // Если перетаскивание было значительным, перейти на предыдущий слайд
      } else if (this.touchEnd - this.touchStart > 20) {
        this.position =
          this.distance * Math.ceil(this.position / this.distance);

        this.setSlideStep();
        this.animateSlider(this.elemSliderTrack, this.position);
        // Иначе, оставить на текущем слайде
      } else {
        this.position =
          this.distance * Math.round(this.position / this.distance);
        this.animateSlider(this.elemSliderTrack, this.position);
      }
      this.updateButtonStates();
    }, 100);
  }

  // Метод вычисления конца слайдера
  sliderEnd() {
    return -(
      this.sliderLength * this.distance -
      this.visibleSlides * this.distance
    );
  }

  // Метод установки общего количества шагов
  setTotalSteps() {
    this.totalSteps = this.sliderLength - this.visibleSlides + 1;
  }

  // Метод установки текущего шага
  setSlideStep() {
    if (this.position > 0) return;
    const valueStep = Math.abs(this.position / this.distance) + 1;
    this.stepNumber = valueStep;

    if (this.callBackSteps) {
      this.callBackSteps(this.stepNumber, this.totalSteps);
    }
    this.dispatchSlideChangeEvent();
  }

  // Метод получения количества видимых слайдов по медиа-запросам
  getVisibleSlidesMediaQueries(arrObjectsMedia) {
    for (let index = 0; index < arrObjectsMedia.length; index++) {
      const objMedia = arrObjectsMedia[index];
      for (let key in objMedia) {
        if (objMedia.hasOwnProperty(key) && objMedia[key].matches) {
          return parseInt(key);
        }
      }
    }
  }

  // Метод обновления ширины элемента
  updateWidthItem() {
    return this.elemItem.offsetWidth;
  }

  //Метод проверки кнопок для отключения или включения
  updateButtonStates() {
    if (this.elemBtnNext) {
      this.elemBtnNext.disabled = this.position <= this.sliderEnd();
    }
    if (this.elemBtnPrev) {
      this.elemBtnPrev.disabled = this.position >= 0;
    }
  }

  // Метод перехода к следующему слайду
  moveNext() {
    const valueEnd =
      this.visibleSlides * this.distance - this.distance * this.sliderLength;
    if (this.position <= valueEnd) return;

    this.position = this.position - this.distance;
    this.animateSlider(this.elemSliderTrack, this.position);
  }

  // Метод перехода к предыдущему слайду
  movePrev() {
    if (this.position === 0) return;

    this.position = this.position + this.distance;
    this.animateSlider(this.elemSliderTrack, this.position);
  }

  // Метод анимации слайдера
  animateSlider(elem, valueTranslate) {
    requestAnimationFrame(() => {
      elem.style.transform = `translateX(${valueTranslate}px)`;
    });
  }

  // Метод сброса слайдера
  resetSlider() {
    this.stepNumber = 1;
    this.position = 0;
    this.animateSlider(this.elemSliderTrack, this.position);
  }
}

function removeClassFromElements(elements, className) {
  elements.forEach(element => {
    element.classList.remove(className);
  });
};



const initSliderLoop = () => {


  const btnNextLoop = document.querySelector("#next-slide-loop");
  const btnPrevLoop = document.querySelector("#prev-slide-loop");


  let parametersLoopSlider = {
    sliderTrack: document.querySelector(".slider-loop__track"),
    allItem: document.querySelectorAll(".slider-loop__item"),
    item: document.querySelector(".slider-loop__item"),
    visibleSlide: 3
  };
  let sliderLoop = new SliderLoop();

  sliderLoop.initSliderLoop(parametersLoopSlider);


  let totalStepsSliderLoop = parametersLoopSlider.allItem.length
  let stepSliderLoop = 0;
  const initCount = countSliderLoop();
  initCount(
    totalStepsSliderLoop,
    stepSliderLoop
  )

  let autoTimer;
  let clickBtn = false;
  let clickStart = 0
  let dragStart = false;



  const mobileWidthMediaQuery = window.matchMedia('(max-width: 630px)');

  mobileWidthMediaQuery.addEventListener('change', function (event) {

    if (event.matches) {
      blockInterval();
      sliderLoop.reset();
      stepSliderLoop = 0
      initCount(totalStepsSliderLoop, stepSliderLoop);
    } else {
      blockInterval();
      sliderLoop.reset();
      stepSliderLoop = 0
      initCount(totalStepsSliderLoop, stepSliderLoop);
    }

  })

  let timer;

  window.addEventListener('resize', () => {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      blockInterval();
      sliderLoop.reset();
      stepSliderLoop = 0
      initCount(totalStepsSliderLoop, stepSliderLoop);
    }, 200);

  })


  btnNextLoop.addEventListener("click", () => {
    sliderLoop.moveNext();
    ++stepSliderLoop;
    initCount(totalStepsSliderLoop, stepSliderLoop);
    blockInterval();
  });
  btnPrevLoop.addEventListener("click", () => {
    sliderLoop.movePrev();
    --stepSliderLoop;
    initCount(totalStepsSliderLoop, stepSliderLoop);
    blockInterval();
  });

  parametersLoopSlider.sliderTrack.addEventListener('dragstart', (e) => {
    e.preventDefault();
  });

  parametersLoopSlider.sliderTrack.addEventListener('mousedown', (e) => {
    startDrag(e.clientX);
  });
  parametersLoopSlider.sliderTrack.addEventListener('mousemove', (e) => {
    moveDrag(e.clientX);
  });
  parametersLoopSlider.sliderTrack.addEventListener('mouseup', () => {
    endDrag();
  });
  parametersLoopSlider.sliderTrack.addEventListener('mouseleave', () => {
    endDrag();
  });
  parametersLoopSlider.sliderTrack.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      startDrag(e.touches[0].clientX);
    }
  });
  parametersLoopSlider.sliderTrack.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1) {
      moveDrag(e.touches[0].clientX);
    }
  });
  parametersLoopSlider.sliderTrack.addEventListener('touchend', () => {
    endDrag();
  });
  parametersLoopSlider.sliderTrack.addEventListener('touchcancel', () => {
    endDrag();
  });

  setInterval(() => {
    if (clickBtn) return;
    ++stepSliderLoop;
    initCount(totalStepsSliderLoop, stepSliderLoop);
    sliderLoop.moveNext();
  }, 4000);

  function startDrag(clientX) {
    clickStart = clientX;
    dragStart = true;
  }
  function moveDrag(clientX) {
    if (!dragStart) return;
    const valueMove = clientX - clickStart;
    if (valueMove < -20) {
      sliderLoop.moveNext();
      ++stepSliderLoop;
      initCount(totalStepsSliderLoop, stepSliderLoop);
      blockInterval();
      dragStart = false;
    } else if (valueMove > 20) {
      sliderLoop.movePrev();
      blockInterval();
      --stepSliderLoop;
      initCount(totalStepsSliderLoop, stepSliderLoop);
      dragStart = false;
    }
  }
  function endDrag() {
    dragStart = false;
  }
  function blockInterval() {
    clickBtn = true
    if (autoTimer) {
      clearTimeout(autoTimer);
    }
    autoTimer = setTimeout(() => {
      clickBtn = false
    }, 4000)
  }
  function countSliderLoop() {
    const currentStepSlideLoop = document.querySelector('.count__current');
    const totalStepSlideLoop = document.querySelector('.count__total');

    return function (total, step) {
      totalStepSlideLoop.textContent = total
      let normalizedStep = ((step % total) + total) % total;

      currentStepSlideLoop.textContent = normalizedStep + 1;
    }
  }



}
initSliderLoop();

const itemsListAbout = document.querySelectorAll('.list-about__item');
itemsListAbout.forEach((item, index) => {
  item.classList.add(`list-about__item--${index + 1}`);
});

const initSliderAbout = () => {

  const mobileWidthMediaQuery = window.matchMedia('(max-width: 630px)');
  const media = [{ 1: window.matchMedia("(min-width: 1px)") }];
  const btnPrevSlideAbout = document.querySelector('#prev-slide-about');
  const btnNextSlideAbout = document.querySelector('#next-slide-about');
  const parametersSliderAbout = {
    sliderTrack: document.querySelector(".slider-about__track"),
    item: document.querySelector(".slider-about__item"),
    itemLength: document.querySelectorAll(".slider-about__item").length,
    btnNext: btnNextSlideAbout,
    btnPrev: btnPrevSlideAbout
  };
  let sliderAbout = new Slider(media)
  sliderAbout.initSlider(parametersSliderAbout);
  sliderAbout.initDragDrop();

  const iconsSteps = {
    containerSelector: ".steps",
    classNameIcon: "steps__icon",
    length: parametersSliderAbout.itemLength,
  };

  const initIconsStepsSlider = ({ containerSelector, classNameIcon, length }) => {
    const fragment = new DocumentFragment();
    const $containerIcons = document.querySelector(containerSelector);
    for (let index = 0; index < length; index++) {
      const $icon = document.createElement("div");
      $icon.className = classNameIcon;
      fragment.append($icon);
    }

    $containerIcons.append(fragment);
  };

  initIconsStepsSlider(iconsSteps);

  const iconsStepsAbout = document.querySelectorAll('.steps__icon');

  parametersSliderAbout.sliderTrack.addEventListener("slideChanged", (e) => {
    removeClassFromElements(iconsStepsAbout, "steps__icon--active");

    iconsStepsAbout[e.detail.currentStep - 1].classList.add(
      "steps__icon--active"
    );

    if (e.detail.currentStep === 1) {
      parametersSliderAbout.btnPrev.setAttribute(
        "aria-label",
        "Предыдущий слайд недоступен"
      );
    } else {
      parametersSliderAbout.btnPrev.setAttribute("aria-label", "Предыдущий слайд");
    }

    if (e.detail.currentStep === e.detail.totalSteps) {
      parametersSliderAbout.btnNext.setAttribute(
        "aria-label",
        "Следующий слайд недоступен"
      );
    } else {
      parametersSliderAbout.btnNext.setAttribute("aria-label", "Следующий слайд");
    }

  });

  mobileWidthMediaQuery.addEventListener('change', function (event) {
    sliderAbout.removeAllListener();
    if (event.matches) {
      let sliderAbout = new Slider(media)
      sliderAbout.initSlider(parametersSliderAbout);
      sliderAbout.initDragDrop();
    }

  })
}
initSliderAbout();

const initTrack = (idTickerIn) => {
  const tickerIn = document.getElementById(idTickerIn);
  tickerIn.innerHTML += tickerIn.innerHTML;
}

initTrack('ticker-in-top');
initTrack('ticker-in-bottom');
