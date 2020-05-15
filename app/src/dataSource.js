export const EXPRESS_HOST = 'http://127.0.0.1:5000/';

export function helloworld(fun){
    fetch(EXPRESS_HOST+'', {
            method:'GET',
            cache:'default'
        })
        .then(response => response.json())
        .then(data => fun(data));
}

export function asyncGetImageList(fun){
    fetch(EXPRESS_HOST+'imageList', {
            method:'GET',
            cache:'default'
        })
        .then(response => response.json())
        .then(data => fun(data));
}

export function asyncGetImageListByBBox(fun, bbxname){
    fetch(EXPRESS_HOST+'imageList/bboxName/'+bbxname, {
            method:'GET',
            cache:'default'
        })
        .then(response => response.json())
        .then(data => fun(data));
}

export function asyncGetImageListByScene(fun, slist){
    fetch(EXPRESS_HOST+'imageList/sceneList/'+slist, {
            method:'GET',
            cache:'default'
        })
        .then(response => response.json())
        .then(data => fun(data));
}

export function asyncGetImageByUuid(fun, uuid){
    fetch(EXPRESS_HOST+'image/'+uuid, {
            method:'GET',
            cache:'default'
        })
        .then(response => response.json())
        .then(data => fun(data));
}

export function asyncUpdateImage(fun, image){
    fetch(EXPRESS_HOST+'update/image', {
            method: 'POST',
            cache:'default',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(image)
        })
        .then(res => res.json())
        .then(res => fun(res));
}

export function asyncUpdateImageScenes(fun, start, end, scenes){
    fetch(EXPRESS_HOST+'update/imagescenes', {
            method: 'POST',
            cache:'default',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'start':start,
                'end':end,
                'scenes':scenes
            })
        })
        .then(res => res.json())
        .then(res => fun(res));
}

export function asyncDeleteImages(fun, start, end){
    fetch(EXPRESS_HOST+'delete/images', {
            method: 'POST',
            cache:'default',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'start':start,
                'end':end
            })
        })
        .then(res => fun(res));
}

export function asyncGetDeviceConfig(fun){
    fetch(EXPRESS_HOST+'devices', {
            method:'GET',
            cache:'default'
        })
        .then(response => response.json())
        .then(data => fun(data));
}


export function asyncDeviceInput(fun, param){
    fetch(EXPRESS_HOST+'device/input', {
            method: 'POST',
            cache:'default',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(param)
        })
        .then(res => res.json())
        .then(res => fun(res));
}

export function asyncStartDeviceScreenRecord(fun){
    fetch(EXPRESS_HOST+'device/screenctrl/start', {
            method:'GET',
            cache:'default'
        })
        .then(response => response.json())
        .then(data => fun(data));
}

export function asyncStopDeviceScreenRecord(fun){
    fetch(EXPRESS_HOST+'device/screenctrl/stop', {
            method:'GET',
            cache:'default'
        })
        .then(response => response.json())
        .then(data => fun(data));
}

export function asyncStartDeviceScreenMirror(fun){
    fetch(EXPRESS_HOST+'device/mirror/start', {
            method:'GET',
            cache:'default'
        })
        .then(response => response.json())
        .then(data => fun(data));
}

export function asyncStopDeviceScreenMirror(fun){
    fetch(EXPRESS_HOST+'device/mirror/stop', {
            method:'GET',
            cache:'default'
        })
        .then(response => response.json())
        .then(data => fun(data));
}

export function asyncGetImageScenePredictionByUuid(fun, uuid){
    fetch(EXPRESS_HOST+'predict/image/'+uuid, {
            method:'GET',
            cache:'default'
        })
        .then(response => response.json())
        .then(data => fun(data));
}

export function asyncDryrunStep(fun){
    fetch(EXPRESS_HOST+'engine/act', {
            method:'GET',
            cache:'default'
        })
        .then(response => response.json())
        .then(data => fun(data));
}