"use strict";

const DEFAULT_MAPTYPE = {
    space: ' ',
    wall: '#',
    player: 'P',
    trigger: '%',
    trigger_with_wall: '$',
    endline: '\n'
};

const DEFAULT_MAPCOLORTYPE = [' ', 0, 0, 0, 'R', 255, 0, 0, 'G', 0, 255, 0, 'B', 0, 0, 255, 'W', 255, 255, 255, 'Y', 255, 255, 0, 'O', 255, 150, 0, 'S', 0, 255, 255];
const DEFAULT_IMAGES = [];
const WORKERS = [];
let coreCount = navigator.hardwareConcurrency;
let width = window.screen.width;
let height = window.screen.height;

for(let i = 0; i < coreCount; i++) {
    WORKERS[i] = new Worker("worker-ray-cast.js");
}

let playerX = 0;
let playerY = 0;
let player = {
    angle: 0,
    fov: 48,
    speed: 2,
    fovZ: 2
};
let keys = [];
let worldMap;
let fps = 60;
let viewAngleStep = 0.1;
let minFPS = 60;
let enableAutoSettings = false;
let ctx;
let viewAngleZ = 0;

function colorToTexture(color) {
    if(!DEFAULT_IMAGES[0]) {
        DEFAULT_IMAGES[0] = loadImage("/tubes_cubic.jpg");
    }
    if(!DEFAULT_IMAGES[1]) {
        DEFAULT_IMAGES[1] = loadImage("/product.jpg");
    }
    let out;
    switch(color[2]) {
        case 255: {
            out = DEFAULT_IMAGES[1];
            break;
        }
        case 0: {
            out = DEFAULT_IMAGES[0];
            break;
        }
    }
    return out;
}

function genMap(string, size = 10, maptype = DEFAULT_MAPTYPE) {
    let out = [];
    let str = string.split(maptype.endline);

    for(let i = 0; i < str.length * size; i++) {
        out[i] = [];
    }

    for(let y = 0; y < str.length; y++) {
        for(let x = 0; x < str[y].length; x++) {
            switch(str[y][x]) {
                case maptype.space: {
                    for(let i = 0; i < size; i++) {
                        for(let j = 0; j < size; j++) {
                            out[y * size + i][x * size + j] = 0;
                        }
                    }
                    break;
                };

                case maptype.wall: {
                    for(let i = 0; i < size; i++) {
                        for(let j = 0; j < size; j++) {
                            out[y * size + i][x * size + j] = 1;
                        }
                    }
                    break;
                };
                
                case maptype.player: {
                    for(let i = 0; i < size; i++) {
                        for(let j = 0; j < size; j++) {
                            out[y * size + i][x * size + j] = 0;
                        }
                    }
                    playerX = x * size;
                    playerY = y * size;
                    break;
                };
                
                case maptype.trigger: {
                    for(let i = 0; i < size; i++) {
                        for(let j = 0; j < size; j++) {
                            out[y * size + i][x * size + j] = 2;
                        }
                    }
                    break;
                };
                
                case maptype.trigger_with_wall: {
                    for(let i = 0; i < size; i++) {
                        for(let j = 0; j < size; j++) {
                            out[y * size + i][x * size + j] = 3;
                        }
                    }
                    break;
                };
            }
        }
    }

    return out;
}

function genColorMap(string, size = 10, maptype = DEFAULT_MAPCOLORTYPE) {
    let out = [];
    let str = string.split('\n');

    for(let i = 0; i < str.length * size; i++) {
        out[i] = [];
    }

    for(let y = 0; y < str.length; y++) {
        for(let x = 0; x < str[y].length; x++) {
            for(let i = 0; i < maptype.length; i += 4) {
                if(str[y][x] === maptype[i]) {
                    for(let k = 0; k < size; k++) {
                        for(let j = 0; j < size; j++) {
                            out[y * size + k][x * size + j] = [maptype[i + 1], maptype[i + 2], maptype[i + 3]];
                        }
                    }
                }
            }
        }
    }

    return out;
}

function genMarginMap(string, size = 10, maptype = DEFAULT_MAPMARGINTYPE) {
    let out = [];
    let str = string.split('\n');

    for(let i = 0; i < str.length * size; i++) {
        out[i] = [];
    }

    for(let y = 0; y < str.length; y++) {
        for(let x = 0; x < str[y].length; x++) {
            for(let i = 0; i < maptype.length; i += 2) {
                if(str[y][x] === maptype[i]) {
                    for(let k = 0; k < size; k++) {
                        for(let j = 0; j < size; j++) {
                            out[y * size + k][x * size + j] = maptype[i + 1];
                        }
                    }
                }
            }
        }
    }

    return out;
}

function rayCast(x, y, angle, map, maxDistance, num) {
    let step = 30;

    let ray = {
        x: x,
        y: y,
        direction: {
            x: Math.sin(angle * Math.PI / 180),
            y: Math.cos(angle * Math.PI / 180)
        },
        width: 1,
        running: true,
        distance: 0,
        color: [0, 0, 0],
        offset: 0
    };

    let ray2 = {
        x: x,
        y: y,
        direction: {
            x: ray.direction.x,
            y: ray.direction.y
        },
        width: 1,
        running: true,
        distance: 0,
        color: [0, 0, 0],
        offset: 0
    };

    let ray3 = {
        x: x,
        y: y,
        direction: {
            x: ray.direction.x,
            y: ray.direction.y
        },
        width: 1,
        running: true,
        distance: 0,
        color: [0, 0, 0],
        offset: 0
    };

    while(ray.distance < maxDistance && ray.running) {

        ray.x += ray.direction.x * step;
        ray.y += ray.direction.y * step;
        if(map.Segment1[Math.round(ray.y + ray.direction.y)][Math.round(ray.x + ray.direction.x)] === 1) {
            step = 0.01;
        } else {
            step = 1;
        }
        if(map.Segment1[Math.round(ray.y)][Math.round(ray.x)] === 1) {
            ray.running = false;
            if(map.colorType === "color") {
                ray.color = map.Segment1Colors[Math.round(ray.y)][Math.round(ray.x)];
            } else {
                ray.color = colorToTexture(map.Segment1Colors[Math.round(ray.y)][Math.round(ray.x)]);
            }
            ray.offset = ray.x % map.mapSize - ray.y % map.mapSize;
            if(ray.offset < 0) {
                ray.offset = -ray.offset;
            }
        }
    }

    ray.distance = p5.Vector.dist(createVector(x, y), createVector(ray.x, ray.y));
    ray.width = 1080 / (ray.distance * Math.cos((num - player.fov) * Math.PI / 180)) * 20;
    step = 30;

    while(ray2.distance < maxDistance && ray2.running) {

        ray2.x += ray2.direction.x * step;
        ray2.y += ray2.direction.y * step;
        if(map.Segment2[Math.round(ray2.y + ray2.direction.y)][Math.round(ray2.x + ray2.direction.x)] === 1) {
            step = 0.01;
        } else {
            step = 1;
        }
        if(map.Segment2[Math.round(ray2.y)][Math.round(ray2.x)] === 1) {
            ray2.running = false;
            if(map.colorType === "color") {
                ray2.color = map.Segment2Colors[Math.round(ray2.y)][Math.round(ray2.x)];
            } else {
                ray2.color = colorToTexture(map.Segment2Colors[Math.round(ray2.y)][Math.round(ray2.x)]);
            }
            ray2.offset = ray2.x % map.mapSize - ray2.y % map.mapSize;
            if(ray2.offset < 0) {
                ray2.offset = -ray2.offset;
            }
        }
    }

    if(!ray2.running) {
        ray2.distance = p5.Vector.dist(createVector(x, y), createVector(ray2.x, ray2.y));
        ray2.width = 1080 / (ray2.distance * Math.cos((num - player.fov) * Math.PI / 180)) * 20;
    }
    step = 30;

    while(ray3.distance < maxDistance && ray3.running) {

        ray3.x += ray3.direction.x * step;
        ray3.y += ray3.direction.y * step;
        if(map.Segment0[Math.round(ray3.y + ray3.direction.y)][Math.round(ray3.x + ray3.direction.x)] === 1) {
            step = 0.01;
        } else {
            step = 1;
        }
        if(map.Segment0[Math.round(ray3.y)][Math.round(ray3.x)] === 1) {
            ray3.running = false;
            if(map.colorType === "color") {
                ray3.color = map.Segment0Colors[Math.round(ray3.y)][Math.round(ray3.x)];
            } else {
                ray3.color = colorToTexture(map.Segment0Colors[Math.round(ray3.y)][Math.round(ray3.x)]);
            }
            ray3.offset = ray3.x % map.mapSize - ray3.y % map.mapSize;
            if(ray3.offset < 0) {
                ray3.offset = -ray3.offset;
            }
        }
    }

    if(!ray3.running) {
        ray3.distance = p5.Vector.dist(createVector(x, y), createVector(ray3.x, ray3.y));
        ray3.width = 1080 / (ray3.distance * Math.cos((num - player.fov) * Math.PI / 180)) * 20;
    }
    ctx.lineWidth = 40 * viewAngleStep;

    if(map.colorType === "color") {
        if(ray3.width / 6 < ray.width && ray2.width / 2 < ray.width) {
            ctx.strokeStyle = `rgb(${ray.color[0] - ray.distance / Math.cos((num - player.fov) * Math.PI / 180) / 5}, ${ray.color[1] - ray.distance / Math.cos((num - player.fov) * Math.PI / 180) / 5}, ${ray.color[2] - ray.distance / Math.cos((num - player.fov) * Math.PI / 180) / 5})`
            ctx.beginPath();
            ctx.moveTo(num * 20, 540 - ray.width);
            ctx.lineTo(num * 20, 540 + ray.width);
            ctx.closePath();
            ctx.stroke();
        }
        if(ray2.distance < ray.distance) {
            ctx.lineWidth = 40 * viewAngleStep + 2;
            ctx.strokeStyle = `rgb(${ray2.color[0] - ray2.distance / Math.cos((num - player.fov) * Math.PI / 180) / 5}, ${ray2.color[1] - ray2.distance / Math.cos((num - player.fov) * Math.PI / 180) / 5}, ${ray2.color[2] - ray2.distance / Math.cos((num - player.fov) * Math.PI / 180) / 5})`
            ctx.beginPath();
            ctx.moveTo(num * 20, 540 - ray2.width / 2);
            ctx.lineTo(num * 20, 540 + ray2.width);
            ctx.closePath();
            ctx.stroke();
        }
        if(ray3.distance < ray.distance && ray3.distance < ray2.distance) {
            ctx.lineWidth = 40 * viewAngleStep + 4;
            ctx.strokeStyle = `rgb(${ray3.color[0] - ray3.distance / Math.cos((num - player.fov) * Math.PI / 180) / 5}, ${ray3.color[1] - ray3.distance / Math.cos((num - player.fov) * Math.PI / 180) / 5}, ${ray3.color[2] - ray3.distance / Math.cos((num - player.fov) * Math.PI / 180) / 5})`
            ctx.beginPath();
            ctx.moveTo(num * 20, 540 - ray3.width / 6);
            ctx.lineTo(num * 20, 540 + ray3.width);
            ctx.closePath();
            ctx.stroke();
        }
    } else {
        if(ray3.width / 6 < ray.width && ray2.width / 2 < ray.width) {
            image(ray.color, num * 20, 540 - ray.width, 40 * viewAngleStep, ray.width * 2, ray.color.width * ray.offset / map.mapSize, 0, 40 * viewAngleStep, ray.color.height);
        }
        if(ray2.distance < ray.distance) {
            image(ray2.color, num * 20, 540 - ray2.width / 2, 40 * (viewAngleStep + viewAngleStep / 10), ray2.width * 1.5, ray2.color.width * ray2.offset / map.mapSize, 0, 40 * viewAngleStep + 2, ray2.color.height);
        }
        if(ray3.distance < ray.distance && ray3.distance < ray2.distance) {
            image(ray3.color, num * 20, 540 - ray3.width / 6, 40 *  (viewAngleStep + viewAngleStep / 6), ray3.width * 1.15, ray3.color.width * ray3.offset / map.mapSize, 0, 40 * viewAngleStep + 4, ray3.color.height);
        }
    }

    //line(num * 20, 540 - ray.width, num * 20, 540 + ray.width);
    // strokeWeight(40 * viewAngleStep);
    // stroke(255 - distance / Math.cos((num - player.fov) * Math.PI / 180) / 5);
    // ^^ p5 variant, but it non-usable, because we have some bugs with color
}