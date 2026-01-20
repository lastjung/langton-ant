import { AntEngine } from './src/engine/AntEngine.js';
import { CanvasRenderer } from './src/renderer/CanvasRenderer.js';
import { UIController } from './src/ui/UIController.js';
import { CONFIG } from './src/engine/Constants.js';
import { AudioManager } from './src/audio/AudioManager.js';

// Initialization
const canvas = document.getElementById('antCanvas');
const engine = new AntEngine(CONFIG.DEFAULT_GRID);
const renderer = new CanvasRenderer(canvas);
const audio = new AudioManager();

let speed = 10; // Steps per frame
let stepAccumulator = 0;

const onPlayPause = () => {
    engine.isPaused = !engine.isPaused;
    // Activate audio context on user gesture
    if (!engine.isPaused) audio.init();
};

const onReset = () => {
    engine.reset();
    renderer.draw(engine);
    ui.update();
};

const onSpeedChange = (val) => {
    speed = parseInt(val);
};

const onRuleChange = (rules) => {
    engine.setRules(rules);
    renderer.draw(engine);
};

const onModeChange = (mode) => {
    const newSize = CONFIG.GRID_MODES[mode];
    engine.size = newSize;
    engine.grid = new Uint8Array(newSize * newSize);
    engine.reset();
    renderer.draw(engine);
};

const onStepAction = (action) => {
    engine.isPaused = true; // Auto-pause when manual stepping
    if (action === 'FORWARD') {
        const index = engine.antPos.y * engine.size + engine.antPos.x;
        const state = engine.grid[index];
        engine.step();
        audio.playStep(state);
    } else if (action === 'BACK') {
        engine.stepBack();
    }
    renderer.draw(engine);
    ui.update();
};

const onSoundToggle = () => audio.toggle();
const onVolumeChange = (val) => audio.setVolume(val);
const onWaveTypeChange = (type) => audio.setWaveform(type);

const ui = new UIController(
    engine, 
    onPlayPause, 
    onReset, 
    onSpeedChange, 
    onRuleChange, 
    onModeChange, 
    onStepAction, 
    onSoundToggle,
    onVolumeChange,
    onWaveTypeChange
);
ui.initPresets(CONFIG.PRESETS);

let lastTime = performance.now();

// Main Simulation Loop
function loop(currentTime) {
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    if (!engine.isPaused) {
        engine.elapsedTime += deltaTime;
        
        const speedFactor = (engine.size < 50) ? 0.1 : 1.0;
        stepAccumulator += speed * speedFactor;

        while (stepAccumulator >= 1) {
            const index = engine.antPos.y * engine.size + engine.antPos.x;
            const stateAtStep = engine.grid[index];
            
            engine.step();
            
            // Only play sound in Discovery mode or low speed to prevent noise chaos
            if (engine.size < 50 || speed < 30) {
                audio.playStep(stateAtStep);
            }
            
            stepAccumulator -= 1;
        }
    }

    renderer.draw(engine);
    ui.update();

    requestAnimationFrame(loop);
}

// Initial Draw
renderer.draw(engine);
requestAnimationFrame(loop); // Use timestamp-based loop
