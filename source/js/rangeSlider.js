import Swipe from 'swipe';
import boundry from './boundry';
import getElementOffset from './getElementOffset';
import getElementOuterDimensions from './getElementOuterDimensions';
import isBetween from './isBetween';

function RangeSlider(el) {
    // Swipe dom elements
    this.el = el;

    this.swipeEl = this.el.querySelector('.rangeslider__swipe');
    this.pinEl = this.el.querySelector('.rangeslider__pin');

    this.elOffset = getElementOffset(this.el);
    this.elDimensions = getElementOuterDimensions(this.el);

    this.pinDimensions = getElementOuterDimensions(this.pinEl);

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
    this.value = 0;

    this.swipe = this.createSwipe(this.swipeEl)

    this.safePadding = 40;

    // Event listeners
    this.listeners = {};

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
    },
    /**
     * Validējam, lai start touch būtu virs pin, ja nav,
     * tad uzskatām, ka nevajag taisīt pin kustību
     */
    handleStart(ev) {
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
        this.calcValue;

        this.fire("move", [this.value]);
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

        this.vizualize();
        this.calcValue;

        this.fire("move", [this.value]);
    },
    validateMoveStartPosition(x, y) {
        this.safePadding

        x = this.translateX(x);
        y = this.translateY(y);

        return (
            isBetween(
                x,
                this.position.x - this.safePadding,
                this.position.x + this.pinDimensions.width + this.safePadding)
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
    },
    setTransform(el, x, y) {
        el.style.transform = 'translate('+x+'px,'+y+'px)'
    },
    /**
     * Calculate slider value
     */
    calcValue() {
        this.value = this.position.x / this.elDimensions.width; 
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
