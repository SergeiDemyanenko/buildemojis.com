'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const projectDir = path.resolve(__dirname, '..');
const publicDir = path.join(projectDir, 'public');
const dataCode = fs.readFileSync(path.join(publicDir, 'js/data.js'), 'utf8');
const scriptCode = fs.readFileSync(path.join(publicDir, 'js/script.js'), 'utf8');
const htmlCode = fs.readFileSync(path.join(publicDir, 'index.html'), 'utf8');
const cssCode = fs.readFileSync(path.join(publicDir, 'css/styles.css'), 'utf8');

function createMockDOM(search = '', initialStorage = {}) {
    const elementsById = {};
    const metaBySelector = {};
    const gtagEvents = [];
    const storage = { ...initialStorage };
    const historyStack = [];
    let clipboardText = '';

    function makeElement(tag, id = '') {
        const listeners = {};
        const attributes = {};
        const children = [];
        const style = {};
        const classes = new Set();
        const el = {
            tagName: tag.toUpperCase(),
            id,
            className: '',
            textContent: '',
            label: '',
            value: '',
            selected: false,
            hidden: false,
            tabIndex: -1,
            style,
            children,
            width: 0,
            height: 0,
            get options() {
                const opts = [];
                for (const child of children) {
                    if (child.tagName === 'OPTION') {
                        opts.push(child);
                    } else if (child.tagName === 'OPTGROUP' && Array.isArray(child.children)) {
                        for (const nested of child.children) {
                            if (nested.tagName === 'OPTION') {
                                opts.push(nested);
                            }
                        }
                    }
                }
                return opts;
            },
            classList: {
                add(c) {
                    classes.add(c);
                },
                remove(c) {
                    classes.delete(c);
                },
                contains(c) {
                    return classes.has(c);
                },
                toggle(c, force) {
                    if (force === undefined) {
                        if (classes.has(c)) {
                            classes.delete(c);
                            return false;
                        }
                        classes.add(c);
                        return true;
                    }
                    if (force) {
                        classes.add(c);
                        return true;
                    }
                    classes.delete(c);
                    return false;
                }
            },
            get offsetWidth() {
                if (this.width) return this.width;
                if (this.id === 'model') return 1080;
                if (this.id === 'canvas') return 1188;
                if (this.className === 'item' && this.tagName === 'SPAN') return 80;
                return 100;
            },
            get offsetHeight() {
                if (this.height) return this.height;
                if (this.id === 'canvas') return 712;
                if (this.className === 'item' && this.tagName === 'SPAN') return 144;
                return 100;
            },
            get offsetLeft() {
                return parseFloat(this.style.left) || 0;
            },
            get offsetTop() {
                return parseFloat(this.style.top) || 0;
            },
            setAttribute(k, v) {
                attributes[k] = String(v);
            },
            getAttribute(k) {
                return attributes[k];
            },
            appendChild(child) {
                child._index = children.length;
                children.push(child);
            },
            prepend(child) {
                children.unshift(child);
            },
            replaceChildren() {
                children.length = 0;
            },
            contains(target) {
                if (target === this) return true;
                return children.some((c) => c === target || (typeof c.contains === 'function' && c.contains(target)));
            },
            addEventListener(type, fn) {
                if (!listeners[type]) listeners[type] = [];
                listeners[type].push(fn);
            },
            removeEventListener(type, fn) {
                if (!listeners[type]) return;
                listeners[type] = listeners[type].filter((f) => f !== fn);
            },
            dispatchEvent(event) {
                const fns = listeners[event.type] || [];
                for (const fn of [...fns]) {
                    fn(event);
                }
            },
            getBoundingClientRect() {
                if (this.tagName === 'SPAN' && this.className === 'item') {
                    const idx = this._index || 0;
                    const topFix = parseFloat(this.style.top) || 0;
                    const leftFix = parseFloat(this.style.left) || 0;
                    return {
                        top: 300 + topFix,
                        left: 400 + idx * 80 + leftFix,
                        width: this.offsetWidth,
                        height: this.offsetHeight
                    };
                }
                return {
                    top: this.offsetTop,
                    left: this.offsetLeft,
                    width: this.offsetWidth,
                    height: this.offsetHeight
                };
            },
            getContext(type) {
                assert.strictEqual(type, '2d');
                return {
                    font: '',
                    textBaseline: '',
                    lastDraw: null,
                    fillText(char, x, y) {
                        this.lastDraw = { char, x, y };
                    }
                };
            },
            animate(keyframes, options) {
                this._lastAnimation = { keyframes, options };
                return { cancel() { } };
            },
            getAnimations() {
                return [{ cancel() { el._animCancelled = true; } }];
            },
            setPointerCapture(id) {
                this._capturedPointer = id;
            },
            hasPointerCapture(id) {
                return this._capturedPointer === id;
            },
            releasePointerCapture(id) {
                if (this._capturedPointer === id) this._capturedPointer = null;
            }
        };
        if (id) elementsById[id] = el;
        return el;
    }

    const documentElement = makeElement('html');
    makeElement('div', 'model');
    makeElement('div', 'target_zone');
    makeElement('span', 'target_zone_label');
    makeElement('a', 'title_link');
    makeElement('span', 'title');
    makeElement('a', 'image_prev');
    makeElement('a', 'image_next');
    makeElement('span', 'level_badge');
    makeElement('select', 'level_select');
    makeElement('button', 'btn_shortcuts');
    makeElement('div', 'shortcuts_popover').hidden = true;
    makeElement('button', 'btn_theme');
    makeElement('span', 'theme_icon');
    makeElement('button', 'btn_outline');
    makeElement('button', 'btn_reset');
    makeElement('button', 'btn_robot');
    makeElement('img', 'icon_robot');
    makeElement('div', 'canvas');
    makeElement('div', 'win_toast').hidden = true;
    makeElement('code', 'win_emoji_text');
    makeElement('button', 'btn_copy');
    makeElement('button', 'btn_copy_link');
    makeElement('a', 'win_next');
    makeElement('link', 'canonical_link');

    const selectors = [
        'meta[name="description"]',
        'meta[property="og:title"]',
        'meta[property="og:description"]',
        'meta[property="og:url"]',
        'meta[name="twitter:title"]',
        'meta[name="twitter:description"]',
        'meta[name="twitter:url"]'
    ];
    for (const sel of selectors) {
        metaBySelector[sel] = makeElement('meta');
    }

    const windowListeners = {};
    const documentListeners = {};
    const sandbox = {
        URLSearchParams,
        URL,
        Object,
        Math,
        Infinity,
        Boolean,
        String,
        Number,
        Array,
        Set,
        JSON,
        parseFloat,
        encodeURIComponent,
        console,
        navigator: {
            clipboard: {
                writeText(txt) {
                    clipboardText = txt;
                    return Promise.resolve();
                }
            }
        },
        window: {
            location: {
                search,
                href: `https://buildemojis.com/${search}`
            },
            history: {
                pushState(state, title, url) {
                    historyStack.push({ state, title, url });
                    sandbox.window.location.search = url;
                    sandbox.window.location.href = `https://buildemojis.com/${url}`;
                }
            },
            localStorage: {
                getItem(k) {
                    return Object.prototype.hasOwnProperty.call(storage, k) ? storage[k] : null;
                },
                setItem(k, v) {
                    storage[k] = String(v);
                }
            },
            scrollX: 0,
            scrollY: 0,
            setTimeout(fn) {
                sandbox._lastTimeoutFn = fn;
            },
            gtag(cmd, eventName, params) {
                if (cmd === 'event') {
                    gtagEvents.push({ eventName, params });
                }
            },
            addEventListener(type, fn) {
                if (!windowListeners[type]) windowListeners[type] = [];
                windowListeners[type].push(fn);
            },
            dispatchEvent(event) {
                for (const fn of windowListeners[event.type] || []) {
                    fn(event);
                }
            },
            getComputedStyle() {
                return { fontSize: '144px', fontFamily: 'Times New Roman' };
            },
            triggerLoad() {
                for (const fn of windowListeners.load || []) fn();
            }
        },
        document: {
            title: 'Build an Emoji',
            documentElement,
            getElementById(id) {
                return elementsById[id] || null;
            },
            querySelector(sel) {
                return metaBySelector[sel] || null;
            },
            createElement(tag) {
                return makeElement(tag);
            },
            addEventListener(type, fn) {
                if (!documentListeners[type]) documentListeners[type] = [];
                documentListeners[type].push(fn);
            },
            dispatchEvent(event) {
                for (const fn of documentListeners[event.type] || []) {
                    fn(event);
                }
            }
        }
    };

    vm.createContext(sandbox);
    vm.runInContext(dataCode + '\n' + scriptCode + '\nwindow.__exports = { data, param, controller, scatterPieces };', sandbox);
    sandbox.window.triggerLoad();

    return {
        sandbox,
        elementsById,
        metaBySelector,
        gtagEvents,
        historyStack,
        storage,
        getClipboardText: () => clipboardText
    };
}

// 1. Check HTML & CSS do not reference obsolete libraries or removed external widgets
assert(!htmlCode.includes('jquery'), 'index.html should not reference jquery');
assert(!htmlCode.includes('touch-punch'), 'index.html should not reference touch-punch');
assert(!htmlCode.includes('buymeacoffee'), 'index.html should not reference buymeacoffee');
assert(!htmlCode.includes('bmc_img'), 'index.html should not reference bmc_img');
assert(!cssCode.includes('bmc_img'), 'styles.css should not reference bmc_img');
assert(htmlCode.includes('name="viewport"'), 'index.html should include responsive viewport meta tag');
assert(htmlCode.includes('Noto+Serif'), 'index.html should load Noto Serif web font');
console.log('PASS 1: Clean HTML/CSS with responsive viewport, web fonts, and without obsolete dependencies');

// 2. Validate data.js schema and all 16 emoji models
{
    const { sandbox } = createMockDOM('');
    const { data } = sandbox.window.__exports;
    const keys = Object.keys(data);
    assert.strictEqual(keys.length, 16, 'Expected 16 emoji definitions in data.js');

    for (const [key, emoji] of Object.entries(data)) {
        assert(typeof emoji.title === 'string' && emoji.title.length > 0, `Invalid title for ${key}`);
        assert.strictEqual(emoji.modelStyleFix, undefined, `Obsolete modelStyleFix should be removed in ${key}`);
        assert(Array.isArray(emoji.model) && emoji.model.length >= 2, `Model for ${key} must have >= 2 pieces`);
        for (const piece of emoji.model) {
            assert(typeof piece.character === 'string' && piece.character.length > 0, `Invalid character in ${key}`);
            assert.strictEqual(piece.canvas, undefined, `Obsolete piece.canvas should be removed in ${key}`);
            if (piece.itemStyleFix !== undefined) {
                assert(typeof piece.itemStyleFix === 'object', `Invalid itemStyleFix in ${key}`);
            }
        }
    }
    console.log('PASS 2: All 16 emoji definitions in public/js/data.js match clean schema');
}

// 3. Validate JSON-LD structured data in public/index.html
{
    const jsonLdMatch = htmlCode.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    assert(jsonLdMatch, 'JSON-LD script should exist in index.html');
    const parsed = JSON.parse(jsonLdMatch[1]);
    assert.strictEqual(parsed['@context'], 'https://schema.org');
    assert.strictEqual(parsed['@graph'].length, 5);
    const itemList = parsed['@graph'].find((n) => n['@type'] === 'ItemList');
    assert.strictEqual(itemList.numberOfItems, 16);
    assert.strictEqual(itemList.itemListElement.length, 16);
    console.log('PASS 3: Schema.org JSON-LD (@graph with 5 entities & 16 levels) is valid');
}

// 4. Validate public/ deployment isolation & repository files
{
    const requiredPublicFiles = [
        'index.html',
        'CNAME',
        'favicon.ico',
        'robots.txt',
        'sitemap.xml',
        'llms.txt',
        'site.webmanifest',
        'css/styles.css',
        'js/data.js',
        'js/script.js',
        'image/og-preview.png',
        'image/next.svg',
        'image/robot.svg',
        'image/favicon.svg',
        'image/apple-touch-icon.png'
    ];
    for (const relPath of requiredPublicFiles) {
        assert(fs.existsSync(path.join(publicDir, relPath)), `Missing required public file: ${relPath}`);
    }

    const forbiddenInPublic = ['README.md', 'LICENSE.txt', 'docs', 'tests', '.github', '.gitignore'];
    for (const item of forbiddenInPublic) {
        assert(!fs.existsSync(path.join(publicDir, item)), `Repo file/dir should NOT be inside public/: ${item}`);
    }

    const manifest = JSON.parse(fs.readFileSync(path.join(publicDir, 'site.webmanifest'), 'utf8'));
    assert.strictEqual(manifest.short_name, 'Build an Emoji');
    assert.strictEqual(manifest.icons.length, 4);
    console.log('PASS 4: public/ directory isolation, assets, manifest, and SEO/GEO files verified');
}

// 5. Invalid ?smile=nonexistent fallback, <optgroup> grouping, & all levels initialization
{
    const { sandbox, elementsById } = createMockDOM('?smile=nonexistent');
    const { param, data } = sandbox.window.__exports;
    assert.strictEqual(param.getSmile(), 'smile');
    assert.strictEqual(elementsById.title.textContent, 'Smile');
    assert.strictEqual(elementsById.image_prev.getAttribute('href'), '?smile=table_flip');
    assert.strictEqual(elementsById.level_badge.textContent, '1 / 16');
    assert.strictEqual(elementsById.level_select.children.length, 3, 'Should have 3 <optgroup> categories');
    assert.strictEqual(elementsById.level_select.children[0].label, 'Easy (2–3 pieces)');
    assert.strictEqual(elementsById.level_select.children[1].label, 'Medium (4–6 pieces)');
    assert.strictEqual(elementsById.level_select.children[2].label, 'Hard • Kaomoji (7–10 pieces)');
    assert.strictEqual(elementsById.level_select.options.length, 16, 'Should have 16 total <option> elements');

    for (const key of Object.keys(data)) {
        const levelDOM = createMockDOM(`?smile=${key}`);
        assert.strictEqual(levelDOM.elementsById.title.textContent, data[key].title);
        assert.strictEqual(levelDOM.sandbox.window.__exports.controller.model.length, data[key].model.length);
    }
    console.log('PASS 5: URL parameter validation, <optgroup> difficulty categories, and all 16 levels verified');
}

// 6. Concept 1 UI Controls & 3-Star Rating System (★☆☆ Robot, ★★☆ Outline, ★★★ Manual)
{
    const { sandbox, elementsById, metaBySelector, getClipboardText } = createMockDOM('?smile=shrug');
    const { controller } = sandbox.window.__exports;
    assert(sandbox.document.title.includes('Build "Shrug" ¯\\_(ツ)_/¯'), 'Dynamic title should include Shrug kaomoji');
    assert.strictEqual(elementsById.canonical_link.getAttribute('href'), 'https://buildemojis.com/?smile=shrug');
    assert.strictEqual(metaBySelector['meta[property="og:url"]'].getAttribute('content'), 'https://buildemojis.com/?smile=shrug');
    assert.strictEqual(elementsById.level_badge.textContent, '15 / 16');
    assert.strictEqual(elementsById.win_toast.hidden, true);

    // Verify target_zone dynamically adapts its width/height to the current emoji
    const { elementsById: smileElements } = createMockDOM('?smile=smile');
    assert(
        parseFloat(elementsById.target_zone.style.width) > parseFloat(smileElements.target_zone.style.width),
        'Target zone should be wider for 9-piece shrug than 2-piece smile'
    );

    // Before completion, dropdown option hides the emoji with ?
    const shrugOption = elementsById.level_select.options[14];
    assert.strictEqual(shrugOption.textContent, '15. Shrug \u00A0|\u00A0 ?');

    // Click Robot -> reveals win_toast, awards 1 star (★☆☆)
    elementsById.icon_robot.dispatchEvent({ type: 'click' });
    assert.strictEqual(elementsById.win_toast.hidden, false);
    assert.strictEqual(!elementsById.target_zone.hidden, true);
    assert.strictEqual(elementsById.win_emoji_text.textContent, '¯\\_(ツ)_/¯');
    assert.strictEqual(elementsById.target_zone.classList.contains('is-completed'), true);
    assert.strictEqual(shrugOption.textContent, '15. Shrug \u00A0|\u00A0 ¯\\_(ツ)_/¯ \u00A0|\u00A0 ★☆☆');

    // Reset, turn on Outline, and solve manually -> upgrades rating to 2 stars (★★☆)
    elementsById.btn_reset.dispatchEvent({ type: 'click' });
    elementsById.btn_outline.dispatchEvent({ type: 'click' });
    assert.strictEqual(elementsById.model.classList.contains('show-outline'), true);
    sandbox.window.__exports.controller.toPosition('manual');
    assert.strictEqual(shrugOption.textContent, '15. Shrug \u00A0|\u00A0 ¯\\_(ツ)_/¯ \u00A0|\u00A0 ★★☆');

    // Reset without Outline and solve manually -> upgrades rating to 3 stars (★★★)
    elementsById.btn_reset.dispatchEvent({ type: 'click' });
    sandbox.window.__exports.controller.toPosition('manual');
    assert.strictEqual(shrugOption.textContent, '15. Shrug \u00A0|\u00A0 ¯\\_(ツ)_/¯ \u00A0|\u00A0 ★★★');

    // Solving with Robot later does NOT downgrade existing 3-star rating
    elementsById.btn_reset.dispatchEvent({ type: 'click' });
    elementsById.icon_robot.dispatchEvent({ type: 'click' });
    assert.strictEqual(shrugOption.textContent, '15. Shrug \u00A0|\u00A0 ¯\\_(ツ)_/¯ \u00A0|\u00A0 ★★★');

    // Verify that opening with ?smile=shrug&done hides target_zone underlay
    const { elementsById: doneElements } = createMockDOM('?smile=shrug&done');
    assert.strictEqual(doneElements.target_zone.hidden, true);

    // Click Copy button -> copies kaomoji to clipboard
    elementsById.btn_copy.dispatchEvent({ type: 'click' });
    assert.strictEqual(getClipboardText(), '¯\\_(ツ)_/¯');
    assert.strictEqual(elementsById.btn_copy.textContent, 'Copied! ✓');

    // Click Copy Link button -> copies ?smile=shrug&done link to clipboard
    elementsById.btn_copy_link.dispatchEvent({ type: 'click' });
    assert(getClipboardText().includes('?smile=shrug&done'), 'Copied link should contain ?smile=shrug&done');
    assert.strictEqual(elementsById.btn_copy_link.textContent, 'Link Copied! ✓');

    // Click Reset button -> hides win_toast, restores target_zone, and scatters pieces from current locations
    const preResetPositions = controller.model.map(entry => ({
        top: Math.round(parseFloat(entry.canvas.style.top) || entry.canvas.offsetTop || 0),
        left: Math.round(parseFloat(entry.canvas.style.left) || entry.canvas.offsetLeft || 0)
    }));
    elementsById.btn_reset.dispatchEvent({ type: 'click' });
    assert.strictEqual(elementsById.win_toast.hidden, true);
    assert.strictEqual(elementsById.target_zone.hidden, false);
    assert.strictEqual(elementsById.target_zone.classList.contains('is-completed'), false);
    for (let i = 0; i < controller.model.length; i++) {
        const anim = controller.model[i].canvas._lastAnimation;
        assert.ok(anim, 'Reset must animate each piece');
        assert.strictEqual(anim.options.duration, 700, 'Reset animation duration must be 700ms');
        assert.strictEqual(anim.options.easing, 'ease-in-out', 'Reset animation easing must be ease-in-out');
        const startTop = Math.round(parseFloat(anim.keyframes[0].top));
        const startLeft = Math.round(parseFloat(anim.keyframes[0].left));
        assert.strictEqual(startTop, preResetPositions[i].top, 'Reset animation must start from current top position');
        assert.strictEqual(startLeft, preResetPositions[i].left, 'Reset animation must start from current left position');
    }
    console.log('PASS 6: 3-Star ratings (★☆☆ / ★★☆ / ★★★), Outline toggle, Win toast, Copy & Reset verified');
}

// 7. Pointer drag active highlight, .is-snapped highlight, z-index elevation, and manual completion
{
    const { sandbox, elementsById, gtagEvents } = createMockDOM('?smile=wink');
    const { controller } = sandbox.window.__exports;
    // wink has 3 pieces: ; - )
    const item0 = controller.model[0];
    const item1 = controller.model[1];
    const item2 = controller.model[2];

    item0.canvas.style.top = '100px';
    item0.canvas.style.left = '100px';
    item1.canvas.style.top = '50px';
    item1.canvas.style.left = '50px';
    item2.canvas.style.top = '10px';
    item2.canvas.style.left = '10px';

    item1.canvas.dispatchEvent({
        type: 'pointerdown',
        pointerType: 'mouse',
        button: 0,
        pointerId: 1,
        clientX: 60,
        clientY: 60,
        preventDefault() { }
    });
    assert.strictEqual(item1.canvas.classList.contains('is-dragging'), true);
    assert(Number(item1.canvas.style.zIndex) > 10, 'Dragged item should elevate z-index');

    // Move item1 to its relative snap position with item0 (+80px left, +0px top), while item2 is still unaligned
    item1.canvas.dispatchEvent({
        type: 'pointermove',
        pointerId: 1,
        clientX: 190,
        clientY: 110
    });
    assert.strictEqual(
        item1.canvas.classList.contains('is-snapped'),
        true,
        'Piece should get .is-snapped highlight when aligned relative to another piece'
    );

    item1.canvas.dispatchEvent({
        type: 'pointerup',
        pointerId: 1
    });
    assert.strictEqual(item1.canvas.classList.contains('is-dragging'), false);
    assert.strictEqual(item1.canvas.classList.contains('is-snapped'), false, 'Green snap border should disappear on pointerup');
    assert.strictEqual(item1.canvas.classList.contains('is-kb-selected'), false, 'Mouse drag should not leave blue keyboard selection');

    // Now move item2 into place to complete the 3-piece wink emoji
    item2.canvas.dispatchEvent({
        type: 'pointerdown',
        pointerType: 'mouse',
        button: 0,
        pointerId: 2,
        clientX: 10,
        clientY: 10,
        preventDefault() { }
    });
    item2.canvas.dispatchEvent({
        type: 'pointermove',
        pointerId: 2,
        clientX: 260,
        clientY: 100
    });
    item2.canvas.dispatchEvent({
        type: 'pointerup',
        pointerId: 2
    });

    assert.strictEqual(elementsById.title_link.getAttribute('href'), '?smile=wink&done');
    assert.strictEqual(elementsById.win_toast.hidden, false);
    assert.strictEqual(item1.canvas.classList.contains('is-snapped'), false, 'Snap highlight cleared on win');
    const completedEvent = gtagEvents.find((e) => e.eventName === 'emoji_completed');
    assert(completedEvent && completedEvent.params.method === 'manual' && completedEvent.params.stars === 3);
    assert.strictEqual(sandbox.item, undefined, 'item should not leak to global scope');
    assert.strictEqual(sandbox.canvasItem, undefined, 'canvasItem should not leak to global scope');
    console.log('PASS 7: Pointer Events drag, .is-snapped proximity highlight, manual 3-star win, and scope isolation verified');
}

// 8. SPA Level Switching (History API pushState), Keyboard Controls (Arrows + Shift), Shortcuts Popover, and Dark Mode
{
    const { sandbox, elementsById, historyStack, storage } = createMockDOM('?smile=smile');
    const { controller, param } = sandbox.window.__exports;

    // Dark Mode toggle
    assert.strictEqual(sandbox.document.documentElement.getAttribute('data-theme'), 'light');
    assert.strictEqual(elementsById.theme_icon.textContent, '☾');
    elementsById.btn_theme.dispatchEvent({ type: 'click' });
    assert.strictEqual(sandbox.document.documentElement.getAttribute('data-theme'), 'dark');
    assert.strictEqual(elementsById.theme_icon.textContent, '☀');
    assert.strictEqual(storage.buildemojis_theme, 'dark');

    // Shortcuts popover toggle & Escape close
    assert.strictEqual(elementsById.shortcuts_popover.hidden, true);
    elementsById.btn_shortcuts.dispatchEvent({ type: 'click' });
    assert.strictEqual(elementsById.shortcuts_popover.hidden, false);
    assert.strictEqual(elementsById.btn_shortcuts.getAttribute('aria-expanded'), 'true');
    sandbox.window.dispatchEvent({ type: 'keydown', key: 'Escape' });
    assert.strictEqual(elementsById.shortcuts_popover.hidden, true);

    // Keyboard arrow movement: 8px normal step, 28px with Shift
    const firstPiece = controller.model[0].canvas;
    firstPiece.style.left = '100px';
    firstPiece.style.top = '100px';
    sandbox.window.dispatchEvent({
        type: 'keydown',
        key: 'ArrowRight',
        shiftKey: false,
        preventDefault() { }
    });
    assert.strictEqual(firstPiece.offsetLeft, 108, 'ArrowRight without Shift should move piece by 8px');
    sandbox.window.dispatchEvent({
        type: 'keydown',
        key: 'ArrowDown',
        shiftKey: true,
        preventDefault() { }
    });
    assert.strictEqual(firstPiece.offsetTop, 128, 'Shift + ArrowDown should move piece by 28px');
    assert.strictEqual(firstPiece.classList.contains('is-kb-selected'), true, 'Keyboard movement highlights active piece');

    // Starting a mouse drag clears keyboard selection
    firstPiece.dispatchEvent({
        type: 'pointerdown',
        pointerType: 'mouse',
        button: 0,
        pointerId: 10,
        clientX: 108,
        clientY: 128,
        preventDefault() { }
    });
    assert.strictEqual(firstPiece.classList.contains('is-kb-selected'), false, 'Mouse pointerdown resets keyboard selection');
    assert.strictEqual(controller.selectedItem, null, 'selectedItem is cleared when switching to mouse');
    firstPiece.dispatchEvent({ type: 'pointerup', pointerId: 10 });

    // SPA navigation via Next button click (without page reload)
    elementsById.image_next.dispatchEvent({
        type: 'click',
        button: 0,
        preventDefault() { }
    });
    assert.strictEqual(param.getSmile(), 'laughing');
    assert.strictEqual(elementsById.title.textContent, 'Laughing');
    assert.strictEqual(elementsById.level_badge.textContent, '2 / 16');
    assert.strictEqual(historyStack[historyStack.length - 1].url, '?smile=laughing');

    // SPA navigation via keyboard bracket ']'
    sandbox.window.dispatchEvent({ type: 'keydown', key: ']' });
    assert.strictEqual(param.getSmile(), 'tears_of_happiness');
    assert.strictEqual(elementsById.title.textContent, 'Tears of happiness');
    assert.strictEqual(controller.model.length, 3);
    console.log('PASS 8: SPA History API navigation, Keyboard controls (8px / 28px Shift), Popover, and Dark Mode verified');
}

// 9. Section 1.1 checkPosition math: signed direction, multi-anchor iteration, duplicate piece Set, and resize pixelError
{
    // 9a. Signed direction check: inverted "):" must NOT match ":)"
    const { sandbox, elementsById } = createMockDOM('?smile=smile');
    const { controller, scatterPieces } = sandbox.window.__exports;
    const colon = controller.model[0].canvas;
    const paren = controller.model[1].canvas;

    colon.style.top = '200px';
    colon.style.left = '200px';
    // Place ")" to the LEFT of ":" (-80px instead of +80px)
    paren.style.top = '200px';
    paren.style.left = '120px';
    controller.checkPosition();
    assert.strictEqual(elementsById.win_toast.hidden, true, 'Inverted "):" must not trigger win');

    // Place ")" to the RIGHT of ":" (+80px)
    paren.style.left = '280px';
    controller.checkPosition();
    assert.strictEqual(elementsById.win_toast.hidden, false, 'Correct ":)" must trigger win');

    // 9b. Anchor candidate iteration & duplicate Set check on "shock" (O_O) where "O" is duplicated
    const shockDOM = createMockDOM('?smile=shock');
    const shockCtrl = shockDOM.sandbox.window.__exports.controller;
    // Place all 5 pieces of (O_O) at their exact model offsets, except leave the second "O" far away at (0, 0)
    // Even if we move the first "O" between the two "O" positions, 1 physical "O" cannot satisfy both "O" slots
    for (let i = 0; i < shockCtrl.model.length; i++) {
        const entry = shockCtrl.model[i];
        const mRect = entry.model.getBoundingClientRect();
        entry.canvas.style.top = `${mRect.top - (entry.canvas.glyphTop || 0)}px`;
        entry.canvas.style.left = `${mRect.left - (entry.canvas.glyphLeft || 0)}px`;
    }
    // Move the second "O" (index 3) far away, and shift the first "O" (index 1) within pixelError of both if unchecked
    shockCtrl.model[3].canvas.style.top = '10px';
    shockCtrl.model[3].canvas.style.left = '10px';
    shockCtrl.checkPosition();
    assert.strictEqual(
        shockDOM.elementsById.win_toast.hidden,
        true,
        'Incomplete assembly with missing duplicate piece must NOT win'
    );

    // Now place the second "O" at the first "O" slot and the first "O" at the second "O" slot (swapped identical pieces)
    const mRect1 = shockCtrl.model[1].model.getBoundingClientRect();
    const mRect3 = shockCtrl.model[3].model.getBoundingClientRect();
    shockCtrl.model[1].canvas.style.top = `${mRect3.top - (shockCtrl.model[1].canvas.glyphTop || 0)}px`;
    shockCtrl.model[1].canvas.style.left = `${mRect3.left - (shockCtrl.model[1].canvas.glyphLeft || 0)}px`;
    shockCtrl.model[3].canvas.style.top = `${mRect1.top - (shockCtrl.model[3].canvas.glyphTop || 0)}px`;
    shockCtrl.model[3].canvas.style.left = `${mRect1.left - (shockCtrl.model[3].canvas.glyphLeft || 0)}px`;
    shockCtrl.checkPosition();
    assert.strictEqual(
        shockDOM.elementsById.win_toast.hidden,
        false,
        'Swapped identical pieces should still match via usedCanvasItems Set'
    );

    // 9c. Anchor candidate iteration when first character is duplicated ("shrug" has 4 "¯" pieces)
    const shrugDOM = createMockDOM('?smile=shrug');
    const shrugCtrl = shrugDOM.sandbox.window.__exports.controller;
    // Place all 9 pieces of shrug in a valid relative formation, with piece[0] and piece[8] (both "¯") swapped
    // so piece[8].canvas is the true leftmost anchor while piece[0].canvas is on the right
    for (let i = 0; i < shrugCtrl.model.length; i++) {
        const targetIdx = i === 0 ? 8 : i === 8 ? 0 : i;
        const mRect = shrugCtrl.model[targetIdx].model.getBoundingClientRect();
        const cItem = shrugCtrl.model[i].canvas;
        cItem.style.top = `${mRect.top - (cItem.glyphTop || 0)}px`;
        cItem.style.left = `${mRect.left - (cItem.glyphLeft || 0)}px`;
    }
    shrugCtrl.checkPosition();
    assert.strictEqual(
        shrugDOM.elementsById.win_toast.hidden,
        false,
        'Multi-anchor iteration should find whichever duplicate of first character is the true anchor'
    );

    // 9d. pixelError recalculation on resize
    assert.strictEqual(shrugCtrl.pixelError, 48);
    shrugDOM.sandbox.window.getComputedStyle = () => ({ fontSize: '90px', fontFamily: 'Times New Roman' });
    shrugDOM.modelItemHeight = 90;
    shrugCtrl.model[0].model.height = 90;
    shrugDOM.sandbox.window.dispatchEvent({ type: 'resize' });
    assert.strictEqual(shrugCtrl.pixelError, 30, 'pixelError should recalculate on window resize');
    console.log('PASS 9: Section 1.1 checkPosition (signed direction, multi-anchor, duplicate Set, resize pixelError) verified');
}

// 10. Section 1.2 Spawn bounds, Smart scatter, Resize layout recalculation, and Click-without-drag optimization
{
    const { sandbox, elementsById } = createMockDOM('?smile=smile');
    const { controller, scatterPieces } = sandbox.window.__exports;

    // 10a. Safe spawn bounds: no piece spawns under #head (top >= 86) or off-screen, and initial scatter is not pre-solved
    for (const entry of controller.model) {
        assert(entry.canvas.offsetTop >= 86, 'Spawned piece must not be placed under #head');
        assert(entry.canvas.offsetLeft >= 20, 'Spawned piece must respect left bound');
    }
    assert.strictEqual(controller.isCompleted, false, 'Smart scatter must not spawn already solved');
    assert.strictEqual(elementsById.win_toast.hidden, true);

    // 10b. Click without drag does NOT call checkPositioneven if pieces are manually positioned at matching coordinates
    const p0 = controller.model[0].canvas;
    const p1 = controller.model[1].canvas;
    p0.style.top = '200px';
    p0.style.left = '200px';
    p1.style.top = '200px';
    p1.style.left = '280px';

    p1.dispatchEvent({
        type: 'pointerdown',
        pointerType: 'mouse',
        button: 0,
        pointerId: 5,
        clientX: 280,
        clientY: 200,
        preventDefault() { }
    });
    // Release at the exact same coordinates without moving
    p1.dispatchEvent({
        type: 'pointerup',
        pointerId: 5
    });
    assert.strictEqual(
        controller.isCompleted,
        false,
        'Click without dragging must NOT trigger checkPosition'
    );

    // Now move by >1px and release -> triggers checkPosition and completes
    p1.dispatchEvent({
        type: 'pointerdown',
        pointerType: 'mouse',
        button: 0,
        pointerId: 6,
        clientX: 280,
        clientY: 200,
        preventDefault() { }
    });
    p1.dispatchEvent({
        type: 'pointermove',
        pointerId: 6,
        clientX: 282,
        clientY: 200
    });
    p1.dispatchEvent({
        type: 'pointerup',
        pointerId: 6
    });
    assert.strictEqual(controller.isCompleted, true, 'Dragging into place completes emoji');
    assert.strictEqual(elementsById.win_toast.hidden, false);

    // 10c. Dragging a piece away from a completed emoji resets completed UI state
    p1.dispatchEvent({
        type: 'pointerdown',
        pointerType: 'mouse',
        button: 0,
        pointerId: 7,
        clientX: 282,
        clientY: 200,
        preventDefault() { }
    });
    p1.dispatchEvent({
        type: 'pointermove',
        pointerId: 7,
        clientX: 500,
        clientY: 400
    });
    p1.dispatchEvent({
        type: 'pointerup',
        pointerId: 7
    });
    assert.strictEqual(controller.isCompleted, false, 'Pulling a piece away un-completes the emoji');
    assert.strictEqual(elementsById.win_toast.hidden, true);

    // 10d. Entrance animation (fromCenter = true) stacks pieces at common center without revealing solved model
    scatterPieces(700, true);
    assert.strictEqual(controller.isCompleted, false, 'Scattering must keep emoji unsolved');
    const startOrigins = controller.model.map(entry => {
        const anim = entry.canvas._lastAnimation;
        assert.ok(anim && anim.keyframes && anim.keyframes.length >= 2, 'Must have animate keyframes');
        const startTop = parseFloat(anim.keyframes[0].top);
        const startLeft = parseFloat(anim.keyframes[0].left);
        const centerX = startLeft + (entry.canvas.width || entry.canvas.offsetWidth || 40) / 2;
        const centerY = startTop + (entry.canvas.height || entry.canvas.offsetHeight || 40) / 2;
        return { centerX, centerY };
    });
    // All piece centers at t=0 must coincide at the exact same stacked center point
    for (let i = 1; i < startOrigins.length; i++) {
        assert.strictEqual(
            Math.round(startOrigins[i].centerX),
            Math.round(startOrigins[0].centerX),
            'All pieces must start at the exact same stacked center X coordinate'
        );
        assert.strictEqual(
            Math.round(startOrigins[i].centerY),
            Math.round(startOrigins[0].centerY),
            'All pieces must start at the exact same stacked center Y coordinate'
        );
    }

    console.log('PASS 10: Safe spawn bounds, smart scatter, click-without-drag skip, and un-complete on drag verified');
}

console.log('ALL TESTS PASSED!');
