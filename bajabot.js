/* BajaBot — local, privacy-friendly, no external libs */
(() => {
  const el = (sel, root = document) => root.querySelector(sel);
  const root = el('#bajabot-root');
  if (!root) return;

  const toggleBtn = el('#bajabot-toggle', root);
  const panel = el('#bajabot-panel', root);
  const closeBtn = el('#bajabot-close', root);
  const messages = el('#bajabot-messages', root);
  const form = el('#bajabot-form', root);
  const input = el('#bajabot-input', root);

  // --- Data: California wildlife facts (keep it short + sweet)
  const FACTS = {

        "deer mouse": [
      "Deer mice are one of the most widespread small mammals in North America, often found in grasslands, chaparral, and forests.",
      "They are excellent climbers and stash seeds in hidden caches—helping plants spread but also sneaking into cabins in winter!"
    ],
    "meadow vole": [
      "Meadow voles make intricate runways in tall grasses; their populations boom and bust, supporting owls, hawks, and coyotes.",
      "They’re a keystone prey species in California wetlands and grasslands—tiny but critical to the food web."
    ],
    "western gray squirrel": [
      "Western gray squirrels are larger than the more familiar eastern gray and prefer oak woodlands and pine forests.",
      "They bury acorns and pine nuts—some forgotten ones sprout, helping regenerate forests."
    ],
    "pocket gopher": [
      "Pocket gophers are solitary burrowers; their tunnels aerate soil and recycle nutrients, though they can frustrate gardeners.",
      "They have external cheek pouches ('pockets') lined with fur for carrying seeds and roots underground."
    ],
    "woodrat": [
      "Woodrats (often called packrats) build elaborate stick houses that can be several feet tall, used for generations.",
      "They’re known for collecting shiny or odd objects and swapping them for items in their nests!"
    ],

    "brown pelican": [
      "Brown pelicans plunge-dive from up to 60 feet, tucking their wings at the last second to spear fish with their pouched bill.",
      "After near-extinction from DDT, brown pelicans recovered and were removed from the U.S. Endangered Species List in 2009."
    ],
    "california sea lion": [
      "California sea lions can swim ~25 mph and 'porpoise'—leaping out of the water—to breathe faster while cruising.",
      "Males gather harems during breeding season and can weigh 600–800 lbs; females are ~200 lbs."
    ],
    "harbor seal": [
      "Harbor seals have V-shaped nostrils and spend ~50% of their time hauled out resting on beaches or docks.",
      "Seals lack external ear flaps (sea lions have them) and move on land with caterpillar-like scoots."
    ],
    "coyote": [
      "Coyotes thrive in cities by being omnivores: fruit, rodents, insects, and… fallen backyard avocados.",
      "You may hear 'chorus howls'—a family group can sound like many more due to echo and pitch variation."
    ],
    "raccoon": [
      "Raccoons ‘wash’ food because their forepaws are ultra-sensitive; water enhances tactile sensing.",
      "Urban raccoons often den in attics or chimneys—never block an entry until you’re sure babies aren’t inside!"
    ],
    "gray fox": [
      "Gray foxes can climb trees—curved claws + rotating forearms let them escape coyotes into branches.",
      "They’re crepuscular (most active at dawn/dusk) and eat rodents, insects, fruit, and the occasional bird egg."
    ],
    "striped skunk": [
      "Skunks stomp and do a U-turn warning before spraying; give them space and back away slowly.",
      "The spray is a sulfur compound; a baking soda + dish soap + hydrogen peroxide mix works better than tomato juice."
    ],
    "virginia opossum": [
      "Opossums eat ticks by the thousands and rarely get rabies (low body temp). They’re urban sanitation heroes.",
      "Babies ride on mom’s back; if one falls off, it can’t find her again—call a local wildlife rehabber."
    ],
    "black-tailed deer": [
      "Black-tailed deer (a coastal subspecies of mule deer) browse shrubs and love tender garden plants—use deer-resistant natives.",
      "Fawns often lie still alone for hours; mom is nearby. Don’t ‘rescue’ unless the fawn is clearly in danger."
    ],
    "mountain lion": [
      "Mountain lions are elusive; if you encounter one, appear large, keep eye contact, back away slowly—don’t run.",
      "They help keep deer populations in check, benefiting ecosystems and reducing vehicle collisions."
    ],
    "red-tailed hawk": [
      "The classic 'hawk scream' in movies is usually a red-tailed hawk, even when the bird on screen isn’t.",
      "They use thermals to soar with minimal wingbeats—look for the brick-red tail in adults."
    ],
    "peregrine falcon": [
      "Peregrines dive (stoop) at over 200 mph—the fastest animal on Earth.",
      "They rebounded in cities by nesting on bridges and skyscrapers after DDT bans."
    ],
    "great blue heron": [
      "Great blue herons hunt with slow-motion patience, then strike like a spear for fish, gophers, even small snakes.",
      "They often nest in colonies (rookeries) high in trees near wetlands."
    ],
    "western gull": [
      "Western gulls are SF Bay natives; unlike many gulls, they don’t migrate far and are highly territorial around rookeries.",
      "They’re opportunistic omnivores—seals’ afterbirth at rookeries is on the menu (nature wastes nothing!)."
    ],
    "anna’s hummingbird": [
      "Anna’s hummingbirds are year-round in much of California; males make a sharp ‘chirp’ with tail feathers during courtship dives.",
      "They enter nightly torpor to save energy—tiny, but metal."
    ],
    "bobcat": [
      "Bobcats are about twice a housecat’s size with ear tufts and a very short 'bobbed' tail; they’re crepuscular ambush hunters.",
      "Their spotted coat is perfect chaparral camouflage; they snack on rabbits and rodents."
    ]
  };

  // Synonyms / common names → canonical keys in FACTS
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
    "black-tailed deer": "black-tailed deer",
    "grey fox": "gray fox",
    "hummingbird": "anna’s hummingbird",
    "falcon": "peregrine falcon",
    "hawk": "red-tailed hawk",
        "vole": "meadow vole",
    "field mouse": "deer mouse",
    "mouse": "deer mouse",
    "squirrel": "western gray squirrel",
    "gray squirrel": "western gray squirrel",
    "gopher": "pocket gopher",
    "wood rat": "woodrat",
    "packrat": "woodrat",

  };

  const normalize = s => s.toLowerCase().trim()
    .replace(/[’']/g, "'")
    .replace(/[^\p{L}\p{N}\s\-]+/gu, "")
    .replace(/\s+/g, " ");

  const choices = Object.keys(FACTS);

  function findAnimal(query) {
    const q = normalize(query);

    // 1) Exact canon name
    if (FACTS[q]) return q;

    // 2) Exact synonym
    if (SYNONYMS[q]) return SYNONYMS[q];

    // 3) Partial match on canon names
    for (const name of choices) {
      if (name.includes(q) || q.includes(name)) return name;
    }

    // 4) Partial match on synonyms
    for (const [syn, target] of Object.entries(SYNONYMS)) {
      if (syn.includes(q) || q.includes(syn)) return target;
    }

    // 5) Very loose match: pick the first word and scan
    const first = q.split(" ")[0];
    for (const name of choices) {
      if (name.includes(first)) return name;
    }
    for (const [syn, target] of Object.entries(SYNONYMS)) {
      if (syn.includes(first)) return target;
    }

    return null;
  }

  function randomFact(animal) {
    const list = FACTS[animal];
    return list[Math.floor(Math.random() * list.length)];
  }

  // --- UI helpers
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
    addMsg("Hi, I’m BajaBot! Tell me an animal (e.g., “pelican” or “coyote”) and I’ll share a local California wildlife fact. Try the chips below!");
    addChips();
  }

  // --- Open/Close
  const openPanel = () => {
    panel.hidden = false;
    input.focus();
    if (!messages.dataset.greeted) {
      greet();
      messages.dataset.greeted = "1";
    }
  };
  const closePanel = () => { panel.hidden = true; toggleBtn.focus(); };

  toggleBtn.addEventListener("click", () => {
    panel.hidden ? openPanel() : closePanel();
  });
  closeBtn.addEventListener("click", closePanel);

  // Close with Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !panel.hidden) closePanel();
  });

  // --- Handle submissions
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = input.value;
    if (!q) return;
    addMsg(q, "me");
    input.value = "";
    form.querySelector("button[type=submit]").disabled = true;

    setTimeout(() => {
      const found = findAnimal(q);
      if (found) {
        addMsg(`🪶 ${capitalize(found)}: ${randomFact(found)}`);
        addMsg("Want another fact? Type the same animal again or ask about a different one.");
      } else {
        addMsg("Hmm, I don’t know that one yet. Try “pelican”, “sea lion”, “coyote”, “hummingbird”, “raccoon”, or “mountain lion”.");
      }
      form.querySelector("button[type=submit]").disabled = false;
      input.focus();
    }, 250); // tiny delay for a natural feel
  });

  function capitalize(name) {
    return name.replace(/\b\p{L}/gu, c => c.toUpperCase());
  }
})();
