$(window).load(function() {
    
    const smile = param.getSmile();
    const nextSmile = param.getNextSmile(smile);
    
    $('#title').each(function() {
        $(this).text(data[smile].title);
    });
    $('#image_next').each(function() {
        $(this).attr('href', `?smile=${nextSmile}`);
    });
    $('#icon_robot').click(function() {        
        controller.toPosition();
    });
    
    let model = $('#model');
    let canvas = $('#canvas');

    if (data[smile].modelStyleFix !== undefined) {
        for (const prop in data[smile].modelStyleFix) {
console.log(model, model.width(), data[smile].modelStyleFix[prop]);
            model.css(prop, model.width() * data[smile].modelStyleFix[prop]);
        }
    }

    for (const obj of data[smile].model) {
        let modelItem = $(`<span class="item">${obj.character}</span>`);
        model.append(modelItem);

        if (obj.itemStyleFix !== undefined) {
            for (const prop in obj.itemStyleFix) {
                modelItem.css(prop, modelItem.height() * obj.itemStyleFix[prop]);
            }
        }

        let canvasItem = $(`<canvas class="item" width="${modelItem.width() * obj.canvas.width}" height="${modelItem.height() * obj.canvas.height}"></canvas>`);
        canvas.prepend(canvasItem);
        
        let context = canvasItem[0].getContext('2d');
        context.font = modelItem.css('font-size') + ' ' + modelItem.css('font-family');
        context.textBaseline = 'top';
        context.fillText(obj.character, canvasItem.width() * obj.canvas.right, canvasItem.height() * obj.canvas.down);
        
        canvasItem.draggable();
        canvasItem.mouseup(controller.checkPosition);

        if (!param.isDone()) {
            canvasItem.animate({
                    top: Math.floor(Math.random() * (canvas.height() - canvasItem.height() * 2)) + canvasItem.height(),
                    left: Math.floor(Math.random() * (canvas.width() - canvasItem.width() * 2)) + canvasItem.width()
                }, 500
            );
        }
        
        controller.model.push({character: obj.character, model: modelItem, canvas: canvasItem});
        if (!controller.canvas[obj.character]) {
            controller.canvas[obj.character] = [];
        }
        controller.canvas[obj.character].push(canvasItem);
        
        if (controller.pixelError === null) {
            controller.pixelError = modelItem.height() / 3;
        }
    }
    
    if (param.isDone()) {
        controller.toPosition();
    }
});

const param  = {
    PARAM_SMILE: 'smile',
    PARAM_DONE: 'done',
    
    params: new URLSearchParams(window.location.search),

    getSmile: function() {
        if (param.params.has(param.PARAM_SMILE)) {
            return param.params.get(param.PARAM_SMILE);
        }
        return param.getNextSmile(null);
    },

    getNextSmile: function(smile) {
        const keys = Object.keys(data);
        const nextIndex = keys.indexOf(smile) + 1;
        
        if (keys.length <= nextIndex) {
            return param.getNextSmile(null);
        }
        return keys[nextIndex];
    },
    
    isDone: function() {
        return param.params.has(param.PARAM_DONE);
    }
}

const controller = {
    pixelError: null,
    model: [],
    canvas: {},
    
    toPosition: function () {
        $('#title_link').attr('href', `?smile=${param.getSmile()}&done`);
        
        for (item of controller.model) {
            item.canvas.animate({
                    top: item.model.offset().top,
                    left: item.model.offset().left
                }, 500
            );
        }
    },
    
    checkPosition: function () {
        let modelTop = null;
        let modelLeft = null;
        let canvasTop = Infinity;
        let canvasLeft = Infinity;
        
        for (const item of controller.model) {
            if (canvasTop === Infinity && canvasLeft === Infinity) {
                modelTop = item.model.offset().top;
                modelLeft = item.model.offset().left;
                
                for (canvasItem of controller.canvas[item.character]) {
                    if (Math.pow(canvasTop, 2) + Math.pow(canvasLeft, 2) 
                        > Math.pow(canvasItem.offset().top, 2) + Math.pow(canvasItem.offset().left, 2)) 
                    {
                        canvasTop = canvasItem.offset().top;
                        canvasLeft = canvasItem.offset().left;
                    }
                }
            } else {
                const dModelTop = Math.abs(item.model.offset().top - modelTop);
                const dModelLeft = Math.abs(item.model.offset().left - modelLeft);
                
                let match = false;
                for (canvasItem of controller.canvas[item.character]) {
                    const dCanvasTop = Math.abs(canvasItem.offset().top - canvasTop);
                    const dCanvasLeft = Math.abs(canvasItem.offset().left - canvasLeft);
                    
                    if ((dCanvasTop > dModelTop - controller.pixelError && dCanvasTop < dModelTop + controller.pixelError)
                        && (dCanvasLeft > dModelLeft - controller.pixelError && dCanvasLeft < dModelLeft + controller.pixelError))
                    {
                        match = true;
                        break;
                    }
                }
                
                if (!match) {
                    return;
                }
            }
        }
        
        controller.toPosition();
    }
}
