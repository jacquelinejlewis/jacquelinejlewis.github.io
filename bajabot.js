/* =====================================================
   BajaBot — lightweight, local animal-facts chatbot
   No external libs. Works on GitHub Pages.
   ===================================================== */
(() => {
  // ----- Element hooks
  const root      = document.querySelector('#bajabot-root');
  if (!root) return;

  const toggleBtn = root.querySelector('#bajabot-toggle');
  const panel     = root.querySelector('#bajabot-panel');
  const closeBtn  = root.querySelector('#bajabot-close');
  const messages  = root.querySelector('#bajabot-messages');
  const form      = root.querySelector('#bajabot-form');
  const input     = root.querySelector('#bajabot-input');

  // ----- Data: California wildlife facts (short + friendly)
  const FACTS = {
    "brown pelican": [
      "Brown pelicans plunge-dive from up to ~60 ft, tucking their wings at the last second to scoop fish in their pouch.",
      "After DDT-era declines, they recovered and were removed from the U.S. Endangered Species list in 2009."
    ],
    "california sea lion": [
      "California sea lions can cruise ~25 mph and ‘porpoise’—leaping for efficient breathing at speed.",
      "Males can reach 600–800 lbs; females are ~200 lbs."
    ],
    "harbor seal": [
      "Harbor seals have V-shaped nostrils and no external ear flaps; they move on land with belly ‘scoots’.",
      "They spend ~half their time hauled out resting on beaches or docks."
    ],
    "coyote": [
      "Coyotes thrive in cities by being omnivores—fruit, rodents, insects, and even fallen backyard avocados.",
      "A family’s chorus howl can sound like many more due to echo and pitch shifts."
    ],
    "raccoon": [
      "Raccoons ‘wash’ food because water heightens the sensitivity of their forepaws.",
      "Never block an attic/chimney entry without checking for babies—mom will relocate them if given the chance."
    ],
    "gray fox": [
      "Gray foxes can climb trees—curved claws + rotating forearms help them escape coyotes.",
      "They’re crepuscular and eat rodents, insects, fruit, and occasionally eggs."
    ],
    "striped skunk": [
      "Skunks stomp and U-turn as a warning—back away slowly to avoid a spray.",
      "A peroxide + baking soda + dish soap mix beats tomato juice for neutralizing odor."
    ],
    "virginia opossum": [
      "Opossums eat thousands of ticks and seldom get rabies (their body temp is low).",
      "Babies ride on mom’s back—if one falls off, it can’t find her again. Call a local rehabber."
    ],
    "black-tailed deer": [
      "Coastal black-tailed deer (a mule deer subspecies) browse shrubs; use deer-resistant native plants in gardens.",
      "Fawns lie motionless for hours while mom feeds—don’t ‘rescue’ unless the fawn is clearly in danger."
    ],
    "mountain lion": [
      "If you encounter a mountain lion, appear large, keep eye contact, back away slowly—don’t run.",
      "They help regulate deer, benefiting ecosystems and reducing road collisions."
    ],
    "red-tailed hawk": [
      "Movies often use a red-tailed hawk’s iconic scream even when showing a different bird.",
      "Look for the brick-red tail on adults soaring on thermals."
    ],
    "peregrine falcon": [
      "Peregrines dive (stoop) at 200+ mph—the fastest animal on Earth.",
      "They’ve adapted to cities, nesting on bridges and skyscrapers."
    ],
    "great blue heron": [
      "Great blues hunt with slow patience, then spear fish, gophers, or small snakes in a flash.",
      "They often nest in colonies (rookeries) high in trees near wetlands."
    ],
    "western gull": [
      "Western gulls are SF Bay natives and highly territorial at rookeries.",
      "They’re omnivores—nature wastes nothing, even at seal rookeries."
    ],
    "anna’s hummingbird": [
      "Anna’s hummingbirds are year-round in much of CA; males ‘chirp’ with tail feathers on courtship dives.",
      "They enter nightly torpor to conserve energy."
    ],
    "bobcat": [
      "Bobcats are about twice a housecat’s size with ear tufts and a very short tail.",
      "Their spotted coat blends into chaparral as they ambush rabbits and rodents."
    ],
    /* --- Your added requests --- */
    "deer mouse": [
      "Deer mice are widespread in CA grasslands and forests—great climbers and avid seed cachers.",
      "They stash seeds in hidden caches, helping some plants spread."
    ],
    "meadow vole": [
      "Meadow voles weave runways through tall grasses; populations boom and bust seasonally.",
      "They’re key prey for owls, hawks, foxes, and coyotes."
    ],
    "western gray squirrel": [
      "Western grays are larger than eastern grays and prefer oak woodlands and pine forests.",
      "They bury acorns and pine nuts; forgotten caches can sprout and regenerate forests."
    ],
    "pocket gopher": [
      "Pocket gophers aerate soil with burrows; helpful ecologically but pesky to gardeners.",
      "Their external cheek ‘pockets’ are fur-lined for hauling seeds underground."
    ],
    "woodrat": [
      "Woodrats (packrats) build elaborate stick houses used for generations.",
      "They’re famous for collecting shiny objects and ‘trading’ them for items in their nests."
    ]
  };

  // Synonyms / common queries → canonical keys
  const SYNONYMS = {
    "pelican": "brown pelican",
    "brown-pelican": "brown pelican",

    "sea lion": "california sea lion",
    "seal": "harbor seal",
    "harbor-seal": "harbor seal",

    "skunk": "striped skunk",
    "opossum": "virginia opossum",
    "possum": "virginia opossum",

    "deer": "black-tailed deer",
    "black tailed deer": "black-tailed deer",

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
    "woodcut": "woodrat" // likely typo from earlier, mapped for convenience
  };

  // ----- Helpers
  const normalize = s => (s || "")
    .toLowerCase()
    .trim()
    .replace(/[’']/g, "'")
    .replace(/[^\p{L}\p{N}\s\-]+/gu, "")
    .replace(/\s+/g, " ");

  const CANON = Object.keys(FACTS);

  function findAnimal(query) {
    const q = normalize(query);
    if (!q) return null;

    // 1) Exact canonical name
    if (FACTS[q]) return q;

    // 2) Exact synonym
    if (SYNONYMS[q]) return SYNONYMS[q];

    // 3) Partial match canonical
    for (const name of CANON) {
      if (name.includes(q) || q.includes(name)) return name;
    }
    // 4) Partial match synonyms
    for (const [syn, target] of Object.entries(SYNONYMS)) {
      if (syn.includes(q) || q.includes(syn)) return target;
    }
    // 5) First-word loose match
    const first = q.split(" ")[0];
    for (const name of CANON) {
      if (name.includes(first)) return name;
    }
    for (const [syn, target] of Object.entries(SYNONYMS)) {
      if (syn.includes(first)) return target;
    }
    return null;
  }

  const randomFact = animal => {
    const list = FACTS[animal] || [];
    return list[Math.floor(Math.random() * list.length)] || "I don’t have a fact yet—but I’m learning!";
  };

  // ----- UI helpers
  function addMsg(text, who = "bot") {
    const row = document.createElement("div");
    row.className = `bb-row ${who}`;
    const msg = document.createElement("div");
    msg.className = `bb-msg ${who}`;
    msg.textContent = text;
    row.appendChild(msg);
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
  }

  function addChips() {
    const wrap = document.createElement("div");
    wrap.className = "bb-chips";
    ["pelican", "sea lion", "coyote", "hummingbird", "raccoon", "mountain lion"].forEach(label => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "bb-chip";
      chip.textContent = label;
      chip.addEventListener("click", () => {
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
    messages.dataset.greeted = "1";
  }

  // ----- Open/Close logic
  function openPanel(){ panel.hidden = false; input.focus(); if (!messages.dataset.greeted) greet(); }
  function closePanel(){ panel.hidden = true; toggleBtn.focus(); }

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    panel.hidden ? openPanel() : closePanel();
  });

  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closePanel();
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) closePanel();
  });

  // Optional: click-outside closes panel
  document.addEventListener('click', (e) => {
    if (panel.hidden) return;
    const outside = !panel.contains(e.target) && !toggleBtn.contains(e.target);
    if (outside) closePanel();
  });

  // ----- Form handling
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;

    addMsg(q, "me");
    input.value = "";
    const sendBtn = form.querySelector('button[type="submit"]');
    if (sendBtn) sendBtn.disabled = true;

    // tiny delay for a natural feel
    setTimeout(() => {
      const found = findAnimal(q);
      if (found) {
        addMsg(`🪶 ${capitalize(found)}: ${randomFact(found)}`);
        addMsg("Want another fact? Type the same animal again or ask about a different one.");
      } else {
        addMsg("Hmm, I don’t know that one yet. Try “pelican”, “sea lion”, “coyote”, “hummingbird”, “raccoon”, or “mountain lion”.");
      }
      if (sendBtn) sendBtn.disabled = false;
      input.focus();
    }, 200);
  });

  function capitalize(name) {
    return (name || "").replace(/\b\p{L}/gu, c => c.toUpperCase());
  }
})();
