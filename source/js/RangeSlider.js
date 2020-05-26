import getElementOuterDimensions from './getElementOuterDimensions';
import formatPinsConfiguration from './formatPinsConfiguration';
import createElIfNotExists from './createElIfNotExists';
import valueRelativeToReal from './valueRelativeToReal';
import valueRealToRelative from './valueRealToRelative';
import getElementOffset from './getElementOffset';
import setCssTransform from './setCssTransform';
import formatPinValue from './formatPinValue';
import TrackFillsList from './TrackFillsList';
import createSwipeEl from './createSwipeEl';
import isBetween from './isBetween';
import PinsList from './PinsList';
import removeEl from './removeEl';
import boundry from './boundry';
import config from './config';
import Swipe from 'swipe';


function arrayFirstIfSingleItem(arr) {
    return arr.length == 1 ? arr[0] : arr;
}

function RangeSlider(el, configuration) {

    this.config = new config(configuration);

    this.safePadding = this.config.get('safePadding', 40);

    this.min = this.config.get('min', {x: 0, y: 0});
    this.max = this.config.get('max', {x: 1, y: 1});
    this.step = this.config.get('step', {x: 0, y: 0});
    /**
     * Ja step ir 0, tad steps skaits būs Infinity
     * tas ir neierobežots skaits soļu
     */
    this.steps = {
        x: (this.max.x - this.min.x) / this.step.x,
        y: (this.max.y - this.min.y) / this.step.y
    }

    this.pinsConfiguartion = formatPinsConfiguration(
        this.config.get('pins', 1), 
        this.steps, 
        value => this.convertValueRealToRelative(value)
    );

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

    this.elOffset = undefined;
    this.elDimensions = undefined;
    

    this.pins = new PinsList(this.pinsConfiguartion, this.el);
    // Uzstādām visiem pins steps
    this.pins.items.forEach(pin => pin.setSteps(this.steps));
    // Uzstādām visiem safePadding
    this.pins.items.forEach(pin => pin.setSafePadding(this.safePadding));


    this.trackFills = new TrackFillsList(this.pins.getCount(), this.trackEl);

    this.swipe = this.createSwipe(this.swipeEl)

    // Event listeners
    this.listeners = {};

    // Window resize timeout
    this.wrt = 0;
    // Window resize funkcija. Lai varētu noņemt event listener
    this.handleWindowResizeFn = undefined;

    this.setEvents();
    this.resize(true);
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
            this.handleWindowResizeFn = () => {
                console.log('resize', this);
                this.handleWindowResize();
            }
            window.addEventListener('resize', this.handleWindowResizeFn);
        }

        /**
         * @todo Pārtaisīt, lai events ir tikai uz to pin, kurš reāli maina pozīciju
         */
        this.pins.onVizualize(pinsPosition => this.trackFills.vizualize(pinsPosition));
    },
    removeEvents() {
        if (this.handleWindowResizeFn) {
            window.removeEventListener('resize', this.handleWindowResizeFn);
        }
    },
    resize(isInitialSetup) {
        // Nolasām visa elementa dimensijas
        this.elOffset = getElementOffset(this.el);
        this.elDimensions = getElementOuterDimensions(this.el);
        

        this.pins.setParentDimensions(this.elDimensions);
        this.pins.resize(isInitialSetup);

        this.trackFills.resize(isInitialSetup);

        // Vizualizējam izmaiņas
        this.pins.vizualize();

        if (!isInitialSetup) {
            this.fire('move', [this.getValue()]);
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

        this.isMove = false;

        this.pin = this.pins.findByPosition(this.translateX(ev.x), this.translateY(ev.y));
        if (this.pin) {
            this.isMove = true;
            this.pin.startMove();

            this.fire('startmove', [this.getValue()]);
        }
    },
    handleEnd(ev) {
        if (!this.isMove) {
            return
        }

        this.pin.endMove();

        this.isMove = false;

        this.fire('change', [this.getValue()]);
        this.fire('endmove', [this.getValue()]);
    },
    handleMove(ev) {
        if (!this.isMove) {
            return
        }

        this.pin.move(ev.offset.x, ev.offset.y);

        this.fire('move', [this.formatPinForMoveEvent(this.pin)]);
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

        this.fire('move', [this.value.x, this.value]);
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
        return arrayFirstIfSingleItem(
            this.pins.getValues(this.direction, value => this.convertValueRelativeToReal(value))
        );
    },
    setValue(values) {
        values = values.map(value => formatPinValue(value));
        
        values.forEach((value, index) => {
            this.pins.items[index].setValue({
                x: valueRealToRelative(value.x, this.min.x, this.max.x),
                y: valueRealToRelative(value.y, this.min.y, this.max.y)
            })
        })

        this.pins.resize();
    },
    getPins() {
        return arrayFirstIfSingleItem(
            this.pins.getPins(this.direction, value => this.convertValueRelativeToReal(value))
        );
    },
    /**
     * Konvertējam reālo padoto vērtību uz iekšējās lietošanas vērtību (0..1)
     */
    convertValueRealToRelative(value) {
        return {
            x: valueRealToRelative(value.x, this.min.x, this.max.x),
            y: valueRealToRelative(value.y, this.min.y, this.max.y)    
        }
    },
    /**
     * Konvertējam iekšējās lietošanas relatīvās vērtības (0..1)
     * uz reālajā vērtībā, kuras sākotnēji tikai padotas no ārpuses
     */
    convertValueRelativeToReal(value) {
        return {
            x: valueRelativeToReal(value.x, this.min.x, this.max.x, this.step.x),
            y: valueRelativeToReal(value.y, this.min.y, this.max.y, this.step.y)
        }
    },
    formatPinForMoveEvent(pin) {
        return this.pins.getPin(this.direction, pin, value => this.convertValueRelativeToReal(value));
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
    },
    destroy() {
        this.swipe.destroy();
        this.removeEvents();

        removeEl(this.swipeEl);
        removeEl(this.trackEl);
        this.pins.items.forEach(pin => removeEl(pin.el))
    }
}

export default RangeSlider
