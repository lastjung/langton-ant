import { AntEngine } from './src/engine/AntEngine.js';
import { CanvasRenderer } from './src/renderer/CanvasRenderer.js';
import { UIController } from './src/ui/UIController.js';
import { CONFIG } from './src/engine/Constants.js';
import { AudioManager } from './src/audio/AudioManager.js';

// 1. Initialization
const canvas = document.getElementById('antCanvas');
const engine = new AntEngine(CONFIG.DEFAULT_GRID);
const renderer = new CanvasRenderer(canvas);
const audio = new AudioManager();

let speed = 20;
let stepAccumulator = 0;
let isEvolutionMode = false;
let evolutionSpeedRatio = 1.0;

// 2. Action Handlers
const onPlayPause = () => {
    engine.isPaused = !engine.isPaused;
    if (!engine.isPaused) {
        audio.init();
        ui.hideSettings();
    }
};

const onReset = () => {
    isEvolutionMode = false;
    engine.reset();
    engine.isPaused = true;
    renderer.zoom = 1.0;
    renderer.cameraPos = { x: 0.5, y: 0.5 };
    stepAccumulator = 0;
    if (ui.phaseBadge) ui.phaseBadge.textContent = "READY";
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
    // Reset state
    isEvolutionMode = (mode === 'EVOLUTION');
    engine.isPaused = true;
    stepAccumulator = 0;
    
    if (mode === 'EVOLUTION') {
        // Evolution mode setup
        const newSize = CONFIG.GRID_MODES['SIMULATION'];
        engine.size = newSize;
        engine.grid = new Uint8Array(newSize * newSize);
        engine.reset();
        engine.elapsedTime = 0;
        renderer.zoom = 4.0;
        renderer.cameraPos = { x: 0.5, y: 0.5 };
        updateEvolution();
    } else {
        // Normal mode setup
        const newSize = CONFIG.GRID_MODES[mode];
        engine.size = newSize;
        engine.grid = new Uint8Array(newSize * newSize);
        engine.reset();
        renderer.zoom = 1.0;
        renderer.cameraPos = { x: 0.5, y: 0.5 };
    }
    
    if (ui.phaseBadge) {
        ui.phaseBadge.textContent = isEvolutionMode ? 'GENESIS' : '';
    }
    renderer.draw(engine);
    ui.update();
};

const onStepAction = (action) => {
    isEvolutionMode = false;
    engine.isPaused = true;
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


const updateEvolution = () => {
    if (!isEvolutionMode) return;

    const steps = engine.steps;
    let phase = "";
    let targetZoom = 1.0;
    let speedRatio = 1.0; // Ratio to apply to user's speed setting

    if (steps <= 10) {
        phase = "GENESIS";
        targetZoom = 4.0;
        speedRatio = 0; // Time-based stepping
    } else if (steps <= 30) {
        phase = "GENESIS";
        targetZoom = 4.0;
        speedRatio = -1; // 0.25s interval
    } else if (steps < 500) {
        phase = "GROWTH";
        const progress = (steps - 30) / 470;
        targetZoom = 4.0 - (progress * 2.5);
        speedRatio = 0.05 + (progress * 0.2); // 5% -> 25% of user speed
    } else if (steps < 5000) {
        phase = "COMPLEXITY";
        const progress = (steps - 500) / 4500;
        targetZoom = 1.5 - (progress * 0.5);
        speedRatio = 0.25 + (progress * 0.75); // 25% -> 100% of user speed
    } else {
        phase = "EXPANSE";
        targetZoom = 1.0;
        speedRatio = 1.0; // Full user speed
    }

    renderer.zoom = targetZoom;
    
    // Camera fixed at center
    renderer.cameraPos.x = 0.5;
    renderer.cameraPos.y = 0.5;

    // Apply speed ratio to user's speed setting
    evolutionSpeedRatio = speedRatio;
    if (ui.phaseBadge) ui.phaseBadge.textContent = phase;
};

// 3. UI and Event Setup
const onSoundToggle = () => audio.toggle();
const onVolumeChange = (val) => audio.setVolume(val);
const onWaveTypeChange = (type) => audio.setWaveform(type);
const onBoardColorChange = (color) => {
    renderer.setBoardColor(color);
    renderer.draw(engine);
};
const onCellColorChange = (color) => {
    renderer.setCellColor(color);
    renderer.draw(engine);
};

const ui = new UIController(
    engine, onPlayPause, onReset, onSpeedChange, onRuleChange, 
    onModeChange, onStepAction, onSoundToggle, onVolumeChange, 
    onWaveTypeChange, onBoardColorChange, onCellColorChange
);
ui.initPresets(CONFIG.PRESETS);

// 4. Main Loop
let lastTime = performance.now();

function loop(currentTime) {
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    if (!engine.isPaused) {
        if (isEvolutionMode) updateEvolution();
        engine.elapsedTime += deltaTime;

        // Special slow stepping for Evolution Phase 1 (volume x3)
        if (isEvolutionMode && evolutionSpeedRatio === 0) {
            // Time-based stepping: 1 step per 500ms
            if (engine.elapsedTime >= 500) {
                const idx = engine.antPos.y * engine.size + engine.antPos.x;
                const state = engine.grid[idx];
                engine.step();
                audio.playStep(state, 6); // Phase 1: x6
                engine.elapsedTime = 0;
            }
        } else if (isEvolutionMode && evolutionSpeedRatio === -1) {
            // Time-based stepping: 1 step per 250ms (volume x2)
            if (engine.elapsedTime >= 250) {
                const idx = engine.antPos.y * engine.size + engine.antPos.x;
                const state = engine.grid[idx];
                engine.step();
                audio.playStep(state, 2); // Phase 1b: x2
                engine.elapsedTime = 0;
            }
        } else {
            // Normal step logic with speed (or speed * ratio for Evolution)
            const effectiveSpeed = isEvolutionMode ? speed * evolutionSpeedRatio : speed;
            stepAccumulator += effectiveSpeed;
            while (stepAccumulator >= 1) {
                const idx = engine.antPos.y * engine.size + engine.antPos.x;
                const state = engine.grid[idx];
                engine.step();
                
                if (effectiveSpeed < 40 || (isEvolutionMode && engine.steps < 700)) {
                    // Phase 3: x1 (500-5000), Phase 4: x0.3 (5000+)
                    const volumeMult = (engine.steps < 500) ? 1 : 
                                       (engine.steps < 5000) ? 1 : 0.3;
                    audio.playStep(state, volumeMult);
                }
                stepAccumulator -= 1;
            }
        }
    }

    renderer.draw(engine);
    ui.update();
    requestAnimationFrame(loop);
}

// Initial draw
renderer.draw(engine);
requestAnimationFrame(loop);
