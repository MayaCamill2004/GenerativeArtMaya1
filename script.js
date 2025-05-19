let flowers = []; // Array to store all flowers
let butterflies = []; // Array to store all butterflies
let skyColor;
let skyTargetColor;
let grassColor;
let isNight = false; // Tracks if it's night time
let isWinter = false; // Tracks if it's winter
let stars = [];
let snowflakes = []; // Array to store snowflakes for winter scene
let lastScrollY = 0; // Keeps track of scroll position

function setup() {
    const container = document.getElementById('canvas-container');
    const canvas = createCanvas(container.offsetWidth, container.offsetHeight);
    canvas.parent('canvas-container');
    colorMode(RGB);
    
    //colours
    skyColor = color(135, 206, 235); 
    skyTargetColor = skyColor;
    grassColor = color(80, 200, 120);

  
    initializeFlowers();

    // when scrolling toggle winter mode
    window.addEventListener('scroll', handleScroll);
}

function initializeFlowers() {
    flowers = [];
    
    for (let i = 0; i <12; i++) {
        let x, y;
        do {
            x = random(50, width-50);
            y = height*0.7 + random(10, 40);
        } while (isTooCloseToFlowers(x, y, 60));
        flowers.push(new Flower(x, y));
    }
}

function draw() {
    // colours for winter or normal
    let currentSky = isWinter ? color(200, 220, 255) : skyColor;
    let currentGrass = isWinter ? color(240, 250, 255) : grassColor;

   
    skyColor = lerpColor(skyColor, skyTargetColor, 0.03);
    noStroke();
    fill(currentSky);
    rect(0, 0, width, height*0.6);

    // stars if night and not winter
    if (isNight && !isWinter) {
        drawStars();
    }

    // grass or snow
    fill(currentGrass);
    rect(0, height*0.6, width, height*0.4);

    //snow if winter
    if (isWinter) {
        drawSnow();
        if (frameCount % 3 === 0 && snowflakes.length < 100) {
            snowflakes.push(new Snowflake());
        }
    }

    //  grow flowers
    for (let flower of flowers) {
        flower.grow();
        flower.show();
    }

    //  move butterflies
    for (let i = butterflies.length - 1; i >= 0; i--) {
        butterflies[i].move();
        butterflies[i].show();
        if (butterflies[i].offScreen()) {
            butterflies.splice(i, 1);
        }
    }
}

function windowResized() {
    const container = document.getElementById('canvas-container');
    resizeCanvas(container.offsetWidth, container.offsetHeight);
    initializeFlowers();
}

function mouseMoved() {
    if (isWinter) return;
    if (mouseY < height*0.6) {
        skyTargetColor = color(20, 24, 60);
        isNight = true;
        if (stars.length === 0) {
            for (let i = 0; i < 100; i++) {
                stars.push({
                    x: random(width),
                    y: random(height*0.6),
                    r: random(1, 3),
                    c: random() < 0.8 ? color(255) : color(255, 255, 180)
                });
            }
        }
    } else {
        skyTargetColor = color(135, 206, 235);
        isNight = false;
        stars = [];
    }
}

function mouseClicked() {
    if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
        // Find closest flower
        let closestFlower = null;
        let minDist = Infinity;
        
        for (let flower of flowers) {
            let d = dist(mouseX, mouseY, flower.x, flower.baseY - flower.stemLength);
            if (d < minDist) {
                minDist = d;
                closestFlower = flower;
            }
        }
        
        //when clicking on flower, create butterfly
        if (minDist < 30) {
            butterflies.push(new Butterfly(closestFlower.x, closestFlower.baseY - closestFlower.stemLength));
        }
    }
}

function handleScroll() {
    if (window.scrollY > 100) {
        isWinter = true;
        snowflakes = [];
        skyTargetColor = color(200, 220, 255);
        grassColor = color(240, 250, 255);
        isNight = false;
        stars = [];
    } else {
        isWinter = false;
        skyTargetColor = color(135, 206, 235);
        grassColor = color(80, 200, 120);
        snowflakes = [];
    }
}

function isTooCloseToFlowers(x, y, minDistance) {
    for (let flower of flowers) {
        let d = dist(x, y, flower.x, flower.baseY);
        if (d < minDistance) {
            return true;
        }
    }
    return false;
}

function drawStars() {
    noStroke();
    for (let s of stars) {
        fill(s.c);
        ellipse(s.x, s.y, s.r, s.r);
    }
}

function drawSnow() {
    for (let i = snowflakes.length - 1; i >= 0; i--) {
        snowflakes[i].move();
        snowflakes[i].show();
        if (snowflakes[i].offScreen()) {
            snowflakes.splice(i, 1);
        }
    }
}

function keyPressed() {
    //  change flower colors when 'M' key is pressed
    if (key === 'm' || key === 'M') {
        for (let flower of flowers) {
            flower.petalHue = random([
                color(255, 120, 180), // pink
                color(255, 255, 120), // yellow
                color(180, 120, 255), // purple
                color(120, 255, 180), // mint
                color(255, 180, 120), // orange
                color(180, 255, 255)  // cyan
            ]);
        }
    }
}

class Snowflake {
    constructor() {
        this.x = random(width);
        this.y = random(-20, 0);
        this.r = random(2, 5);
        this.speed = random(1, 2.5);
        this.wind = random(-0.5, 0.5);
    }
    
    move() {
        this.y += this.speed;
        this.x += this.wind;
    }
    
    show() {
        noStroke();
        fill(255, 255, 255, 220);
        ellipse(this.x, this.y, this.r, this.r);
    }
    
    offScreen() {
        return this.y > height;
    }
}

class Flower {
    constructor(x, baseY) {
        this.x = x;
        this.baseY = baseY;
        this.stemLength = 0;
        this.maxStem = random(80, 120);
        this.bloomSize = 0;
        this.maxBloom = random(15, 25);
        this.leafAngle = random(-PI/4, PI/4);
        this.leafSize = random(12, 18);
        this.petalColor = color(random(200, 360), 80, 80);
        this.centerColor = color(255, 220, 100);
        this.petalHue = random([
            color(255, 120, 180), // pink
            color(255, 255, 120), // yellow
            color(180, 120, 255)  // purple
        ]);
        this.windOffset = random(0, 1000); // offset for wind movement
        this.windStrength = random(0.5, 1.5); //  wind strength per flower
    }
    
    grow() {
        if (this.stemLength < this.maxStem) {
            this.stemLength += 0.5;
        } else if (this.bloomSize < this.maxBloom) {
            this.bloomSize += 0.3;
        }
    }
    
    show() {
        //  wind movement
        let windX = 0;
        if (isNight) {
            windX = sin(frameCount * 0.02 + this.windOffset) * this.windStrength;
        }

        // Stem with wind movement
        push();
        translate(windX, 0);
        stroke(60, 180, 80);
        strokeWeight(3);
        line(this.x, this.baseY, this.x, this.baseY - this.stemLength);

        // Leaf with wind movement
        push();
        translate(this.x, this.baseY - this.stemLength/2);
        rotate(this.leafAngle + (isNight ? sin(frameCount * 0.03 + this.windOffset) * 0.1 : 0));
        fill(60, 180, 80);
        noStroke();
        ellipse(0, 0, this.leafSize, this.leafSize/2);
        pop();

        // Bloom with wind movement
        if (this.stemLength >= this.maxStem) {
            push();
            translate(this.x, this.baseY - this.stemLength);
            rotate(isNight ? sin(frameCount * 0.02 + this.windOffset) * 0.1 : 0);
            fill(this.petalHue);
            noStroke();
            for (let i = 0; i < 6; i++) {
                ellipse(0, this.bloomSize, this.bloomSize/2, this.bloomSize);
                rotate(PI/3);
            }
            fill(255, 220, 100);
            ellipse(0, 0, this.bloomSize, this.bloomSize);
            pop();
        }
        pop();
    }
}

class Butterfly {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.angle = random(TWO_PI);
        this.speed = random(1, 2);
        this.size = random(18, 26);
        this.color = random([
            color(255, 105, 180), //  pink
            color(255, 182, 193), //  pink
            color(186, 85, 211),  // purple
            color(148, 0, 211)    //  violet
        ]);
        this.wingFlap = 0;
    }
    
    move() {
        this.y -= this.speed;
        this.x += sin(this.angle) * 1.5;
        this.angle += random(-0.05, 0.05);
        this.wingFlap += 0.2;
    }
    
    show() {
        push();
        translate(this.x, this.y);
        fill(this.color);
        let flap = sin(this.wingFlap) * 6;
        ellipse(-this.size/3, 0, this.size/2 + flap, this.size);
        ellipse(this.size/3, 0, this.size/2 - flap, this.size);
        fill(0);
        rect(-2, -this.size/2, 4, this.size);
        pop();
    }
    
    offScreen() {
        return this.y < -30;
    }
}