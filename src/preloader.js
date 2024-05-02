import { Scene } from "phaser";

// Class to preload all the assets
export class Preloader extends Scene {
    constructor() {
        super({ key: "Preloader" });
    }

    preload() {
        // Load all the assets
        this.load.setPath("assets");
        this.load.image("logo", "logo.png");
        this.load.image("floor", "floor.png");
        this.load.image("background", "background.png");

        this.load.image("health-pickup", "pickups/health-pickup.png");
        this.load.image("boost-pickup", "pickups/booster-pickup.png");
        
        this.load.image("player", "player/player.png");
        this.load.image("bullet", "player/bullet.png");
        this.load.atlas("propulsion-fire", "player/propulsion/propulsion-fire.png", "player/propulsion/propulsion-fire_atlas.json");
        this.load.animation("propulsion-fire-anim", "player/propulsion/propulsion-fire_anim.json");
        
        
        
        // Enemies
        this.load.image("enemy-ork", "enemies/enemy-ork/enemy_ork.png");

        // Reticle
        this.load.image("reticle", "player/reticle.png");

        // Fonts
        this.load.bitmapFont("pixelfont", "fonts/pixelfont.png", "fonts/pixelfont.xml");
        this.load.image("knighthawks", "fonts/knight3.png");

        // Event to update the loading bar
        this.load.on("progress", (progress) => {
            console.log("Loading: " + Math.round(progress * 100) + "%");
        });

        // Add an error event listener to capture and log file errors
        this.load.on('fileerror', function (file, error) {
            console.error(`Error loading file: ${file.key}. Error: ${error.message}`);
        });
        
        
        
    }

    create() {
        // Create bitmap font and load it in cache
        const config = {
            image: 'knighthawks',
            width: 31,
            height: 25,
            chars: Phaser.GameObjects.RetroFont.TEXT_SET6,
            charsPerRow: 10,
            spacing: { x: 1, y: 1 }
        };
        this.cache.bitmapFont.add('knighthawks', Phaser.GameObjects.RetroFont.Parse(this, config));

        // When all the assets are loaded, go to the next scene
        this.scene.start("SplashScene");
        
        
    }
}



