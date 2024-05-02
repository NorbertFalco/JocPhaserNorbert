export class HealthPickup extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        scene.add.existing(this);

        // Enable physics for the pickup
        scene.physics.world.enable(this);
        this.body.setCollideWorldBounds(false);
        this.body.allowGravity = true;
        this.body.setVelocityY(200); // Falling speed: adjust as needed
    }
}

export class BoostPickup extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        scene.add.existing(this);

        // Enable physics for the pickup
        scene.physics.world.enable(this);
        this.body.setCollideWorldBounds(false);
        this.body.allowGravity = true;
        this.body.setVelocityY(200); // Falling speed: adjust as needed
    }
}
