import Bullet from './Bullet.js';

class Player extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        scene.add.existing(this);

        // Player properties
        this.initialHealth = 100;
        this.currentHealth = this.initialHealth;
        this.lives = 3;
        this.initialSpeed = 400;
        this.speed = this.initialSpeed;
        this.jumpVelocity = -400;
        this.lastFired = 0;

        // Bullet group
        this.bullets = scene.physics.add.group({
            classType: Bullet,
            maxSize: 10,
            runChildUpdate: true,
        });

        // Enable physics and set up collision
        scene.physics.world.enable(this);
        scene.physics.add.collider(this, scene.floor);
        this.body.setSize(30, 30).setCollideWorldBounds(true).setBounce(0.3);
        this.body.setOffset(0, 0);
        this.body.setGravityY(500);

        // Reticle settings
        this.reticle = scene.physics.add.sprite(x, y, 'reticle');
        this.reticle.setDisplaySize(25, 25).setCollideWorldBounds(true).setDepth(1);
        this.reticle.body.allowGravity = false;

        // Weapon input
        this.weapon = scene.input.activePointer;

        // Add propulsion sprite and set depth
        this.propulsion = scene.add.sprite(x, y + 16, 'propulsion-fire');
        this.propulsion.visible = false;
        this.propulsion.setDepth(-1);

        // Invulnerability settings
        this.isInvulnerable = false;
        this.invulnerabilityDuration = 2000; // 2 seconds

        // Game over event callback
        this.onGameOverCallback = null;
    }

    flashRed() {
        this.scene.tweens.add({
            targets: this,
            tint: 0xff0000, // Red color
            duration: 200, // Duration of the red flash
            repeat: 3, // Repeat the flash 3 times
            yoyo: true, // Return to the original color
            onComplete: () => {
                // Restore the original tint after the flash
                this.clearTint();
            }
        });
    }

    update(cursors, time, delta) {
        // Reset velocity if no key is being pressed
        if (!cursors.left.isDown && !cursors.right.isDown) {
            this.body.setVelocityX(0);
            this.propulsion.visible = false;
        }

        // Handle horizontal movement and sprite direction
        if (cursors.left.isDown) {
            this.body.setVelocityX(-this.speed);
            this.setScale(-1, 1);
        } else if (cursors.right.isDown) {
            this.body.setVelocityX(this.speed);
            this.setScale(1, 1);
        }

        // Jumping code in Player class
        if (cursors.jump.isDown && this.body.onFloor()) {
            // Jump
            this.body.setVelocityY(this.jumpVelocity);

            // Show propulsion sprite and play the animation
            this.propulsion.visible = true;
            this.propulsion.setPosition(this.x, this.y + 16); // Adjust the position relative to the player
            this.propulsion.play('propulsion-fire', true);
        } else {
            // Hide propulsion sprite when not jumping
            this.propulsion.visible = false;
            this.propulsion.stop();
        }

        // Handle reticle movement
        const reticleSpeed = 10;
        const reticleVelocityX = (this.weapon.x - this.reticle.x) * reticleSpeed;
        const reticleVelocityY = (this.weapon.y - this.reticle.y) * reticleSpeed;

        this.reticle.body.setVelocity(reticleVelocityX, reticleVelocityY);

        // Fire bullet if weapon button is down
        if (this.weapon.isDown) {
            this.fire();
        }

        // Handle invulnerability timer
        if (this.isInvulnerable && time > this.invulnerabilityTimer) {
            this.isInvulnerable = false;
        }
    }

    // Bullet firing function
    fire() {
        if (this.scene.time.now > this.lastFired) {
            const bullet = this.bullets.get().setActive(true).setVisible(true);
            if (bullet) {
                bullet.setTexture('bullet');
                const bulletSpawnX = this.x;
                const bulletSpawnY = this.y;

                bullet.setPosition(bulletSpawnX, bulletSpawnY);
                bullet.fire(this.reticle);

                this.lastFired = this.scene.time.now + 200;
            }
        }
    }

    // Handle damage taken
    takeDamage(damageAmount) {
        if (this.isInvulnerable || this.currentHealth <= 0 || this.lives <= 0) {
            return;
        }

        // Reduce health
        this.currentHealth -= damageAmount;

        // Flash red when taking damage
        this.flashRed();

        // Check for player death and adjust lives
        if (this.currentHealth <= 0) {
            this.currentHealth = 0;
            if (this.lives > 0) {
                this.lives--;
            }

            // Check for game over
            if (this.lives <= 0) {
                this.emit('gameover');
            } else {
                // Reset health if there are remaining lives
                this.currentHealth = this.initialHealth;
            }
        }

        // Make player invulnerable for a brief time after taking damage
        this.isInvulnerable = true;
        this.invulnerabilityTimer = this.scene.time.now + this.invulnerabilityDuration;
    }

    // Increase player's health
    increaseHealth(amount = 10) {
        this.currentHealth += amount;
        // Ensure health does not exceed maximum
        this.currentHealth = Math.min(this.currentHealth, this.initialHealth);
    }

    // Grant speed boost to player for a limited time
    grantSpeedBoost(duration = 5000, speed = 600) {
        this.speed = speed;
        this.speedBoostTimer = this.scene.time.now + duration;
    
        // Reset speed to initial value after duration
        this.scene.time.delayedCall(duration, () => {
            this.speed = this.initialSpeed;
        });
        
    }
    
    onGameOver(callback) {
        this.onGameOverCallback = callback;
    }

    onGameOver() {
        if (this.onGameOverCallback) {
            this.onGameOverCallback();
        }
    }
}

export default Player;



