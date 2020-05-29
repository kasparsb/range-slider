import valueRelativeToReal from './valueRelativeToReal';
import valueRealToRelative from './valueRealToRelative';
import formatValue from './formatValue';
import TrackFillsList from './TrackFillsList';
import createSwipeEl from './createSwipeEl';
import createTrackEl from './createTrackEl';
import PinsList from './PinsList';
import config from './config';
import Swipe from 'swipe';

import getOuterDimensions from 'dom-helpers/src/getOuterDimensions';
import getOffset from 'dom-helpers/src/getOffset';
import create from 'dom-helpers/src/create';
import removeEl from 'dom-helpers/src/remove';
import on from  'dom-helpers/src/event/on';
import off from  'dom-helpers/src/event/off';

function arrayFirstIfSingleItem(arr) {
    return arr.length == 1 ? arr[0] : arr;
}

function isArray(value) {
    return Object.prototype.toString.call(value) === '[object Array]'
}

function RangeSlider(configuration) {

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

    this.min = formatValue(this.config.get('min', {x: 0, y: 0}), this.direction, 0);
    this.max = formatValue(this.config.get('max', {x: 1, y: 1}), this.direction, 1);
    this.step = formatValue(this.config.get('step', {x: 0, y: 0}), this.direction, 0);
    /**
     * Ja step ir 0, tad steps skaits būs Infinity
     * tas ir neierobežots skaits soļu
     */
    this.steps = {
        x: (this.max.x - this.min.x) / this.step.x,
        y: (this.max.y - this.min.y) / this.step.y
    }

    this.values = this.formatValues(this.config.get('value', 0));

    // Main element and Swipe element
    this.el = create('div', {
        className: 'rangeslider rangeslider--pins-'+this.values.length
    });
    this.swipeEl = createSwipeEl(this.el);
    this.trackEl = createTrackEl(this.el);

    this.elOffset = undefined;
    this.elDimensions = undefined;

    this.pins = new PinsList(this.values, this.el, pin => {
        pin.setSteps(this.steps);
        pin.setSafePadding(this.safePadding);

        this.el.appendChild(pin.el)
    });

    this.trackFills = new TrackFillsList(this.pins.items.length, this.trackEl);

    this.swipe = new Swipe(this.swipeEl, {direction: 'horizontal'})

    // Event listeners
    this.listeners = {};

    // Window resize timeout
    this.wrt = 0;
    // Window resize funkcija. Lai varētu noņemt event listener
    this.windowResizeHandler = undefined;

    this.setEvents();
}

RangeSlider.prototype = {
    setEvents() {
        this.swipe.on('start', ev => this.handleStart(ev));
        this.swipe.on('move', ev => this.handleMove(ev));
        this.swipe.on('end', ev => this.handleEnd(ev));
        this.swipe.on('tap', ev => this.handleTap(ev));

        // Pēc noklusējuma netiek handlots window resize
        if (this.config.get('handleWindowResize', true)) {
            this.windowResizeHandler = on(window, 'resize', ev => this.handleWindowResize());
        }

        this.pins.onVizualize(pinsPosition => this.trackFills.vizualize(pinsPosition));
    },
    removeEvents() {
        if (this.windowResizeHandler) {
            off(window, 'resize', this.windowResizeHandler)
        }
    },
    render() {
        setTimeout(() => this.resize(true), 5);
        return this.el;
    },
    resize(isInitialSetup) {
        // Nolasām visa elementa dimensijas
        this.elOffset = getOffset(this.el);
        this.elDimensions = getOuterDimensions(this.el);

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
        this.isMove = false;

        this.pin = this.pins.findByPosition(this.translateX(ev.x), this.translateY(ev.y));
        if (this.pin) {
            this.isMove = true;
            this.pin.startMove();

            this.fire('startmove', [this.formatPinForMoveEvent(this.pin)]);
        }
    },
    handleEnd(ev) {
        if (!this.isMove) {
            return
        }

        this.pin.endMove();

        this.isMove = false;

        this.fire('change', [this.getValue()]);
        this.fire('endmove', [this.formatPinForMoveEvent(this.pin)]);
    },
    handleMove(ev) {
        if (!this.isMove) {
            return
        }

        this.pin.move(ev.offset.x, ev.offset.y);

        this.pins.vizualize(this.pin);

        this.fire('move', [this.formatPinForMoveEvent(this.pin)]);
    },
    handleTap(ev) {
        
    },
    translateX(x) {
        return x - this.elOffset.left
    },
    translateY(y) {
        return y - this.elOffset.top
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
        this.values = this.formatValues(values);
        
        values.forEach((value, index) => {
            this.pins.items[index].setValue({
                x: valueRealToRelative(value.x, this.min.x, this.max.x),
                y: valueRealToRelative(value.y, this.min.y, this.max.y)
            })
        })

        this.pins.vizualize();
    },
    formatValues(values) {
        if (!isArray(values)) {
            values = [values];
        }

        return values.map(value => this.convertValueRealToRelative(formatValue(value, this.direction)));
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
