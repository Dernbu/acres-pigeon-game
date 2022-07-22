// We need these import statements to tell NextJS to build the pages together with this page.
import background from './assets/background_600x800.png';
import action_button_spritesheet from './assets/actions_button_spritesheet.png';
import action_button_json from './assets/actions_button_spritesheet.json' assert {type: 'json'};
import make_hover_button from '../../utils/make_hover_button';


export default class MainScene extends Phaser.Scene {

    // See StartScene.ts for why I do this nonsense
    static SCENE_KEY = 'main-scene' + Math.random();
    static BACKGROUND_KEY = this.SCENE_KEY + 'background';
    static ACTION_BUTTON_KEY = this.SCENE_KEY + 'action-button';

    // Game values to be tweaked with
    /**
     * We are using the logistic growth model:
     * dN/dt = r(L-N)/L*N
     * N: no. pigeons
     * L: limit (carrying capacity)
     * r: contant of proportionality
     */
    pigeon_number = 10;
    carrying_capacity = 1000;
    coefficient = 0.03;

    actionButton!: Phaser.GameObjects.Sprite;
    lineGraphGroup!: Phaser.GameObjects.Group;

    debugElements!: DebugElements;

    updatePigeonGrowth() {
        // Just a small optimisation
        if (this.pigeon_number >= this.carrying_capacity - 1) {
            return;
        }

        // These are values for debug purposes - TODO (deployment): remove
        this.pigeon_number += this.coefficient * (this.carrying_capacity - this.pigeon_number) / this.carrying_capacity * this.pigeon_number;
    }

    constructor() {
        super(MainScene.SCENE_KEY);
    }

    preload() {
        this.load.image(MainScene.BACKGROUND_KEY, background.src)
        this.load.spritesheet(MainScene.ACTION_BUTTON_KEY, action_button_spritesheet.src, action_button_json)
    }

    create() {
        // Background, and stretch background to fit screen.
        const background = this.add.image(0, 0, MainScene.BACKGROUND_KEY).setOrigin(0, 0);
        background.setScale(Math.max(
            this.cameras.main.width / background.width,
            this.cameras.main.height / background.height
        ));

        // Debug elements
        this.debugElements = new DebugElements(this);

        // Buttons
        this.actionButton = make_hover_button(this.add.sprite(10, this.scale.height - 10, MainScene.ACTION_BUTTON_KEY))
            .setOrigin(0, 1)
            .setScale(0.5);

        // Update pigeon growth every 200ms
        // setInterval(() => this.updatePigeonGrowth(), 200)
        this.time.addEvent({
            callbackScope: this,
            delay: 200,
            loop: true,
            callback: () => this.updatePigeonGrowth()
        })
        this.cameras.main.fadeIn(1000, 0, 0, 0);
    }

    update() {
        this.debugElements.updateElements(this.pigeon_number, this.carrying_capacity, this.coefficient);
    }
}


class DebugElements {
    scene: Phaser.Scene;

    pigeon_number_element: Phaser.GameObjects.Text;
    carrying_capacity_element: Phaser.GameObjects.Text;
    coefficient_element: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;

        this.pigeon_number_element = this.scene.add.text(100, 100, "").setColor('#000000')
        this.carrying_capacity_element = this.scene.add.text(100, 120, "").setColor('#000000')
        this.coefficient_element = this.scene.add.text(100, 140, "").setColor('#000000')
    }

    updateElements(pigeon_number: number, carrying_capacity: number, coefficient: number) {
        this.pigeon_number_element.setText("Pigeon number: " + Math.round(pigeon_number));
        this.carrying_capacity_element.setText("Carrying capacity: " + carrying_capacity);
        this.coefficient_element.setText("Constant of Proportionality: " + coefficient);
    }
}