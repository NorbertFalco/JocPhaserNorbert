class Bullet extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        this.speed = 800; // Adjust bullet speed as needed
        this.setDepth(1);
    }

    fire(target) {
        this.scene.physics.moveToObject(this, target, this.speed);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        if (this.y <= -32 || this.y >= this.scene.sys.canvas.height + 32 || this.x <= -32 || this.x >= this.scene.sys.canvas.width + 32) {
            this.setActive(false);
            this.setVisible(false);
        }
    }
}

export default Bullet;




