importScripts('vector.js');

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
let playerX;
let playerY;
let playerAngle;
let playerFov
let viewAngleStep;
let coreAngleStep;
let worldMap;
let radiusOfView;
let result = [];
let outData = [];

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

worldMap = {
    colorType: "texture",
    mapSize: 100,
    
    Segment0: genMap(
        `
########################################
########################################
###   #                           ######
##                                    ##
##            P                       ##
##                                    ##
##             #                    ####
##             #                      ##
##             #                      ##
##                                    ##
##                                    ##
##                                    ##
##                                    ##
##                                    ##
########################################
########################################
        `, 1
    ),
    Segment1: genMap(
    `
########################################
########################################
##  #                            ######
##                                    ##
##      #     P                       ##
##      #           #                 ##
##      #    ##     #               ####
##           #                        ##
##           ##    #############      ##
#### ## ##         #                  ##
##                 #                  ##
##                 #                  ##
##                 #                  ##
##                                    ##
########################################
########################################
    `, 1
    ),
    Segment2: genMap(
    `
########################################
########################################
## # #                                ##
##                  ####################
########      P                       ##
##     #        ##                    ##
##     #        ##                    ##
##            #                   ######
##                                    ##
#### ## ##          ####################
##                  #                 ##
##                  #                 ##
##                  #                 ##
##                                    ##
########################################
########################################
    `, 1
    ),
    Segment0Colors: genColorMap(
        `
WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW
WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW
WWY   Y                           WWWWWW
WW                                    WW
WW                                    WW
WW                                    WW
WW             Y                    WWWW
WW             Y                      WW
WW             Y                      WW
WW                                    WW
WW                                    WW
WW                                    WW
WW                                    WW
WW                                    WW
WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW
WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW
        `, 1
    ),
    Segment1Colors: genColorMap(
    `
WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW
WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW
WW  R                             WWWWWW
WW                                    WW
WW      W     P                       WW
WW      W           R                 WW
WW      W    RR     R               WWWW
WW           R                        WW
WW           RR    WWWWWWWWWWWWW      WW
WWWW WW WW         W                  WW
WW                 W                  WW
WW                 W                  WW
WW                 W                  WW
WW                                    WW
WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW
WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW
    `, 1
    ),
    Segment2Colors: genColorMap(
    `
WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW
WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW
WR O O                                WW
WW                  WWWWWWWWWWWWWWWWWWWW
WWWWWWWW      P                       WW
WW     W        WW                    WW
WW     W        WW                    WW
WW            O                   WWWWWW
WW                                    WW
WWWW WW WW          WWWWWWWWWWWWWWWWWWWW
WW                  W                 WW
WW                  W                 WW
WW                  W                 WW
WW                                    WW
WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW
WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW
    `, 1
    )
};

function colorToTexture(color) {
    if(!DEFAULT_IMAGES[0]) {
        DEFAULT_IMAGES[0] = {
            index: 0,
            width: 1000,
            height: 768
        };
    }
    if(!DEFAULT_IMAGES[1]) {
        DEFAULT_IMAGES[1] = {
            index: 1,
            width: 500,
            height: 333
        };
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
        if(map.Segment1[Math.round((ray.y + ray.direction.y) / map.mapSize)][Math.round((ray.x + ray.direction.x) / map.mapSize)] === 1) {
            step = 0.01;
        } else {
            step = 1;
        }
        if(map.Segment1[Math.round((ray.y) / map.mapSize)][Math.round((ray.x) / map.mapSize)] === 1) {
            ray.running = false;
            if(map.colorType === "color") {
                ray.color = map.Segment2Colors[Math.round((ray.y) / map.mapSize)][Math.round((ray.x) / map.mapSize)];
            } else {
                ray.color = colorToTexture(map.Segment2Colors[Math.round((ray.y) / map.mapSize)][Math.round((ray.x) / map.mapSize)]);
            }
            ray.offset = ray.x % map.mapSize - ray.y % map.mapSize;
            if(ray.offset < 0) {
                ray.offset = -ray.offset;
            }
        }
    }

    ray.distance = Vector.length(x - ray.x, y - ray.y);
    ray.width = 1080 / (ray.distance * Math.cos((num - playerFov) * Math.PI / 180)) * 20;
    step = 30;

    while(ray2.distance < maxDistance && ray2.running) {

        ray2.x += ray2.direction.x * step;
        ray2.y += ray2.direction.y * step;
        if(map.Segment2[Math.round((ray2.y + ray2.direction.y) / map.mapSize)][Math.round((ray2.x + ray2.direction.x) / map.mapSize)] === 1) {
            step = 0.01;
        } else {
            step = 1;
        }
        if(map.Segment2[Math.round((ray2.y) / map.mapSize)][Math.round((ray2.x) / map.mapSize)] === 1) {
            ray2.running = false;
            if(map.colorType === "color") {
                ray2.color = map.Segment2Colors[Math.round((ray2.y) / map.mapSize)][Math.round((ray2.x) / map.mapSize)];
            } else {
                ray2.color = colorToTexture(map.Segment2Colors[Math.round((ray2.y) / map.mapSize)][Math.round((ray2.x) / map.mapSize)]);
            }
            ray2.offset = ray2.x % map.mapSize - ray2.y % map.mapSize;
            if(ray2.offset < 0) {
                ray2.offset = -ray2.offset;
            }
        }
    }

    if(!ray2.running) {
        ray2.distance = Vector.length(x - ray2.x, y - ray2.y);
        ray2.width = 1080 / (ray2.distance * Math.cos((num - playerFov) * Math.PI / 180)) * 20;
    }
    step = 30;

    while(ray3.distance < maxDistance && ray3.running) {

        ray3.x += ray3.direction.x * step;
        ray3.y += ray3.direction.y * step;
        if(map.Segment0[Math.round((ray3.y + ray3.direction.y) / map.mapSize)][Math.round((ray3.x + ray3.direction.x) / map.mapSize)] === 1) {
            step = 0.01;
        } else {
            step = 1;
        }
        if(map.Segment0[Math.round(ray3.y / map.mapSize)][Math.round(ray3.x / map.mapSize)] === 1) {
            ray3.running = false;
            if(map.colorType === "color") {
                ray3.color = map.Segment2Colors[Math.round(ray3.y / map.mapSize)][Math.round((ray3.x) / map.mapSize)];
            } else {
                ray3.color = colorToTexture(map.Segment2Colors[Math.round(ray3.y / map.mapSize)][Math.round(ray3.x / map.mapSize)]);
            }
            ray3.offset = ray3.x % map.mapSize - ray3.y % map.mapSize;
            if(ray3.offset < 0) {
                ray3.offset = -ray3.offset;
            }
        }
    }

    if(!ray3.running) {
        ray3.distance = Vector.length(x - ray3.x, y - ray3.y);
        ray3.width = 1080 / (ray3.distance * Math.cos((num - playerFov) * Math.PI / 180)) * 20;
    }

    if(map.colorType === "color") {
        // ctx.lineWidth = 40 * viewAngleStep;
        // if(ray3.width / 6 < ray.width && ray2.width / 2 < ray.width) {
        //     ctx.strokeStyle = `rgb(${ray.color[0] - ray.distance / Math.cos((num - player.fov) * Math.PI / 180) / 5}, ${ray.color[1] - ray.distance / Math.cos((num - player.fov) * Math.PI / 180) / 5}, ${ray.color[2] - ray.distance / Math.cos((num - player.fov) * Math.PI / 180) / 5})`
        //     ctx.beginPath();
        //     ctx.moveTo(num * 20, 540 - ray.width);
        //     ctx.lineTo(num * 20, 540 + ray.width);
        //     ctx.closePath();
        //     ctx.stroke();
        // }
        // if(ray2.distance < ray.distance) {
        //     ctx.lineWidth = 40 * viewAngleStep + 2;
        //     ctx.strokeStyle = `rgb(${ray2.color[0] - ray2.distance / Math.cos((num - player.fov) * Math.PI / 180) / 5}, ${ray2.color[1] - ray2.distance / Math.cos((num - player.fov) * Math.PI / 180) / 5}, ${ray2.color[2] - ray2.distance / Math.cos((num - player.fov) * Math.PI / 180) / 5})`
        //     ctx.beginPath();
        //     ctx.moveTo(num * 20, 540 - ray2.width / 2);
        //     ctx.lineTo(num * 20, 540 + ray2.width);
        //     ctx.closePath();
        //     ctx.stroke();
        // }
        // if(ray3.distance < ray.distance && ray3.distance < ray2.distance) {
        //     ctx.lineWidth = 40 * viewAngleStep + 4;
        //     ctx.strokeStyle = `rgb(${ray3.color[0] - ray3.distance / Math.cos((num - player.fov) * Math.PI / 180) / 5}, ${ray3.color[1] - ray3.distance / Math.cos((num - player.fov) * Math.PI / 180) / 5}, ${ray3.color[2] - ray3.distance / Math.cos((num - player.fov) * Math.PI / 180) / 5})`
        //     ctx.beginPath();
        //     ctx.moveTo(num * 20, 540 - ray3.width / 6);
        //     ctx.lineTo(num * 20, 540 + ray3.width);
        //     ctx.closePath();
        //     ctx.stroke();
        //     return [num * 20, 540 - ray.width / 6, 540 + ray3.width, ray3.color[0] - ray3.distance / Math.cos((num - player.fov) * Math.PI / 180) / 5, ]
        // }
    } else {
        outData = [];
        if(ray3.width / 6 < ray.width && ray2.width / 2 < ray.width) {
            outData[0] = [0, ray.color, num * 20, 540 - ray.width, 40 * coreAngleStep, ray.width * 2, ray.color.width * ray.offset / map.mapSize, 0, 40 * coreAngleStep, ray.color.height];
        }
        if(ray2.distance < ray.distance) {
            outData[1] = [1, ray2.color, num * 20, 540 - ray2.width / 2, 40 * (coreAngleStep + coreAngleStep / 10), ray2.width * 1.5, ray2.color.width * ray2.offset / map.mapSize, 0, 40 * coreAngleStep + 2, ray2.color.height];
        }
        if(ray3.distance < ray.distance && ray3.distance < ray2.distance) {
            outData[2] = [2, ray3.color, num * 20, 540 - ray3.width / 6, 40 * (coreAngleStep + coreAngleStep / 6), ray3.width * 1.15, ray3.color.width * ray3.offset / map.mapSize, 0, 40 * coreAngleStep + 4, ray3.color.height];
        }
        return outData;
    }

    //line(num * 20, 540 - ray.width, num * 20, 540 + ray.width);
    // strokeWeight(40 * viewAngleStep);
    // stroke(255 - distance / Math.cos((num - player.fov) * Math.PI / 180) / 5);
    // ^^ p5 variant, but it non-usable, because we have some bugs with color
}

onmessage = function(e) {
    let data = JSON.parse(e.data);
    if(data[0] !== "set") {
        playerX = data[0];
        playerY = data[1];
        playerAngle = data[2];
        viewAngleStep = data[3];
        radiusOfView = data[5];
        playerFov = data[6];
        coreAngleStep = data[7];
        result = [];
        for(let i = -playerFov + data[8]; i < playerFov; i += viewAngleStep) {
            result[result.length] = rayCast(playerX, playerY, playerAngle + i, worldMap, radiusOfView, i + playerFov);
        }
        postMessage(JSON.stringify(result));
    } else {
        worldMap = data[1];
    }
}