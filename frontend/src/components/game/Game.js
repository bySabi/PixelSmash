import React from 'react';
import Phaser from 'phaser';
import { IonPhaser } from '@ion-phaser/react';
import './Game.css';

export default class Game extends React.Component {

    constructor(props) {
        super(props);

        let { player1Prop } = props;

        this.state = {
            unmounted: true,
            initialize: true,
            game: {
                width: 1200,
                height: 675,
                type: Phaser.AUTO,
                physics: {
                    default: 'arcade',
                    arcade: {
                        gravity: { y: 900 },
                        debug: false
                    }
                },
                scene: {
                    init: function () {
                        this.cameras.main.setBackgroundColor('#24252A')
                    },
                    preload: function () {
                        this.load.spritesheet('player1', player1Prop.spritesheetPath, { frameWidth: player1Prop.frameDimensions.x, frameHeight: player1Prop.frameDimensions.y });
                        this.load.image('background', 'assets/background.png');
                        this.load.image('ground', 'assets/ground.png');
                    },
                    create: function () {

                        // background
                        this.background = this.add.image(600, 337.5, 'background');

                        // platforms
                        this.passablePlatforms = this.physics.add.staticGroup();
                        this.passablePlatforms.create(350, 400, 'ground').setScale(.2).refreshBody();
                        this.passablePlatforms.create(850, 400, 'ground').setScale(.2).refreshBody();
                        
                        this.impassablePlatforms = this.physics.add.staticGroup();
                        this.impassablePlatforms.create(600, 550, 'ground').setScale(.75).refreshBody();

                        // player
                        this.player1 = this.physics.add.sprite(600, 400, 'player1');
                        // this.player1.setBounce(.2, .2);
                        // this.player1.setCollideWorldBounds(true);
                        this.player1.setMass(player1Prop.mass);
                        this.player1.jumpCount = 1;
                        this.player1.isMidair = true;
                        this.player1.setSize(player1Prop.hitboxDimensions.x, player1Prop.hitboxDimensions.y);
                        this.anims.create({
                            key: 'left',
                            frames: this.anims.generateFrameNumbers('player1', { start: 18, end: 23 }),
                            frameRate: 10,
                            repeat: -1
                        });
                        this.anims.create({
                            key: 'right',
                            frames: this.anims.generateFrameNumbers('player1', { start: 6, end: 11 }),
                            frameRate: 10,
                            repeat: -1
                        });
                        this.anims.create({
                            key: 'idle',
                            frames: this.anims.generateFrameNumbers('player1', { start: 4, end: 5 }),
                            frameRate: 3,
                            repeat: -1
                        });
                        this.anims.create({
                            key: 'jump',
                            frames: this.anims.generateFrameNumbers('player1', { start: 0, end: 5 }),
                            frameRate: 15,
                            repeat: 1
                        });

                        // text
                        this.helloWorld = this.add.text(
                            this.cameras.main.centerX,
                            this.cameras.main.centerY,
                            "PixelSmash", {
                            font: "40px Arial",
                            fill: "#ffffff"
                        }
                        );
                        this.helloWorld.setOrigin(0.5);
                        this.counter = 0;

                        // physics collisions
                        this.passableCollision = this.physics.add.collider(this.player1, this.passablePlatforms, () => {
                            if (this.player1.body.onFloor() === true) {
                                this.player1.jumpCount = 0;
                            }
                        }, 
                        (player, platform) => {
                            if (player.y + 20 > platform.y || this.player1.body.velocity.y < 0) {
                                return false;
                            }
                            return true;
                        });

                        this.impassableCollision = this.physics.add.collider(this.player1, this.impassablePlatforms, () => {
                            if (this.player1.body.onFloor() === true) {
                                this.player1.jumpCount = 0;
                            }
                        });


                        // initialize keyboard listeners
                        this.cursors = this.input.keyboard.createCursorKeys();
                        this.cursors.space.isPressedWithoutRelease = false;
                    },
                    update: function () {
                        if (this.counter === 0.00) {
                            console.log(this.player1);
                            console.log(this.load);
                        }

                        // text animation
                        this.counter += .07;
                        if (this.counter >= 6.28) {
                            this.counter = 0.1;
                        }
                        this.helloWorld.angle = 0 + (10 * Math.sin(this.counter));
                        if (this.counter === .1) {
                            // console.log(this.player1.y);
                            console.log(this.player1.body.velocity);
                        }

                        // input handling
                        if (this.cursors.left.isDown) {
                            this.player1.anims.play('right', true);
                            this.player1.setVelocityX(-player1Prop.movementSpeed);
                        }
                        else if (this.cursors.right.isDown) {
                            this.player1.anims.play('left', true);
                            this.player1.setVelocityX(player1Prop.movementSpeed);
                        }
                        else {
                            this.player1.anims.play('idle', true);
                            this.player1.setVelocityX(0);
                        }
                        this.cursors.space.onDown = (e) => {
                            if (!this.cursors.space.isPressedWithoutRelease && this.player1.jumpCount < 2) {
                                if (this.player1.jumpCount === 0) {
                                    this.player1.setVelocityY(-450);
                                }
                                else if (this.player1.jumpCount === 1) {
                                    this.player1.setVelocityY(-300);
                                }
                                this.player1.jumpCount += 1;
                                this.cursors.space.isPressedWithoutRelease = true;
                                console.log('true jump');
                            }
                        }
                        this.cursors.space.onUp = (e) => {
                            this.cursors.space.isPressedWithoutRelease = false;
                        }

                        // boundaries
                        if (this.player1.y > 850 || this.player1.x < -50 || this.player1.x > 1250) {
                            this.player1.setVelocityY(0);
                            this.player1.y = 400;
                            this.player1.x = 600;
                        }
                        

                    }
                }
            }
        }
    }

    initializeGame = () => {
        this.setState({ initialize: true })
    }

    destroy = () => {
        this.setState({ unmounted: true })
    }

    render() {
        const { initialize, game } = this.state
        return (
            <div className="Game">
                {/* <button onClick={this.initializeGame}>start</button> */}
                {<IonPhaser game={game} initialize={initialize} />}
            </div>
        );
    }
}
