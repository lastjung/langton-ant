import { Draggable } from './Draggable.js';

export class UIController {
  constructor(engine, onPlayPause, onReset, onSpeedChange, onRuleChange, onModeChange, onStepAction, onSoundToggle, onVolumeChange, onWaveTypeChange) {
    this.engine = engine;

    // Initialize Draggable Panels
    const ctrlPanel = document.getElementById('controlPanel');
    const settPanel = document.getElementById('settingsPanel');
    if (ctrlPanel) new Draggable(ctrlPanel, ctrlPanel.querySelector('.drag-handle'));
    if (settPanel) new Draggable(settPanel, settPanel.querySelector('.drag-handle'));
    
    // Bind UI elements
    this.playBtn = document.getElementById('playPause');
    this.resetBtn = document.getElementById('reset');
    this.speedSlider = document.getElementById('speed');
    this.volumeSlider = document.getElementById('volume');
    this.waveTypeSelect = document.getElementById('waveType');
    this.stepDisplay = document.getElementById('stepCount');
    this.timeDisplay = document.getElementById('elapsedTime');
    this.rulePreset = document.getElementById('rulePreset');
    this.ruleInput = document.getElementById('ruleInput');
    this.modeDiscovery = document.getElementById('modeDiscovery');
    this.modeSimulation = document.getElementById('modeSimulation');
    this.stepBackBtn = document.getElementById('stepBack');
    this.stepForwardBtn = document.getElementById('stepForward');
    this.soundToggleBtn = document.getElementById('soundToggle');

    // Events
    this.playBtn.addEventListener('click', onPlayPause);
    this.resetBtn.addEventListener('click', onReset);
    this.speedSlider.addEventListener('input', (e) => onSpeedChange(e.target.value));
    this.volumeSlider.addEventListener('input', (e) => onVolumeChange(e.target.value));
    this.waveTypeSelect.addEventListener('change', (e) => onWaveTypeChange(e.target.value));
    
    // Sound Toggle
    this.soundToggleBtn.addEventListener('click', () => {
      const isEnabled = onSoundToggle();
      this.soundToggleBtn.textContent = isEnabled ? '🔊' : '🔇';
    });

    // Step Events
    this.stepBackBtn.addEventListener('click', () => onStepAction('BACK'));
    this.stepForwardBtn.addEventListener('click', () => onStepAction('FORWARD'));
    
    // Mode Events
    this.modeDiscovery.addEventListener('click', () => {
      this.setActiveMode('Discovery');
      onModeChange('DISCOVERY');
    });
    this.modeSimulation.addEventListener('click', () => {
      this.setActiveMode('Simulation');
      onModeChange('SIMULATION');
    });
    
    // Rule Events
    this.rulePreset.addEventListener('change', (e) => {
      const selected = e.target.value;
      this.ruleInput.value = selected;
      onRuleChange(selected);
    });
    
    this.ruleInput.addEventListener('input', (e) => {
      onRuleChange(e.target.value.toUpperCase().replace(/[^LR]/g, ''));
    });
  }

  initPresets(presets) {
    this.rulePreset.innerHTML = presets.map(p => `<option value="${p.rules}">${p.name}</option>`).join('');
    this.ruleInput.value = presets[0].rules;
  }

  update() {
    this.stepDisplay.textContent = `Steps: ${this.engine.steps.toLocaleString()}`;
    this.timeDisplay.textContent = `Time: ${this.formatTime(this.engine.elapsedTime)}`;
    this.playBtn.textContent = this.engine.isPaused ? '▶ Play' : '⏸ Pause';
  }

  setActiveMode(mode) {
    this.modeDiscovery.classList.toggle('active', mode === 'Discovery');
    this.modeSimulation.classList.toggle('active', mode === 'Simulation');
  }

  formatTime(ms) {
    const totalSeconds = ms / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const hundredths = Math.floor((ms % 1000) / 10);

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}`;
  }
}
