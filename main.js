// This is an old version
// So i decided keep it here

let objects = [];
let triggers = [];
let keys = [];
const MAX_RADIUS = 1000;
let rayStep = 5;
let px = 550, py = 50;
let playerSpeed = 5;
let angls = 0;
let view = 60;
let medium = 20;
let renderTime = 0;
let rayP = 0.2;
let wheel = 100;
let fps = 60;
let minFPS = 30;
let enableAutoSettings = true;

function getMedium(percent, ...numbers) {
    let p;
    let medium = 0;
    for(let i = 0; i < numbers.length; i++) {
        medium += numbers[i];
    }

    medium /= numbers.length;
    p = (medium - numbers[0]) / 100;

    return Math.min(...numbers) + p * percent;
}

function ray(x, y, speed, angle) {
    return {
        x: x,
        y: y,
        angle: angle,
        sx: Math.sin(angle * Math.PI / 180) * speed,
        sy: Math.cos(angle * Math.PI / 180) * speed 
    }
}

function object(collide, r = 255, g = 255, b = 255) {
    return {
        col: collide,
        r: r,
        g: g,
        b: b
    }
}

function obj_rect(x, y, w, h, r = 255, g = 255, b = 255) {
    return {
        col: [createVector(x - w / 2, y - h / 2), createVector(x + w / 2, y - h / 2), createVector(x + w / 2, y + h / 2), createVector(x - w / 2, y + h / 2)],
        r: r,
        g: g,
        b: b
    }
}

function trigger(collide, callback) {
    return {
        col: collide,
        callback: callback
    }
}

function setup() {
    createCanvas(1920, 1080);
    noSmooth();

    // Walls
    // objects[0] = obj_rect(500, 0, 5, 100, 200, 200, 255);
    // objects[1] = obj_rect(600, 0, 5, 100, 200, 200, 255);
    // objects[2] = obj_rect(800, 0, 5, 100, 200, 200, 255);
    // objects[3] = obj_rect(900, 0, 5, 100, 200, 200, 255);
    // objects[4] = obj_rect(550, 0, 100, 10, 200, 200, 255);
    // objects[5] = obj_rect(850, 0, 100, 10, 200, 200, 255);
    // objects[6] = obj_rect(250, 50, 500, 10, 200, 200, 255);
    objects[0] = obj_rect(0, 500, 10, 1000, 200, 200, 255); // Left border
    objects[1] = obj_rect(1200, 500, 10, 1000, 200, 200, 255); // Right border
    // objects[9] = obj_rect(700, 50, 200, 10, 200, 200, 255);
    // objects[10] = obj_rect(1050, 50, 300, 10, 200, 200, 255);
    // objects[11] = obj_rect(450, 1000, 500, 10, 200, 200, 255);
    // objects[12] = obj_rect(950, 1000, 500, 10, 200, 200, 255);
    objects[2] = obj_rect(600, 1008, 1200, 10, 255, 200, 255);
    // objects[14] = obj_rect(100, 350, 10, 300, 200, 200, 255);
    // objects[15] = obj_rect(250, 500, 300, 10, 200, 200, 255);
    // objects[16] = obj_rect(250, 350, 100, 300, 200, 200, 255);
    // objects[17] = obj_rect(400, 250, 200, 100, 200, 200, 255);
    // objects[18] = obj_rect(700, 300, 200, 200, 200, 200, 255);
    // objects[19] = obj_rect(400, 450, 10, 100, 200, 200, 255);
    // objects[20] = obj_rect(500, 450, 10, 100, 200, 200, 255);
    // objects[21] = obj_rect(450, 400, 100, 10, 200, 200, 255);
    // objects[22] = obj_rect(800, 500, 600, 10, 200, 200, 255);
    // objects[23] = obj_rect(1100, 350, 10, 300, 200, 200, 255);
    // objects[24] = obj_rect(900, 350, 200, 100, 200, 200, 255);
    // objects[25] = obj_rect(950, 250, 100, 100, 200, 200, 255);
    // objects[26] = obj_rect(300, 650, 600, 100, 200, 200, 255);
    // objects[27] = obj_rect(700, 700, 10, 200, 200, 200, 255);
    // objects[28] = obj_rect(800, 700, 10, 200, 200, 200, 255);
    // objects[29] = obj_rect(900, 650, 10, 100, 200, 200, 255);
    // objects[30] = obj_rect(1100, 650, 10, 100, 200, 200, 255);
    // objects[31] = obj_rect(1000, 700, 200, 10, 200, 200, 255);
    // objects[32] = obj_rect(500, 800, 400, 10, 200, 200, 255);
    // objects[33] = obj_rect(350, 950, 500, 100, 200, 200, 255);
    // objects[34] = obj_rect(100, 850, 10, 100, 200, 200, 255);
    // objects[35] = obj_rect(200, 850, 10, 100, 200, 200, 255);
    // objects[36] = obj_rect(300, 850, 10, 100, 200, 200, 255);
    // objects[37] = obj_rect(950, 800, 300, 10, 200, 200, 255);
    // objects[38] = obj_rect(1100, 850, 10, 100, 200, 200, 255);
    // objects[39] = obj_rect(900, 900, 400, 10, 200, 200, 255);
    // objects[40] = obj_rect(850, 1000, 500, 10, 200, 200, 255);
    // objects[41] = obj_rect(700, 950, 10, 100, 200, 200, 255);
    // Edges

}

function checkForCollision(x, y, objects) {
    for(let i = 0; i < objects.length; i++) {
        if(collidePointPoly(x, y, objects[i].col) || x < 0 || x > 1920 || y < 0 || y > 1080) {
            return i + 1;
        }
    }

    return false;
}

function rayCast(_ray, objects, num, _private_add = 0) {
    let x = _ray.x, y = _ray.y;
    let c = 0;
    let totalVectorLength = 1080;
    let color = 0;
    let obj = {
        r: 255,
        g: 255,
        b: 255
    };
    let col = 0;
    while(c < MAX_RADIUS / rayStep) {
        for(let i = 0; i < objects.length; i++) {
            if(col === i) {
                if(collidePolyPoly([createVector(x, y), createVector(x + _ray.sx * MAX_RADIUS, y + _ray.sy * MAX_RADIUS)], objects[i].col)) {
                    col++;
                    totalVectorLength = p5.Vector.dist(createVector(x, y), createVector(x + _ray.sx * MAX_RADIUS, y + _ray.sy * MAX_RADIUS));
                }
            } else {
                if(collidePointPoly(x, y, objects[i].col) || x < 0 || x > 1200 || y < 0 || y > 1000) {
                    totalVectorLength = p5.Vector.dist(createVector(x, y), createVector(_ray.x, _ray.y)) / 100 + 100;
                    if(x < 0 || x > 1200 || y < 0 || y > 1000) {
                        //totalVectorLength = MAX_RADIUS * rayStep;
                    } else {
                        obj = objects[i];
                        beginShape();
                        for (const { x, y } of objects[i].col)  vertex(x / 5, y / 5);
                        endShape(CLOSE);
                    }
                    c = MAX_RADIUS / rayStep;
                }
            }
        }
        x += _ray.sx;
        y += _ray.sy;
        c++;
    }
    color = 255 - totalVectorLength / 1.5;
    totalVectorLength *= cos(-num * 2 * Math.PI / 180);
    let height = 1080 / totalVectorLength;
    line(1800 - view * 14 + num * 30, 540 - height, 1800 - view * 14 + num * 30, height + 540); // drawing lines on 3d output
    if(color < 0) {
        color = 0; // so this stroke of code doesn't have many sense.
    }
    line(_ray.x / 5, _ray.y / 5, x / 5, y / 5); // drawing rays on 2d map
    stroke(getMedium(-color, obj.r, 0), getMedium(-color, obj.g, 0), getMedium(-color, obj.b, 0));
}

function draw() {
    renderTime = new Date() - 0;
    background(0);
    strokeWeight(rayP * 20);

    angls = Math.atan2(mouseX - 960, mouseY - 540);
    for(let i = -view; i < view; i += rayP) {
        rayCast(ray(px + Math.sin(angls + radians(90)) * i / 4, py + Math.cos(angls + radians(90)) * i / 4, rayStep, i + angls * (180 / Math.PI)), objects, -i / 2);
    }

    stroke(hit ? color('red') : 0);
    fill(100);
    let trigger = checkForCollision(px, py, triggers)
    if(trigger) {
        triggers[trigger - 1].callback();
    }
    for(let i = 0; i < keys.length; i++) {
        switch(keys[i]) {
            case 87: {
                if(!checkForCollision(px + Math.sin(angls) * playerSpeed, py + Math.cos(angls) * playerSpeed, objects)) {
                    px += Math.sin(angls) * playerSpeed;
                    py += Math.cos(angls) * playerSpeed;
                }
                break;
            }
            case 83: {
                if(!checkForCollision(px - Math.sin(angls) * playerSpeed, py - Math.cos(angls) * playerSpeed, objects)) {
                    px -= Math.sin(angls) * playerSpeed;
                    py -= Math.cos(angls) * playerSpeed;
                }
                break;
            }
            case 65: {
                if(!checkForCollision(px + Math.sin(angls + (90 * Math.PI / 180)) * playerSpeed, py + Math.cos(angls + (90 * Math.PI / 180)) * playerSpeed, objects)) {
                    px += Math.sin(angls + (90 * Math.PI / 180)) * playerSpeed;
                    py += Math.cos(angls + (90 * Math.PI / 180)) * playerSpeed;
                }
                break;
            }
            case 68: {
                if(!checkForCollision(px - Math.sin(angls + (90 * Math.PI / 180)) * playerSpeed, py - Math.cos(angls + (90 * Math.PI / 180)) * playerSpeed, objects)) {
                    px -= Math.sin(angls + (90 * Math.PI / 180)) * playerSpeed;
                    py -= Math.cos(angls + (90 * Math.PI / 180)) * playerSpeed;
                }
                break;
            }
            case 16: {
                playerSpeed = 10;
                view = 55;
                break;
            }
            case 17: {
                playerSpeed = 5;
                view = 60;
                break;
            }
        }
    }

    text(`${fps}FPS`, 1800, 10);
}

setInterval(() => {
    fps = Math.floor(1000 / (new Date() - renderTime));
    if(fps < minFPS * 1.1 && enableAutoSettings) {
        rayP += 0.1;
    } else if(enableAutoSettings) {
        rayP -= 0.05;
    }
}, 250);

document.addEventListener("keydown", function(e) {
    if(e.keyCode !== keys[keys.length - 1]) {
        keys.push(e.keyCode);
    }
});

document.addEventListener("keyup", (e) => {
    keys = keys.filter((val) => {return val !== e.keyCode});
});

document.addEventListener("wheel", (e) => {
    if(e.deltaY > 0) {
        wheel += 10;
    } else {
        wheel -= 10;
    }
});