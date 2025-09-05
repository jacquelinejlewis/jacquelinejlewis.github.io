
(() => {

  const root = document.getElementById('bajabot-root');
  if (!root) { console.error('BajaBot: #bajabot-root not found'); return; }

  const toggleBtn = root.querySelector('#bajabot-toggle');
  const panel     = root.querySelector('#bajabot-panel');
  const closeBtn  = root.querySelector('#bajabot-close');
  const messages  = root.querySelector('#bajabot-messages');
  const form      = root.querySelector('#bajabot-form');
  const input     = root.querySelector('#bajabot-input');

  if (!toggleBtn || !panel || !closeBtn || !messages || !form || !input) {
    console.error('BajaBot: missing required child elements');
    return;
  }


  const FACTS = {
    "brown pelican": [
      "Brown pelicans plunge-dive from up to ~60 ft, tucking their wings at the last second to scoop fish.",
      "They recovered after DDT bans and left the U.S. Endangered Species list in 2009."
    ],
    "california sea lion": [
      "California sea lions can cruise ~25 mph and ‘porpoise’—leaping to breathe efficiently at speed.",
      "Males can reach 600–800 lbs; females are ~200 lbs."
    ],
    "harbor seal": [
      "Harbor seals have V-shaped nostrils and no external ear flaps; they shuffle on land with belly scoots.",
      "They spend ~half their time hauled out resting on beaches or docks."
    ],
    "coyote": [
      "Coyotes thrive in cities by eating fruit, rodents, insects—and even fallen backyard avocados.",
      "A family’s chorus howl can sound like many more due to echo and pitch shifts."
    ],
    "raccoon": [
      "Raccoons ‘wash’ food because water heightens forepaw sensitivity.",
      "Never block an attic/chimney entry without checking for babies."
    ],
    "gray fox": [
      "Gray foxes can climb trees—curved claws + rotating forearms help them escape coyotes.",
      "They’re crepuscular omnivores: rodents, insects, fruit, eggs."
    ],
    "striped skunk": [
      "Skunks stomp and U-turn as a warning—back away slowly to avoid a spray.",
      "Peroxide + baking soda + dish soap beats tomato juice for odor."
    ],
    "virginia opossum": [
      "Opossums eat thousands of ticks and rarely get rabies (low body temp).",
      "Babies ride on mom’s back; if one falls off, it can’t find her again."
    ],
    "black-tailed deer": [
      "Coastal black-tailed deer browse shrubs; plant deer-resistant natives.",
      "Fawns lie motionless for hours while mom feeds—don’t ‘rescue’ unless clearly in danger."
    ],
    "mountain lion": [
      "If you encounter one: appear large, keep eye contact, back away slowly—don’t run.",
      "They help regulate deer, benefiting ecosystems."
    ],
    "red-tailed hawk": [
      "Movies often use a red-tailed hawk’s scream even for other birds.",
      "Adults show a brick-red tail when soaring on thermals."
    ],
    "peregrine falcon": [
      "Peregrines dive at 200+ mph—the fastest animal on Earth.",
      "They nest on bridges and skyscrapers in cities."
    ],
    "great blue heron": [
      "Great blues hunt with slow patience then spear prey in a flash.",
      "They often nest in treetop colonies (rookeries) near wetlands."
    ],
    "western gull": [
      "Western gulls are SF Bay natives and very territorial at rookeries.",
      "They’re omnivores—nature wastes nothing."
    ],
    "anna's hummingbird": [
      "Anna’s hummingbirds are year-round in much of CA; males ‘chirp’ with tail feathers on courtship dives.",
      "They enter nightly torpor to conserve energy."
    ],
    "bobcat": [
      "Bobcats are ~2× a housecat with a short tail and ear tufts.",
      "They ambush rabbits and rodents in chaparral."
    ],
    // Your additions
    "deer mouse": [
      "Deer mice are widespread in CA grasslands and forests—great climbers and seed cachers.",
      "Their seed stashes can help some plants spread."
    ],
    "meadow vole": [
      "Meadow voles weave runways through tall grasses; populations boom and bust.",
      "They’re key prey for owls, hawks, foxes, and coyotes."
    ],
    "western gray squirrel": [
      "Western grays prefer oak woodlands and pine forests and are larger than eastern grays.",
      "Forgotten acorn caches can sprout and regenerate forests."
    ],
    "pocket gopher": [
      "Pocket gophers aerate soil with burrows—great ecologically, pesky in gardens.",
      "External fur-lined cheek ‘pockets’ carry seeds underground."
    ],
    "woodrat": [
      "Woodrats (packrats) build elaborate stick houses used for generations.",
      "They’re famous for collecting shiny objects and ‘trading’ them."
    ]
  };

  const SYNONYMS = {
    "pelican": "brown pelican",
    "sea lion": "california sea lion",
    "seal": "harbor seal",
    "skunk": "striped skunk",
    "opossum": "virginia opossum",
    "possum": "virginia opossum",
    "deer": "black-tailed deer",
    "grey fox": "gray fox",
    "gray squirrel": "western gray squirrel",
    "squirrel": "western gray squirrel",
    "gopher": "pocket gopher",
    "deermouse": "deer mouse",
    "field mouse": "deer mouse",
    "mouse": "deer mouse",
    "vole": "meadow vole",
    "wood rat": "woodrat",
    "packrat": "woodrat",
    "woodcut": "woodrat",       
    "anna’s hummingbird": "anna's hummingbird", 
    "annas hummingbird": "anna's hummingbird",
    "anna hummingbird": "anna's hummingbird"
  };


  const normalize = (s) =>
    String(s || '')
      .toLowerCase()
      .replace(/[’‘]/g, "'")
      .replace(/[^a-z0-9\s\-']/g, '')   
      .replace(/\s+/g, ' ')
      .trim();

  const CANON = Object.keys(FACTS);

  function findAnimal(query) {
    const q = normalize(query);
    if (!q) return null;

    if (FACTS[q]) return q;              
    if (SYNONYMS[q]) return SYNONYMS[q]; 

   
    for (const name of CANON) if (name.includes(q) || q.includes(name)) return name;
    for (const [syn, tgt] of Object.entries(SYNONYMS)) if (syn.includes(q) || q.includes(syn)) return tgt;

   
    const first = q.split(' ')[0];
    for (const name of CANON) if (name.includes(first)) return name;
    for (const [syn, tgt] of Object.entries(SYNONYMS)) if (syn.includes(first)) return tgt;

    return null;
  }

  const randomFact = (animal) => {
    const list = FACTS[animal] || [];
    return list[Math.floor(Math.random() * list.length)] || "I don’t have a fact yet—but I’m learning!";
  };

  function addMsg(text, who = 'bot') {
    if (!messages) return;
    const row = document.createElement('div');
    row.className = `bb-row ${who}`;
    const msg = document.createElement('div');
    msg.className = `bb-msg ${who}`;
    msg.textContent = text;
    row.appendChild(msg);
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
  }

  function addChips() {
    const wrap = document.createElement('div');
    wrap.className = 'bb-chips';
    ['pelican','sea lion','coyote','hummingbird','raccoon','mountain lion'].forEach(label => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'bb-chip';
      chip.textContent = label;
      chip.addEventListener('click', () => {
        input.value = label;
        form.requestSubmit();
      });
      wrap.appendChild(chip);
    });
    messages.appendChild(wrap);
  }

  function greet() {
    addMsg("Hi, I’m BajaBot! Tell me an animal (e.g., “pelican” or “coyote”) and I’ll share a California wildlife fact. Try the chips below!");
    addChips();
    messages.dataset.greeted = '1';
  }


  function openPanel(){ panel.hidden = false; input.focus(); if (!messages.dataset.greeted) greet(); }
  function closePanel(){ panel.hidden = true; toggleBtn.focus(); }

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    panel.hidden ? openPanel() : closePanel();
  });
  closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closePanel(); });

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) closePanel(); });
  document.addEventListener('click', (e) => {
    if (panel.hidden) return;
    const outside = !panel.contains(e.target) && !toggleBtn.contains(e.target);
    if (outside) closePanel();
  });


  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;

    addMsg(q, 'me');
    input.value = '';

    const sendBtn = form.querySelector('button[type="submit"]');
    if (sendBtn) sendBtn.disabled = true;

  
    setTimeout(() => {
      try {
        const found = findAnimal(q);
        if (found) {
          addMsg(`🪶 ${titleCase(found)}: ${randomFact(found)}`);
          addMsg("Want another fact? Type the same animal again or ask about a different one.");
        } else {
          addMsg('Hmm, I don’t know that one yet. Try “pelican”, “sea lion”, “coyote”, “hummingbird”, “raccoon”, or “mountain lion”.');
        }
      } catch (err) {
        console.error('BajaBot error:', err);
        addMsg('Oops—something went wrong on my end. Try another animal?');
      } finally {
        if (sendBtn) sendBtn.disabled = false;
        input.focus();
      }
    }, 150);
  });

  function titleCase(s) {
    return String(s || '')
      .split(' ')
      .map(w => w ? w[0].toUpperCase() + w.slice(1) : w)
      .join(' ');
  }
})();
