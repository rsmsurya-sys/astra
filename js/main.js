/**
 * ARUNA STATION: Main Application & UI Controller
 * Orchestrates views, modals, event listeners, codex renderer, and state transitions.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const viewIntro = document.getElementById('view-intro');
  const viewStrategy = document.getElementById('view-strategy');
  const viewSurvival = document.getElementById('view-survival');
  const viewEnding = document.getElementById('view-ending');

  // Switch View Helper
  function switchView(viewName) {
    [viewIntro, viewStrategy, viewSurvival, viewEnding].forEach(el => el.classList.remove('active'));
    
    if (viewName === 'intro') viewIntro.classList.add('active');
    else if (viewName === 'strategy') viewStrategy.classList.add('active');
    else if (viewName === 'survival') {
      viewSurvival.classList.add('active');
      
      // Initialize 2D Radar Simulation
      if (!window.radarEngine) {
        window.radarEngine = new RadarEngine('radar-canvas');
      }
      window.radarEngine.start();

      // Initialize 3D Realistic Station Engine
      if (!window.station3D && window.Station3DEngine) {
        window.station3D = new Station3DEngine('viewport-3d-wrapper');
      }
      if (window.station3D) {
        window.station3D.start();
      }
    } else if (viewName === 'ending') {
      if (window.radarEngine) window.radarEngine.stop();
      if (window.station3D) window.station3D.stop();
      viewEnding.classList.add('active');
      renderEndingScreen();
    }
    window.gameState.currentView = viewName;
  }

  // 1. INTRO VIEW INTERACTIONS
  const btnStartStrategy = document.getElementById('btn-start-strategy');
  const btnPlayBriefing = document.getElementById('btn-play-briefing');
  const briefingTranscript = document.getElementById('briefing-transcript');

  if (btnStartStrategy) {
    btnStartStrategy.addEventListener('click', () => {
      window.soundEngine.init();
      window.soundEngine.playTerminalBeep();
      switchView('strategy');
      updateStrategyUI();
    });
  }

  if (btnPlayBriefing) {
    btnPlayBriefing.addEventListener('click', () => {
      window.soundEngine.init();
      window.soundEngine.playTerminalBeep();
      window.soundEngine.playEntityHarmonic(false);

      // Visual typewriter effect
      briefingTranscript.innerText = "";
      const fullText = "\"Houston, we had to make a choice. The storm was coming faster than predicted. We diverted resources from the research lab to the power system... It was the right call at the time. But then we discovered something in the deep crater that changed everything. We needed that lab. Now the power is failing. And something... something is moving through the station. Every decision matters. Every choice has a cost.\"";
      let i = 0;
      const typeInterval = setInterval(() => {
        briefingTranscript.innerText += fullText.charAt(i);
        i++;
        if (i % 6 === 0) window.soundEngine.playGeiger();
        if (i >= fullText.length) clearInterval(typeInterval);
      }, 25);
    });
  }

  // 2. STRATEGY VIEW INTERACTIONS
  function updateStrategyUI() {
    const s = window.gameState.strategy;
    const m = window.gameState.matrix;

    // Entry selection
    document.querySelectorAll('.option-card[data-group="entry"]').forEach(card => {
      card.classList.toggle('selected', card.getAttribute('data-val') === s.entry);
    });

    // Resources selection
    document.querySelectorAll('.option-card[data-group="resources"]').forEach(card => {
      card.classList.toggle('selected', card.getAttribute('data-val') === s.resources);
    });

    // Priority Checkboxes
    document.querySelectorAll('.priority-box').forEach(box => {
      const pri = box.getAttribute('data-pri');
      const isChecked = s.priorities.includes(pri);
      box.classList.toggle('checked', isChecked);
      const input = box.querySelector('input');
      if (input) input.checked = isChecked;
    });

    // Profile Bars & Name
    document.getElementById('profile-name').innerText = m.archetype;
    document.getElementById('profile-sub').innerText = m.subTitle;
    document.getElementById('profile-desc').innerText = m.desc;

    document.getElementById('score-sci').innerText = m.science + '%';
    document.getElementById('bar-sci').style.width = m.science + '%';

    document.getElementById('score-sur').innerText = m.survival + '%';
    document.getElementById('bar-sur').style.width = m.survival + '%';

    document.getElementById('score-soc').innerText = m.society + '%';
    document.getElementById('bar-soc').style.width = m.society + '%';
  }

  // Decision Card Clicks
  document.querySelectorAll('.option-card').forEach(card => {
    card.addEventListener('click', () => {
      window.soundEngine.playTerminalBeep();
      const group = card.getAttribute('data-group');
      const val = card.getAttribute('data-val');
      if (group === 'entry') window.gameState.setEntry(val);
      if (group === 'resources') window.gameState.setResources(val);
      updateStrategyUI();
    });
  });

  // Priority Box Clicks
  document.querySelectorAll('.priority-box').forEach(box => {
    box.addEventListener('click', (e) => {
      e.preventDefault();
      window.soundEngine.playTerminalBeep();
      const pri = box.getAttribute('data-pri');
      window.gameState.togglePriority(pri);
      updateStrategyUI();
    });
  });

  // Launch Mission
  const btnLaunch = document.getElementById('btn-launch-mission');
  if (btnLaunch) {
    btnLaunch.addEventListener('click', () => {
      window.soundEngine.playKlaxon();
      switchView('survival');
    });
  }

  // 3. SURVIVAL VIEW CONTROLS
  const btnPing = document.getElementById('btn-trigger-ping');
  if (btnPing) {
    btnPing.addEventListener('click', () => {
      if (window.station3D) window.station3D.triggerSonarPing3D();
      if (window.radarEngine) window.radarEngine.triggerPing();
    });
  }

  // 3D Camera Mode Toggle (1st Person vs 3rd Person)
  const btnToggleCam = document.getElementById('btn-toggle-cam');
  if (btnToggleCam) {
    btnToggleCam.addEventListener('click', () => {
      if (window.station3D) window.station3D.toggleCameraMode();
    });
  }

  // 3D Flashlight Toggle
  const btnToggleFlashlight = document.getElementById('btn-toggle-flashlight');
  if (btnToggleFlashlight) {
    btnToggleFlashlight.addEventListener('click', () => {
      if (window.station3D) window.station3D.toggleFlashlight();
    });
  }

  // Viewmode Toggle: 3D Realistic vs 2D Radar
  const btnToggleViewmode = document.getElementById('btn-toggle-viewmode');
  const view3DWrapper = document.getElementById('viewport-3d-wrapper');
  const miniRadarWrapper = document.getElementById('mini-radar-wrapper');
  const viewModeText = document.getElementById('view-mode-text');

  if (btnToggleViewmode) {
    btnToggleViewmode.addEventListener('click', () => {
      window.soundEngine.playTerminalBeep();
      const is3D = !view3DWrapper.classList.contains('hidden');
      if (is3D) {
        // Switch to full 2D Radar
        view3DWrapper.classList.add('hidden');
        miniRadarWrapper.classList.remove('mini-radar-docked');
        miniRadarWrapper.classList.add('mini-radar-full');
        btnToggleViewmode.classList.remove('active-mode');
        if (viewModeText) viewModeText.innerText = "MODE: 2D RADAR";
      } else {
        // Switch to 3D Realistic
        view3DWrapper.classList.remove('hidden');
        miniRadarWrapper.classList.add('mini-radar-docked');
        miniRadarWrapper.classList.remove('mini-radar-full');
        btnToggleViewmode.classList.add('active-mode');
        if (viewModeText) viewModeText.innerText = "MODE: 3D REAL";
      }
    });
  }

  // Expand / Dock Mini-Radar Button
  const btnExpandRadar = document.getElementById('btn-expand-radar');
  if (btnExpandRadar) {
    btnExpandRadar.addEventListener('click', () => {
      window.soundEngine.playTerminalBeep();
      if (miniRadarWrapper.classList.contains('mini-radar-docked')) {
        miniRadarWrapper.classList.remove('mini-radar-docked');
        miniRadarWrapper.classList.add('mini-radar-full');
        btnExpandRadar.innerText = "⤡ DOCK";
      } else {
        miniRadarWrapper.classList.add('mini-radar-docked');
        miniRadarWrapper.classList.remove('mini-radar-full');
        btnExpandRadar.innerText = "⤢ EXPAND";
      }
    });
  }

  // Close Terminal Modal
  const btnCloseTerm = document.getElementById('btn-close-terminal');
  if (btnCloseTerm) {
    btnCloseTerm.addEventListener('click', () => {
      document.getElementById('terminal-interaction-modal').classList.add('hidden');
    });
  }

  // 4. CLIMAX CONFRONTATION ACTIONS
  const confrontationModal = document.getElementById('modal-confrontation');
  const btnFight = document.getElementById('btn-choice-fight');
  const btnComm = document.getElementById('btn-choice-communicate');
  const btnOverload = document.getElementById('btn-choice-overload');

  if (btnFight) {
    btnFight.addEventListener('click', () => {
      window.soundEngine.playKlaxon();
      window.gameState.survival.confrontationChoice = 'fight';
      confrontationModal.classList.add('hidden');
      switchView('ending');
    });
  }

  if (btnComm) {
    btnComm.addEventListener('click', () => {
      window.soundEngine.playEntityHarmonic(true);
      window.gameState.survival.confrontationChoice = 'communicate';
      confrontationModal.classList.add('hidden');
      setTimeout(() => switchView('ending'), 1200);
    });
  }

  if (btnOverload) {
    btnOverload.addEventListener('click', () => {
      window.soundEngine.playKlaxon();
      window.gameState.survival.confrontationChoice = 'overload';
      confrontationModal.classList.add('hidden');
      setTimeout(() => switchView('ending'), 1200);
    });
  }

  // 5. ENDING SCREEN RENDERER
  function renderEndingScreen() {
    const outcome = window.gameState.computeEnding();
    const ending = outcome.ending;

    document.getElementById('ending-title').innerText = ending.title;
    document.getElementById('ending-badge').innerText = `ENDING ${ending.id} OF 6`;
    document.getElementById('ending-achievement').innerText = ending.achievement;
    document.getElementById('ending-text').innerText = ending.text;

    document.getElementById('final-score').innerText = outcome.score;
    document.getElementById('final-crew').innerText = `${outcome.crewSaved} / 6`;
    document.getElementById('final-data').innerText = outcome.data;
    document.getElementById('final-entity').innerText = outcome.entity;
  }

  const btnReplay = document.getElementById('btn-replay');
  if (btnReplay) {
    btnReplay.addEventListener('click', () => {
      window.location.reload();
    });
  }

  const btnViewAllEndings = document.getElementById('btn-view-all-endings');
  if (btnViewAllEndings) {
    btnViewAllEndings.addEventListener('click', () => {
      openCodex('tab-endings');
    });
  }

  // 6. CODEX & NARRATIVE ARCHIVE
  const modalCodex = document.getElementById('modal-codex');
  const btnCodex = document.getElementById('btn-codex');
  const btnCloseCodex = document.getElementById('btn-close-codex');

  function openCodex(tabId = 'tab-logs') {
    window.soundEngine.playTerminalBeep();
    modalCodex.classList.remove('hidden');
    switchCodexTab(tabId);
  }

  if (btnCodex) btnCodex.addEventListener('click', () => openCodex());
  if (btnCloseCodex) btnCloseCodex.addEventListener('click', () => modalCodex.classList.add('hidden'));

  // Tab switching in Codex
  document.querySelectorAll('.codex-tab-btn').forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
      const targetTab = tabBtn.getAttribute('data-tab');
      switchCodexTab(targetTab);
    });
  });

  function switchCodexTab(tabId) {
    document.querySelectorAll('.codex-tab-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-tab') === tabId);
    });
    document.querySelectorAll('.codex-tab-pane').forEach(p => {
      p.classList.toggle('active', p.id === tabId);
    });
  }

  // Populate Audio Logs
  const logsList = document.getElementById('logs-list');
  const displayTitle = document.getElementById('display-log-title');
  const displayMeta = document.getElementById('display-log-meta');
  const displayText = document.getElementById('display-log-text');
  const btnPlayLogAudio = document.getElementById('btn-play-log-audio');

  if (logsList && window.NARRATIVE_DATA) {
    logsList.innerHTML = '';
    window.NARRATIVE_DATA.audioLogs.forEach((log, idx) => {
      const btn = document.createElement('button');
      btn.className = 'log-item-btn' + (idx === 0 ? ' active' : '');
      btn.innerHTML = `
        <span class="log-item-id">${log.id} // ${log.speaker}</span>
        <span class="log-item-title">${log.title}</span>
      `;
      btn.addEventListener('click', () => {
        document.querySelectorAll('.log-item-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        displayTitle.innerText = `[${log.id}] ${log.title} — ${log.speaker}`;
        displayMeta.innerText = `${log.meta} // ${log.date}`;
        displayText.innerText = log.text;
        window.soundEngine.playTerminalBeep();
      });
      logsList.appendChild(btn);
    });

    // Default first log
    const firstLog = window.NARRATIVE_DATA.audioLogs[0];
    displayTitle.innerText = `[${firstLog.id}] ${firstLog.title} — ${firstLog.speaker}`;
    displayMeta.innerText = `${firstLog.meta} // ${firstLog.date}`;
    displayText.innerText = firstLog.text;
  }

  if (btnPlayLogAudio) {
    btnPlayLogAudio.addEventListener('click', () => {
      window.soundEngine.playTerminalBeep();
      window.soundEngine.playEntityHarmonic(true);
    });
  }

  // Populate Dossiers
  const dossiersGrid = document.getElementById('dossiers-container');
  if (dossiersGrid && window.NARRATIVE_DATA) {
    dossiersGrid.innerHTML = '';
    window.NARRATIVE_DATA.crewDossiers.forEach(d => {
      const card = document.createElement('div');
      card.className = 'dossier-card';
      card.innerHTML = `
        <h4>${d.name}</h4>
        <div class="dossier-role">${d.role} // ${d.agency} (Age ${d.age})</div>
        <p>${d.bio}</p>
        <div style="margin-top: 8px; font-family: var(--font-mono); font-size: 0.75rem; color: #4ade80;">STATUS: ${d.status}</div>
      `;
      dossiersGrid.appendChild(card);
    });
  }

  // Populate Endings Bible
  const endingsGrid = document.getElementById('endings-bible-container');
  if (endingsGrid && window.NARRATIVE_DATA) {
    endingsGrid.innerHTML = '';
    window.NARRATIVE_DATA.endings.forEach(e => {
      const card = document.createElement('div');
      card.className = 'ending-bible-card';
      card.innerHTML = `
        <h4>${e.title}</h4>
        <div class="achievement-pill" style="margin-bottom: 8px;">${e.achievement}</div>
        <p>${e.text}</p>
      `;
      endingsGrid.appendChild(card);
    });
  }

  // Audio Toggle
  const btnSound = document.getElementById('btn-sound-toggle');
  const soundIcon = document.getElementById('sound-icon');
  if (btnSound) {
    btnSound.addEventListener('click', () => {
      const active = window.soundEngine.toggleSound();
      btnSound.innerHTML = active ? '<span>🔊</span> AUDIO: ON' : '<span>🔇</span> AUDIO: OFF';
    });
  }

  // Mission Clock Countdown simulation
  let seconds = 90 * 3600;
  setInterval(() => {
    seconds = Math.max(0, seconds - 1);
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    const clockEl = document.getElementById('mission-clock');
    if (clockEl) clockEl.innerText = `${hrs}:${mins}:${secs}`;
  }, 1000);
});
