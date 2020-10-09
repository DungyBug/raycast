const DEFAULT_MAPTYPE = {
    space: ' ',
    wall: '#',
    player: 'P',
    trigger: '%',
    trigger_with_wall: '$',
    endline: '\n'
}

let playerX = 0;
let playerY = 0;
let player = {
    angle: 0,
    fov: 48,
    speed: 2
};
let keys = [];
let worldMap;
let fps = 60;
let viewAngleStep = 0.1;
let minFPS = 60;
let enableAutoSettings = true;

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

function rayCast(x, y, angle, map, maxDistance, num) {
    let distance = 0;
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
        distance: 0
    };

    let ray2 = {
        x: x,
        y: y,
        direction: {
            x: Math.sin(angle * Math.PI / 180),
            y: Math.cos(angle * Math.PI / 180)
        },
        width: 1,
        running: true,
        distance: 0
    };

    while(ray.distance < maxDistance && ray.running) {
        distance++;

        ray.x += ray.direction.x * step;
        ray.y += ray.direction.y * step;

        if(map.Segment2[Math.round(ray.y + ray.direction.y)][Math.round(ray.x + ray.direction.x)] === 1 || map.Segment1[Math.round(ray.y + ray.direction.y)][Math.round(ray.x + ray.direction.x)] === 1) {
            step = 0.1;
        } else {
            step = 1;
        }

        if(map.Segment2[Math.round(ray.y)][Math.round(ray.x)] === 1 && ray2.running) {
            let old_ray = ray;
            ray = ray2;
            ray2 = old_ray;
            ray2.running = false;
        }
        if(map.Segment1[Math.round(ray.y)][Math.round(ray.x)] === 1) {
            ray.running = false;
        }
    }

    if(ray.distance < maxDistance) {
        distance = p5.Vector.dist(createVector(x, y), createVector(ray.x, ray.y));
        distance *= Math.cos((num - player.fov) * Math.PI / 180);
        ray.width = 1080 / distance * 20;
        line(num * 20, 540 - ray.width, num * 20, 540 + ray.width);
        strokeWeight(40 * viewAngleStep);
        stroke(255 - distance / Math.cos((num - player.fov) * Math.PI / 180) / 5);
    }

    distance = p5.Vector.dist(createVector(x, y), createVector(ray2.x, ray2.y));
    distance *= Math.cos((num - player.fov) * Math.PI / 180);
    ray2.width = 1080 / distance * 20;
    line(num * 20, 540 - ray2.width / 4, num * 20, 540 + ray2.width);
    stroke(255 - distance / Math.cos((num - player.fov) * Math.PI / 180) / 5);
}

function setup() {
    createCanvas(1920, 1080);
    worldMap = {
        Segment1: genMap(
        `
#######################################
#                                ######
#                                    ##
#      #     P                       ##
#      #           #                 ##
#      #    ##     #               ####
#           #                        ##
#           ##    #############      ##
### ## ##         #                  ##
#                 #                  ##
#                 #                  ##
#                 #                  ##
#                                    ##
#######################################
        `, 100
        ),
        Segment2: genMap(
        `
#######################################
#                                    ##
#                  ####################
#######      P                       ##
#     #        ##                    ##
#     #        ##                    ##
#            #                   ######
#                                    ##
### ## ##          ####################
#                  #                 ##
#                  #                 ##
#                  #                 ##
#                                    ##
#######################################
        `, 100
        )
    };
}

setInterval(() => {
    fps = Math.round(frameRate());
    if(enableAutoSettings) {
        if(fps < minFPS) {
            viewAngleStep += 0.1;
        } else {
            viewAngleStep -= 0.05;
        }
    }
}, 200);

function draw() {
    // draw map

    background(0);

    // for(let y = 0; y < worldMap.length; y += 30) {
    //     for(let x = 0; x < worldMap[y].length; x += 30) {
    //         square(x - 30, y, 30);
    //         if(worldMap[y][x] === 1) {
    //             fill(255);
    //         } else {
    //             fill(0);
    //         }
    //     }
    // }

    player.angle = Math.atan2(mouseX - 960, mouseY - 540);

    for(let i = -player.fov; i < player.fov; i += viewAngleStep) {
        // Drawing rays
        rayCast(playerX, playerY, player.angle * (180 / Math.PI) + i, worldMap, 1200, i + player.fov);
    }

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
    noStroke();
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