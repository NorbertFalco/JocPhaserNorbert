import { Scene } from "phaser";
import Player from "../gameobjects/Player";
import Enemy from "../gameobjects/Enemy";
import Bullet from "../gameobjects/Bullet";
import { HealthPickup, BoostPickup } from "../gameobjects/Pickups";

export class MainScene extends Scene {
    constructor() {
        super({ key: 'MainScene' });
        this.spawnEnemy = this.spawnEnemy.bind(this);
        this.spawnDelay = 2000; // Start with a spawn delay of 2 seconds
    }

    create() {
        // Create background
        this.background = this.add.sprite(0, 0, 'background');
        this.background.setOrigin(0, 0);
        this.background.setDisplaySize(this.sys.canvas.width, this.sys.canvas.height);

        // Create floor
        this.floor = this.physics.add.sprite(480, 510, 'floor');
        this.floor.setImmovable(true);
        this.floor.body.allowGravity = false;

        // Set up physics bounds
        this.physics.world.setBounds(0, 0, this.sys.canvas.width, this.sys.canvas.height);
        this.physics.world.on('worldbounds', (body) => {
            if (body.gameObject instanceof Bullet) {
                body.gameObject.destroy();
            }
        });

        // Create player
        const playerY = this.sys.canvas.height - 80;
        this.player = new Player(this, 400, playerY, 'player');
        this.player.body.setCollideWorldBounds(true);

        // Create the propulsion-fire animation
        this.anims.create({
            key: 'propulsion-fire',
            frames: this.anims.generateFrameNames('propulsion-fire'),
            frameRate: 10,
            repeat: -1,
        });

        // Initialize display texts
        this.livesText = this.add.text(16, 80, `Lives: ${this.player.lives}`, {
            fontSize: '24px',
            fill: '#ffffff',
        });

        this.score = 0;
        this.scoreText = this.add.text(16, 16, 'Score: 0', {
            fontSize: '24px',
            fill: '#ffffff',
        });

        this.healthText = this.add.text(16, 48, `Health: ${this.player.currentHealth}`, {
            fontSize: '24px',
            fill: '#ffffff',
        });

        // Set up player input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.cursors.jump = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.cursors.left = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.cursors.right = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        // Create enemy group
        this.enemies = this.physics.add.group();

        // Set up enemy spawning event
        this.enemySpawnEvent = this.time.addEvent({
            delay: this.spawnDelay,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true,
        });

        // Create groups for pickups
        this.healthPickups = this.physics.add.group({
            classType: HealthPickup,
            maxSize: 5, // Adjust as necessary
            runChildUpdate: true,
        });

        this.boostPickups = this.physics.add.group({
            classType: BoostPickup,
            maxSize: 5, // Adjust as necessary
            runChildUpdate: true,
        });

        // Set up spawning events for pickups
        this.time.addEvent({
            delay: 10000, // Health pickup spawns every 10 seconds
            callback: this.spawnHealthPickup,
            callbackScope: this,
            loop: true,
        });

        this.time.addEvent({
            delay: 15000, // Boost pickup spawns every 15 seconds
            callback: this.spawnBoostPickup,
            callbackScope: this,
            loop: true,
        });

        // Set up collision and overlap detection
        this.physics.add.collider(this.player, this.floor);
        this.physics.add.collider(this.enemies, this.floor);
        this.physics.add.overlap(this.player.bullets, this.enemies, this.handleBulletEnemyCollision, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.handlePlayerEnemyCollision, null, this);
        this.physics.add.overlap(this.player, this.healthPickups, this.handleHealthPickup, null, this);
        this.physics.add.overlap(this.player, this.boostPickups, this.handleBoostPickup, null, this);

        // Add collisions between pickups and the floor to ensure they fall to the ground
        this.physics.add.collider(this.healthPickups, this.floor);
        this.physics.add.collider(this.boostPickups, this.floor);

        // Game over event
        this.player.on('gameover', () => {
            this.scene.start('GameOverScene', { points: this.score });
        });

        this.initializeLivesDisplay(this.player.lives);
    }

    update(time, delta) {
        this.player.update(this.cursors, time, delta);
        this.enemies.getChildren().forEach(enemy => {
            enemy.update();
        });

        // Optionally, adjust the spawn delay over time to increase enemy spawn rate
        if (this.spawnDelay > 2000) {
            this.spawnDelay -= 10; // Reduce spawn delay by 10ms each frame
            // Update the event with the new spawn delay
            this.enemySpawnEvent.delay = this.spawnDelay;
        }
    }

    handleBulletEnemyCollision(bullet, enemy) {
        bullet.destroy();
        enemy.takeDamage();

        // Optionally, increase the score when an enemy is destroyed
        this.score += 10; // Adjust the score increment as desired
        this.scoreText.setText(`Score: ${this.score}`);
    }

    handlePlayerEnemyCollision(player, enemy) {
        player.takeDamage(10);

        // Bump the player away from the enemy
        const bumpVelocity = 200; // Adjust as needed
        const direction = new Phaser.Math.Vector2(player.x - enemy.x, player.y - enemy.y).normalize();
        player.body.setVelocity(direction.x * bumpVelocity, direction.y * bumpVelocity);

        // Update health display
        this.updateHealthDisplay(player.currentHealth);

        // Destroy enemy after collision
        enemy.destroy();

        // Update lives display
        this.updateLivesDisplay(player.lives);
    }

    spawnHealthPickup() {
        const x = Math.random() * this.sys.canvas.width;
        const y = 0; // Start at the top of the screen

        const healthPickup = this.healthPickups.get(x, y, 'health-pickup');
        if (healthPickup) {
            healthPickup.setActive(true);
            healthPickup.setVisible(true);
            healthPickup.body.setGravityY(200); // Adjust as needed
            healthPickup.body.setCollideWorldBounds(true); // Ensure it collides with the world bounds
        }
    }

    spawnBoostPickup() {
        const x = Math.random() * this.sys.canvas.width;
        const y = 0; // Start at the top of the screen

        const boostPickup = this.boostPickups.get(x, y, 'boost-pickup');
        if (boostPickup) {
            boostPickup.setActive(true);
            boostPickup.setVisible(true);
            boostPickup.body.setGravityY(200); // Adjust as needed
            boostPickup.body.setCollideWorldBounds(true); // Ensure it collides with the world bounds
        }
    }

    spawnEnemy() {
        const numEnemies = Math.floor(Math.max(1, this.spawnDelay / 1000)); // Spawn more enemies over time

        for (let i = 0; i < numEnemies; i++) {
            const spawnSide = Math.random() < 0.5 ? 'left' : 'right';
            const x = spawnSide === 'left' ? 0 : this.sys.canvas.width;
            const y = this.sys.canvas.height - 50; // Spawn enemy near the ground

            const enemy = new Enemy(this, x, y, 'enemy-ork');
            this.enemies.add(enemy);

            // Add collision between player and enemy
            this.physics.add.collider(this.player, enemy, this.handlePlayerEnemyCollision, null, this);

            // Set the target for the enemy
            enemy.setTarget(this.player);
        }
    }

    // Initialize lives display
    initializeLivesDisplay(lives) {
        this.livesText.setText(`Lives: ${lives}`);
    }

    // Update lives display
    updateLivesDisplay(lives) {
        this.livesText.setText(`Lives: ${Math.max(0, lives)}`);
    }

    // Update health display
    updateHealthDisplay(health) {
        this.healthText.setText(`Health: ${health}`);
    }

    handleHealthPickup(player, pickup) {
        // Increase player's health and destroy the pickup
        player.increaseHealth();
        pickup.destroy();

        // Update health display
        this.updateHealthDisplay(player.currentHealth);
    }

    handleBoostPickup(player, pickup) {
        // Grant player a speed boost and destroy the pickup
        player.grantSpeedBoost();
        pickup.destroy();
    }
}




