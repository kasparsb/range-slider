import Swipe from 'swipe';
import boundry from './boundry';
import getElementOffset from './getElementOffset';
import getElementOuterDimensions from './getElementOuterDimensions';
import isBetween from './isBetween';
import createSwipeEl from './createSwipeEl';
import createElIfNotExists from './createElIfNotExists';

function RangeSlider(el, config) {

    this.config = {};
    if (typeof  config != "undefined") {
        this.config = config;
    }

    // Swipe dom elements
    this.el = el;

    this.swipeEl = createSwipeEl(this.el);
    this.pinEl = createElIfNotExists(this.el, 'rangeslider__pin', 'div');
    this.trackEl = createElIfNotExists(this.el, 'rangeslider__track', 'div');
    this.trackFillEl = createElIfNotExists(this.trackEl, 'rangeslider__track-fill', 'div');

    this.elOffset = undefined;
    this.elDimensions = undefined;
    this.pinDimensions = undefined;

    this.position = {
        x: 0,
        y: 0
    }

    this.offset = {
        x: 0,
        y: 0
    }

    this.min = 0;
    this.max = 1;
    /**
     * Two dimensional value for x, y range
     */
    this.value = {
        x: 0,
        y: 0
    };

    this.swipe = this.createSwipe(this.swipeEl)

    this.safePadding = 40;

    // Event listeners
    this.listeners = {};

    // Window resize timeout
    this.wrt = 0;

    this.resize(true);
    this.setEvents();
    this.calcValue();
}

RangeSlider.prototype = {
    createSwipe(el) {
        return new Swipe(el, {
            direction: 'horizontal'
        })
    },
    setEvents() {
        this.swipe.on('start', ev => this.handleStart(ev));
        this.swipe.on('move', ev => this.handleMove(ev));
        this.swipe.on('end', ev => this.handleEnd(ev));
        this.swipe.on('tap', ev => this.handleTap(ev));

        if (typeof this.config["handleWindowResize"] != "undefined") {
            window.addEventListener("resize", ev => this.handleWindowResize()); 
        }
    },
    resize(isInitialSetup) {
        this.elOffset = getElementOffset(this.el);
        this.elDimensions = getElementOuterDimensions(this.el);
        this.pinDimensions = getElementOuterDimensions(this.pinEl);

        // Recalculate position based on new slider element dimensions
        this.position.x = this.elDimensions.width * this.value.x;
        this.position.y = this.elDimensions.height * this.value.y;

        console.log("resize", this.position.x, this.elDimensions.width);


        this.offset.x = 0;
        this.offset.y = 0;


        this.vizualize();

        if (!isInitialSetup) {
            this.calcValue();
            this.fire("move", [this.value.x, this.value]);    
        }
    },
    handleWindowResize(ev) {
        console.log("handleWindowResize");
        clearTimeout(this.wrt);
        this.wrt = setTimeout(() => this.resize(), 60);
    },
    /**
     * Validējam, lai start touch būtu virs pin, ja nav,
     * tad uzskatām, ka nevajag taisīt pin kustību
     */
    handleStart(ev) {
        console.log("handleStart", this.position.x, this.offset.x); 
        this.position.x = this.boundryX(this.position.x + this.offset.x);
        this.position.y = this.boundryY(this.position.y + this.offset.y);

        // Notīrām move offset vērtības
        this.offset.x = 0;
        this.offset.y = 0;

        this.isMove = this.validateMoveStartPosition(ev.x, ev.y);
    },
    handleEnd(ev) {
        if (!this.isMove) {
            return
        }
        this.position.x = this.boundryX(this.position.x + this.offset.x);
        this.position.y = this.boundryY(this.position.y + this.offset.y);

        // Notīrām move offset vērtības
        this.offset.x = 0;
        this.offset.y = 0;

        this.isMove = false;
    },
    handleMove(ev) {
        if (!this.isMove) {
            return
        }

        this.offset.x = ev.offset.x;
        this.offset.y = ev.offset.y;

        this.vizualize();
        this.calcValue();

        this.fire("move", [this.value.x, this.value]);
    },
    handleTap(ev) {
        /**
         * x, y vērtības ir relatīvas pret dokumentu
         * transformējam tās relatīvas pret parent elementu
         *
         * Centrējam pin pret tap vietu
         */
        this.position.x = this.boundryX(this.translateX(ev.x) - (this.pinDimensions.width/2));
        this.position.y = this.boundryY(this.translateY(ev.y) - (this.pinDimensions.height/2));

        // Notīrām move offset vērtības
        this.offset.x = 0;
        this.offset.y = 0;

        this.isMove = false;


        this.vizualize();
        this.calcValue();

        this.fire("move", [this.value.x, this.value]);
    },
    validateMoveStartPosition(x, y) {
        console.log("YY validatestart", x);

        x = this.translateX(x);
        y = this.translateY(y);

        console.log("validatestart", x, this.position.x);
        console.log(isBetween(
                x,
                this.position.x - this.safePadding,
                this.position.x + this.pinDimensions.width + this.safePadding)
);


        return (
            isBetween(
                x,
                this.position.x - this.safePadding,
                this.position.x + this.pinDimensions.width + this.safePadding
            )
            &&
            isBetween(
                y,
                this.position.y - this.safePadding,
                this.position.y + this.pinDimensions.height + this.safePadding
            )
        )
    },
    translateX(x) {
        return x - this.elOffset.left
    },
    translateY(y) {
        return y - this.elOffset.top
    },
    boundryX(x) {
        return boundry(x, 0, this.elDimensions.width - this.pinDimensions.width)
    },
    boundryY(y) {
        return boundry(y, 0, this.elDimensions.height - this.pinDimensions.height)
    },
    vizualize() {
        this.setTransform(
            this.pinEl,
            this.boundryX(this.position.x + this.offset.x),
            //this.boundryY(this.position.y + this.offset.y),
            0
        )

        this.trackFillEl.style.width = this.boundryX(this.position.x + this.offset.x)+'px';
    },
    setTransform(el, x, y) {
        el.style.transform = 'translate('+x+'px,'+y+'px)'
    },
    /**
     * Calculate slider value
     */
    calcValue() {
        this.value.x = this.boundryX(this.position.x + this.offset.x) / this.elDimensions.width;
        this.value.y = this.boundryY(this.position.y + this.offset.y) / this.elDimensions.height; 
    },
    on(eventName, cb) {
        if (typeof this.listeners[eventName] == "undefined") {
            this.listeners[eventName] = [];
        }
        this.listeners[eventName].push(cb)
    },
    fire(eventName, args) {
        if (typeof this.listeners[eventName] == "undefined") {
            return;
        }
        for (let i = 0; i < this.listeners[eventName].length; i++) {
           this.listeners[eventName][i].apply(this, args); 
        }
    }
}

export default RangeSlider
