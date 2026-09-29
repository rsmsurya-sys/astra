/**
 * ARUNA STATION: Game State & Decision Engine
 * Manages 3S matrix computation, gameplay progression, telemetry, and ending calculation.
 */

class GameStateManager {
  constructor() {
    this.currentView = 'intro';
    
    // Strategy choices
    this.strategy = {
      entry: 'B',          // A = Main Dock, B = Airlock 3
      resources: 'B',      // A = Rescue (60), B = Hybrid (50), C = Survival (40)
      priorities: ['A', 'B'] // Max 2 of A, B, C
    };

    // 3S Matrix Vector
    this.matrix = {
      science: 75,
      survival: 60,
      society: 85,
      archetype: "THE IDEALIST",
      subTitle: "HIGH SCIENCE // BALANCED SURVIVAL // HIGH SOCIETY",
      desc: "Your profile favors human life and recovering ancient knowledge. Entry via Airlock 3 ensures environmental stability, but demands acoustic stealth."
    };

    // Survival Phase In-Game Telemetry
    this.survival = {
      o2: 100,
      battery: 100,
      pingReady: true,
      clockSeconds: 90 * 3600, // 90 hours
      crew: {
        chen: false,
        murthy: false,
        tanaka: false,
        patel: false,
        stasis: false
      },
      dataSecured: false,
      reactorCalibrated: false,
      entityState: 'dormant', // 'dormant', 'curious', 'hunting', 'pacified'
      confrontationChoice: null
    };

    this.recalculateMatrix();
  }

  setEntry(val) {
    this.strategy.entry = val;
    this.recalculateMatrix();
  }

  setResources(val) {
    this.strategy.resources = val;
    this.recalculateMatrix();
  }

  togglePriority(val) {
    const idx = this.strategy.priorities.indexOf(val);
    if (idx > -1) {
      if (this.strategy.priorities.length > 1) {
        this.strategy.priorities.splice(idx, 1);
      }
    } else {
      if (this.strategy.priorities.length >= 2) {
        this.strategy.priorities.shift();
      }
      this.strategy.priorities.push(val);
    }
    this.recalculateMatrix();
  }

  recalculateMatrix() {
    let sci = 50;
    let sur = 50;
    let soc = 50;

    // Entry factor
    if (this.strategy.entry === 'A') {
      sci += 15;
      sur -= 10;
      soc -= 5;
    } else {
      sci -= 5;
      sur += 15;
      soc += 10;
    }

    // Resources factor
    if (this.strategy.resources === 'A') {
      soc += 30;
      sci -= 15;
      sur -= 15;
    } else if (this.strategy.resources === 'B') {
      sci += 15;
      sur += 10;
      soc += 10;
    } else if (this.strategy.resources === 'C') {
      sur += 35;
      soc -= 25;
      sci += 10;
    }

    // Priorities
    if (this.strategy.priorities.includes('A')) soc += 20;
    if (this.strategy.priorities.includes('B')) sci += 20;
    if (this.strategy.priorities.includes('C')) sur += 20;

    this.matrix.science = Math.min(100, Math.max(10, sci));
    this.matrix.survival = Math.min(100, Math.max(10, sur));
    this.matrix.society = Math.min(100, Math.max(10, soc));

    // Profile Archetype Resolution
    if (this.matrix.society >= 70 && this.matrix.science >= 70) {
      this.matrix.archetype = "THE IDEALIST";
      this.matrix.subTitle = "HIGH SCIENCE // BALANCED SURVIVAL // HIGH SOCIETY";
      this.matrix.desc = "You balance the moral duty to rescue every human life with an unwavering drive to preserve the greatest discovery of our era.";
    } else if (this.matrix.society >= 70 && this.matrix.survival >= 70) {
      this.matrix.archetype = "THE GUARDIAN";
      this.matrix.subTitle = "HIGH SURVIVAL // HIGH SOCIETY // LOW SCIENCE";
      this.matrix.desc = "Crew survival and colony preservation are paramount. Scientific glory takes a back seat to keeping people alive.";
    } else if (this.matrix.survival >= 70 && this.matrix.society < 50) {
      this.matrix.archetype = "THE PRAGMATIST";
      this.matrix.subTitle = "HIGH SURVIVAL // MODERATE SCIENCE // LOW SOCIETY";
      this.matrix.desc = "Cold calculation rules your command. You refuse to throw away rescue resources on lost causes.";
    } else if (this.matrix.science >= 75 && this.matrix.society < 55) {
      this.matrix.archetype = "THE SCIENTIST";
      this.matrix.subTitle = "MAXIMUM SCIENCE // LOW CREW TRIAGE";
      this.matrix.desc = "The Meridian Signal represents an epochal cosmic event. Human lives are temporary; truth is eternal.";
    } else {
      this.matrix.archetype = "THE PIONEER";
      this.matrix.subTitle = "BALANCED TACTICAL // EXPEDITION LEAD";
      this.matrix.desc = "A balanced approach adapting to the realities of an acoustic nightmare in the dark of Shackleton Crater.";
    }
  }

  // Calculate final mission result
  computeEnding() {
    const choice = this.survival.confrontationChoice;
    let crewCount = 0;
    if (this.survival.crew.chen) crewCount++;
    if (this.survival.crew.murthy) crewCount++;
    if (this.survival.crew.tanaka) crewCount++;
    if (this.survival.crew.patel) crewCount++;
    if (this.survival.crew.stasis) crewCount += 2;

    const dataSecured = this.survival.dataSecured;

    // Ending 4: Communication / First Contact
    if (choice === 'communicate') {
      return {
        ending: window.NARRATIVE_DATA.endings[3],
        score: 950 + (crewCount * 10),
        crewSaved: Math.max(crewCount, 4),
        data: dataSecured ? "SECURED" : "ARCHIVED",
        entity: "PACIFIED / ALLY"
      };
    }

    // Ending 3: The Sacrifice
    if (choice === 'overload') {
      return {
        ending: window.NARRATIVE_DATA.endings[2],
        score: 850 + (crewCount * 15),
        crewSaved: crewCount,
        data: dataSecured ? "SECURED" : "LOST",
        entity: "CONTAINED (OVERLOAD)"
      };
    }

    // Ending 6: Failure
    if (this.survival.o2 <= 0 || (choice === 'fight' && crewCount <= 1)) {
      return {
        ending: window.NARRATIVE_DATA.endings[5],
        score: 180,
        crewSaved: 0,
        data: "DESTROYED",
        entity: "ESCAPED TO SHUTTLE"
      };
    }

    // Ending 1: Rescue
    if (crewCount >= 4 && !dataSecured) {
      return {
        ending: window.NARRATIVE_DATA.endings[0],
        score: 800 + (crewCount * 20),
        crewSaved: crewCount,
        data: "LOST IN CORE",
        entity: "EVADED"
      };
    }

    // Ending 2: Discovery
    if (crewCount >= 3 && dataSecured) {
      return {
        ending: window.NARRATIVE_DATA.endings[1],
        score: 900 + (crewCount * 10),
        crewSaved: crewCount,
        data: "SECURED",
        entity: "ACTIVE ON MOON"
      };
    }

    // Ending 5: The Burden
    return {
      ending: window.NARRATIVE_DATA.endings[4],
      score: 600,
      crewSaved: Math.min(crewCount, 1),
      data: dataSecured ? "SECURED" : "LOST",
      entity: "UNRESOLVED"
    };
  }
}

window.gameState = new GameStateManager();
