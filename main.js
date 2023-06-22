const Synthia = {};
Synthia.entityId = 0;

Synthia.Vector = class {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;

    }
    getMagnitude() {
        return Math.sqrt(this.x ** 2 + this.y ** 2)
    }
    calculateDistance(vector) {
        let dx = this.x - vector.x
        let dy = this.y - vector.y
        return Math.sqrt(
            dx ** 2 + dy ** 2
        )
    }
    add(vector) {
        return new Synthia.Vector(
            this.x + vector.x,
            this.y + vector.y
        )
    }
    subtract(vector) {
        return new Synthia.Vector(
            this.x - vector.x,
            this.y - vector.y
        )
    }
    scale(magnitude) {
        return new Synthia.Vector(
            this.x * magnitude,
            this.y * magnitude
        )
    }
    round() {
        return new Synthia.Vector(
            Math.round(this.x),
            Math.round(this.y)
        )
    }
    clamp(value) {
        const magnitude = this.getMagnitude()
        if (magnitude > value) {
            const scaleFactor = value / magnitude;
            return new Synthia.Vector(
                this.x *= scaleFactor,
                this.y *= scaleFactor
            )
        }
    }
    lerp(target, time) {
        return new Synthia.Vector(
            this.x + (target.x - this.x) * time,
            this.y + (target.y - this.y) * time,
        )
    }

    easeOut(target, time) {
        time = Math.pow(time, 2);
        return new Synthia.Vector(
            this.x + (target.x - this.x) * time,
            this.y + (target.y - this.y) * time,
        )
    }

    easeIn(target, time) {
        time = 1 - Math.pow(1 - time, 2);
        return new Synthia.Vector(
            this.x + (target.x - this.x) * time,
            this.y + (target.y - this.y) * time,
        )
    }
    
    elastic(target, time) {
        const stretch  = 0.1; // Controls how far things jiggle
        const firmness =  40; // Controls how long things jiggle for
        const elasticTime = Math.pow(2, -firmness * time) * Math.sin((time - stretch / 4) * (2 * Math.PI) / stretch) + 1;
        return new Synthia.Vector(
            this.x + (target.x - this.x) * elasticTime,
            this.y + (target.y - this.y) * elasticTime,
        )
    }

    toString() {
        return `(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
    }
};
Synthia.Shapes = {
    SQUARE: Symbol("Square"),
    CIRCLE: Symbol("Circle"),
}
Synthia.Shape = {
    Circle: class {
        constructor(radius = 10, color = 'black') {
            this.name   = Synthia.Shapes.CIRCLE
            this.radius = radius
            this.color  = color
        }
    },
    Square: class {
        constructor(width = 20, color = 'black') {
            this.name  = Synthia.Shapes.SQUARE
            this.width = width
            this.color = color
        }
    }
};
Synthia.Input = {
    Mouse: {
        Position: new Synthia.Vector(),
        Buttons: { Left: false, Middle: false, Right: false },
    },
    Keyboard: {}
};
Synthia.Display = class {
    constructor(canvasId) {
        this.Canvas  = document.getElementById(canvasId);
        this.Canvas.width  = 640;
        this.Canvas.height = 360;
        this.Context = this.Canvas.getContext('2d');
        // Pixel art
        this.Context.imageSmoothingEnabled = false;
        // Mouse Tracking
        this.Canvas.addEventListener('mousemove', (e) => {
            const rect = this.Canvas.getBoundingClientRect();
            Synthia.Input.Mouse.Position.x = e.clientX - rect.left;
            Synthia.Input.Mouse.Position.y = e.clientY - rect.top;
        });
        this.Canvas.addEventListener('mousedown', (e) => {
            switch(e.button) {
                case 0: Synthia.Input.Mouse.Buttons.Left = true; break;
                case 1: Synthia.Input.Mouse.Buttons.Middle = true; break;
                case 2: Synthia.Input.Mouse.Buttons.Right = true; break;
                default: break;
            }
        });
        this.Canvas.addEventListener('mouseup', (e) => {
            switch(e.button) {
                case 0: Synthia.Input.Mouse.Buttons.Left = false; break;
                case 1: Synthia.Input.Mouse.Buttons.Middle = false; break;
                case 2: Synthia.Input.Mouse.Buttons.Right = false; break;
                default: break;
            }
        });
        // Fixing Right click issue.
        this.Canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    // Vector Art
    fillCircle(x, y, radius, color) {
        let ctx = this.Context

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2, false);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();
    }
    strokeCircle(x, y, radius, color) {
    	let ctx = this.Context;
	    ctx.beginPath();
	    ctx.arc(x, y, radius, 0, 2 * Math.PI);
	    ctx.strokeStyle = color;
	    ctx.stroke();
    }
	fillRect(x, y, width, height, color) {
		let ctx = this.Context
		ctx.fillStyle = color
		ctx.fillRect(x, y, width, height)
	}
	strokeRect(x, y, width, height, color) {
		let ctx = this.Context
		ctx.strokeStyle = color
		ctx.strokeRect(x, y, width, height)
	}
	strokeLine(x1, y1, x2, y2, color = 'black') {
		let ctx = this.Context
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.strokeStyle = color;
		ctx.stroke();
	}
	drawText(x, y, text, color = 'black', align = 'left', font) {
		let ctx = this.Context
		if (font) { ctx.font = font}
		ctx.fillStyle = color
		ctx.textAlign = align
		ctx.fillText(text, x, y)
	}
	fillTextArea(x, y, width, height, text, color = 'black', align = 'center', font = this.getFont()) {
		let ctx = this.Context
		ctx.fillStyle = color
		let fontSize = Math.round(height * 0.8)
		ctx.font = `${fontSize}px ${font}`
		// Scale
		let textWidth = ctx.measureText(text).width 
		while (textWidth > width && fontSize > 0) {
			fontSize--
			ctx.font = `${fontSize}px ${font}`
			textWidth = ctx.measureText(text).width
		}
		// Align
		let textX
		switch(align) {
			case 'center':
				textX = x + (width - textWidth) / 2
				break;
			case 'right':
				textX = x + width - textWidth
				break;
			default:
				textX = x
		}
		let textY = Math.round(y + (height + fontSize * 0.8) / 2)
		this.drawText(textX, textY, text, color, 'left', font)
	}
    clear(color = 'white') {
        let ctx = this.Context;

        ctx.fillStyle = color
        ctx.fillRect(0, 0, this.Canvas.width, this.Canvas.width)
    }
};
Synthia.Renderer = {
    Vector: function (display, entities) {
        for (let entity of entities.values()) {
            if (entity.hasComponent(Synthia.ComponentTypes.VECTOR_SPRITE)) {
                let x = entity.Position.x
                let y = entity.Position.y
                let shape = entity.Shape
                switch(shape.name) {
                    case Synthia.Shapes.CIRCLE:
                        display.strokeCircle(x, y, shape.radius, shape.color);
                        break;
                    case Synthia.Shapes.SQUARE:
                        display.strokeRect(
                            x - (shape.width/2),
                            y - (shape.width/2),
                            shape.width, 
                            shape.width, 
                            shape.color
                        );
                        break;
                    default:
                        console.warn('Unknown shape: ', shape.name);
                        break;
                }
            }
        }
    }
}
Synthia.Engine = class {
    constructor(canvasId) {
        // Input handling
        window.addEventListener('keydown', (e) => {
            Synthia.Input.Keyboard[e.key.toLowerCase()] = true;
        });
        window.addEventListener('keyup', (e) => {
            Synthia.Input.Keyboard[e.key.toLowerCase()] = false;
        });
        // Display generation
        this.Display = new Synthia.Display(canvasId);
        this.Scene = null;
        this.currentTime = 0;
        // Start the loop
        this.gameLoop = this.gameLoop.bind(this);
    }
    changeScene(scene) {
        let finalWords = null;
        if (this.Scene) { finalWords = this.Scene.exit() }
        this.Scene = scene;
        this.Scene.enter(finalWords);
    }
    gameLoop(timestamp) {
        const deltaTime = timestamp - this.currentTime;
        this.currentTime = timestamp;
        this.Display.clear()
        if (this.Scene) {
            this.Scene.update(deltaTime);
            this.Scene.render(this.Display);
        }
        // Keep going
        requestAnimationFrame(this.gameLoop);
    }
    start() {
        requestAnimationFrame(this.gameLoop);
    }
};
// ECS system
Synthia.Entity = class {
    constructor() {
        this.id = Synthia.entityId++;
        this.components = {};
    }
    addComponent(component) {
        this.components[component.name] = component;
        if (component.data) {
            Object.assign(this, component.data)
        }
    }
    getComponent(name) {
        return this.components[name];
    }
    removeComponent(name) {
        delete this.components[name];
    }
    hasComponent(name) {
        return this.components.hasOwnProperty(name);
    }
};
Synthia.Entities = {}
Synthia.Component = class {
    constructor(name, data) {
        this.name = name;
        this.data = data;
    }
};
Synthia.ComponentTypes = {
    FOLLOW_TARGET: Symbol("Follow Target"),
    VECTOR_SPRITE: Symbol("Vector Sprite"),
    TWEENABLE:     Symbol("Tweenable"),
    CAMERA:        Symbol("Camera")
};
Synthia.Components = {
    FollowTarget: new Synthia.Component(
        Synthia.ComponentTypes.FOLLOW_TARGET,
        { 
            followMaxSpeed: 5,
            followTarget: Synthia.Input.Mouse,
            followDistance: 20
        }
    ),
    VectorSprite: new Synthia.Component(
        Synthia.ComponentTypes.VECTOR_SPRITE,
        {
            Position: new Synthia.Vector(100, 100),
            Shape:    new Synthia.Shape.Square(20)
        }
    ),
    Tweenable: new Synthia.Component(
        Synthia.ComponentTypes.TWEENABLE,
        {
            Position: new Synthia.Vector(100, 100),

            TweenOrigin: new Synthia.Vector(100, 100),
            TweenTarget: new Synthia.Vector(500, 100),
            // Timer in frames
            tweenFrame:      0,
            tweenDuration: 100,

            tweenStyle: 'elastic',

            setNewTweenTarget: function (position, time) {
                this.TweenTarget   = position;
                this.tweenDuration = time;
            }
        }
    ),
    Camera: new Synthia.Component(
        Synthia.ComponentTypes.CAMERA,
        {
            Position: new Synthia.Vector(100, 100),

            worldToCameraCoordinates(vector) {
                return vector.subtract(this.Position)
            }
        }
    )
};
Synthia.System = class {
    constructor(name, componentNames, logic) {
        this.name = name;
        this.componentNames = componentNames;

        this.logic = logic || this.defaultLogic;
    }
    defaultLogic() {
        console.warn(`No logic implemented for system "${this.name}".`);
    }
    applicableTo(entity) {
        return this.componentNames.every(name => entity.hasComponent(name));
    }
    update(entities, deltaTime) {
        for (let entity of entities.values()) {
            if (this.applicableTo(entity)) {
                this.logic(entity, deltaTime)
            }
        }
    }
};
Synthia.Systems = {
    FollowTarget: new Synthia.System(
        "Follow Target",
        [Synthia.ComponentTypes.FOLLOW_TARGET],
        function (entity, deltaTime) {
            let target   = entity.followTarget.Position
            let position = entity.Position
            let distance = position.calculateDistance(target)
            if (distance > entity.followDistance) {
                let displacement = target.subtract(position)
                displacement     = displacement.clamp(entity.followMaxSpeed)
                entity.Position  = position.add(displacement)
            }
        }
    ),
    Tweening: new Synthia.System(
        "Tweening",
        [Synthia.ComponentTypes.TWEENABLE],
        function (entity, deltaTime) {
            if (entity.tweenDuration > 0) {
                if (entity.tweenFrame < entity.tweenDuration) {
                    entity.Position = entity.TweenOrigin[entity.tweenStyle](
                        entity.TweenTarget,
                        entity.tweenFrame / entity.tweenDuration
                    )
                    entity.tweenFrame++
                } else {
                    entity.tweenFrame = 0;
                    entity.tweenDuration = 0;
                    entity.Position = new Synthia.Vector(
                        entity.TweenTarget.x, entity.TweenTarget.y
                    )
                    entity.Origin = new Synthia.Vector(
                        entity.TweenTarget.x, entity.TweenTarget.y
                    )
                }
            }
        }
    )

}
Synthia.Scene = class {
    constructor(name, customMethods = {}) {
        this.name = name || "Default Scene";

        this.Entities  = new Map();
        this.Systems   = [];
        this.Renderers = [];

        this.enter  = customMethods.enter  || this.enter;
        this.update = customMethods.update || this.update;
        this.render = customMethods.render || this.render;
        this.exit   = customMethods.exit   || this.exit;
    }
    // Entity handling
    addEntity(entity) {
        if (entity instanceof Synthia.Entity) {
            this.Entities.set(entity.id, entity);
        }
    }
    removeEntity(entity) {
        if (entity instanceof Synthia.Entity) {
            this.Entities.delete(entity.id);
        }
    }
    getEntity(id) {
        return this.Entities.get(id)
    }
    // System handling
    addSystem(system) {
        if (system instanceof Synthia.System) {
            this.Systems.push(system);
        }
    }
    // Scene logic
    enter(data) {
        console.log("Entering " + this.name);
        if (data) {
            console.log(data);
        }
    }
    update(deltaTime) {
        this.time = deltaTime;
        for (let system of this.Systems) {
            system.update(this.Entities, deltaTime)
        }
    }
    render(display) {
        for (let renderer of this.Renderers) {
            renderer(display, this.Entities)
        }
    }
    exit() {
        console.log("Exiting " + this.name);
        return "Bye bye!";
    }
};