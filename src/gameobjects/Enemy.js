class Enemy extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        scene.add.existing(this);

        // Set initial properties
        this.speed = 300; // Adjust enemy speed as needed
        this.target = null;
        this.health = 3; // Initial health set to 3

        // Enable physics for the enemy
        scene.physics.world.enable(this);
        this.body.setCollideWorldBounds(true);
        this.body.setImmovable(false);

        // Set the position
        this.setPosition(x, y);

        // Set gravity to keep the enemy on the ground
        this.body.allowGravity = true;
        this.body.setGravityY(800); // Adjust as needed

        // Add collision with the ground
        scene.physics.add.collider(this, scene.floor);

        // Running animation variables
        this.runStartY = y;
        this.runAmplitude = 5; // Adjust the amplitude of the up-and-down movement
        this.runFrequency = 0.5; // Increase the frequency of the up-and-down movement

        // Set up for sine wave animation
        this.runTime = 0;
    }

    update() {
        if (this.target) {
            // Calculate the direction vector from the enemy to the target
            const direction = new Phaser.Math.Vector2(this.target.x - this.x, this.target.y - this.y).normalize();

            // Set the velocity to move the enemy towards the target along the ground
            this.body.setVelocityX(direction.x * this.speed);

            // Flip the sprite based on the direction of movement
            this.setFlipX(direction.x < 0);
        }

        // Apply the up-and-down running animation
        this.runTime += this.runFrequency;
        const sineMovement = Math.sin(this.runTime) * this.runAmplitude;
        this.y = this.runStartY + sineMovement;

        // Reset the vertical velocity to prevent any jumping
        if (!this.body.onFloor()) {
            this.body.setVelocityY(0);
        }
    }

    setTarget(target) {
        this.target = target;
    }

    takeDamage() {
        // Reduce health when taking damage
        this.health--;

        // Flash red
        this.setTint(0xff0000); // Flash red
        this.scene.time.delayedCall(100, () => this.clearTint(), [], this);

        // Check if enemy should be destroyed
        if (this.health <= 0) {
            // Add score and update the score text when the enemy is destroyed
            this.scene.score += 10;
            this.scene.scoreText.setText(`Score: ${this.scene.score}`);

            // Destroy the enemy
            this.destroy();
        }
    }
}

export default Enemy;



