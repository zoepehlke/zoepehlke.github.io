// Configuration constants for better maintainability
const CONFIG = {
    COLORS: {
        BACKGROUND: '#ecececff',
        OVERLAY_NORMAL: '#D55143cd',
        OVERLAY_HOVERED: '#ad413586',
         TEXT: '#F1DFE7'
    },
    PHYSICS: {
        REPULSION_STRENGTH: 0.4,
        MIN_DISTANCE_FACTOR: 1.2,
        BORDER_REPULSION_STRENGTH: 0.5,
        BORDER_REPULSION_DISTANCE: 50,
        SPEED_SCALE_REFERENCE: 1000,
        BASE_SPEED_MULTIPLIER: 0.8,
        MAX_SPEED_MULTIPLIER: 1.25,
        HOVER_SPEED_MULTIPLIER: 0.2,
        HOVER_DAMPENING: 0.95,
        BOOST_MULTIPLIER: 0.75
    },
    VISUAL: {
        HOVER_SCALE: 1.3,
        SCALE_SPEED: 0.05,
        FONT_SIZE_MULTIPLIER: 0.2,
        CANVAS_AREA_RATIO: 0.16
    },
    PROJECT_URLS: {
        "Chiro": "./chiro.html",
        "Tape und Papier": "./tape-und-papier.html",
        "Neue Welten": "./neue-welten.html",
        "Konstellationen": "./konstellationen.html",
        "Mutation": "./mutation.html"
    }
};

let canvas;
let circles = [];
let circleImages = {};
const projectCircles = [
    ["Chiro", 1],
    ["Tape und Papier", 1],
    ["Neue Welten", 1],
    ["Konstellationen", 1],
    ["Mutation", 1]
];

/**
 * Preloads circle images for each project.
 */
function preload() {
    circleImages["Chiro"] = loadImage("./img/circles/chiro-circle.png");
    circleImages["Tape und Papier"] = loadImage("./img/circles/tape-papier-circle.png");
    circleImages["Neue Welten"] = loadImage("./img/circles/neue-welten-circle.png");
    circleImages["Konstellationen"] = loadImage("./img/circles/konstellationen-circle.png");
    circleImages["Mutation"] = loadImage("./img/circles/mutation-circle.png");
}

/**
 * Sets up the p5.js canvas and initializes circles.
 */
function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent("canvasContainer");
    textAlign(CENTER, CENTER);
    textFont('Quicksand');
    createCircles();
}

/**
 * Creates and initializes all moving circles based on project data.
 * Simplified to scale circles equally to fill the canvas based on the number of projects.
 */
function createCircles() {
    circles = [];
    const numCircles = projectCircles.length;
    const totalCanvasArea = width * height;
    const totalCircleArea = totalCanvasArea * CONFIG.VISUAL.CANVAS_AREA_RATIO;
    const areaPerCircle = totalCircleArea / numCircles;
    const radius = Math.sqrt(areaPerCircle / Math.PI);

    for (let i = 0; i < numCircles; i++) {
        const [group] = projectCircles[i]; // Ignore visitor count, treat all equally
        const x = random(radius, width - radius);
        const y = random(radius, height - radius);
        circles.push(new MovingCircle(x, y, radius, group));
    }
}

/**
 * Handles window resizing by updating canvas and recreating circles.
 */
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    createCircles();
}

/**
 * Main draw loop: updates and renders all circles.
 */
function draw() {
    background(CONFIG.COLORS.BACKGROUND);

    // Update hover states
    circles.forEach(circle => circle.updateHover(mouseX, mouseY));

    // Set cursor based on hover state
    const isAnyHovered = circles.some(circle => circle.isHovered);
    cursor(isAnyHovered ? 'grab' : 'default');

    // Update physics and render
    circles.forEach(circle => {
        circle.applyRepulsion(circles);
        circle.applyBorderRepulsion();
        circle.move();
        circle.checkCollisions(circles);
        circle.display();
    });
}

/**
 * Handles mouse clicks to navigate to project pages.
 */
function mousePressed() {
    for (const circle of circles) {
        if (circle.handleClick(mouseX, mouseY)) {
            break;
        }
    }
}

/**
 * Represents a moving circle with physics, hover effects, and click handling.
 */
class MovingCircle {
    /**
     * @param {number} x - Initial x position
     * @param {number} y - Initial y position
     * @param {number} radius - Circle radius
     * @param {string} group - Project group name
     */
    constructor(x, y, radius, group) {
        this.x = x;
        this.y = y;
        this.baseRadius = radius;
        this.radius = radius;
        this.group = group;

        // Initialize velocity based on screen size
        const baseSpeed = this.getScreenRelativeSpeed();
        this.velocityX = random(-baseSpeed, baseSpeed);
        this.velocityY = random(-baseSpeed, baseSpeed);

        // Hover and scaling properties
        this.isHovered = false;
        this.targetScale = 1.0;
        this.currentScale = 1.0;
        this.scaleSpeed = CONFIG.VISUAL.SCALE_SPEED;

        // Project URL
        this.projectUrl = CONFIG.PROJECT_URLS[group] || "#";
    }

    /**
     * Calculates speed relative to screen size for consistent behavior across devices.
     * @returns {number} Screen-relative speed
     */
    getScreenRelativeSpeed() {
        const screenDiagonal = Math.sqrt(width * width + height * height);
        const scaleFactor = screenDiagonal / CONFIG.PHYSICS.SPEED_SCALE_REFERENCE;
        return scaleFactor * CONFIG.PHYSICS.BASE_SPEED_MULTIPLIER;
    }

    /**
     * Handles click events to navigate to the project page.
     * @param {number} mouseX - Mouse x position
     * @param {number} mouseY - Mouse y position
     * @returns {boolean} True if click was handled
     */
    handleClick(mouseX, mouseY) {
        const distance = dist(mouseX, mouseY, this.x, this.y);
        if (distance < this.radius) {
            window.location.href = this.projectUrl;
            return true;
        }
        return false;
    }

    /**
     * Updates hover state and handles scale transitions.
     * @param {number} mouseX - Mouse x position
     * @param {number} mouseY - Mouse y position
     */
    updateHover(mouseX, mouseY) {
        const distance = dist(mouseX, mouseY, this.x, this.y);
        const wasHovered = this.isHovered;
        this.isHovered = distance < this.radius;

        // Apply boost when leaving hover
        if (wasHovered && !this.isHovered) {
            this.applyHoverExitBoost();
        }

        // Update scale target
        this.targetScale = this.isHovered ? CONFIG.VISUAL.HOVER_SCALE : 1.0;
        this.currentScale = lerp(this.currentScale, this.targetScale, this.scaleSpeed);
        this.radius = this.baseRadius * this.currentScale;
    }

    /**
     * Applies a random boost when exiting hover to maintain system energy.
     */
    applyHoverExitBoost() {
        const boostStrength = this.getScreenRelativeSpeed() * CONFIG.PHYSICS.BOOST_MULTIPLIER;
        const randomAngle = random(0, TWO_PI);
        this.velocityX += cos(randomAngle) * boostStrength;
        this.velocityY += sin(randomAngle) * boostStrength;
    }

    /**
     * Updates position based on velocity, with speed limits and hover effects.
     */
    move() {
        const maxSpeed = this.getScreenRelativeSpeed() * CONFIG.PHYSICS.MAX_SPEED_MULTIPLIER;
        const speedMultiplier = this.isHovered ? CONFIG.PHYSICS.HOVER_SPEED_MULTIPLIER : 1.0;

        // Limit speed
        const currentSpeed = Math.sqrt(this.velocityX ** 2 + this.velocityY ** 2);
        if (currentSpeed > maxSpeed * speedMultiplier) {
            this.velocityX = (this.velocityX / currentSpeed) * maxSpeed * speedMultiplier;
            this.velocityY = (this.velocityY / currentSpeed) * maxSpeed * speedMultiplier;
        }

        // Apply hover dampening
        if (this.isHovered) {
            this.velocityX *= CONFIG.PHYSICS.HOVER_DAMPENING;
            this.velocityY *= CONFIG.PHYSICS.HOVER_DAMPENING;
        }

        this.x += this.velocityX;
        this.y += this.velocityY;
    }

    /**
     * Checks and resolves collisions with other circles.
     * @param {MovingCircle[]} otherCircles - Array of other circles
     */
    checkCollisions(otherCircles) {
        for (const other of otherCircles) {
            if (other === this) continue;

            const distance = dist(this.x, this.y, other.x, other.y);
            const minDistance = this.radius + other.radius;

            if (distance < minDistance) {
                const angle = atan2(this.y - other.y, this.x - other.x);
                const overlap = minDistance - distance;

                // Separate circles
                this.x += cos(angle) * (overlap / 2);
                this.y += sin(angle) * (overlap / 2);
                other.x -= cos(angle) * (overlap / 2);
                other.y -= sin(angle) * (overlap / 2);

                // Exchange velocities
                [this.velocityX, other.velocityX] = [other.velocityX, this.velocityX];
                [this.velocityY, other.velocityY] = [other.velocityY, this.velocityY];
            }
        }
    }

    /**
     * Applies repulsion forces from other circles.
     * @param {MovingCircle[]} otherCircles - Array of other circles
     */
    applyRepulsion(otherCircles) {
        for (const other of otherCircles) {
            if (other === this) continue;

            const distance = dist(this.x, this.y, other.x, other.y);
            const minDistance = (this.radius + other.radius) * CONFIG.PHYSICS.MIN_DISTANCE_FACTOR;

            if (distance < minDistance && distance > 0) {
                const angle = atan2(this.y - other.y, this.x - other.x);
                const force = CONFIG.PHYSICS.REPULSION_STRENGTH * (1 - distance / minDistance);
                this.velocityX += cos(angle) * force;
                this.velocityY += sin(angle) * force;
            }
        }
    }

    /**
     * Applies repulsion forces from canvas borders.
     */
    applyBorderRepulsion() {
        const { BORDER_REPULSION_STRENGTH, BORDER_REPULSION_DISTANCE } = CONFIG.PHYSICS;

        if (this.x - this.radius < BORDER_REPULSION_DISTANCE) {
            this.velocityX += BORDER_REPULSION_STRENGTH * (1 - (this.x - this.radius) / BORDER_REPULSION_DISTANCE);
        }
        if (this.x + this.radius > width - BORDER_REPULSION_DISTANCE) {
            this.velocityX -= BORDER_REPULSION_STRENGTH * (1 - (width - (this.x + this.radius)) / BORDER_REPULSION_DISTANCE);
        }
        if (this.y - this.radius < BORDER_REPULSION_DISTANCE) {
            this.velocityY += BORDER_REPULSION_STRENGTH * (1 - (this.y - this.radius) / BORDER_REPULSION_DISTANCE);
        }
        if (this.y + this.radius > height - BORDER_REPULSION_DISTANCE) {
            this.velocityY -= BORDER_REPULSION_STRENGTH * (1 - (height - (this.y + this.radius)) / BORDER_REPULSION_DISTANCE);
        }
    }

    /**
     * Renders the circle with image, overlay, and text.
     */
    display() {
        const displaySize = this.baseRadius * 2 * this.currentScale;

        // Draw image if available
        const img = circleImages[this.group];
        if (img && img.width > 0) {
            imageMode(CENTER);
            image(img, this.x, this.y, displaySize, displaySize);
        }

        // Draw overlay
        const overlayColor = this.isHovered ? CONFIG.COLORS.OVERLAY_HOVERED : CONFIG.COLORS.OVERLAY_NORMAL;
        fill(overlayColor);
        noStroke();
        ellipse(this.x, this.y, displaySize);

        // Draw text
        //fill(CONFIG.COLORS.TEXT);

        fill(this.isHovered ? CONFIG.COLORS.TEXT : CONFIG.COLORS.TEXT);
        textSize(this.baseRadius * CONFIG.VISUAL.FONT_SIZE_MULTIPLIER * this.currentScale);

        // Add stroke for better contrast
        strokeWeight(10);
        text(this.group, this.x, this.y);
        noStroke(); // Reset stroke
    }
}
