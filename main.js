const Synthia = {};

Synthia.Engine = class {
    constructor(canvasId) {
        this.Canvas  = document.getElementById(canvasId);
        this.Context = this.Canvas.getContext('2d');

        this.Scene = null;
        this.currentTime = 0;
    }

    changeScene(scene) {
        let finalWords = null;
        if (this.Scene) { finalWords = this.Scene.exit() }
        this.Scene = scene;
        this.Scene.enter(finalWords);
    }

    gameLoop(timestamp) {
        // Calculate time since last update in ms
        const dt = timestamp - this.currentTime;
        this.currentTime = timestamp;
        // Wipe the screen
        this.Context.clearRect(0, 0, this.Canvas.width, this.Canvas.height);
        // Update the current Scene
        if (this.Scene) {
            this.Scene.update(dt);
            this.Scene.render(this.Context);
        }
        // Start the next frame but preserve the 'this' context
        requestAnimationFrame(this.gameLoop.bind(this));
    }
}

Synthia.Scene = class {
    constructor(name, customMethods = {}) {
        this.name = name || "Default Scene";
        this.time = 1;

        this.enter  = customMethods.enter  || this.enter;
        this.update = customMethods.update || this.update;
        this.render = customMethods.render || this.render;
        this.exit   = customMethods.exit   || this.exit;
    }

    enter(info) {
        console.log("Entering " + this.name);
        if (info) {
            console.log("I was told this!");
            console.log(info);
        }
    }
    update(deltaTime) {
        this.time = deltaTime;
    }
    render(context) {
        let fps = Math.round(1000 / this.time);
        context.fillStyle = 'black';
        context.fillText(`FPS: ${fps}`, 0, 0);
    }
    exit() {
        console.log("Exiting " + this.name);
        return "Bye bye!";
    }
}