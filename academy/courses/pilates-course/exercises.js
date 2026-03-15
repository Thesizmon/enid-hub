// ═══════════════════════════════════════════════════════════════
//  ENID ACADEMY — Exercise Registry & Playlist Definitions
//  Single source of truth for all exercise data
// ═══════════════════════════════════════════════════════════════

const EXERCISES = {

  // ── FOUNDATIONS ──────────────────────────────────────────────

  'neutral-standing': {
    id: 'neutral-standing',
    title: 'Neutral Standing',
    subtitle: 'Posture · Foundations · Awareness',
    muscleTag: '🧍 Full Body · Alignment',
    category: 'Foundations',
    type: 'static',
    frameA: 'Full Body Avatar.png',
    frameB: null,
    sets: 1, reps: null, hold: '60s', interval: null,
    about: "Neutral standing is the starting point of all Pilates work. It teaches you to feel your body's natural alignment — balanced weight, soft knees, long spine, and an engaged core without gripping. Everything in Pilates flows from this awareness.",
    steps: [
      'Stand tall with feet hip-width apart, weight evenly spread across both feet.',
      'Soften your knees — never locked, never bent.',
      'Gently draw your lower belly in without holding your breath.',
      'Let your arms hang naturally at your sides, shoulders relaxed and wide.',
      'Imagine a thread pulling the crown of your head toward the ceiling.',
    ],
    cues: [
      { icon: '🧵', text: '"Imagine a thread from the crown of your head to the ceiling."' },
      { icon: '⚖️', text: '"Weight even across both feet — not rocking forward or back."' },
      { icon: '😮‍💨', text: '"Ribcage drops down and in — not flared or puffed."' },
      { icon: '🤲', text: '"Shoulders wide and heavy — not shrugged."' },
    ],
    primaryMuscles: ['Postural Muscles', 'Core Stabilisers'],
    secondaryMuscles: ['Glutes', 'Feet & Ankles'],
  },

  'supine-breathing': {
    id: 'supine-breathing',
    title: 'Supine Breathing',
    subtitle: 'Breathwork · Foundations · Awareness',
    muscleTag: '🫁 Diaphragm · Core',
    category: 'Foundations',
    type: 'static',
    frameA: 'Supine Breathing.png',
    frameB: null,
    sets: 1, reps: 10, hold: '4s', interval: null,
    about: 'Supine breathing is the cornerstone of Pilates. Lying on your back, you learn to breathe with your full rib cage — lateral expansion, belly release, and diaphragmatic engagement — building the foundation for all core work that follows.',
    steps: [
      'Lie flat on your back with knees bent, feet hip-width apart, arms by your sides.',
      'Place one hand on your chest and one on your lower ribs.',
      'Inhale slowly through your nose, feeling your ribs expand sideways.',
      'Exhale fully through parted lips, gently drawing your navel toward your spine.',
      'Repeat for 10 breaths, keeping your shoulders soft and heavy.',
    ],
    cues: [
      { icon: '🌬️', text: '"Breathe wide into your back and sides, not up into your chest."' },
      { icon: '🧘', text: '"Shoulders heavy, jaw soft, eyes closed."' },
      { icon: '🌊', text: '"Let the exhale be twice as long as the inhale."' },
      { icon: '🏔️', text: '"Spine stays neutral — don\'t flatten or arch."' },
    ],
    primaryMuscles: ['Diaphragm', 'Transverse Abdominis'],
    secondaryMuscles: ['Intercostals', 'Pelvic Floor'],
  },

  'neutral-spine': {
    id: 'neutral-spine',
    title: 'Neutral Spine',
    subtitle: 'Alignment · Foundations · Awareness',
    muscleTag: '🦴 Spine · Core',
    category: 'Foundations',
    type: 'static',
    frameA: 'Neutral Spine.png',
    frameB: null,
    sets: 1, reps: null, hold: '30s', interval: null,
    about: 'Neutral spine is the natural, unforced curve of your lower back in a supine position. It\'s not flat on the floor, and not arched — it\'s the "Goldilocks" position where your spine is supported and your deep core can work most efficiently.',
    steps: [
      'Lie on your back with knees bent, feet flat on the floor.',
      'Find the small natural space between your lower back and the mat.',
      'Notice the three bony points: pubic bone and two hip bones form a level triangle.',
      'This is neutral — hold it without gripping or forcing.',
      'All supine Pilates exercises begin and return to this position.',
    ],
    cues: [
      { icon: '🔺', text: '"Hip points and pubic bone form a level triangle."' },
      { icon: '💧', text: '"There is a small natural arch — a drop of water could sit there."' },
      { icon: '😌', text: '"Don\'t flatten — neutral is not imprinted."' },
      { icon: '🔒', text: '"Hold it without gripping your glutes or abs."' },
    ],
    primaryMuscles: ['Multifidus', 'Transverse Abdominis'],
    secondaryMuscles: ['Pelvic Floor', 'Lumbar Extensors'],
  },

  'pelvic-tilt': {
    id: 'pelvic-tilt',
    title: 'Pelvic Tilt',
    subtitle: 'Mobility · Foundations · Awareness',
    muscleTag: '🦴 Pelvis · Lower Back',
    category: 'Foundations',
    type: 'animated',
    frameA: 'Pelvic Tilt - Start.png',
    frameB: 'Pelic Tilt - Tilted.png',
    labelA: 'Neutral',
    labelB: 'Tilted',
    sets: 2, reps: 10, hold: '2s', interval: 2500,
    about: 'The pelvic tilt introduces you to the most fundamental movement in Pilates: controlling your pelvis. You learn to move from neutral spine into a posterior tilt — gently pressing your lower back into the mat — building awareness of your core\'s relationship to your lumbar spine.',
    steps: [
      'Begin in neutral spine — natural curve in your lower back.',
      'Inhale to prepare.',
      'Exhale and gently rock your pelvis, pressing your lower back toward the mat.',
      'Hold for 2 seconds, feeling your deep abs engage.',
      'Inhale to return to neutral. That\'s one rep.',
    ],
    cues: [
      { icon: '🥄', text: '"Scoop the pelvis — like tipping a bowl of water forward."' },
      { icon: '🧠', text: '"Use your abs to move the pelvis — not your glutes."' },
      { icon: '😮‍💨', text: '"Exhale as you tilt — let the breath drive the movement."' },
      { icon: '🔄', text: '"Return to neutral slowly — don\'t collapse."' },
    ],
    primaryMuscles: ['Transverse Abdominis', 'Rectus Abdominis'],
    secondaryMuscles: ['Glutes', 'Hip Flexors', 'Lumbar Stabilisers'],
  },

  // ── CORE ACTIVATION ──────────────────────────────────────────

  'tabletop-legs': {
    id: 'tabletop-legs',
    title: 'Tabletop Legs',
    subtitle: 'Core Stability · Core Activation',
    muscleTag: '🔲 Hip Flexors · Core',
    category: 'Core Activation',
    type: 'static',
    frameA: 'Tabletop Legs.png',
    frameB: null,
    sets: 1, reps: null, hold: '30s', interval: null,
    about: 'Tabletop legs is the foundation position for all supine core exercises. With both knees lifted and shins parallel to the floor at 90°, your deep core must work to keep your pelvis stable — the moment you float your legs, it\'s working.',
    steps: [
      'Begin in neutral spine.',
      'Inhale. On the exhale, float one knee up to hip height, shin parallel to the floor.',
      'Float the second knee up — both legs now at 90°/90°.',
      'Your lower back should not arch — keep neutral.',
      'Hold this position and breathe. This is your base for toe taps, dead bug, and more.',
    ],
    cues: [
      { icon: '📐', text: '"90/90 — thigh vertical, shin horizontal."' },
      { icon: '🌉', text: '"Feel the connection from your foot to your deep abs."' },
      { icon: '🚫', text: '"Don\'t let your lower back arch — neutral spine throughout."' },
      { icon: '😮‍💨', text: '"Breathe continuously — don\'t hold your breath to stabilise."' },
    ],
    primaryMuscles: ['Transverse Abdominis', 'Hip Flexors'],
    secondaryMuscles: ['Pelvic Floor', 'Lumbar Stabilisers'],
  },

  'toe-taps': {
    id: 'toe-taps',
    title: 'Toe Taps',
    subtitle: 'Core Challenge · Core Activation',
    muscleTag: '🦵 Hip Flexors · Deep Core',
    category: 'Core Activation',
    type: 'animated',
    frameA: 'Tabletop Legs.png',
    frameB: 'Toe Taps Lowering.png',
    labelA: 'Tabletop Hold',
    labelB: 'Toe Tap Down',
    sets: 3, reps: 10, hold: '1s', interval: 2000,
    about: 'Toe taps challenge your ability to maintain a stable pelvis and neutral spine while one leg moves. Starting from tabletop, you lower one toe toward the floor and return — a small movement with huge core demand.',
    steps: [
      'Begin in tabletop legs — both knees at 90/90, neutral spine.',
      'Inhale to prepare.',
      'Exhale and slowly lower one foot toward the floor, toe tapping lightly.',
      'Inhale and float it back to tabletop.',
      'Alternate legs. Your lower back must not move at all.',
    ],
    cues: [
      { icon: '🔒', text: '"Pelvis is an anchor — it must not move when the leg does."' },
      { icon: '🪶', text: '"Lower slowly — gravity is the resistance."' },
      { icon: '👣', text: '"Tap lightly — don\'t rest your weight on the foot."' },
      { icon: '🌬️', text: '"Exhale on the lowering — breathe the leg down."' },
    ],
    primaryMuscles: ['Transverse Abdominis', 'Hip Flexors'],
    secondaryMuscles: ['Rectus Abdominis', 'Obliques', 'Pelvic Floor'],
  },

  'dead-bug': {
    id: 'dead-bug',
    title: 'Dead Bug',
    subtitle: 'Core Stability · Core Activation',
    muscleTag: '🪲 Deep Core · Anti-Rotation',
    category: 'Core Activation',
    type: 'animated',
    frameA: 'dead bug start.png',
    frameB: 'dead bug extension.png',
    labelA: 'Start',
    labelB: 'Extension',
    sets: 3, reps: 8, hold: '2s', interval: 2500,
    about: 'The dead bug is one of the most effective exercises for deep core stability. Arms reach up and one leg extends away while your spine stays completely still — training anti-extension control and contralateral coordination simultaneously.',
    steps: [
      'Lie on your back. Float arms straight up over your shoulders.',
      'Float both knees to tabletop (90/90).',
      'Inhale. Exhale and slowly lower one arm overhead and the opposite leg toward the floor.',
      'Stop before your lower back lifts — that\'s your end range.',
      'Inhale and return. Switch sides. Keep your back pinned to the mat.',
    ],
    cues: [
      { icon: '📌', text: '"Back to the mat — every single rep."' },
      { icon: '🔄', text: '"Opposite arm and leg — cross-body connection."' },
      { icon: '🐢', text: '"Slow is the whole point — 3 counts out, 3 counts back."' },
      { icon: '😮‍💨', text: '"Exhale as you extend — brace the deep abs."' },
    ],
    primaryMuscles: ['Transverse Abdominis', 'Rectus Abdominis'],
    secondaryMuscles: ['Obliques', 'Hip Flexors', 'Shoulder Stabilisers'],
  },

  // ── STABILITY & CONTROL ───────────────────────────────────────

  'bird-dog': {
    id: 'bird-dog',
    title: 'Bird Dog',
    subtitle: 'Stability · Control · Balance',
    muscleTag: '🐦 Core · Glutes · Balance',
    category: 'Stability',
    type: 'animated',
    frameA: 'bird dog start.png',
    frameB: 'bird dog extension.png',
    labelA: 'Neutral',
    labelB: 'Extension',
    sets: 3, reps: 8, hold: '3s', interval: 2500,
    about: 'The bird dog trains spinal stability and anti-rotation from a quadruped (hands and knees) position. Extending opposite arm and leg demands coordinated engagement of your entire posterior chain and deep core while keeping the spine completely level.',
    steps: [
      'Start on hands and knees — wrists under shoulders, knees under hips.',
      'Find neutral spine — not arched, not rounded.',
      'Inhale to prepare. Exhale and slowly extend one arm forward and the opposite leg back.',
      'Hold for 3 seconds — hips level, spine neutral, gaze down.',
      'Inhale and return. Alternate sides.',
    ],
    cues: [
      { icon: '🔭', text: '"Reach long — think long, not high."' },
      { icon: '📏', text: '"Hips level — no rotation, no hiking."' },
      { icon: '👀', text: '"Eyes on the floor — keep the neck in line."' },
      { icon: '⏱️', text: '"3-second hold builds more than reps — don\'t rush."' },
    ],
    primaryMuscles: ['Multifidus', 'Glutes', 'Deltoids'],
    secondaryMuscles: ['Transverse Abdominis', 'Hamstrings', 'Core Stabilisers'],
  },

  'side-leg-lift': {
    id: 'side-leg-lift',
    title: 'Side Leg Lift',
    subtitle: 'Hip Abduction · Stability',
    muscleTag: '🦵 Hip Abductors · Glutes',
    category: 'Stability',
    type: 'animated',
    frameA: 'Side leg lift - down.png',
    frameB: 'Side Leg Lift - lifted.png',
    labelA: 'Rest',
    labelB: 'Lifted',
    sets: 3, reps: 12, hold: '1s', interval: 2000,
    about: 'The side leg lift targets your hip abductors — the muscles on the outside of your hips and glutes that are often weak and underused. Strengthening them supports knee health, pelvic stability, and the functional movement patterns used in walking and balance.',
    steps: [
      'Lie on your side in a straight line — hips stacked, legs extended.',
      'Support your head with your bottom arm or hand.',
      'Keep your top leg in line with your body — not in front.',
      'Inhale. Exhale and lift the top leg with control, no higher than hip height.',
      'Lower slowly on the inhale. Keep your core engaged throughout.',
    ],
    cues: [
      { icon: '📐', text: '"Lift from the hip — not from the waist."' },
      { icon: '⛓️', text: '"Hips stacked vertically — don\'t roll forward or back."' },
      { icon: '🦶', text: '"Flex your foot at the top — activates the outer hip more."' },
      { icon: '🐢', text: '"Lower slowly — the descent builds as much strength as the lift."' },
    ],
    primaryMuscles: ['Gluteus Medius', 'Gluteus Minimus', 'TFL'],
    secondaryMuscles: ['Obliques', 'Hip Stabilisers'],
  },

  // ── STRENGTH & SUPPORT ───────────────────────────────────────

  'glute-bridge': {
    id: 'glute-bridge',
    title: 'Glute Bridge',
    subtitle: 'Posterior Chain · Strength · Support',
    muscleTag: '🍑 Glutes · Core',
    category: 'Strength',
    type: 'animated',
    frameA: 'Glute bridge start position.png',
    frameB: 'Glute bridge top position.png',
    labelA: 'Start Position',
    labelB: 'Top Position',
    sets: 3, reps: 15, hold: '2s', interval: 2500,
    about: 'The glute bridge activates your posterior chain — glutes, hamstrings, and core stabilisers — while improving hip mobility and spinal stability. It\'s the foundation of all posterior chain training and perfect for any level.',
    steps: [
      'Lie flat on your back with knees bent and feet hip-width apart, flat on the floor.',
      'Rest your arms by your sides, palms facing down. Engage your core gently.',
      'Press through your heels and drive your hips upward until your body forms a straight diagonal from knees to shoulders.',
      'Squeeze your glutes firmly at the top. Hold for 2 seconds.',
      'Lower your hips back down slowly and with control. That\'s one rep.',
    ],
    cues: [
      { icon: '👣', text: '"Drive through your heels — toes light."' },
      { icon: '💎', text: '"Squeeze like you\'re cracking a walnut at the top."' },
      { icon: '🏹', text: '"Ribs down, don\'t arch your back — long spine."' },
      { icon: '🐢', text: '"Lower slowly — 3 counts down. Control is strength."' },
      { icon: '🌬️', text: '"Exhale on the way up, inhale on the way down."' },
    ],
    primaryMuscles: ['Gluteus Maximus', 'Hamstrings'],
    secondaryMuscles: ['Core', 'Lower Back', 'Hip Flexors'],
  },

  'single-leg-balance': {
    id: 'single-leg-balance',
    title: 'Single Leg Balance',
    subtitle: 'Proprioception · Strength · Support',
    muscleTag: '🦶 Ankle · Glute Medius',
    category: 'Strength',
    type: 'static',
    frameA: 'single leg balance.png',
    frameB: null,
    sets: 2, reps: null, hold: '30s', interval: null,
    about: 'Single leg balance challenges proprioception — your body\'s sense of its own position in space. It strengthens the stabilising muscles of your standing ankle, knee, hip, and core while training your nervous system to react and adjust automatically.',
    steps: [
      'Stand tall in neutral alignment — soft gaze, long spine.',
      'Shift your weight onto one foot and lift the opposite knee to hip height.',
      'Find your balance point — use your standing ankle, not your waist.',
      'Hold for 30 seconds, breathing normally.',
      'To progress, close your eyes or stand on a folded mat.',
    ],
    cues: [
      { icon: '👁️', text: '"Soft focus point — don\'t stare rigidly."' },
      { icon: '🌴', text: '"Root through your standing foot — all four corners."' },
      { icon: '🤜', text: '"Stand hip is level — don\'t let it drop."' },
      { icon: '🧘', text: '"Wobbling is working — your stabilisers are firing."' },
    ],
    primaryMuscles: ['Gluteus Medius', 'Ankle Stabilisers', 'Tibialis Anterior'],
    secondaryMuscles: ['Core', 'Hip Flexors', 'Calf Complex'],
  },

  // ── COOLDOWN & RESET ──────────────────────────────────────────

  'seated-tall-spine': {
    id: 'seated-tall-spine',
    title: 'Seated Tall Spine',
    subtitle: 'Posture · Cooldown · Reset',
    muscleTag: '🧍 Spine · Posture',
    category: 'Cooldown',
    type: 'static',
    frameA: 'Seated Tall Spine.png',
    frameB: null,
    sets: 1, reps: null, hold: '60s', interval: null,
    about: 'Seated tall spine resets your posture after movement. Sitting upright with your spine stacked, shoulders wide, and crown lifted, you reconnect with your body\'s neutral alignment — an essential closing practice for any Pilates session.',
    steps: [
      'Sit cross-legged or with legs extended on the mat.',
      'Place hands on your thighs and sit as tall as possible.',
      'Lift through the crown of your head, lengthen the back of the neck.',
      'Let your shoulders relax and broaden away from your ears.',
      'Close your eyes, breathe deeply, and just be tall for 60 seconds.',
    ],
    cues: [
      { icon: '👑', text: '"Crown to ceiling — long through the back of the neck."' },
      { icon: '🌬️', text: '"Breathe wide into your ribs, not up into your chest."' },
      { icon: '🏔️', text: '"Sit like a mountain — grounded and tall."' },
      { icon: '😌', text: '"Release your jaw, your hands, your feet."' },
    ],
    primaryMuscles: ['Postural Muscles', 'Core Stabilisers'],
    secondaryMuscles: ['Rhomboids', 'Trapezius', 'Deep Neck Flexors'],
  },

  'childs-pose': {
    id: 'childs-pose',
    title: "Child's Pose",
    subtitle: 'Release · Cooldown · Restore',
    muscleTag: '🙇 Lower Back · Hips',
    category: 'Cooldown',
    type: 'static',
    frameA: 'Childs pose.png',
    frameB: null,
    sets: 1, reps: null, hold: '60s', interval: null,
    about: "Child's pose is the universal reset of Pilates and yoga. Folding the body forward releases the lower back, hips, and glutes while calming the nervous system. It's both a rest position and an active stretch for the entire posterior chain.",
    steps: [
      'Begin on hands and knees.',
      'Sink your hips back toward your heels as far as comfortable.',
      'Walk your arms forward and rest your forehead on the mat.',
      'Let gravity do the work — no forcing, no gripping.',
      'Breathe into your lower back and feel it expand with each inhale.',
    ],
    cues: [
      { icon: '🌬️', text: '"Breathe into your lower back — feel it lift and soften."' },
      { icon: '⬇️', text: '"Let your hips be heavy — don\'t hold yourself up."' },
      { icon: '🤲', text: '"Arms long, shoulders releasing away from your ears."' },
      { icon: '😴', text: '"This is rest — let your body be completely passive."' },
    ],
    primaryMuscles: ['Lower Back', 'Glutes', 'Hip Flexors'],
    secondaryMuscles: ['Lats', 'Thoracic Spine', 'Ankles'],
  },

  'seated-twist-stretch': {
    id: 'seated-twist-stretch',
    title: 'Seated Twist Stretch',
    subtitle: 'Rotation · Cooldown · Restore',
    muscleTag: '🌀 Thoracic Spine · Obliques',
    category: 'Cooldown',
    type: 'static',
    frameA: 'Seated Twist Stretch.png',
    frameB: null,
    sets: 2, reps: null, hold: '30s', interval: null,
    about: 'The seated twist restores thoracic rotation — the type of spinal movement most lost from sitting. It gently decompresses the spinal discs, stretches the obliques, and helps the body transition from training mode to rest and recovery.',
    steps: [
      'Sit tall with legs extended or crossed.',
      'Place your right hand behind you for support.',
      'On an inhale, grow tall through your spine.',
      'On the exhale, rotate gently to the right, leading with your ribs — not your shoulder.',
      'Hold for 30 seconds, then return to center and switch sides.',
    ],
    cues: [
      { icon: '🌀', text: '"Rotate from the ribs — not from the shoulder or neck."' },
      { icon: '📏', text: '"Sit tall first, then twist — don\'t collapse into the rotation."' },
      { icon: '😮‍💨', text: '"Each exhale deepens the twist slightly — don\'t force."' },
      { icon: '⚖️', text: '"Both sitting bones are grounded and even."' },
    ],
    primaryMuscles: ['Thoracic Rotators', 'Obliques'],
    secondaryMuscles: ['Lats', 'Piriformis', 'Paraspinals'],
  },

};

// ═══════════════════════════════════════════════════════════════
//  PLAYLIST DEFINITIONS
// ═══════════════════════════════════════════════════════════════

const PLAYLISTS = {

  'foundations': {
    id: 'foundations',
    title: 'Foundations',
    subtitle: 'Body Awareness & Breath',
    emoji: '🌱',
    accentColor: '#4A9060',
    chipClass: 'chip-green',
    duration: '~15 min',
    level: 'Beginner',
    focus: 'Awareness · Breath · Alignment',
    exercises: ['supine-breathing', 'neutral-spine', 'pelvic-tilt'],
  },

  'core-activation': {
    id: 'core-activation',
    title: 'Core Activation',
    subtitle: 'Deep Stability & Control',
    emoji: '🔥',
    accentColor: '#C06030',
    chipClass: 'chip-orange',
    duration: '~20 min',
    level: 'Beginner',
    focus: 'Deep Core · Hip Flexors · Coordination',
    exercises: ['tabletop-legs', 'toe-taps', 'dead-bug'],
  },

  'stability': {
    id: 'stability',
    title: 'Stability & Control',
    subtitle: 'Balance & Strength',
    emoji: '⚖️',
    accentColor: '#4050A0',
    chipClass: 'chip-blue',
    duration: '~20 min',
    level: 'Beginner',
    focus: 'Anti-Rotation · Glutes · Balance',
    exercises: ['bird-dog', 'side-leg-lift'],
  },

  'strength': {
    id: 'strength',
    title: 'Strength & Support',
    subtitle: 'Posterior Chain & Balance',
    emoji: '💪',
    accentColor: '#A03070',
    chipClass: 'chip-pink',
    duration: '~20 min',
    level: 'Beginner',
    focus: 'Glutes · Posterior Chain · Proprioception',
    exercises: ['glute-bridge', 'single-leg-balance'],
  },

  'cooldown': {
    id: 'cooldown',
    title: 'Cooldown & Reset',
    subtitle: 'Release & Restore',
    emoji: '🌙',
    accentColor: '#6840A0',
    chipClass: 'chip-purple',
    duration: '~15 min',
    level: 'All Levels',
    focus: 'Stretch · Release · Breath',
    exercises: ['seated-tall-spine', 'childs-pose', 'seated-twist-stretch'],
  },

};

// ═══════════════════════════════════════════════════════════════
//  HELPER: get exercise by id
// ═══════════════════════════════════════════════════════════════
function getExercise(id) {
  return EXERCISES[id] || null;
}

// ═══════════════════════════════════════════════════════════════
//  HELPER: get playlist by id
// ═══════════════════════════════════════════════════════════════
function getPlaylist(id) {
  return PLAYLISTS[id] || null;
}

// ═══════════════════════════════════════════════════════════════
//  HELPER: read URL search param
// ═══════════════════════════════════════════════════════════════
function urlParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}
