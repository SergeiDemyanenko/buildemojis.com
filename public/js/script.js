'use strict';

const STORAGE_KEY_COMPLETED = 'buildemojis_completed';
const STORAGE_KEY_THEME = 'buildemojis_theme';
const completedEmojis = loadCompletedEmojis();
const levelOptionElements = {};

window.addEventListener('load', () => {
    const titleEl = document.getElementById('title');
    const prevLinkEl = document.getElementById('image_prev');
    const nextLinkEl = document.getElementById('image_next');
    const levelBadgeEl = document.getElementById('level_badge');
    const levelSelectEl = document.getElementById('level_select');
    const outlineBtnEl = document.getElementById('btn_outline');
    const resetBtnEl = document.getElementById('btn_reset');
    const robotBtnEl = document.getElementById('icon_robot');
    const robotLinkEl = document.getElementById('btn_robot');
    const copyBtnEl = document.getElementById('btn_copy');
    const copyLinkBtnEl = document.getElementById('btn_copy_link');
    const winNextEl = document.getElementById('win_next');
    const shortcutsBtnEl = document.getElementById('btn_shortcuts');
    const shortcutsPopoverEl = document.getElementById('shortcuts_popover');
    const themeBtnEl = document.getElementById('btn_theme');
    const themeIconEl = document.getElementById('theme_icon');
    const modelEl = document.getElementById('model');

    initTheme(themeBtnEl, themeIconEl);
    initShortcutsPopover(shortcutsBtnEl, shortcutsPopoverEl);
    initLevelPicker(param.getSmile(), levelBadgeEl, levelSelectEl, (selectedSmile) => {
        switchToLevel(selectedSmile, true);
    });

    if (nextLinkEl) {
        nextLinkEl.addEventListener('click', (event) => {
            const currentSmile = param.getSmile();
            const targetSmile = param.getNextSmile(currentSmile);
            trackEvent('next_emoji_click', {
                from_emoji: currentSmile,
                to_emoji: targetSmile
            });
            if (isPlainLeftClick(event)) {
                if (typeof event.preventDefault === 'function') {
                    event.preventDefault();
                }
                switchToLevel(targetSmile, true);
            }
        });
    }

    if (prevLinkEl) {
        prevLinkEl.addEventListener('click', (event) => {
            const currentSmile = param.getSmile();
            const targetSmile = param.getPrevSmile(currentSmile);
            trackEvent('prev_emoji_click', {
                from_emoji: currentSmile,
                to_emoji: targetSmile
            });
            if (isPlainLeftClick(event)) {
                if (typeof event.preventDefault === 'function') {
                    event.preventDefault();
                }
                switchToLevel(targetSmile, true);
            }
        });
    }

    if (winNextEl) {
        winNextEl.addEventListener('click', (event) => {
            const currentSmile = param.getSmile();
            const targetSmile = param.getNextSmile(currentSmile);
            if (isPlainLeftClick(event)) {
                if (typeof event.preventDefault === 'function') {
                    event.preventDefault();
                }
                switchToLevel(targetSmile, true);
            }
        });
    }

    const toggleOutline = () => {
        if (!outlineBtnEl || !modelEl) {
            return;
        }
        const currentSmile = param.getSmile();
        const isShowing = modelEl.classList ? modelEl.classList.toggle('show-outline') : false;
        if (isShowing) {
            controller.outlineUsed = true;
        }
        if (outlineBtnEl.classList) {
            outlineBtnEl.classList.toggle('is-active', isShowing);
        }
        outlineBtnEl.setAttribute('aria-pressed', String(isShowing));
        const zoneLabelEl = document.getElementById('target_zone_label');
        if (zoneLabelEl) {
            zoneLabelEl.textContent = isShowing
                ? 'Outline active — match pieces to the silhouette'
                : 'Assembly Zone (click “Outline” for a hint)';
        }
        trackEvent('outline_toggle', { emoji_id: currentSmile, visible: isShowing });
    };

    if (outlineBtnEl) {
        outlineBtnEl.addEventListener('click', toggleOutline);
    }

    if (resetBtnEl) {
        resetBtnEl.addEventListener('click', () => {
            const currentSmile = param.getSmile();
            controller.scatter();
            trackEvent('emoji_reset', { emoji_id: currentSmile });
        });
    }

    const triggerRobot = (event) => {
        if (event && typeof event.stopPropagation === 'function') {
            event.stopPropagation();
        }
        controller.toPosition('robot');
    };

    if (robotBtnEl) {
        robotBtnEl.addEventListener('click', triggerRobot);
    }
    if (robotLinkEl) {
        robotLinkEl.addEventListener('click', triggerRobot);
    }

    if (copyBtnEl) {
        copyBtnEl.addEventListener('click', () => {
            const currentSmile = param.getSmile();
            const emojiText = getEmojiText(data[currentSmile]);
            copyToClipboard(emojiText);
            copyBtnEl.textContent = 'Copied! ✓';
            trackEvent('emoji_copied', { emoji_id: currentSmile, emoji_text: emojiText });
            if (typeof window.setTimeout === 'function') {
                window.setTimeout(() => {
                    copyBtnEl.textContent = 'Copy';
                }, 1500);
            }
        });
    }

    if (copyLinkBtnEl) {
        copyLinkBtnEl.addEventListener('click', () => {
            const currentSmile = param.getSmile();
            const shareUrl = getShareableDoneUrl(currentSmile);
            copyToClipboard(shareUrl);
            copyLinkBtnEl.textContent = 'Link Copied! ✓';
            trackEvent('emoji_link_copied', { emoji_id: currentSmile, share_url: shareUrl });
            if (typeof window.setTimeout === 'function') {
                window.setTimeout(() => {
                    copyLinkBtnEl.textContent = 'Copy Link';
                }, 1500);
            }
        });
    }

    window.addEventListener('resize', () => {
        recalculateLayout(true);
    });

    window.addEventListener('popstate', () => {
        param.params = new URLSearchParams(window.location.search);
        renderLevel(param.getSmile());
    });

    initKeyboardControls(toggleOutline);

    renderLevel(param.getSmile());
    initFontLoadRelayout();
});

function initFontLoadRelayout() {
    const fonts = typeof document !== 'undefined' ? document.fonts : null;
    if (!fonts || typeof fonts.load !== 'function') {
        return;
    }

    // Web fonts load lazily (unicode-range), so glyph boxes measured before the
    // swap may not match the final rendering (e.g. ︵, ツ, メ). Re-measure once loaded.
    const sampleChars = [...new Set(
        Object.values(data).flatMap((emoji) => emoji.model.map((piece) => piece.character))
    )].join('');

    Promise.all([
        fonts.load('48px "Noto Serif"', sampleChars),
        fonts.load('48px "Noto Sans JP"', sampleChars)
    ])
        .catch(() => { })
        .then(() => recalculateLayout());

    if (typeof fonts.addEventListener === 'function') {
        fonts.addEventListener('loadingdone', () => recalculateLayout());
    }
}

function isPlainLeftClick(event) {
    if (!event) {
        return true;
    }
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
        return false;
    }
    if (typeof event.button === 'number' && event.button !== 0) {
        return false;
    }
    return true;
}

function clearElementChildren(el) {
    if (!el) {
        return;
    }
    if (Array.isArray(el.children)) {
        el.children.length = 0;
    }
    if (typeof el.replaceChildren === 'function') {
        el.replaceChildren();
    } else if ('innerHTML' in el) {
        el.innerHTML = '';
    }
}

function switchToLevel(targetSmile, pushHistory = true) {
    if (!Object.prototype.hasOwnProperty.call(data, targetSmile)) {
        return;
    }
    const newSearch = `?smile=${encodeURIComponent(targetSmile)}`;
    param.params = new URLSearchParams(newSearch);

    if (pushHistory) {
        if (typeof window !== 'undefined' && window.history && typeof window.history.pushState === 'function') {
            window.history.pushState({ smile: targetSmile }, '', newSearch);
        } else if (typeof window !== 'undefined' && window.location) {
            window.location.search = newSearch;
        }
    }

    renderLevel(targetSmile);
}

function renderLevel(smile) {
    const nextSmile = param.getNextSmile(smile);
    const prevSmile = param.getPrevSmile(smile);

    const titleEl = document.getElementById('title');
    const titleLinkEl = document.getElementById('title_link');
    const prevLinkEl = document.getElementById('image_prev');
    const nextLinkEl = document.getElementById('image_next');
    const levelBadgeEl = document.getElementById('level_badge');
    const levelSelectEl = document.getElementById('level_select');
    const outlineBtnEl = document.getElementById('btn_outline');
    const winToastEl = document.getElementById('win_toast');
    const winNextEl = document.getElementById('win_next');
    const targetZoneEl = document.getElementById('target_zone');
    const zoneLabelEl = document.getElementById('target_zone_label');
    const modelEl = document.getElementById('model');
    const canvasEl = document.getElementById('canvas');

    if (titleEl) {
        titleEl.textContent = data[smile].title;
    }
    if (titleLinkEl) {
        titleLinkEl.setAttribute('href', '');
    }
    if (nextLinkEl) {
        nextLinkEl.setAttribute('href', `?smile=${nextSmile}`);
    }
    if (prevLinkEl) {
        prevLinkEl.setAttribute('href', `?smile=${prevSmile}`);
    }
    if (winNextEl) {
        winNextEl.setAttribute('href', `?smile=${nextSmile}`);
    }
    if (winToastEl) {
        winToastEl.hidden = true;
    }
    if (targetZoneEl) {
        targetZoneEl.hidden = false;
        if (targetZoneEl.classList) {
            targetZoneEl.classList.remove('is-completed');
        }
    }
    if (zoneLabelEl) {
        zoneLabelEl.textContent = 'Assembly Zone (click “Outline” for a hint)';
    }
    if (outlineBtnEl) {
        if (outlineBtnEl.classList) {
            outlineBtnEl.classList.remove('is-active');
        }
        outlineBtnEl.setAttribute('aria-pressed', 'false');
    }

    updateLevelPickerState(smile, levelBadgeEl, levelSelectEl);
    updatePageMetadata(smile);

    clearElementChildren(modelEl);
    clearElementChildren(canvasEl);

    if (modelEl) {
        modelEl.style.top = '';
        modelEl.style.left = '';
        if (modelEl.classList) {
            modelEl.classList.remove('show-outline');
        }
    }

    controller.pixelError = null;
    controller.model = [];
    controller.canvas = {};
    controller.outlineUsed = false;
    controller.selectedItem = null;
    controller.isCompleted = false;

    const modelItems = [];
    for (const obj of data[smile].model) {
        const modelItem = document.createElement('span');
        modelItem.className = 'item';
        modelItem.textContent = obj.character;
        modelEl.appendChild(modelItem);

        if (obj.itemStyleFix !== undefined) {
            for (const [prop, ratio] of Object.entries(obj.itemStyleFix)) {
                modelItem.style[prop] = `${modelItem.offsetHeight * ratio}px`;
            }
        }
        modelItems.push({ obj, modelItem });
    }

    for (const { obj, modelItem } of modelItems) {
        const glyphMetrics = measureGlyphBox(modelEl, modelItem, obj.character, window.getComputedStyle(modelItem));

        const canvasItem = document.createElement('div');
        canvasItem.className = 'item';
        canvasItem.character = obj.character;
        canvasItem.tabIndex = 0;
        canvasItem.setAttribute('role', 'button');
        canvasItem.setAttribute('aria-label', `Draggable piece ${obj.character}`);
        canvasItem.width = glyphMetrics.boxWidth;
        canvasItem.height = glyphMetrics.boxHeight;
        canvasItem.glyphLeft = glyphMetrics.glyphLeft;
        canvasItem.glyphTop = glyphMetrics.glyphTop;
        canvasItem.style.width = `${glyphMetrics.boxWidth}px`;
        canvasItem.style.height = `${glyphMetrics.boxHeight}px`;

        const glyphEl = document.createElement('span');
        glyphEl.className = 'item-glyph';
        glyphEl.textContent = obj.character;
        glyphEl.style.left = `${glyphMetrics.glyphLeft}px`;
        glyphEl.style.top = `${glyphMetrics.glyphTop}px`;
        canvasItem.appendChild(glyphEl);

        canvasEl.prepend(canvasItem);

        canvasItem.addEventListener('focus', () => {
            selectCanvasItem(canvasItem);
        });
        canvasItem.addEventListener('blur', () => {
            if (canvasItem.classList) {
                canvasItem.classList.remove('is-kb-selected');
                canvasItem.classList.remove('is-snapped');
            }
            if (controller.selectedItem === canvasItem) {
                controller.selectedItem = null;
            }
        });

        makeDraggable(canvasItem, controller.checkPosition);

        controller.model.push({ character: obj.character, model: modelItem, canvas: canvasItem });
        if (!controller.canvas[obj.character]) {
            controller.canvas[obj.character] = [];
        }
        controller.canvas[obj.character].push(canvasItem);
    }

    updatePixelError();
    scatterPieces(param.isDone() ? 0 : 700, !param.isDone());
    fitTargetZone(targetZoneEl, controller.model);

    trackEvent('emoji_view', {
        emoji_id: smile,
        emoji_title: data[smile].title,
        pre_completed: param.isDone()
    });

    if (param.isDone()) {
        controller.toPosition('url_done');
    }
}

function selectCanvasItem(canvasItem) {
    if (controller.selectedItem && controller.selectedItem !== canvasItem && controller.selectedItem.classList) {
        controller.selectedItem.classList.remove('is-kb-selected');
    }
    controller.selectedItem = canvasItem;
    if (canvasItem && canvasItem.classList) {
        canvasItem.classList.add('is-kb-selected');
    }
}

function clearSelectedCanvasItem() {
    if (controller.selectedItem) {
        const prev = controller.selectedItem;
        controller.selectedItem = null;
        if (prev.classList) {
            prev.classList.remove('is-kb-selected');
            prev.classList.remove('is-snapped');
        }
        if (typeof prev.blur === 'function') {
            prev.blur();
        }
    }
}

function clearAllSnapHighlights() {
    for (const item of controller.model) {
        if (item.canvas && item.canvas.classList) {
            item.canvas.classList.remove('is-snapped');
        }
    }
}

function checkPieceSnapped(activeCanvasItem) {
    if (!activeCanvasItem || controller.model.length < 2 || !controller.pixelError) {
        return false;
    }
    const activePos = getGlyphOffset(activeCanvasItem);
    const err = controller.pixelError;
    const activeChar = activeCanvasItem.character;

    for (let i = 0; i < controller.model.length; i++) {
        const slotA = controller.model[i];
        if (slotA.character !== activeChar) {
            continue;
        }
        const modelPosA = getOffset(slotA.model);

        for (let j = 0; j < controller.model.length; j++) {
            if (i === j) {
                continue;
            }
            const slotB = controller.model[j];
            const modelPosB = getOffset(slotB.model);
            const expectedDTop = modelPosA.top - modelPosB.top;
            const expectedDLeft = modelPosA.left - modelPosB.left;

            const candidates = controller.canvas[slotB.character] || [];
            for (const otherCanvas of candidates) {
                if (otherCanvas === activeCanvasItem) {
                    continue;
                }
                const otherPos = getGlyphOffset(otherCanvas);
                const actualDTop = activePos.top - otherPos.top;
                const actualDLeft = activePos.left - otherPos.left;

                if (
                    Math.abs(actualDTop - expectedDTop) < err &&
                    Math.abs(actualDLeft - expectedDLeft) < err
                ) {
                    return true;
                }
            }
        }
    }
    return false;
}

function updateSnapHighlight(activeCanvasItem) {
    if (!activeCanvasItem || !activeCanvasItem.classList) {
        return false;
    }
    const snapped = checkPieceSnapped(activeCanvasItem);
    activeCanvasItem.classList.toggle('is-snapped', snapped);
    return snapped;
}

function initTheme(themeBtnEl, themeIconEl) {
    let savedTheme = 'light';
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            const stored = window.localStorage.getItem(STORAGE_KEY_THEME);
            if (stored === 'dark' || stored === 'light') {
                savedTheme = stored;
            } else if (
                typeof window.matchMedia === 'function' &&
                window.matchMedia('(prefers-color-scheme: dark)').matches
            ) {
                savedTheme = 'dark';
            }
        }
    } catch (_) {
        // Ignore storage errors
    }

    applyTheme(savedTheme, themeBtnEl, themeIconEl);

    if (themeBtnEl) {
        themeBtnEl.addEventListener('click', () => {
            const rootEl = document.documentElement;
            const currentTheme = rootEl && rootEl.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
            const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(nextTheme, themeBtnEl, themeIconEl);
            try {
                if (typeof window !== 'undefined' && window.localStorage) {
                    window.localStorage.setItem(STORAGE_KEY_THEME, nextTheme);
                }
            } catch (_) {
                // Ignore storage errors
            }
            trackEvent('theme_toggle', { theme: nextTheme });
        });
    }
}

function applyTheme(theme, themeBtnEl, themeIconEl) {
    const isDark = theme === 'dark';
    if (document.documentElement && typeof document.documentElement.setAttribute === 'function') {
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    }
    if (themeBtnEl) {
        themeBtnEl.setAttribute('aria-pressed', String(isDark));
        if (themeBtnEl.classList) {
            themeBtnEl.classList.toggle('is-active', isDark);
        }
    }
    if (themeIconEl) {
        themeIconEl.textContent = isDark ? '☀' : '☾';
    }
}

function initShortcutsPopover(shortcutsBtnEl, shortcutsPopoverEl) {
    if (!shortcutsBtnEl || !shortcutsPopoverEl) {
        return;
    }

    const setPopoverOpen = (open) => {
        shortcutsPopoverEl.hidden = !open;
        shortcutsBtnEl.setAttribute('aria-expanded', String(open));
        if (shortcutsBtnEl.classList) {
            shortcutsBtnEl.classList.toggle('is-active', open);
        }
    };

    shortcutsBtnEl.addEventListener('click', (event) => {
        if (event && typeof event.stopPropagation === 'function') {
            event.stopPropagation();
        }
        const willOpen = Boolean(shortcutsPopoverEl.hidden);
        setPopoverOpen(willOpen);
    });

    if (typeof document.addEventListener === 'function') {
        document.addEventListener('click', (event) => {
            if (shortcutsPopoverEl.hidden) {
                return;
            }
            const target = event && event.target;
            if (
                target &&
                typeof shortcutsPopoverEl.contains === 'function' &&
                (shortcutsPopoverEl.contains(target) || shortcutsBtnEl.contains(target))
            ) {
                return;
            }
            setPopoverOpen(false);
        });
    }
}

function initKeyboardControls(toggleOutline) {
    window.addEventListener('keydown', (event) => {
        if (!event || event.ctrlKey || event.altKey || event.metaKey) {
            return;
        }

        const shortcutsBtnEl = document.getElementById('btn_shortcuts');
        const shortcutsPopoverEl = document.getElementById('shortcuts_popover');

        if (event.key === 'Escape') {
            if (shortcutsPopoverEl && !shortcutsPopoverEl.hidden) {
                shortcutsPopoverEl.hidden = true;
                if (shortcutsBtnEl) {
                    shortcutsBtnEl.setAttribute('aria-expanded', 'false');
                    if (shortcutsBtnEl.classList) {
                        shortcutsBtnEl.classList.remove('is-active');
                    }
                }
            }
            return;
        }

        const activeTag = event.target && event.target.tagName ? event.target.tagName.toUpperCase() : '';
        if (activeTag === 'SELECT' || activeTag === 'INPUT' || activeTag === 'TEXTAREA') {
            return;
        }

        if (
            event.key === 'ArrowUp' ||
            event.key === 'ArrowDown' ||
            event.key === 'ArrowLeft' ||
            event.key === 'ArrowRight'
        ) {
            if (controller.model.length === 0) {
                return;
            }
            if (typeof event.preventDefault === 'function') {
                event.preventDefault();
            }

            const activeItem = controller.selectedItem || controller.model[0].canvas;
            selectCanvasItem(activeItem);

            controller.topZIndex += 1;
            activeItem.style.zIndex = String(controller.topZIndex);

            const step = event.shiftKey ? 28 : 8;
            let top = activeItem.offsetTop;
            let left = activeItem.offsetLeft;

            if (event.key === 'ArrowUp') top -= step;
            if (event.key === 'ArrowDown') top += step;
            if (event.key === 'ArrowLeft') left -= step;
            if (event.key === 'ArrowRight') left += step;

            if (controller.isCompleted) {
                resetCompletedUIState();
            }

            activeItem.style.top = `${top}px`;
            activeItem.style.left = `${left}px`;

            updateSnapHighlight(activeItem);
            controller.checkPosition();
            return;
        }

        if (event.key === 'o' || event.key === 'O') {
            if (typeof toggleOutline === 'function') {
                toggleOutline();
            }
            return;
        }

        if (event.key === 'r' || event.key === 'R') {
            const currentSmile = param.getSmile();
            controller.scatter();
            trackEvent('emoji_reset', { emoji_id: currentSmile });
            return;
        }

        if (event.key === '[') {
            const currentSmile = param.getSmile();
            switchToLevel(param.getPrevSmile(currentSmile), true);
            return;
        }

        if (event.key === ']') {
            const currentSmile = param.getSmile();
            switchToLevel(param.getNextSmile(currentSmile), true);
            return;
        }

        if (event.key === ' ') {
            if (activeTag === 'BUTTON' || activeTag === 'A') {
                return;
            }
            if (typeof event.preventDefault === 'function') {
                event.preventDefault();
            }
            controller.toPosition('robot');
        }
    });

    window.addEventListener('keyup', (event) => {
        if (
            event &&
            (event.key === 'ArrowUp' ||
                event.key === 'ArrowDown' ||
                event.key === 'ArrowLeft' ||
                event.key === 'ArrowRight')
        ) {
            clearAllSnapHighlights();
        }
    });
}

function updatePixelError() {
    if (controller.model.length === 0) {
        controller.pixelError = null;
        return;
    }
    const firstModelEl = controller.model[0].model;
    let baseSize = firstModelEl ? firstModelEl.offsetHeight : 0;
    if (typeof window !== 'undefined' && typeof window.getComputedStyle === 'function' && firstModelEl) {
        const computedFontSize = parseFloat(window.getComputedStyle(firstModelEl).fontSize);
        if (Number.isFinite(computedFontSize) && computedFontSize > 0) {
            baseSize = Math.max(baseSize, computedFontSize);
        }
    }
    controller.pixelError = (baseSize || 144) / 3;
}

function getSpawnBounds(canvasEl, pieceWidth, pieceHeight) {
    const headEl = document.getElementById('head');
    const headBottom = headEl ? (headEl.offsetTop || 0) + (headEl.offsetHeight || 58) : 68;
    const areaHeight = Math.max(canvasEl ? canvasEl.offsetHeight : 0, 360);
    const areaWidth = Math.max(canvasEl ? canvasEl.offsetWidth : 0, 360);

    const minTop = Math.max(headBottom + 18, 86);
    const maxTop = Math.max(minTop, areaHeight - pieceHeight - 24);
    const minLeft = 20;
    const maxLeft = Math.max(minLeft, areaWidth - pieceWidth - 20);

    return { minTop, maxTop, minLeft, maxLeft };
}

function clearUrlDoneParam() {
    if (param.isDone()) {
        const currentSmile = param.getSmile();
        const cleanSearch = `?smile=${encodeURIComponent(currentSmile)}`;
        param.params = new URLSearchParams(cleanSearch);
        if (typeof window !== 'undefined' && window.history && typeof window.history.replaceState === 'function') {
            window.history.replaceState({ smile: currentSmile }, '', cleanSearch);
        }
    }
}

function scatterPieces(duration = 700, fromCenter = false) {
    const canvasEl = document.getElementById('canvas');
    if (!canvasEl || controller.model.length === 0) {
        return;
    }

    const initialPositions = controller.model.map((item) => ({
        top: Math.round(
            item.canvas.style && item.canvas.style.top
                ? parseFloat(item.canvas.style.top)
                : item.canvas.offsetTop || 0
        ),
        left: Math.round(
            item.canvas.style && item.canvas.style.left
                ? parseFloat(item.canvas.style.left)
                : item.canvas.offsetLeft || 0
        )
    }));

    const minCenterDistSq = 56 * 56;
    let chosenCoords = [];

    for (let attempt = 0; attempt < 12; attempt++) {
        const coords = [];
        const centers = [];

        for (let i = 0; i < controller.model.length; i++) {
            const canvasItem = controller.model[i].canvas;
            const bounds = getSpawnBounds(canvasEl, canvasItem.width, canvasItem.height);
            let bestTop = bounds.minTop;
            let bestLeft = bounds.minLeft;

            for (let pTry = 0; pTry < 15; pTry++) {
                const candidateTop =
                    bounds.minTop + Math.floor(Math.random() * (bounds.maxTop - bounds.minTop + 1));
                const candidateLeft =
                    bounds.minLeft + Math.floor(Math.random() * (bounds.maxLeft - bounds.minLeft + 1));
                bestTop = candidateTop;
                bestLeft = candidateLeft;

                const cx = candidateLeft + canvasItem.width / 2;
                const cy = candidateTop + canvasItem.height / 2;
                let tooClose = false;
                for (const prev of centers) {
                    const dx = cx - prev.x;
                    const dy = cy - prev.y;
                    if (dx * dx + dy * dy < minCenterDistSq) {
                        tooClose = true;
                        break;
                    }
                }
                if (!tooClose) {
                    break;
                }
            }

            coords.push({ top: bestTop, left: bestLeft });
            centers.push({
                x: bestLeft + canvasItem.width / 2,
                y: bestTop + canvasItem.height / 2
            });
        }

        for (let i = 0; i < controller.model.length; i++) {
            controller.model[i].canvas.style.top = `${coords[i].top}px`;
            controller.model[i].canvas.style.left = `${coords[i].left}px`;
        }

        chosenCoords = coords;
        if (!isSolvedState()) {
            break;
        }
    }

    if (isSolvedState() && controller.model.length >= 2) {
        const secondItem = controller.model[1].canvas;
        const bounds = getSpawnBounds(canvasEl, secondItem.width, secondItem.height);
        const span = Math.max(bounds.maxLeft - bounds.minLeft, 120);
        const shiftedLeft =
            bounds.minLeft + ((chosenCoords[1].left - bounds.minLeft + Math.floor(span / 2)) % (span + 1));
        chosenCoords[1].left = shiftedLeft;
    }

    let originTop = null;
    let originLeft = null;
    if (fromCenter) {
        const targetZoneEl = document.getElementById('target_zone');
        if (targetZoneEl && targetZoneEl.offsetWidth > 0 && targetZoneEl.offsetHeight > 0) {
            const zoneOffset = getOffset(targetZoneEl);
            originTop = zoneOffset.top + targetZoneEl.offsetHeight / 2;
            originLeft = zoneOffset.left + targetZoneEl.offsetWidth / 2;
        } else if (canvasEl) {
            const canvasOffset = getOffset(canvasEl);
            const w = canvasEl.offsetWidth || 400;
            const h = canvasEl.offsetHeight || 400;
            originTop = canvasOffset.top + h / 2;
            originLeft = canvasOffset.left + w / 2;
        }
    }

    for (let i = 0; i < controller.model.length; i++) {
        const item = controller.model[i];
        let from = null;
        if (fromCenter && originTop !== null && originLeft !== null) {
            const pieceH = item.canvas.height || item.canvas.offsetHeight || 40;
            const pieceW = item.canvas.width || item.canvas.offsetWidth || 40;
            from = {
                top: Math.round(originTop - pieceH / 2),
                left: Math.round(originLeft - pieceW / 2)
            };
        } else if (!fromCenter) {
            from = initialPositions[i];
        }
        animatePosition(
            item.canvas,
            chosenCoords[i].top,
            chosenCoords[i].left,
            duration,
            from
        );
    }
}

function recalculateLayout(isResize = false) {
    const smile = param.getSmile();
    const modelEl = document.getElementById('model');
    const canvasEl = document.getElementById('canvas');
    const targetZoneEl = document.getElementById('target_zone');
    if (!modelEl || !canvasEl || controller.model.length === 0) {
        return;
    }

    const emojiDef = data[smile];
    for (let i = 0; i < controller.model.length; i++) {
        const entry = controller.model[i];
        const pieceDef = emojiDef && emojiDef.model[i];
        entry.model.style.top = '';
        entry.model.style.left = '';
        if (pieceDef && pieceDef.itemStyleFix !== undefined) {
            for (const [prop, ratio] of Object.entries(pieceDef.itemStyleFix)) {
                entry.model.style[prop] = `${entry.model.offsetHeight * ratio}px`;
            }
        }
    }

    for (const entry of controller.model) {
        const glyphMetrics = measureGlyphBox(
            modelEl,
            entry.model,
            entry.character,
            window.getComputedStyle(entry.model)
        );
        entry.canvas.width = glyphMetrics.boxWidth;
        entry.canvas.height = glyphMetrics.boxHeight;
        entry.canvas.glyphLeft = glyphMetrics.glyphLeft;
        entry.canvas.glyphTop = glyphMetrics.glyphTop;
        entry.canvas.style.width = `${glyphMetrics.boxWidth}px`;
        entry.canvas.style.height = `${glyphMetrics.boxHeight}px`;

        const glyphEl = entry.canvas.children && entry.canvas.children[0];
        if (glyphEl && glyphEl.style) {
            glyphEl.style.left = `${glyphMetrics.glyphLeft}px`;
            glyphEl.style.top = `${glyphMetrics.glyphTop}px`;
        }

        if (controller.isCompleted) {
            const targetOffset = getOffset(entry.model);
            entry.canvas.style.top = `${targetOffset.top - glyphMetrics.glyphTop}px`;
            entry.canvas.style.left = `${targetOffset.left - glyphMetrics.glyphLeft}px`;
        } else if (isResize) {
            const bounds = getSpawnBounds(canvasEl, glyphMetrics.boxWidth, glyphMetrics.boxHeight);
            const currentTop = entry.canvas.offsetTop;
            const currentLeft = entry.canvas.offsetLeft;
            if (currentTop < bounds.minTop || currentTop > bounds.maxTop || currentLeft < bounds.minLeft || currentLeft > bounds.maxLeft) {
                const clampedTop = Math.min(Math.max(currentTop, bounds.minTop), bounds.maxTop);
                const clampedLeft = Math.min(Math.max(currentLeft, bounds.minLeft), bounds.maxLeft);
                entry.canvas.style.top = `${clampedTop}px`;
                entry.canvas.style.left = `${clampedLeft}px`;
            }
        }
    }

    updatePixelError();
    fitTargetZone(targetZoneEl, controller.model);
}

function resetCompletedUIState() {
    clearUrlDoneParam();
    if (!controller.isCompleted) {
        return;
    }
    controller.isCompleted = false;
    const winToastEl = document.getElementById('win_toast');
    const targetZoneEl = document.getElementById('target_zone');
    const titleLinkEl = document.getElementById('title_link');

    if (winToastEl) {
        winToastEl.hidden = true;
    }
    if (targetZoneEl) {
        targetZoneEl.hidden = false;
        if (targetZoneEl.classList) {
            targetZoneEl.classList.remove('is-completed');
        }
    }
    if (titleLinkEl) {
        titleLinkEl.setAttribute('href', '');
    }
}

function fitTargetZone(targetZoneEl, modelList) {
    if (!targetZoneEl || !modelList || modelList.length === 0) {
        return;
    }

    let minLeft = Infinity;
    let minTop = Infinity;
    let maxRight = -Infinity;
    let maxBottom = -Infinity;

    for (const entry of modelList) {
        const targetOffset = getOffset(entry.model);
        const glyphTop = entry.canvas.glyphTop || 0;
        const glyphLeft = entry.canvas.glyphLeft || 0;
        const boxLeft = targetOffset.left - glyphLeft;
        const boxTop = targetOffset.top - glyphTop;
        const boxRight = boxLeft + entry.canvas.width;
        const boxBottom = boxTop + entry.canvas.height;

        if (boxLeft < minLeft) minLeft = boxLeft;
        if (boxTop < minTop) minTop = boxTop;
        if (boxRight > maxRight) maxRight = boxRight;
        if (boxBottom > maxBottom) maxBottom = boxBottom;
    }

    if (!Number.isFinite(minLeft) || !Number.isFinite(minTop)) {
        return;
    }

    const padX = 28;
    const padTop = 42;
    const padBottom = 24;
    const minZoneWidth = 280;

    const assembledWidth = maxRight - minLeft;
    const assembledHeight = maxBottom - minTop;
    const centerX = (minLeft + maxRight) / 2;

    const zoneWidth = Math.max(Math.round(assembledWidth + padX * 2), minZoneWidth);
    const zoneHeight = Math.round(assembledHeight + padTop + padBottom);
    const zoneLeft = Math.round(centerX - zoneWidth / 2);
    const zoneTop = Math.round(minTop - padTop);

    targetZoneEl.style.transform = 'none';
    targetZoneEl.style.width = `${zoneWidth}px`;
    targetZoneEl.style.height = `${zoneHeight}px`;
    targetZoneEl.style.left = `${zoneLeft}px`;
    targetZoneEl.style.top = `${zoneTop}px`;
}

function loadCompletedEmojis() {
    const map = {};
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            const raw = window.localStorage.getItem(STORAGE_KEY_COMPLETED);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    for (const key of parsed) {
                        if (typeof key === 'string' && Object.prototype.hasOwnProperty.call(data, key)) {
                            map[key] = 3;
                        }
                    }
                } else if (parsed && typeof parsed === 'object') {
                    for (const [key, stars] of Object.entries(parsed)) {
                        if (Object.prototype.hasOwnProperty.call(data, key) && typeof stars === 'number' && stars >= 1) {
                            map[key] = Math.min(Math.max(Math.floor(stars), 1), 3);
                        }
                    }
                }
            }
        }
    } catch (_) {
        // Ignore storage access errors
    }
    return map;
}

function formatStars(stars) {
    if (stars >= 3) return '★★★';
    if (stars === 2) return '★★☆';
    return '★☆☆';
}

function formatLevelOptionText(index, key) {
    const sep = ' \u00A0|\u00A0 ';
    const stars = completedEmojis[key] || 0;
    if (stars > 0) {
        return `${index + 1}. ${data[key].title}${sep}${getEmojiText(data[key])}${sep}${formatStars(stars)}`;
    }
    return `${index + 1}. ${data[key].title}${sep}?`;
}

function markEmojiCompleted(key, earnedStars = 3) {
    if (!Object.prototype.hasOwnProperty.call(data, key)) {
        return;
    }
    const prevStars = completedEmojis[key] || 0;
    const bestStars = Math.max(prevStars, earnedStars);
    completedEmojis[key] = bestStars;

    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(STORAGE_KEY_COMPLETED, JSON.stringify(completedEmojis));
        }
    } catch (_) {
        // Ignore storage write errors
    }

    const keys = Object.keys(data);
    const index = keys.indexOf(key);
    const opt = levelOptionElements[key];
    if (opt && index >= 0) {
        opt.textContent = formatLevelOptionText(index, key);
    }
}

function getDifficultyGroupKey(pieceCount) {
    if (pieceCount <= 3) return 'easy';
    if (pieceCount <= 6) return 'medium';
    return 'hard';
}

function initLevelPicker(currentSmile, badgeEl, selectEl, onSelectSmile) {
    const keys = Object.keys(data);

    if (selectEl) {
        const groups = {
            easy: document.createElement('optgroup'),
            medium: document.createElement('optgroup'),
            hard: document.createElement('optgroup')
        };
        groups.easy.label = 'Easy (2–3 pieces)';
        groups.medium.label = 'Medium (4–6 pieces)';
        groups.hard.label = 'Hard • Kaomoji (7–10 pieces)';

        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const opt = document.createElement('option');
            opt.value = key;
            opt.textContent = formatLevelOptionText(i, key);
            if (key === currentSmile) {
                opt.selected = true;
            }
            levelOptionElements[key] = opt;

            const groupKey = getDifficultyGroupKey(data[key].model.length);
            groups[groupKey].appendChild(opt);
        }

        selectEl.appendChild(groups.easy);
        selectEl.appendChild(groups.medium);
        selectEl.appendChild(groups.hard);
        selectEl.value = currentSmile;

        selectEl.addEventListener('change', () => {
            if (selectEl.value) {
                if (typeof onSelectSmile === 'function') {
                    onSelectSmile(selectEl.value);
                } else if (window.location) {
                    window.location.search = `?smile=${encodeURIComponent(selectEl.value)}`;
                }
            }
        });
    }

    updateLevelPickerState(currentSmile, badgeEl, selectEl);
}

function updateLevelPickerState(currentSmile, badgeEl, selectEl) {
    const keys = Object.keys(data);
    const currentIndex = keys.indexOf(currentSmile);

    if (badgeEl) {
        badgeEl.textContent = `${currentIndex + 1} / ${keys.length}`;
    }

    if (selectEl) {
        selectEl.value = currentSmile;
        for (const [key, opt] of Object.entries(levelOptionElements)) {
            opt.selected = key === currentSmile;
        }
    }
}

function getShareableDoneUrl(smile) {
    if (typeof window !== 'undefined' && window.location && window.location.href) {
        try {
            const url = new URL(window.location.href);
            url.search = `?smile=${encodeURIComponent(smile)}&done`;
            return url.toString();
        } catch (_) {
            // Fallback to canonical domain below
        }
    }
    return `https://buildemojis.com/?smile=${encodeURIComponent(smile)}&done`;
}

function copyToClipboard(text) {
    if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        navigator.clipboard.writeText(text).catch(() => { });
    }
}

function trackEvent(eventName, eventParams) {
    if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, eventParams);
    }
}

function getEmojiText(emojiObj) {
    return emojiObj.model
        .map((item) => (item.character === '¯' && item.itemStyleFix && item.itemStyleFix.top >= 0.5 ? '_' : item.character))
        .join('');
}

function updatePageMetadata(smile) {
    const emojiObj = data[smile];
    if (!emojiObj) {
        return;
    }

    const emojiText = getEmojiText(emojiObj);
    const hasExplicitSmile = param.params.has(param.PARAM_SMILE);
    const pageTitle = hasExplicitSmile
        ? `Build "${emojiObj.title}" ${emojiText} — Build an Emoji Game`
        : `Build an Emoji — Interactive Emoticon & Kaomoji Puzzle Game`;
    const pageDescription = `Play Build an Emoji: drag and drop ${emojiObj.model.length} character pieces to assemble the "${emojiObj.title}" (${emojiText}) text emoticon! Free browser puzzle game inspired by https://buildshruggie.com/.`;
    const canonicalUrl = hasExplicitSmile
        ? `https://buildemojis.com/?smile=${encodeURIComponent(smile)}`
        : 'https://buildemojis.com/';

    if (typeof document.title === 'string') {
        document.title = pageTitle;
    }

    const canonicalEl = document.getElementById('canonical_link');
    if (canonicalEl) {
        canonicalEl.setAttribute('href', canonicalUrl);
    }

    if (typeof document.querySelector === 'function') {
        const metaUpdates = {
            'meta[name="description"]': pageDescription,
            'meta[property="og:title"]': pageTitle,
            'meta[property="og:description"]': pageDescription,
            'meta[property="og:url"]': canonicalUrl,
            'meta[name="twitter:title"]': pageTitle,
            'meta[name="twitter:description"]': pageDescription,
            'meta[name="twitter:url"]': canonicalUrl
        };

        for (const [selector, content] of Object.entries(metaUpdates)) {
            const metaEl = document.querySelector(selector);
            if (metaEl) {
                metaEl.setAttribute('content', content);
            }
        }
    }
}

function measureGlyphBox(modelEl, modelItem, character, computedStyle) {
    const fallbackWidth = Math.max(modelItem.offsetWidth, 40);
    const fallbackHeight = Math.max(modelItem.offsetHeight, 40);

    let baselineY = fallbackHeight * 0.78;
    if (typeof document.createElement === 'function' && typeof modelItem.getBoundingClientRect === 'function') {
        const probe = document.createElement('span');
        probe.style.display = 'inline-block';
        probe.style.width = '0px';
        probe.style.height = '0px';
        probe.style.verticalAlign = 'baseline';
        modelItem.appendChild(probe);
        const itemRect = modelItem.getBoundingClientRect();
        const probeRect = probe.getBoundingClientRect();
        if (probeRect.top > itemRect.top) {
            baselineY = probeRect.top - itemRect.top;
        }
        if (typeof probe.remove === 'function') {
            probe.remove();
        } else if (modelItem.removeChild) {
            modelItem.removeChild(probe);
        }
    }

    let ascent = baselineY * 0.75;
    let descent = (fallbackHeight - baselineY) * 0.5;
    let left = 0;
    let right = fallbackWidth;

    const measureCanvas = document.createElement('canvas');
    if (measureCanvas && typeof measureCanvas.getContext === 'function') {
        const ctx = measureCanvas.getContext('2d');
        if (ctx && typeof ctx.measureText === 'function') {
            ctx.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;
            const metrics = ctx.measureText(character);
            if (
                metrics &&
                typeof metrics.actualBoundingBoxAscent === 'number' &&
                typeof metrics.actualBoundingBoxDescent === 'number'
            ) {
                ascent = metrics.actualBoundingBoxAscent;
                descent = metrics.actualBoundingBoxDescent;
                left = metrics.actualBoundingBoxLeft || 0;
                right = metrics.actualBoundingBoxRight || fallbackWidth;
            }
        }
    }

    const inkWidth = Math.max(right + left, 16);
    const inkHeight = Math.max(ascent + descent, 16);
    const padX = Math.max(Math.round(fallbackHeight * 0.12), 14);
    const padY = Math.max(Math.round(fallbackHeight * 0.12), 14);

    const boxWidth = Math.round(inkWidth + padX * 2);
    const boxHeight = Math.round(inkHeight + padY * 2);

    const modelInkCenterX = (right - left) / 2;
    const modelInkCenterY = baselineY + (descent - ascent) / 2;

    const glyphLeft = Math.round(boxWidth / 2 - modelInkCenterX);
    const glyphTop = Math.round(boxHeight / 2 - modelInkCenterY);

    return {
        boxWidth,
        boxHeight,
        glyphLeft,
        glyphTop
    };
}

function getOffset(element) {
    const rect = element.getBoundingClientRect();
    return {
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX
    };
}

function getGlyphOffset(canvasItem) {
    const offset = getOffset(canvasItem);
    const glyphTop = canvasItem.glyphTop || 0;
    const glyphLeft = canvasItem.glyphLeft || 0;
    return {
        top: offset.top + glyphTop,
        left: offset.left + glyphLeft
    };
}

function animatePosition(element, top, left, duration = 700, from = null) {
    if (typeof element.getAnimations === 'function') {
        for (const anim of element.getAnimations()) {
            anim.cancel();
        }
    }
    const startTop = from ? from.top : element.offsetTop;
    const startLeft = from ? from.left : element.offsetLeft;
    element.style.top = `${top}px`;
    element.style.left = `${left}px`;

    if (duration > 0 && typeof element.animate === 'function' && !navigator.webdriver) {
        element.animate(
            [
                { top: `${startTop}px`, left: `${startLeft}px` },
                { top: `${top}px`, left: `${left}px` }
            ],
            { duration, easing: 'ease-in-out' }
        );
    }
}

function makeDraggable(element, onRelease) {
    element.addEventListener('pointerdown', (event) => {
        if (event.pointerType === 'mouse' && event.button !== 0) {
            return;
        }
        event.preventDefault();

        if (typeof element.getAnimations === 'function') {
            for (const anim of element.getAnimations()) {
                anim.cancel();
            }
        }

        clearSelectedCanvasItem();
        controller.topZIndex += 1;
        element.style.zIndex = String(controller.topZIndex);
        if (element.classList) {
            element.classList.remove('is-kb-selected');
            element.classList.add('is-dragging');
        }

        const initialLeft = element.offsetLeft;
        const initialTop = element.offsetTop;
        const shiftX = event.clientX - initialLeft;
        const shiftY = event.clientY - initialTop;
        let hasMoved = false;

        element.setPointerCapture(event.pointerId);

        const onPointerMove = (moveEvent) => {
            const newLeft = moveEvent.clientX - shiftX;
            const newTop = moveEvent.clientY - shiftY;
            if (Math.abs(newLeft - initialLeft) > 1 || Math.abs(newTop - initialTop) > 1) {
                hasMoved = true;
                if (controller.isCompleted) {
                    resetCompletedUIState();
                }
            }
            element.style.left = `${newLeft}px`;
            element.style.top = `${newTop}px`;
            updateSnapHighlight(element);
        };

        const onPointerUp = (upEvent) => {
            element.removeEventListener('pointermove', onPointerMove);
            element.removeEventListener('pointerup', onPointerUp);
            element.removeEventListener('pointercancel', onPointerUp);
            if (element.classList) {
                element.classList.remove('is-dragging');
                element.classList.remove('is-snapped');
                element.classList.remove('is-kb-selected');
            }
            if (element.hasPointerCapture(upEvent.pointerId)) {
                element.releasePointerCapture(upEvent.pointerId);
            }
            if (hasMoved && !controller.isCompleted && typeof onRelease === 'function') {
                onRelease();
            }
        };

        element.addEventListener('pointermove', onPointerMove);
        element.addEventListener('pointerup', onPointerUp);
        element.addEventListener('pointercancel', onPointerUp);
    });
}

const param = {
    PARAM_SMILE: 'smile',
    PARAM_DONE: 'done',

    params: new URLSearchParams(window.location.search),

    getSmile() {
        const smile = param.params.get(param.PARAM_SMILE);
        if (smile && Object.prototype.hasOwnProperty.call(data, smile)) {
            return smile;
        }
        return param.getNextSmile(null);
    },

    getNextSmile(smile) {
        const keys = Object.keys(data);
        const nextIndex = keys.indexOf(smile) + 1;

        if (keys.length <= nextIndex) {
            return param.getNextSmile(null);
        }
        return keys[nextIndex];
    },

    getPrevSmile(smile) {
        const keys = Object.keys(data);
        const prevIndex = keys.indexOf(smile) - 1;

        if (prevIndex < 0) {
            return keys[keys.length - 1];
        }
        return keys[prevIndex];
    },

    isDone() {
        return param.params.has(param.PARAM_DONE);
    }
};

function isSolvedState() {
    if (controller.model.length === 0 || !controller.pixelError) {
        return false;
    }

    const firstEntry = controller.model[0];
    const anchorModelOffset = getOffset(firstEntry.model);
    const anchorCandidates = controller.canvas[firstEntry.character] || [];

    for (const anchorCanvas of anchorCandidates) {
        const anchorCanvasOffset = getGlyphOffset(anchorCanvas);
        const usedCanvasItems = new Set([anchorCanvas]);
        let allMatched = true;

        for (let i = 1; i < controller.model.length; i++) {
            const item = controller.model[i];
            const itemModelOffset = getOffset(item.model);
            const dModelTop = itemModelOffset.top - anchorModelOffset.top;
            const dModelLeft = itemModelOffset.left - anchorModelOffset.left;

            let bestCandidate = null;
            let bestDistanceSq = Infinity;

            for (const canvasItem of controller.canvas[item.character] || []) {
                if (usedCanvasItems.has(canvasItem)) {
                    continue;
                }

                const canvasOffset = getGlyphOffset(canvasItem);
                const dCanvasTop = canvasOffset.top - anchorCanvasOffset.top;
                const dCanvasLeft = canvasOffset.left - anchorCanvasOffset.left;

                const errTop = Math.abs(dCanvasTop - dModelTop);
                const errLeft = Math.abs(dCanvasLeft - dModelLeft);

                if (errTop < controller.pixelError && errLeft < controller.pixelError) {
                    const distSq = errTop * errTop + errLeft * errLeft;
                    if (distSq < bestDistanceSq) {
                        bestDistanceSq = distSq;
                        bestCandidate = canvasItem;
                    }
                }
            }

            if (!bestCandidate) {
                allMatched = false;
                break;
            }

            usedCanvasItems.add(bestCandidate);
        }

        if (allMatched) {
            return true;
        }
    }

    return false;
}

const controller = {
    pixelError: null,
    topZIndex: 10,
    model: [],
    canvas: {},
    outlineUsed: false,
    selectedItem: null,
    isCompleted: false,

    scatter() {
        clearUrlDoneParam();
        const winToastEl = document.getElementById('win_toast');
        const targetZoneEl = document.getElementById('target_zone');
        const titleLinkEl = document.getElementById('title_link');
        const modelEl = document.getElementById('model');

        controller.isCompleted = false;

        if (winToastEl) {
            winToastEl.hidden = true;
        }
        if (targetZoneEl) {
            targetZoneEl.hidden = false;
            if (targetZoneEl.classList) {
                targetZoneEl.classList.remove('is-completed');
            }
        }
        if (titleLinkEl) {
            titleLinkEl.setAttribute('href', '');
        }

        controller.outlineUsed = Boolean(
            modelEl && modelEl.classList && modelEl.classList.contains('show-outline')
        );
        clearAllSnapHighlights();
        clearSelectedCanvasItem();
        scatterPieces(700);
    },

    toPosition(method = 'manual') {
        const smile = param.getSmile();
        const titleLinkEl = document.getElementById('title_link');
        const winToastEl = document.getElementById('win_toast');
        const winEmojiTextEl = document.getElementById('win_emoji_text');
        const targetZoneEl = document.getElementById('target_zone');

        controller.isCompleted = true;
        titleLinkEl.setAttribute('href', `?smile=${smile}&done`);

        let earnedStars = 1;
        if (method === 'manual') {
            earnedStars = controller.outlineUsed ? 2 : 3;
        }
        markEmojiCompleted(smile, earnedStars);
        clearAllSnapHighlights();

        if (winEmojiTextEl) {
            winEmojiTextEl.textContent = getEmojiText(data[smile]);
        }
        if (winToastEl) {
            winToastEl.hidden = false;
        }
        if (targetZoneEl) {
            if (method === 'url_done') {
                targetZoneEl.hidden = true;
            }
            if (targetZoneEl.classList) {
                targetZoneEl.classList.add('is-completed');
            }
        }
        const modelEl = document.getElementById('model');
        const outlineBtnEl = document.getElementById('btn_outline');
        if (modelEl && modelEl.classList) {
            modelEl.classList.remove('show-outline');
        }
        if (outlineBtnEl) {
            if (outlineBtnEl.classList) {
                outlineBtnEl.classList.remove('is-active');
            }
            outlineBtnEl.setAttribute('aria-pressed', 'false');
        }

        trackEvent('emoji_completed', {
            emoji_id: smile,
            emoji_title: data[smile].title,
            method,
            stars: earnedStars
        });

        for (const item of controller.model) {
            const targetOffset = getOffset(item.model);
            const glyphTop = item.canvas.glyphTop || 0;
            const glyphLeft = item.canvas.glyphLeft || 0;
            animatePosition(item.canvas, targetOffset.top - glyphTop, targetOffset.left - glyphLeft, 500);
        }
    },

    checkPosition() {
        if (isSolvedState()) {
            controller.toPosition('manual');
        }
    }
};
