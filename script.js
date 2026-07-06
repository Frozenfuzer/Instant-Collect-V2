/* ==========================================================================
   INSTANT COLLECTÉ — comportement, v3 multi-pages
   ========================================================================== */

/* --------------------------------------------------------------------------
   1) POINT DE CONTACT DES COMMANDES — une seule ligne à changer
   -------------------------------------------------------------------------- */
const ORDER_LINK = "https://www.instagram.com/instant_collecte/";

/* --------------------------------------------------------------------------
   1bis) FORMULAIRE DE COMMANDE (Tally) — dépôt photos + infos client
   -------------------------------------------------------------------------- */
// URL du formulaire Tally publié
const TALLY_FORM_URL = "https://tally.so/r/RGgEb9";

// URL d'embed dérivée + options d'intégration : hideTitle (le hero de la page
// affiche déjà le titre), transparentBackground (l'écrin kraft du site se voit
// à travers), dynamicHeight (l'iframe suit la hauteur réelle du formulaire,
// nécessite le script tally.so/widgets/embed.js chargé dans index.html).
const TALLY_EMBED_BASE = TALLY_FORM_URL.replace("/r/", "/embed/")
  + "?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1";

// Correspondance route du site → libellé exact de l'option "Quelle édition ?"
// dans Tally. ATTENTION : la valeur doit correspondre AU CARACTÈRE PRÈS au
// texte de l'option choisie dans Tally (Pre-populate fields), sinon le champ
// ne se pré-coche pas (le formulaire reste fonctionnel, juste pas pré-rempli).
const EDITION_PREFILL = {
  "fete-des-meres": "Pour toute la Famille !",
  "saint-valentin": "Histoire d'Amour",
  "souvenir-ete":   "Souvenir d'été",
  "mariage":        "Notre Mariage",
  "jour-de-fete":   "Jour de fête !",
};

// État du tunnel de commande : sert à forcer un formulaire Tally VIERGE à
// chaque nouvelle entrée dans le tunnel (clic sur "Je commande", retour sur
// la page après une commande envoyée, etc.). Sans ça, l'iframe reste figée
// sur l'écran "merci" de Tally et un client ne peut plus repasser commande.
let forceTallyReload = false;
let previousRoute = null;

/* --------------------------------------------------------------------------
   2) IMAGES — colle ici les URLs de tes images (Assets CodePen, postimages, etc.)
      Laisse "" pour afficher un cadre "image à venir" stylisé à la place.
      La clé correspond à l'attribut data-img="..." dans le HTML.

      Exemple : editionMeresHero: "https://i.postimg.cc/xxxx/fete-des-meres.png",

      boosterPackArt / boosterCard1-3 : visuel du pack fermé et des 3 photos
      révélées à l'ouverture (booster mystère, page d'accueil). Embarquées en
      base64 ci-dessous pour fonctionner directement sur CodePen sans
      hébergement externe — tu peux remplacer par une URL https://... à tout
      moment, le fonctionnement ne change pas.
   -------------------------------------------------------------------------- */
const IMAGES = {
  // Logo hero accueil
  heroLogo: "https://frozenfuzer.github.io/Instant-Collect-/assets/accueil/Photo%201%20modif.png",

  // Accueil — titre "Comment ça fonctionne ?" flanqué des 3 mini boosters
  titleBoostersArt: "https://frozenfuzer.github.io/Instant-Collect-/assets/icones/3%20mini%20booster.jpeg",

  // Accueil — icônes des 4 mini-étapes
  stepIconCamera:    "https://frozenfuzer.github.io/Instant-Collect-/assets/icones/Vignette%201%20appareil%20photo.jpeg",
  stepIconVignettes: "https://frozenfuzer.github.io/Instant-Collect-/assets/icones/Vignette%202%20carte%20en%20d%C3%A9sordre.jpeg",
  stepIconBoosters:  "https://frozenfuzer.github.io/Instant-Collect-/assets/icones/Vignette%203%203%20mini%20booster.jpeg",
  stepIconLivre:     "https://frozenfuzer.github.io/Instant-Collect-/assets/icones/Vignette%204%20livret.jpeg",

  // Accueil — booster mystère interactif
  boosterPackArt: "https://frozenfuzer.github.io/Instant-Collect-/assets/accueil/Booster%20Ete%202026%20sans%20Fond.png",
  boosterCard1:   "https://frozenfuzer.github.io/Instant-Collect-/assets/accueil/Mini%20image%20booster%20mystere%20Famille.jpeg",
  boosterCard2:   "https://frozenfuzer.github.io/Instant-Collect-/assets/accueil/Mini%20image%20booster%20mystere%20Julian%20et%20mami.jpeg",
  boosterCard3:   "https://frozenfuzer.github.io/Instant-Collect-/assets/accueil/Mini%20image%20booster%20mystere%20mariage.jpeg",

  // Vitrine "une collection à découvrir" (accueil, sous le booster interactif)
  boosterCollEte:    "https://frozenfuzer.github.io/Instant-Collect-/assets/accueil/Booster%20Ete%202026%20sans%20Fond.png",
  boosterCollNormal: "https://frozenfuzer.github.io/Instant-Collect-/assets/accueil/booster%20normal.png",
  boosterCollFete:   "https://frozenfuzer.github.io/Instant-Collect-/assets/accueil/Booster%20fete.png",

  // Accueil — cartes valeurs (photos)
  valuePhoto1: "https://frozenfuzer.github.io/Instant-Collect-/assets/accueil/Photo%202.png",
  valuePhoto2: "https://frozenfuzer.github.io/Instant-Collect-/assets/accueil/Photo%203%20.png",
  valuePhoto3: "https://frozenfuzer.github.io/Instant-Collect-/assets/accueil/Photo%204.jpg",

  // Accueil — grille éditions (à compléter)
  editionHistoireAmour: "https://frozenfuzer.github.io/Instant-Collect-/assets/accueil/Photo%204.jpg",
  editionSouvenirs:     "https://frozenfuzer.github.io/Instant-Collect-/assets/accueil/Photo%205.png",
  editionEte:           "https://frozenfuzer.github.io/Instant-Collect-/assets/accueil/Photo%206.png",
  editionKing:          "https://frozenfuzer.github.io/Instant-Collect-/assets/accueil/Photo%208.png",
  editionMariage:       "https://frozenfuzer.github.io/Instant-Collect-/assets/accueil/Photo%207.png",
  editionPeres:         "https://frozenfuzer.github.io/Instant-Collect-/assets/accueil/Photo%209.png",

  // Accueil — bandeau vedette
  editionMeresHero: "https://frozenfuzer.github.io/Instant-Collect-/assets/accueil/Photo%205.png",

  // Accueil — ambiance (polaroids)
  ambiance1: "https://frozenfuzer.github.io/Instant-Collect-/assets/accueil/Photo%202.png",
  ambiance2: "https://frozenfuzer.github.io/Instant-Collect-/assets/accueil/Photo%2010.jpg",
  ambiance3: "https://frozenfuzer.github.io/Instant-Collect-/assets/accueil/Photo%209.png",
  ambiance4: "https://frozenfuzer.github.io/Instant-Collect-/assets/accueil/Photo%205.png",

  // Accueil — preuve sociale (screenshots)
  screenshot1: "https://frozenfuzer.github.io/Instant-Collect-/assets/accueil/PHOTO%2011.PNG",
  screenshot2: "https://frozenfuzer.github.io/Instant-Collect-/assets/accueil/PHOTO%2012.PNG",
  screenshot3: "https://frozenfuzer.github.io/Instant-Collect-/assets/accueil/PHOTO%2013.PNG",
  screenshot4: "https://frozenfuzer.github.io/Instant-Collect-/assets/accueil/PHOTO%2014.PNG",
  screenshot5: "https://frozenfuzer.github.io/Instant-Collect-/assets/accueil/PHOTO%2015.jpg",

  // Concept — intro nostalgie (collage photos, à remplir dès que les images sont dans assets/concept/)
  conceptPhoto1: "https://frozenfuzer.github.io/Instant-Collect-/assets/concept/Photo%201%20carte%20concept.PNG",
  conceptPhoto2: "https://frozenfuzer.github.io/Instant-Collect-/assets/concept/Photo%202%20carte%20concept.PNG",
  conceptPhoto3: "https://frozenfuzer.github.io/Instant-Collect-/assets/concept/Photo%203%20carte%20concept.PNG",

  // Concept — 4 étapes
  step1: "https://frozenfuzer.github.io/Instant-Collect-/assets/concept/Groupement%20de%20photo%20sur%20table.JPG",
  step2: "",
  step3: "https://frozenfuzer.github.io/Instant-Collect-/assets/concept/IMG_9295.PNG",
  step4: "https://frozenfuzer.github.io/Instant-Collect-/assets/concept/IMG_9294.jpg",

  // King Jouet
  kingBooster: "", kingShop: "",

  // Réalisations sur-mesure
  realisationJoinzy: "", realisationEvg: "", realisationEntreprise: "", realisationCommunion: "",

  // Fête des Mères
  meresHero: "https://frozenfuzer.github.io/Instant-Collect-/assets/edition/livret%20maelle.JPG",
  meresPoster: "",
  meresLivret: "",

  // Mariage
  mariageHero: "",
  mariagePoster: "",
  mariageLivret: "",

  // Saint-Valentin
  valentinHero: "", valentinLivret: "",
  valentinPoster: "",

  // Jour de Fête
  jourFetePoster: "",
  jourFeteLivret: "",

  // Souvenir d'été
  etePoster: "",
  eteLivret: "",
};

// Clés à charger immédiatement (au-dessus de la ligne de flottaison)
const EAGER_KEYS = new Set([
  'heroLogo','boosterPackArt','boosterCard1','boosterCard2','boosterCard3',
  'titleBoostersArt','stepIconCamera','stepIconVignettes','stepIconBoosters','stepIconLivre',
  'screenshot1','screenshot2','screenshot3','screenshot4','screenshot5'
]);

function setImage(el){
  const key = el.dataset.img;
  const url = IMAGES[key];
  if (!url || url.trim() === "") return;
  if (el.tagName === 'IMG'){
    el.src = url;
  } else {
    el.style.backgroundImage = `url("${url}")`;
  }
  el.classList.add("has-image");
}

function applyImages(){
  const lazyEls = [];

  document.querySelectorAll("[data-img]").forEach((el) => {
    const key = el.dataset.img;
    if (!key) return;
    if (EAGER_KEYS.has(key)){
      setImage(el); // chargement immédiat
    } else {
      lazyEls.push(el); // lazy
    }
  });

  // Lazy loading via IntersectionObserver
  if ('IntersectionObserver' in window){
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          setImage(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '400px 0px' }); // commence à charger 400px avant d'être visible
    lazyEls.forEach(el => observer.observe(el));
  } else {
    // Fallback navigateurs anciens
    lazyEls.forEach(el => setImage(el));
  }
}

/* --------------------------------------------------------------------------
   3) CTA commande
   -------------------------------------------------------------------------- */
document.querySelectorAll("[data-order-link]").forEach((el) => {
  el.addEventListener("click", () => window.open(ORDER_LINK, "_blank", "noopener"));
});

// Boutons "Je commande" — redirigent vers le tunnel de commande #commande,
// avec l'édition pré-remplie. "data-edition" porte la CLÉ de route (ex.
// "saint-valentin"), jamais le nom affiché : on la résout donc TOUJOURS via
// EDITION_PREFILL pour obtenir le vrai nom envoyé à Tally (ex. "Histoire
// d'Amour"). Sans data-edition explicite, on déduit la clé depuis la page
// actuellement affichée.
// Chaque clic force un formulaire Tally VIERGE (voir forceTallyReload et
// renderRoute) : sans ça, un client qui a déjà validé une commande retombe
// sur l'écran "merci" de Tally et ne peut plus en repasser une seconde,
// que ce soit pour la même édition ou une autre.
document.querySelectorAll("[data-order-cta]").forEach((el) => {
  el.addEventListener("click", () => {
    const currentRoute = document.body.getAttribute("data-page") || "";
    const editionKey = el.dataset.edition || currentRoute;
    const edition = EDITION_PREFILL[editionKey] || "";
    const query = edition ? ("?edition=" + encodeURIComponent(edition)) : "";
    const targetHash = "commande" + query;

    forceTallyReload = true;

    if (window.location.hash.replace("#", "") === targetHash) {
      // Le hash cible est identique au hash actuel : "hashchange" ne se
      // déclenche pas tout seul dans ce cas, on relance donc le rendu de
      // la route manuellement pour appliquer le rechargement forcé.
      renderRoute();
    } else {
      window.location.hash = targetHash;
    }
  });
});

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* --------------------------------------------------------------------------
   4) ROUTEUR par hash — 7 "pages" dans un seul fichier
   -------------------------------------------------------------------------- */
const ROUTES = {
  "accueil":        { title: "Instant Collecté — Le souvenir qu'on déballe, qu'on offre", header: "full" },
  "concept":        { title: "Comment ça marche — Instant Collecté", header: "full" },
  "king-jouet":     { title: "Partenariat King Jouet — Instant Collecté", header: "minimal" },
  "fete-des-meres": { title: "Édition Pour toute la Famille ! — Instant Collecté", header: "full" },
  "saint-valentin": { title: "Édition Histoire d'Amour — Instant Collecté", header: "full" },
  "mariage":        { title: "Notre Mariage — Instant Collecté",                    header: "full" },
  "contact":        { title: "Nous contacter — Instant Collecté",                     header: "full" },
  "souvenir-ete":   { title: "Édition Souvenir d'été — Instant Collecté",            header: "full" },
  "jour-de-fete":   { title: "Jour de Fête ! — Instant Collecté",                     header: "full" },
  "partenaires":    { title: "Nos Partenaires — Instant Collecté",                     header: "full" },
  "realisations":   { title: "Un autre projet ? — Réalisations sur-mesure — Instant Collecté", header: "full" },
  "mentions-legales": { title: "Mentions légales — Instant Collecté",                   header: "full" },
  "cgv":              { title: "Conditions Générales de Vente — Instant Collecté",       header: "full" },
  "commande":         { title: "Votre commande — Instant Collecté",                      header: "full" },
};
const DEFAULT_ROUTE = "accueil";

const siteHeader     = document.getElementById("siteHeader");
  const siteFooter     = document.getElementById("siteFooter") || document.querySelector(".footer");
const navLinksPanel  = document.getElementById("navLinks");
const navBurger      = document.getElementById("navBurger");
const navEditions    = document.getElementById("navEditions");
const navEditionsTrig = document.getElementById("navEditionsTrigger");
const pages          = document.querySelectorAll(".page");

function resolveRoute(rawHash){
  // On ignore tout ce qui suit un "?" (ex. #commande?edition=Notre+Mariage)
  // pour que la route reste bien "commande" et ne tombe pas sur DEFAULT_ROUTE.
  const clean = (rawHash || "").replace("#", "").split("?")[0].trim();
  return ROUTES[clean] ? clean : DEFAULT_ROUTE;
}

function renderRoute(){
  const rawHash = window.location.hash;
  const route = resolveRoute(rawHash);
  const config = ROUTES[route];

  // On entre fraîchement dans le tunnel de commande depuis une autre page
  // (navigation directe, retour arrière du navigateur, etc.) : on force un
  // formulaire vierge, même si l'édition demandée est identique à la
  // dernière fois.
  if (route === "commande" && previousRoute !== "commande") {
    forceTallyReload = true;
  }
  previousRoute = route;

  pages.forEach((page) => page.classList.toggle("is-active", page.dataset.pageSection === route));

  document.body.setAttribute("data-page", route);
  document.title = config.title;

  siteHeader.classList.toggle("header-minimal", config.header === "minimal");
  if (siteFooter) siteFooter.classList.toggle("footer-minimal", route === "king-jouet");

  document.querySelectorAll("[data-route-link]").forEach((link) => {
    link.classList.toggle("is-active", link.dataset.routeLink === route);
  });

  closeEditions();
  navLinksPanel.classList.remove("is-open");
  navBurger.setAttribute("aria-expanded", "false");

  // Scroll immédiat — triple méthode pour compatibilité navigateurs
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  window.scrollTo(0, 0);

  // ré-arme les apparitions au scroll sur le contenu désormais visible
  setupReveal();

  // Repositionne la flèche concept exactement 10px sous le texte
  if (route === "concept") positionConceptArrow();

  // Charge le formulaire Tally avec l'édition pré-remplie (si présente dans le
  // hash, ex. #commande?edition=Notre+Mariage). On ne recharge que lorsque
  // forceTallyReload l'exige (nouveau clic "Je commande" ou entrée fraîche
  // dans le tunnel, voir plus haut) — le paramètre anti-cache "_r" garantit
  // que le rechargement est réel même si l'édition demandée est identique à
  // la précédente, pour ne jamais rester bloqué sur l'écran "merci" de Tally.
  if (route === "commande") {
    const queryIndex = rawHash.indexOf("?");
    const query = queryIndex !== -1 ? "&" + rawHash.slice(queryIndex + 1) : "";
    const frame = document.getElementById("tallyFrame");
    if (frame && (forceTallyReload || !frame.dataset.tallySrc)) {
      const url = TALLY_EMBED_BASE + query + "&_r=" + Date.now();
      frame.dataset.tallySrc = url;
      if (window.Tally && typeof window.Tally.loadEmbeds === "function") {
        window.Tally.loadEmbeds();          // active dynamicHeight & co
      } else {
        frame.src = url;                     // fallback si embed.js pas chargé
      }
      forceTallyReload = false;
    }
  }
}

window.addEventListener("hashchange", renderRoute);

/* --------------------------------------------------------------------------
   Flèche concept — positionnement dynamique (indépendant des fonts)
   -------------------------------------------------------------------------- */
function positionConceptArrow() {
  const lastP  = document.querySelector("#page-concept .concept-nostalgie-text p:last-of-type");
  const arrow  = document.querySelector("#page-concept .concept-nostalgie-arrow");
  const section = document.querySelector("#page-concept .concept-nostalgie");
  if (!lastP || !arrow || !section) return;

  const pRect = lastP.getBoundingClientRect();
  const sRect = section.getBoundingClientRect();

  // 10px sous le dernier paragraphe, exprimé en top relatif à la section
  arrow.style.top    = (pRect.bottom - sRect.top - 38) + "px";
  arrow.style.bottom = "auto";
}

// Applique aussi quand les fonts Google sont chargées (Work Sans change les mesures)
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => {
    if (document.querySelector("#page-concept.is-active")) positionConceptArrow();
  });
}
window.addEventListener("resize", () => {
  if (document.querySelector("#page-concept.is-active")) positionConceptArrow();
});

/* --------------------------------------------------------------------------
   4b) Scroll en haut sur TOUT clic de lien hash (nav, footer, cartes…)
       Couvre aussi le cas où le hash ne change pas (même page, relance manuelle)
   -------------------------------------------------------------------------- */
document.addEventListener("click", (e) => {
  const anchor = e.target.closest('a[href^="#"]');
  if (!anchor) return;
  const target = anchor.getAttribute("href").replace("#", "");
  if (!ROUTES[target]) return; // ignore les ancres non-routées

  // Si le hash est déjà le bon, hashchange ne se déclenche pas → on force manuellement
  if (resolveRoute(window.location.hash) === target) {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);
  }
  // Dans tous les cas, on sécurise le scroll au prochain tick
  setTimeout(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);
  }, 16);
});

/* --------------------------------------------------------------------------
   5) Dropdown "Éditions" — ouverture au clic + survol (desktop), accessible
   -------------------------------------------------------------------------- */
function openEditions(){
  if (!navEditions) return;
  navEditions.classList.add("is-open");
  navEditionsTrig.setAttribute("aria-expanded", "true");
}
function closeEditions(){
  if (!navEditions) return;
  navEditions.classList.remove("is-open");
  navEditionsTrig.setAttribute("aria-expanded", "false");
}
function toggleEditions(){
  if (!navEditions) return;
  navEditions.classList.contains("is-open") ? closeEditions() : openEditions();
}

if (navEditions && navEditionsTrig){
  navEditionsTrig.addEventListener("click", (e) => { e.stopPropagation(); toggleEditions(); });

  // survol sur desktop seulement
  const hoverCapable = window.matchMedia("(hover: hover) and (min-width: 761px)");
  navEditions.addEventListener("mouseenter", () => { if (hoverCapable.matches) openEditions(); });
  navEditions.addEventListener("mouseleave", () => { if (hoverCapable.matches) closeEditions(); });

  // clic en dehors ferme
  document.addEventListener("click", (e) => {
    if (navEditions.classList.contains("is-open") && !navEditions.contains(e.target)) closeEditions();
  });
  // Échap ferme
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeEditions(); });
}

/* --------------------------------------------------------------------------
   6) Menu mobile (burger)
   -------------------------------------------------------------------------- */
if (navBurger && navLinksPanel){
  navBurger.addEventListener("click", () => {
    const isOpen = navLinksPanel.classList.toggle("is-open");
    navBurger.setAttribute("aria-expanded", String(isOpen));
  });
  navLinksPanel.querySelectorAll("a, .nav-cta").forEach((el) => {
    el.addEventListener("click", () => {
      navLinksPanel.classList.remove("is-open");
      navBurger.setAttribute("aria-expanded", "false");
    });
  });
}

/* --------------------------------------------------------------------------
   7) Booster mystère — ouverture façon "booster TCG", au clic/tap uniquement
      Séquence complète, entièrement automatique une fois déclenchée :
        1. déchirure du pack (scale + fade)
        2. flash lumineux
        3. les 3 cartes s'envolent en éventail avec rebond, puis flottent
        4. freeze de 5 secondes, le temps de regarder les photos
        5. les cartes rentrent dans le pack (animation inverse)
        6. le pack se reforme, retour à l'état initial
      Pas de bouton dédié : on reclique sur le pack pour relancer le cycle.
   -------------------------------------------------------------------------- */
const boosterPack    = document.getElementById("boosterPack");
const boosterFlash   = document.getElementById("boosterFlash");
const boosterReveal  = document.getElementById("boosterReveal");

let boosterIsBusy = false; // verrouille les clics pendant tout le cycle
let boosterAnimTimers = [];

function clearBoosterTimers(){
  boosterAnimTimers.forEach((t) => clearTimeout(t));
  boosterAnimTimers = [];
}

function runBoosterCycle(){
  if (!boosterPack || !boosterReveal || boosterIsBusy) return;
  boosterIsBusy = true;

  boosterPack.setAttribute("aria-expanded", "true");
  boosterPack.setAttribute("aria-label", "Booster ouvert");

  if (prefersReducedMotion){
    // version simplifiée : affichage direct, freeze 5s, puis retour direct
    boosterPack.classList.add("is-open");
    boosterReveal.classList.add("is-visible", "is-settled");
    boosterAnimTimers.push(setTimeout(() => {
      boosterReveal.classList.remove("is-visible", "is-settled");
      boosterPack.classList.remove("is-open");
      boosterPack.setAttribute("aria-expanded", "false");
      boosterPack.setAttribute("aria-label", "Cliquer pour ouvrir le booster mystère");
      boosterIsBusy = false;
    }, 3500));
    return;
  }

  // 1) le pack se déchire
  boosterPack.classList.add("is-opening");

  // 2) flash lumineux, synchronisé avec la fin de la déchirure
  boosterAnimTimers.push(setTimeout(() => {
    boosterPack.classList.remove("is-opening");
    boosterPack.classList.add("is-open");
    if (boosterFlash) boosterFlash.classList.add("is-flashing");
  }, 280));

  // 3) les cartes s'envolent en éventail
  boosterAnimTimers.push(setTimeout(() => {
    boosterReveal.classList.add("is-visible");
  }, 340));

  // 4) une fois posées, petit flottement continu + démarrage du freeze de 5s
  boosterAnimTimers.push(setTimeout(() => {
    boosterReveal.classList.add("is-settled");
    if (boosterFlash) boosterFlash.classList.remove("is-flashing");
  }, 1100));

  // 5) après le freeze, les cartes rentrent dans le pack (animation inverse)
  boosterAnimTimers.push(setTimeout(() => {
    boosterReveal.classList.remove("is-settled");
    boosterReveal.classList.add("is-returning");
  }, 4600));

  // 6) le pack se reforme une fois les cartes rentrées
  boosterAnimTimers.push(setTimeout(() => {
    boosterReveal.classList.remove("is-visible", "is-returning");
    boosterPack.classList.remove("is-open");
    boosterPack.classList.add("is-reforming");
  }, 5060));

  // 7) retour complet à l'état initial, le clic redevient possible
  boosterAnimTimers.push(setTimeout(() => {
    boosterPack.classList.remove("is-reforming");
    boosterPack.setAttribute("aria-expanded", "false");
    boosterPack.setAttribute("aria-label", "Cliquer pour ouvrir le booster mystère");
    boosterIsBusy = false;
  }, 5560));
}

if (boosterPack && boosterReveal){
  boosterPack.addEventListener("click", runBoosterCycle);
}

/* --------------------------------------------------------------------------
   8) Apparitions au scroll (marquées) — ré-armées à chaque changement de page
   -------------------------------------------------------------------------- */
let revealObserver = null;
const REVEAL_SELECTOR = ".page.is-active .values .value, .page.is-active .step-mini, .page.is-active .produit-card, .page.is-active .concept-step-row, .page.is-active .feature-band, .page.is-active .polaroid, .page.is-active .faq-item, .page.is-active .section-header, .page.is-active .partenaire-header, .page.is-active .video-embed-wrap, .page.is-active .contact-card, .page.is-active .contact-form-wrap, .page.is-active .concept-nostalgie-text";

function setupReveal(){
  if (prefersReducedMotion) return;
  if (revealObserver) revealObserver.disconnect();

  const targets = document.querySelectorAll(REVEAL_SELECTOR);
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting){
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

  targets.forEach((el, i) => {
    el.classList.add("reveal");
    // petit décalage en cascade dans une même rangée
    const mod = i % 3;
    if (mod === 1) el.classList.add("reveal-delay-1");
    if (mod === 2) el.classList.add("reveal-delay-2");
    revealObserver.observe(el);
  });
}

/* --------------------------------------------------------------------------
   9) Init
   -------------------------------------------------------------------------- */
applyImages();
renderRoute();

/* --------------------------------------------------------------------------
   10) Formulaire de contact — Formspree + fallback mailto
   -------------------------------------------------------------------------- */
(function(){
  const form = document.getElementById("contactForm");
  if (!form) return;
  const submitBtn    = document.getElementById("cfSubmitBtn");
  const labelDefault = submitBtn ? submitBtn.querySelector(".form-submit-label") : null;
  const labelSending = submitBtn ? submitBtn.querySelector(".form-submit-sending") : null;
  const successBox   = document.getElementById("cfSuccess");
  const errorBox     = document.getElementById("cfError");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const requiredFields = form.querySelectorAll("[required]");
    let valid = true;
    requiredFields.forEach((f) => { f.classList.toggle("is-invalid", !f.value.trim()); if (!f.value.trim()) valid = false; });
    if (!valid) return;
    if (submitBtn) submitBtn.disabled = true;
    if (labelDefault) labelDefault.hidden = true;
    if (labelSending) labelSending.hidden = false;
    if (successBox) successBox.hidden = true;
    if (errorBox) errorBox.hidden = true;

    const action = form.getAttribute("action") || "";
    const isFormspree = action.includes("formspree.io") && !action.includes("YOUR_FORMSPREE_ID");

    if (isFormspree) {
      try {
        const res = await fetch(action, { method:"POST", body:new FormData(form), headers:{"Accept":"application/json"} });
        if (res.ok) { form.reset(); if (successBox) successBox.hidden = false; }
        else throw new Error();
      } catch { if (errorBox) errorBox.hidden = false; }
    } else {
      const fn=(form.querySelector("#cf-firstname")||{value:""}).value, ln=(form.querySelector("#cf-lastname")||{value:""}).value;
      const em=(form.querySelector("#cf-email")||{value:""}).value;
      const ph=(form.querySelector("#cf-phone")||{value:""}).value, tp=(form.querySelector("#cf-type")||{value:""}).value;
      const ms=(form.querySelector("#cf-message")||{value:""}).value;
      const body=`Nom : ${fn} ${ln}\nEmail : ${em}\nTéléphone : ${ph||"–"}\nType : ${tp}\n\nMessage :\n${ms}`;
      window.location.href=`mailto:[À REMPLACER]?subject=Nouvelle demande — Instant Collecté&body=${encodeURIComponent(body)}`;
      if (successBox) successBox.hidden = false;
    }
    if (submitBtn) submitBtn.disabled = false;
    if (labelDefault) labelDefault.hidden = false;
    if (labelSending) labelSending.hidden = true;
  });
  form.querySelectorAll(".form-input").forEach((i) => i.addEventListener("input", () => i.classList.remove("is-invalid")));
})();

/* ---------- Carousel preuve sociale — infinite ---------- */
function initCarousel(){
  const track = document.querySelector('.sp-track');
  if(!track) return;
  const cards = Array.from(track.querySelectorAll('.screenshot-card'));
  const prevBtn = document.querySelector('.sp-prev');
  const nextBtn = document.querySelector('.sp-next');
  const dotsWrap = document.getElementById('spDots');
  const visible = window.innerWidth <= 640 ? 1 : 3;
  const total = cards.length;
  const max = total - visible;
  let current = 0;
  let animating = false;

  if(dotsWrap){
    dotsWrap.innerHTML = '';
    for(let i = 0; i <= max; i++){
      const dot = document.createElement('button');
      dot.className = 'sp-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Avis ' + (i+1));
      dot.addEventListener('click', function(){ goTo(i); });
      dotsWrap.appendChild(dot);
    }
  }

  function getCardWidth(){ return cards[0].offsetWidth + 16; }

  function updateDots(){
    document.querySelectorAll('.sp-dot').forEach(function(d, i){ d.classList.toggle('active', i === current); });
  }

  function goTo(index, instant){
    current = ((index % (max+1)) + (max+1)) % (max+1);
    var tx = current * getCardWidth();
    if(instant){ track.style.transition = 'none'; } else { track.style.transition = 'transform 0.4s ease'; }
    track.style.transform = 'translateX(-' + tx + 'px)';
    updateDots();
  }

  function goNext(){
    if(animating) return;
    if(current >= max){
      // Sauter à la fin, puis revenir au début sans animation
      animating = true;
      track.style.transition = 'none';
      track.style.transform = 'translateX(-' + (current * getCardWidth()) + 'px)';
      setTimeout(function(){
        track.style.transition = 'transform 0.4s ease';
        current = 0;
        track.style.transform = 'translateX(0)';
        updateDots();
        setTimeout(function(){ animating = false; }, 420);
      }, 20);
    } else {
      goTo(current + 1);
    }
  }

  function goPrev(){
    if(animating) return;
    if(current <= 0){
      animating = true;
      track.style.transition = 'none';
      track.style.transform = 'translateX(0)';
      setTimeout(function(){
        track.style.transition = 'transform 0.4s ease';
        current = max;
        track.style.transform = 'translateX(-' + (max * getCardWidth()) + 'px)';
        updateDots();
        setTimeout(function(){ animating = false; }, 420);
      }, 20);
    } else {
      goTo(current - 1);
    }
  }

  if(prevBtn) prevBtn.addEventListener('click', goPrev);
  if(nextBtn) nextBtn.addEventListener('click', goNext);
  goTo(0);
}
document.addEventListener('DOMContentLoaded', function(){ initCarousel(); });

if (typeof applyImages === "function") applyImages();

/* --------------------------------------------------------------------------
   FAQ accordion — délégation d'événement, fonctionne après rendu de page
   -------------------------------------------------------------------------- */
document.addEventListener('click', function(e) {
  const btn = e.target.closest('.faq-question');
  if (!btn) return;
  const card = btn.closest('[data-faq-card]');
  if (!card) return;
  const isOpen = card.classList.contains('is-open');
  // Ferme toutes les cartes ouvertes
  document.querySelectorAll('[data-faq-card].is-open').forEach(function(c) {
    c.classList.remove('is-open');
    c.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
  });
  // Ouvre la carte cliquée si elle était fermée
  if (!isOpen) {
    card.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
  }
});
