let data = [];
let finishedCores = coreCount;
let renderTime = new Date();

function setup() {
    ctx = createCanvas(3840, 2160).canvas.getContext("2d");
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
            `, 100
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
        `, 100
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
        `, 100
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
            `, 100
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
        `, 100
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
        `, 100
        )
    };

    background(0);
    colorToTexture([0, 0, 0]);
    for(let i = 0; i < WORKERS.length; i++) {
        WORKERS[i].onmessage = function(e) {
            finishedCores++;
            data[data.length] = JSON.parse(e.data);
        }
    }

}

setInterval(() => {
    if(enableAutoSettings) {
        if(fps < minFPS) {
            viewAngleStep += 0.01;
        } else {
            viewAngleStep -= 0.005;
        }
    }
}, 200);

function draw() {
    // draw map
    if(finishedCores === coreCount) {
        background(0);
        for(let i = 0; i < data.length; i++) {
            for(let j = 0; j < data[i].length; j++) {
                if(data[i][j][0]) {
                    image(DEFAULT_IMAGES[data[i][j][0][1].index], data[i][j][0][2], data[i][j][0][3], data[i][j][0][4], data[i][j][0][5], data[i][j][0][6], data[i][j][0][7], data[i][j][0][8], data[i][j][0][9]);
                }
                if(data[i][j][1]) {
                    image(DEFAULT_IMAGES[data[i][j][1][1].index], data[i][j][1][2], data[i][j][1][3], data[i][j][1][4], data[i][j][1][5], data[i][j][1][6], data[i][j][1][7], data[i][j][1][8], data[i][j][1][9]);
                }
                if(data[i][j][2]) {
                    image(DEFAULT_IMAGES[data[i][j][2][1].index], data[i][j][2][2], data[i][j][2][3], data[i][j][2][4], data[i][j][2][5], data[i][j][2][6], data[i][j][2][7], data[i][j][2][8], data[i][j][2][9]);
                }
            }
        }
        data = [];
        fps = Math.round(1000 / (new Date() - renderTime));
        renderTime = new Date();
        finishedCores = 0;
        for(let i = 0; i < coreCount; i++) {
            WORKERS[i].postMessage(JSON.stringify([playerX, playerY, player.angle * (180 / Math.PI), viewAngleStep * coreCount, null, 900, player.fov, viewAngleStep / 2, i * viewAngleStep]));
        }
    }

    player.angle = Math.atan2(mouseX - 960, mouseY - 540);

    for(let i = 0; i < keys.length; i++) {
        switch(keys[i]) {
            case 87: {
                if(true) { // !checkForCollision(playerX + Math.sin(player.angle) * player.speed, playerY + Math.cos(player.angle) * player.speed, objects)
                    playerX += Math.sin(player.angle) * player.speed;
                    playerY += Math.cos(player.angle) * player.speed;
                }
                break;
            }
            case 83: {
                if(true) { // !checkForCollision(playerX - Math.sin(player.angle) * player.speed, playerY - Math.cos(player.angle) * player.speed, objects)
                    playerX -= Math.sin(player.angle) * player.speed;
                    playerY -= Math.cos(player.angle) * player.speed;
                }
                break;
            }
            case 65: {
                if(true) { // !checkForCollision(playerX + Math.sin(player.angle + (90 * Math.PI / 180)) * player.speed, playerY + Math.cos(player.angle + (90 * Math.PI / 180)) * player.speed, objects)
                    playerX -= Math.sin(player.angle + (90 * Math.PI / 180)) * player.speed;
                    playerY -= Math.cos(player.angle + (90 * Math.PI / 180)) * player.speed;
                }
                break;
            }
            case 68: {
                if(true) { // !checkForCollision(playerX - Math.sin(player.angle + (90 * Math.PI / 180)) * player.speed, playerY - Math.cos(player.angle + (90 * Math.PI / 180)) * player.speed, objects)
                    playerX += Math.sin(player.angle + (90 * Math.PI / 180)) * player.speed;
                    playerY += Math.cos(player.angle + (90 * Math.PI / 180)) * player.speed;
                }
                break;
            }
            case 16: {
                player.speed = 5;
                break;
            }
            case 17: {
                player.speed = 2;
                break;
            }
        }
    }

    text(`${fps}FPS`, 100, 10);
    fill(255, 0, 255);
}



document.addEventListener("keydown", (e) => {
    if(keys[keys.length - 1] !== e.keyCode) {
        keys.push(e.keyCode);
    }
});

document.addEventListener("keyup", (e) => {
    keys = keys.filter((val) => {return val !== e.keyCode});
});