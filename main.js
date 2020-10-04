var hit = false;
let addangle = 190;
let objects = [];
let keys = [];
let maxRadius = 550;
let rayStep = 2;
let px = 500, py = 600;
let playerSpeed = 2;
let angls = 0;
let view = 45;
let medium = 20;

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
        sx: Math.sin(angle * Math.PI / 180) * speed,
        sy: Math.cos(angle * Math.PI / 180) * speed 
    }
}

function setup() {
    createCanvas(1920, 1080);
    noSmooth()
    let poly = [], poly2 = [], poly3 = [];

    // Set x,y positions as vecs:
    poly[0] = createVector(123, 231);
    poly[1] = createVector(10, 111);
    poly[2] = createVector(20, 23);
    poly[3] = createVector(390, 33);
    poly2[0] = createVector(400, 400);
    poly2[1] = createVector(420, 433);
    poly2[2] = createVector(399, 444);
    poly2[3] = createVector(380, 400);
    poly3[0] = createVector(668, 785);
    poly3[1] = createVector(1800, 785);
    poly3[2] = createVector(1800, 1080);
    poly3[3] = createVector(668, 1080);
    objects[0] = poly;
    objects[1] = poly2;
    objects[2] = poly3;
}

function checkForCollision(x, y, objects) {
    for(let i = 0; i < objects.length; i++) {
        if(collidePointPoly(x, y, objects[i]) || x < 0 || x > 1920 || y < 0 || y > 1080) {
            return false;
        }
    }

    return true;
}

function rayCast(ray, objects, num) {
    let x = ray.x, y = ray.y;
    let c = 0;
    let total = 540;
    let color = 0;
    while(c < maxRadius / rayStep) {
        for(let i = 0; i < objects.length; i++) {
            if(collidePointPoly(x, y, objects[i]) || x < 0 || x > 1920 || y < 0 || y > 1080) {
                total = c;
                if(x < 0 || x > 1920 || y < 0 || y > 1080) {
                    total = 540;
                } else {
                    beginShape();
                    for (const { x, y } of objects[i])  vertex(x, y);
                    endShape(CLOSE);
                }
                c = maxRadius / rayStep;
            }
        }
        x += ray.sx;
        y += ray.sy;
        c++;
    }
    let rx = (0 + total * 2) / (Math.sin((total) * Math.PI / 180) * 0.04 + 4);
    let rx2 = (1080 - total) / (Math.cos((total) * Math.PI / 180) * 0.04 + 4);
    rx2 = getMedium(medium, rx2, 540);
    // if(rx2 < 540) {
    //     rx2 = 540;
    // }
    line((1800 - (num * 30 - view * 15)) / 5, rx, (1800 - (num * 30 - view * 15)) / 5, rx2);
    line(ray.x, ray.y, x, y);
    color = 255 - total;
    if(color < 10) {
        color = 10;
    }
    stroke(color);
}

function draw() {
    background(0);

    // Use vectors as input:
    // hit = collidePointPolyVector(mouse, poly);
    for(let i = -view; i < view; i += 0.2) {
        rayCast(ray(px, py, rayStep, i + Math.atan2(mouseX - 960, mouseY - 540) * (180 / Math.PI)), objects, Math.sin(i * Math.PI / 180) * view * 2);
    }

    stroke(hit ? color('red') : 0);
    fill(100);
    for(let i = 0; i < keys.length; i++) {
        switch(keys[i]) {
            case 87: {
                angls = Math.atan2(mouseX - 960, mouseY - 540);
                if(checkForCollision(px + Math.sin(angls) * playerSpeed, py + Math.cos(angls) * playerSpeed, objects)) {
                    px += Math.sin(angls) * playerSpeed;
                    py += Math.cos(angls) * playerSpeed;
                }
                break;
            }
            case 83: {
                angls = Math.atan2(mouseX - 960, mouseY - 540);
                if(checkForCollision(px - Math.sin(angls) * playerSpeed, py + Math.cos(angls) * playerSpeed, objects)) {
                    px -= Math.sin(angls) * playerSpeed;
                    py -= Math.cos(angls) * playerSpeed;
                }
                break;
            }
            case 65: {
                angls = Math.atan2(mouseX - 960, mouseY - 540);
                if(checkForCollision(px + Math.sin(angls + (90 * Math.PI / 180)) * playerSpeed, py - Math.cos(angls + (90 * Math.PI / 180)) * playerSpeed, objects)) {
                    px += Math.sin(angls + (90 * Math.PI / 180)) * playerSpeed;
                    py += Math.cos(angls + (90 * Math.PI / 180)) * playerSpeed;
                }
                break;
            }
            case 68: {
                angls = Math.atan2(mouseX - 960, mouseY - 540);
                if(checkForCollision(px - Math.sin(angls + (90 * Math.PI / 180)) * playerSpeed, py - Math.cos(angls + (90 * Math.PI / 180)) * playerSpeed, objects)) {
                    px -= Math.sin(angls + (90 * Math.PI / 180)) * playerSpeed;
                    py -= Math.cos(angls + (90 * Math.PI / 180)) * playerSpeed;
                }
                break;
            }
            case 16: {
                playerSpeed = 4;
                view = 30;
                break;
            }
            case 17: {
                playerSpeed = 2;
                view = 45;
                break;
            }
        }
    }

}

document.addEventListener("keydown", function(e) {
    if(e.keyCode !== keys[keys.length - 1]) {
        keys.push(e.keyCode);
    }
});

document.addEventListener("keyup", (e) => {
    keys = keys.filter((val) => {return val !== e.keyCode});
});