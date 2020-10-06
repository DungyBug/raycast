var hit = false;
let addangle = 190;
let objects = [];
let keys = [];
let maxRadius = 1500;
let rayStep = 5;
let px = 500, py = 600;
let playerSpeed = 2;
let angls = 0;
let view = 55;
let medium = 20;
let renderTime = 0;
let rayP = 0.2;
let wheel = 180;

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

function object(collide, r = 255, g = 255, b = 255, mirroring = 0) {
    return {
        col: collide,
        r: r,
        g: g,
        b: b,
        mirroring: mirroring
    }
}

function setup() {
    createCanvas(1920, 1080);
    noSmooth()
    let poly = [], poly2 = [], poly3 = [], poly4 = [], poly5 = [], poly6 = [], poly7 = [], poly8 = [], s1 = [], s2 = [], s3 = [], s4 = [];

    // Set x,y positions as vecs:
    poly[0] = createVector(133, 241);
    poly[1] = createVector(30, 121);
    poly[2] = createVector(30, 43);
    poly[3] = createVector(400, 43);
    poly2[0] = createVector(400, 400);
    poly2[1] = createVector(420, 433);
    poly2[2] = createVector(399, 444);
    poly2[3] = createVector(380, 400);
    poly3[0] = createVector(668, 785);
    poly3[1] = createVector(1800, 785);
    poly3[2] = createVector(1800, 1075);
    poly3[3] = createVector(668, 1075);
    poly4[0] = createVector(969, 404);
    poly4[1] = createVector(969, 454);
    poly4[2] = createVector(1100, 454);
    poly4[3] = createVector(1100, 404);
    poly5[0] = createVector(1160, 404);
    poly5[1] = createVector(1160, 454);
    poly5[2] = createVector(1915, 454);
    poly5[3] = createVector(1915, 404);
    poly6[0] = createVector(969, 404);
    poly6[1] = createVector(969, 200);
    poly6[2] = createVector(1000, 200);
    poly6[3] = createVector(1000, 404);
    poly7[0] = createVector(1900, 404);
    poly7[1] = createVector(1900, 200);
    poly7[2] = createVector(1915, 200);
    poly7[3] = createVector(1915, 404);
    poly8[0] = createVector(969, 200);
    poly8[1] = createVector(969, 190);
    poly8[2] = createVector(1915, 190);
    poly8[3] = createVector(1915, 200);
    s1[0] = createVector(0, 0);
    s1[1] = createVector(0, 5);
    s1[2] = createVector(1920, 5);
    s1[3] = createVector(1920, 0);
    s2[0] = createVector(0, 5);
    s2[1] = createVector(5, 5);
    s2[2] = createVector(5, 1080);
    s2[3] = createVector(0, 1080);
    s3[0] = createVector(1920, 5);
    s3[1] = createVector(1915, 5);
    s3[2] = createVector(1915, 1075);
    s3[3] = createVector(1920, 1075);
    s4[0] = createVector(5, 1080);
    s4[1] = createVector(5, 1075);
    s4[2] = createVector(1920, 1075);
    s4[3] = createVector(1920, 1080);
    objects[0] = object(poly, 255, 255, 255);
    objects[1] = object(poly2, 255, 255, 255);
    objects[2] = object(poly3, 255, 255, 255);
    objects[3] = object(poly4, 255, 255, 255);
    objects[4] = object(poly5, 255, 255, 255);
    objects[5] = object(poly6, 255, 255, 255);
    objects[6] = object(poly7, 255, 255, 255);
    objects[7] = object(poly8, 255, 255, 255);
    objects[8] = object(s1, 255, 255, 255);
    objects[9] = object(s2, 255, 255, 255);
    objects[10] = object(s3, 255, 255, 255);
    objects[11] = object(s4, 255, 255, 255);
}

function checkForCollision(x, y, objects) {
    for(let i = 0; i < objects.length; i++) {
        if(collidePointPoly(x, y, objects[i].col) || x < 0 || x > 1920 || y < 0 || y > 1080) {
            return false;
        }
    }

    return true;
}

function rayCast(_ray, objects, num, _private_add = 0) {
    let x = _ray.x, y = _ray.y;
    let angls = Math.atan2(mouseX - 960, mouseY - 540) * (wheel / Math.PI);
    let c = 0;
    let total = 1080;
    let color = 0;
    let obj = {
        r: 255,
        g: 255,
        b: 255
    };
    while(c < maxRadius / rayStep) {
        for(let i = 0; i < objects.length; i++) {
            if(collidePointPoly(x, y, objects[i].col) || x < 0 || x > 1920 || y < 0 || y > 1080) {
                total = p5.Vector.dist(createVector(x, y), createVector(_ray.x, _ray.y));
                if(x < 0 || x > 1920 || y < 0 || y > 1080) {
                    total = maxRadius * rayStep;
                } else {
                    obj = objects[i];
                    beginShape();
                    for (const { x, y } of objects[i].col)  vertex(x / 5, y / 5);
                    endShape(CLOSE);
                }
                c = maxRadius / rayStep;
            }
        }
        x += _ray.sx;
        y += _ray.sy;
        c++;
    }
    color = 200 - total / 4;
    total *= Math.cos((angls - _ray.angle) * Math.PI / 180);
    total /= 3;
    let rx = ((total + _private_add) / 2);
    let rx2 = (1080 - (total + _private_add) / 2);
    // if(rx2 < 540) {
    //     rx2 = 540;
    // }
    line(_ray.x / 5, _ray.y / 5, x / 5, y / 5);
    line((view * 17 + num * 30), rx, (view * 17 + num * 30), rx2);
    if(color < 0) {
        color = 0;
    }
    stroke(getMedium(-color, obj.r, 0), getMedium(-color, obj.g, 0), getMedium(-color, obj.b, 0));
}

function amodule(num, angle) {
    let module = num < 0 ? num : num;
    return 1 + Math.sin(module * Math.PI / angle);
}

function draw() {
    renderTime = new Date() - 0;
    background(0);

    // Use vectors as input:
    // hit = collidePointPolyVector(mouse, poly);
    angls = Math.atan2(mouseX - 960, mouseY - 540);
    for(let i = -view; i < view; i += rayP) {
        rayCast(ray(px, py, rayStep, i + angls * (180 / Math.PI)), objects, i / 2, 400);
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
                view = 40;
                break;
            }
            case 17: {
                playerSpeed = 2;
                view = 55;
                break;
            }
        }
    }
    if(new Date() - renderTime > 20) {
        // if(rayStep < 4) {
        //     rayStep++;
        // }
        // if(rayP < 0.8) {
        //     rayP += 0.05;
        // }
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

document.addEventListener("wheel", (e) => {
    if(e.deltaY > 0) {
        wheel += 1;
    } else {
        wheel -= 1;
    }
});