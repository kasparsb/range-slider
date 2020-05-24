import Swipe from 'swipe';
import boundry from './boundry';
import getElementOffset from './getElementOffset';
import getElementOuterDimensions from './getElementOuterDimensions';
import isBetween from './isBetween';
import createSwipeEl from './createSwipeEl';
import createElIfNotExists from './createElIfNotExists';
import setCssTransform from './setCssTransform';
import config from './config';
import PinsList from './PinsList';

function arrayFirstIfSingleItem(arr) {
    return arr.length == 1 ? arr[0] : arr;
}

function RangeSlider(el, configuration) {

    this.config = new config(configuration);

    this.safePadding = this.config.get('safePadding', 40);

    /**
     * konfigurācija, masīvs ar virzieniem kādos darbojas slider
     * x, y
     * this.direction = ['x', 'y'];
     * this.direction = ['x'];
     * this.direction = ['y'];
     */
    this.direction = this.config.get('direction', ['x']);

    // Swipe dom elements
    this.el = el;

    this.swipeEl = createSwipeEl(this.el);
    this.trackEl = createElIfNotExists(this.el, 'rangeslider__track', 'div');
    this.trackFillEl = createElIfNotExists(this.trackEl, 'rangeslider__track-fill', 'div');

    this.elOffset = undefined;
    this.elDimensions = undefined;
    
    this.pins = new PinsList(this.config.get('pins', 1), this.safePadding, this.el);

    this.swipe = this.createSwipe(this.swipeEl)

    // Event listeners
    this.listeners = {};

    // Window resize timeout
    this.wrt = 0;

    this.resize(true);

    this.setEvents();
    // this.calcValue();
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

        // Pēc noklusējuma netiek handlots window resize
        if (this.config.get('handleWindowResize', false)) {
            window.addEventListener('resize', ev => this.handleWindowResize());
        }
    },
    resize(isInitialSetup) {
        // Nolasām visa elementa dimensijas
        this.elOffset = getElementOffset(this.el);
        this.elDimensions = getElementOuterDimensions(this.el);
        
        // Sagatvojam pins
        this.pins.setParentDimensions(this.elDimensions);
        this.pins.resize(this.elDimensions);
        this.pins.vizualize();

        if (!isInitialSetup) {
            //this.calcValue();
            //this.fire('move', [this.value.x, this.value]);    
        }
    },
    handleWindowResize(ev) {
        clearTimeout(this.wrt);
        this.wrt = setTimeout(() => this.resize(), 60);
    },
    /**
     * Validējam, lai start touch būtu virs pin, ja nav,
     * tad uzskatām, ka nevajag taisīt pin kustību
     */
    handleStart(ev) {
        //console.log("handleStart", this.position.x, this.offset.x); 
        console.log("handleStart"); 

        this.isMove = false;
        
        this.pin = this.pins.findByPosition(this.translateX(ev.x), this.translateY(ev.y));
        if (this.pin) {
            this.isMove = true;
            this.pin.startMove();
        }
    },
    handleEnd(ev) {
        if (!this.isMove) {
            return
        }

        this.pin.endMove();

        this.isMove = false;
    },
    handleMove(ev) {
        if (!this.isMove) {
            return
        }

        this.pin.move(ev.offset.x, ev.offset.y);

        this.fire('move', [this.getValue()]);
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
    /**
     * Ja ir tikai viens pin, tad atgriežam vērtību nevis masīvu
     * Vairāku pin gadījumā atgriežam vērtības kā masīvu, kur indekss
     * apzīmē pin indeksu
     */
    getValue() {
        return arrayFirstIfSingleItem(this.pins.getValues(this.direction));
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
