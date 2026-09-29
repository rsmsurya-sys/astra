/**
 * ARUNA STATION: Complete Narrative Database
 * In-game codex, dossiers, 31 audio logs, endings, and profile definitions.
 */

window.NARRATIVE_DATA = {
  // 6 Character Dossiers
  crewDossiers: [
    {
      id: "aiden",
      name: "Dr. Aiden Okafor",
      role: "Rescue Mission Commander",
      age: 39,
      agency: "ESA / NASA Joint Ops",
      bio: "Acoustic engineer and deep space triage lead. Specializes in non-optical sonar navigation and high-stress isolation crises.",
      status: "ACTIVE (Commander)"
    },
    {
      id: "chen",
      name: "Captain Sarah Chen",
      role: "Base Mission Commander",
      age: 44,
      agency: "NASA",
      bio: "Expedition 04 Commander. Refused evacuation when the crater anomaly was discovered, believing understanding it was humanity's destiny.",
      status: "CRITICAL (Command Deck)"
    },
    {
      id: "murthy",
      name: "Dr. James Murthy",
      role: "Chief Planetary Geologist",
      age: 51,
      agency: "ISRO",
      bio: "Discovered the 432 Hz vibrating crystalline lattice under 200m of polar ice. Convinced the entity is a stellar communications gateway.",
      status: "ISOLATED (Deep Lab)"
    },
    {
      id: "tanaka",
      name: "Engineer Yuki Tanaka",
      role: "Chief Reactor Systems Specialist",
      age: 34,
      agency: "JAXA",
      bio: "Tokamak fusion specialist. Discovered the entity feeds on the acoustic turbine hum of the reactor core.",
      status: "BARRICADED (Engineering)"
    },
    {
      id: "patel",
      name: "Dr. Kavya Patel",
      role: "Base Physician & Biometeorologist",
      age: 37,
      agency: "ISRO / UN Space Board",
      bio: "Station doctor who sacrificed her suit integrity to shield Yuki during hull decompression. Currently in failing medical pod.",
      status: "CRITICAL (Medical Bay)"
    },
    {
      id: "stasis_crew",
      name: "Marcus Vance & Elena Rostova",
      role: "Security & EVA Specialists",
      age: "32 & 29",
      agency: "USSF & Roscosmos",
      bio: "First to map the subterranean cavern and encounter acoustic barotrauma. Placed in cryogenic stasis pods 03 & 04.",
      status: "METABOLIC STASIS (Deck B)"
    }
  ],

  // 31 Restored Audio Logs
  audioLogs: [
    // Command Deck
    {
      id: "CMD-01",
      cat: "COMMAND",
      speaker: "Captain Sarah Chen",
      date: "Feb 18, 2047",
      title: "The Storm Warning",
      text: "Solar flare at L1 is heading down the lunar orbital plane. We retracted solar arrays 3 and 4, cutting our budget by 40%. We have to decide: Murthy's deep drill or life support. Easy choice. Life comes first.",
      meta: "Bridge Console Alpha // 08:14 UTC"
    },
    {
      id: "CMD-02",
      cat: "COMMAND",
      speaker: "Captain Sarah Chen",
      date: "Feb 24, 2047",
      title: "The Diverted Watt",
      text: "I reversed my call. Murthy brought a core sample vibrating at 432 Hz. There is an artificial superstructure in the crater. I diverted power to keep the borehole energized. Yuki is furious, but Aruna will make history.",
      meta: "Observation Deck // 19:42 UTC"
    },
    {
      id: "CMD-03",
      cat: "COMMAND",
      speaker: "Captain Sarah Chen",
      date: "March 02, 2047",
      title: "Acoustic Shadows",
      text: "Sound is behaving unnaturally. Dropped tools echo three seconds late from different rooms. The bedrock is ringing like a giant tuning fork. We aren't sleeping. Everyone hears footsteps in empty halls.",
      meta: "Corridor Beta // 02:15 UTC"
    },
    {
      id: "CMD-04",
      cat: "COMMAND",
      speaker: "Captain Sarah Chen",
      date: "March 09, 2047",
      title: "The Stasis Order",
      text: "Scrubbers dropped to 17%. As commander, I ordered Marcus and Elena into cryo-stasis to conserve oxygen. Marcus wanted his shotgun ready, but sleep is their only survival chance. Four of us remain awake.",
      meta: "Cryo Bay Deck B // 11:30 UTC"
    },
    {
      id: "CMD-05",
      cat: "COMMAND",
      speaker: "Captain Sarah Chen",
      date: "March 12, 2047",
      title: "Every Choice Has an Echo",
      text: "If Houston sends rescue: do not trust optical feeds. Use your acoustic sonar. But whatever sound you emit, the entity will hear. It's curious. If you're going to save us, be quiet. Every choice has an echo.",
      meta: "Emergency Hub // 23:58 UTC"
    },

    // Science & Lab
    {
      id: "SCI-01",
      cat: "SCIENCE",
      speaker: "Dr. James Murthy",
      date: "Feb 14, 2047",
      title: "The Anomaly at 200 Meters",
      text: "Drill bit 7 shattered at 214 meters. Adhered to the carbide teeth was metallic glass. Perfectly flat, molecularly uniform, non-lunar. Its isotopic ratios don't match any solar system meteorite.",
      meta: "Sub-Floor Drill // 14:20 UTC"
    },
    {
      id: "SCI-02",
      cat: "SCIENCE",
      speaker: "Dr. James Murthy",
      date: "Feb 20, 2047",
      title: "The 432 Hz Resonance",
      text: "Listen to that tone. The sample in the vacuum jar started singing under a 2-Tesla field. A pure, clean A-natural at 432 Hz. Why would an ancient buried artifact vibrate at a harmonic musical pitch?",
      meta: "Spectroscopy Lab // 21:05 UTC"
    },
    {
      id: "SCI-03",
      cat: "SCIENCE",
      speaker: "Dr. James Murthy",
      date: "Feb 27, 2047",
      title: "Geometric Seeding",
      text: "Ground radar scans show concentric hexagonal rings 12 kilometers across beneath the crater. A giant acoustic diaphragm. Ruins are dead; this structure has active impedance. It's waiting for resonance.",
      meta: "Planetary Analysis // 16:40 UTC"
    },
    {
      id: "SCI-04",
      cat: "SCIENCE",
      speaker: "Dr. James Murthy",
      date: "March 05, 2047",
      title: "The Wake-Up Call",
      text: "We made an irreparable mistake. We pulsed 50kW of RF acoustic energy down the shaft. The response was a violent harmonic back-wave. An acoustic entity separated from the rock and rose into our pylons. It woke up.",
      meta: "Borehole Shaft // 04:12 UTC"
    },
    {
      id: "SCI-05",
      cat: "SCIENCE",
      speaker: "Dr. James Murthy",
      date: "March 10, 2047",
      title: "The Mirror Mind",
      text: "I tested it with sonar pings: three short, two long. The walls answered with the exact rhythm inverted in pitch. It’s an acoustic consciousness. It interprets our sounds as speech.",
      meta: "Lab Isolation // 08:33 UTC"
    },
    {
      id: "SCI-06",
      cat: "SCIENCE",
      speaker: "Dr. James Murthy",
      date: "March 13, 2047",
      title: "The Meridian Signal Drive",
      text: "I've encrypted all raw telemetry onto the portable drive. It points to the Gliese 667 system. They were here before mankind walked upright. Do not wipe this data. Let Earth decide.",
      meta: "Lab Mainframe // 01:10 UTC"
    },

    // Engineering & Reactor
    {
      id: "ENG-01",
      cat: "ENGINEERING",
      speaker: "Engineer Yuki Tanaka",
      date: "Feb 19, 2047",
      title: "Load Shedding",
      text: "Chen shunted 40% of reactor output to the drill. The Tokamak magnetic field requires 120kW continuous bias. If we melt down into a puddle of radioactive glass, at least Murthy will have his rocks.",
      meta: "Reactor Control // 10:15 UTC"
    },
    {
      id: "ENG-02",
      cat: "ENGINEERING",
      speaker: "Engineer Yuki Tanaka",
      date: "Feb 28, 2047",
      title: "Harmonic Stress in Coolant",
      text: "Coolant loop Beta is vibrating at 50 Hz. Three weld joints sheared. The entire base is resting on an enormous tuning fork. If this continues, the reactor vessel will crack by next week.",
      meta: "Coolant Manifold // 13:45 UTC"
    },
    {
      id: "ENG-03",
      cat: "ENGINEERING",
      speaker: "Engineer Yuki Tanaka",
      date: "March 06, 2047",
      title: "It Lives in the Core",
      text: "I looked through the quartz window. It's perched on the magnetic coils—a swirling cloud of violet dust and sound waves. It feeds on the turbine hum. To it, our reactor sounds like a lullaby.",
      meta: "Observation Gallery // 18:22 UTC"
    },
    {
      id: "ENG-04",
      cat: "ENGINEERING",
      speaker: "Engineer Yuki Tanaka",
      date: "March 11, 2047",
      title: "Kavya's Tourniquet",
      text: "Kavya shielded me when a pressure wave blew the hatches off. Her visor cracked. She’s bleeding in the med bay. If the rescue team reaches Engineering: the manual scram code is 9-9-4-Echo.",
      meta: "Lockout Bay // 15:50 UTC"
    },
    {
      id: "ENG-05",
      cat: "ENGINEERING",
      speaker: "Engineer Yuki Tanaka",
      date: "March 13, 2047",
      title: "The Overload Option",
      text: "I wired a bypass into the deuterium injector. If the creature tries to follow us onto the shuttle, blow the torus. 50-megajoule plasma fireball. It will vaporize the station. Pray we don't need it.",
      meta: "Aux Conduit // 03:05 UTC"
    },

    // Medical Bay
    {
      id: "MED-01",
      cat: "MEDICAL",
      speaker: "Dr. Kavya Patel",
      date: "March 01, 2047",
      title: "Hypobaric Delirium",
      text: "Both Vance and Murthy reported severe auditory hallucinations. Vance heard his daughter singing from the air vents. EEG scans show massive theta-wave synchronization from the station's magnetic pulse.",
      meta: "Infirmary // 07:11 UTC"
    },
    {
      id: "MED-02",
      cat: "MEDICAL",
      speaker: "Dr. Kavya Patel",
      date: "March 07, 2047",
      title: "Acoustic Barotrauma",
      text: "Treated Elena for ruptured eardrums. The seismic discharge transmitted through her boot soles into her skull. The human skeleton acts as an acoustic amplifier in a rigid suit.",
      meta: "Trauma Ward // 20:30 UTC"
    },
    {
      id: "MED-03",
      cat: "MEDICAL",
      speaker: "Dr. Kavya Patel",
      date: "March 09, 2047",
      title: "Cryo Pod Calibration",
      text: "Vance and Elena are safely induced into metabolic stasis at 4°C. O2 expenditure drops by 55%, buying Sarah, Yuki, James, and me 4 days. If rescue is delayed past 90h, pods will vent nitrogen.",
      meta: "Stasis Bay 2 // 12:45 UTC"
    },
    {
      id: "MED-04",
      cat: "MEDICAL",
      speaker: "Dr. Kavya Patel",
      date: "March 11, 2047",
      title: "Visor Breach",
      text: "I've sealed myself inside Pod B. Visor seal failed during decomp. Barotrauma to right lung. Yuki made it to Engineering; that's what matters. Okafor: do not sacrifice your mission for me.",
      meta: "Hyperbaric Pod B // 16:30 UTC"
    },
    {
      id: "MED-05",
      cat: "MEDICAL",
      speaker: "Dr. Kavya Patel",
      date: "March 12, 2047",
      title: "The Triage of Tomorrow",
      text: "In medical triage, black means you comfort them and save who you can. Aruna is a black tag. But what we found here... that's the green tag for humanity. Don't let our deaths be meaningless.",
      meta: "Medical Pod B // 21:15 UTC"
    },

    // Security & Recon
    {
      id: "SEC-01",
      cat: "SECURITY",
      speaker: "Specialist Marcus Vance",
      date: "March 04, 2047",
      title: "Lockdown Protocol 9",
      text: "Condition Yellow declared. Distributed non-lethal sonic crowd dispersal rifles. Firearms are suicidal in pressurized lunar modules. Let's see how whatever is in the vents likes 140 decibels.",
      meta: "Security Armory // 15:00 UTC"
    },
    {
      id: "SEC-02",
      cat: "SECURITY",
      speaker: "Specialist Elena Rostova",
      date: "March 06, 2047",
      title: "The Shadow in the Dust",
      text: "Dust around the borehole has organized into concentric ripples like iron filings. Above the rim, a silhouette moved against solar wind. I pinged it with a laser; the beam reflected as a sound wave in my helmet.",
      meta: "Airlock 3 Vestibule // 02:40 UTC"
    },
    {
      id: "SEC-03",
      cat: "SECURITY",
      speaker: "Specialist Marcus Vance",
      date: "March 07, 2047",
      title: "Sonic Weapons Ineffective",
      text: "DO NOT FIRE THE SONIC RIFLES! I cornered it in storage and fired point blank. It fed on the sound, expanded into a blinding purple cloud, and blew out the reinforced windows. Sound is its element.",
      meta: "Corridor Charlie // 19:15 UTC"
    },
    {
      id: "SEC-04",
      cat: "SECURITY",
      speaker: "Specialist Marcus Vance",
      date: "March 08, 2047",
      title: "Barricade Deck B",
      text: "Welded the pressure door to Deck B. My oxygen meter says 4 hours left. Elena is already asleep in Pod 4. It can't open welded doors with brute force; it seeps through vents. Check your ducts.",
      meta: "Stasis Airlock // 22:10 UTC"
    },
    {
      id: "SEC-05",
      cat: "SECURITY",
      speaker: "Specialist Elena Rostova",
      date: "March 09, 2047",
      title: "Elena's Last Note",
      text: "To my brother Mikhail in St. Petersburg: we looked into the deep crater and discovered the universe isn't cold and empty. It's vibrating with life. Sleep is coming now. Bring us home, Aiden.",
      meta: "Stasis Pod 04 // 10:50 UTC"
    },

    // System Telemetry & Entity Echoes
    {
      id: "AUT-01",
      cat: "SYSTEM",
      speaker: "Station AI Telemetry",
      date: "March 05, 2047",
      title: "Seismic Event Waveform",
      text: "Subsurface displacement at -214m. Waveform matches mathematical modulation of prime number intervals. Source does not correlate with tectonic shearing.",
      meta: "Seismic Array 04 // 04:12 UTC"
    },
    {
      id: "AUT-02",
      cat: "SYSTEM",
      speaker: "Acoustic Pickup",
      date: "March 08, 2047",
      title: "Curiosity Echo Mimicry",
      text: "Target emitting low-amplitude frequency modulation mimicking human cardiac cycle (72 BPM) through habitat structural beams.",
      meta: "Hab Deck B Sensor // 17:04 UTC"
    },
    {
      id: "AUT-03",
      cat: "SYSTEM",
      speaker: "Station AI Alert",
      date: "March 10, 2047",
      title: "Acoustic Sensor Overload",
      text: "Sound pressure exceeded 165 dB in Sector 3. Primary breaker 03 tripped by physical vibration displacement following pneumatic wrench discharges.",
      meta: "Sector 3 Breaker // 03:22 UTC"
    },
    {
      id: "AUT-04",
      cat: "SYSTEM",
      speaker: "Station AI Telemetry",
      date: "March 14, 2047",
      title: "Hypoxic Forecast",
      text: "Total breathable oxygen: 1,420 liters. Degradation rate: 18 L/h. Irreversible hypoxic asphyxiation in 78 hours. Stasis pod secondary reserve: 34%.",
      meta: "Life Support Telemetry // 06:00 UTC"
    },
    {
      id: "AUT-05",
      cat: "SYSTEM",
      speaker: "Sub-Crater Resonance",
      date: "March 15, 2047",
      title: "The First Contact Harmonic",
      text: "Polyphonic crystalline chime at 432 Hz, 864 Hz, 1296 Hz. Translation: WE HEAR YOUR SOUND. WE ARE AWAKE. RESPOND IN HARMONY OR BE DISSOLVED.",
      meta: "Shackleton Mantle Array // 00:01 UTC"
    }
  ],

  // 6 Branching Endings
  endings: [
    {
      id: 1,
      title: "ENDING 1: THE RESCUE",
      achievement: "🏆 SHEPHERD",
      score: 800,
      text: "You returned to Earth with 5 surviving crew members. The data was lost in the reactor scuttling, but humanity survived. Captain Chen and the survivors see sunlight again. Is human life worth more than ancient knowledge? For you, the answer will always be yes."
    },
    {
      id: 2,
      title: "ENDING 2: THE DISCOVERY",
      achievement: "🏆 PIONEER",
      score: 900,
      text: "The extraction shuttle accelerated into Earth orbit with Dr. Murthy's Meridian data drive secured. Proof of ancient extraterrestrial intelligence ignites a global scientific revolution. Those lost at Aruna Station will have their names carved onto humanity's first starships."
    },
    {
      id: 3,
      title: "ENDING 3: THE SACRIFICE",
      achievement: "🏆 THE LAST GUARDIAN",
      score: 850,
      text: "You stayed behind in the Tokamak chamber, turning the seized manual dog-latches to overload the core. The crew escaped on Hermes IV with the data. As the Cherenkov whiteout consumed you, the Entity mirrored your heartbeat. A titanium memorial at Shackleton Rim honors your sacrifice forever."
    },
    {
      id: 4,
      title: "ENDING 4: COMMUNICATION (FIRST CONTACT)",
      achievement: "🏆 FIRST CONTACT",
      score: 950,
      text: "You modulated your acoustic pings to 432 Hz harmonic fifths. The Entity pacified, returning power to Aruna Base. It was never a beast—it was a cosmic guardian terrified by our violent noise. When humanity stopped shouting and listened, the stars opened up."
    },
    {
      id: 5,
      title: "ENDING 5: THE BURDEN",
      achievement: "🏆 HAUNTED",
      score: 600,
      text: "You escaped alone with the Meridian data drive. Earth celebrates the discovery with ticker-tape parades, but in the dark of night, you still hear the cryo pods venting into vacuum. The data is worth billions, but your soul stayed in Shackleton Crater."
    },
    {
      id: 6,
      title: "ENDING 6: TOTAL FAILURE",
      achievement: "🏆 TRAGEDY",
      score: 200,
      text: "Every critical system failed. The crew perished, the data burned, and Hermes IV drifts pilotless through lunar orbit with the Entity on board, accelerating toward Earth. In the static silence, a single 432 Hz chime rings: 'Why did you wake what was sleeping?'"
    }
  ]
};
