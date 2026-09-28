/* ═══════════════════════════════════════
   RA3D Nutrition — App Logic
   ═══════════════════════════════════════ */

var productDetails = {
  creatine: { code: "RA3D—01 / STRENGTH", title: "كرياتين مونوهيدرات", description: "100% Micronized. توضح العبوة 5 جم للحصة و30 حصة بإجمالي 150 جم. راجع الملصق الفعلي للمكونات وإرشادات الاستخدام." },
  preworkout: { code: "RA3D—02 / PRE-WORKOUT", title: "LAST REP / تركيبة ما قبل التمرين", description: "نكهة Red Thunder، والعبوة موضح عليها 10 حصص. راجع الملصق الفعلي للمكونات وإرشادات الاستخدام." },
  carbs: { code: "RA3D—03 / CARB", title: "CARB / كربوهيدرات", description: "نكهة Blueberry، والعبوة بوزن 1000 جم موضح عليها 23 حصة. راجع الملصق الفعلي للمعلومات الغذائية وإرشادات الاستخدام." }
};

document.documentElement.classList.add("js-enabled");

/* ─── Menu Toggle ─── */
var menuToggle = document.getElementById("menuToggle");
var siteNav = document.getElementById("siteNav");
menuToggle.addEventListener("click", function () {
  var open = menuToggle.getAttribute("aria-expanded") !== "true";
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "إغلاق القائمة" : "فتح القائمة");
  siteNav.classList.toggle("is-open", open);
});
siteNav.addEventListener("click", function (event) {
  if (!event.target.closest("a")) return;
  siteNav.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "فتح القائمة");
});

/* ─── Product Filter System ─── */
var filters = Array.from(document.querySelectorAll(".filter-button"));
var productCards = Array.from(document.querySelectorAll(".product-card"));
var coachOptions = Array.from(document.querySelectorAll(".coach-option"));
var catalogStatus = document.getElementById("catalogStatus");
var categoryNames = { all: "كل الفئات", strength: "القوة", energy: "قبل التمرين", carbs: "الكربوهيدرات" };

function applyFilter(selected) {
  filters.forEach(function (filter) {
    var active = filter.dataset.filter === selected;
    filter.classList.toggle("is-active", active);
    filter.setAttribute("aria-pressed", String(active));
  });
  coachOptions.forEach(function (option) {
    option.setAttribute("aria-pressed", String(option.dataset.coachFilter === selected));
  });
  productCards.forEach(function (card) {
    card.hidden = selected !== "all" && card.dataset.category !== selected;
  });
  if (catalogStatus) {
    catalogStatus.textContent = selected === "all"
      ? "المجموعة كاملة ظاهرة، اختار فئة للتصفية."
      : "المنتجات المعروضة: " + categoryNames[selected] + ". راجع تفاصيل كل منتج قبل الاختيار.";
  }
}

filters.forEach(function (button) {
  button.addEventListener("click", function () {
    applyFilter(button.dataset.filter);
  });
});

coachOptions.forEach(function (button) {
  button.addEventListener("click", function () {
    applyFilter(button.dataset.coachFilter);
    var behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    document.getElementById("products").scrollIntoView({ behavior: behavior, block: "start" });
  });
});

/* ─── Product Dialog ─── */
var dialog = document.getElementById("productDialog");
var dialogOrderBtn = document.getElementById("dialogOrderBtn");
document.querySelectorAll("[data-product]").forEach(function (button) {
  button.addEventListener("click", function () {
    var product = productDetails[button.dataset.product];
    if (!product) return;
    document.getElementById("dialogCode").textContent = product.code;
    document.getElementById("dialogTitle").textContent = product.title;
    document.getElementById("dialogDescription").textContent = product.description;
    if (dialogOrderBtn) {
      dialogOrderBtn.href = "https://wa.me/20XXXXXXXXXX?text=" + encodeURIComponent("عايز أطلب " + product.title);
    }
    dialog.showModal();
  });
});
document.querySelector(".dialog-close").addEventListener("click", function () { dialog.close(); });
dialog.addEventListener("click", function (event) { if (event.target === dialog) dialog.close(); });

/* ─── Reveal on Scroll (IntersectionObserver) ─── */
var revealItems = document.querySelectorAll(".reveal");
var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if ("IntersectionObserver" in window && !reducedMotion) {
  var observer = new IntersectionObserver(function (entries, currentObserver) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-seen");
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  revealItems.forEach(function (item) { observer.observe(item); });
} else {
  revealItems.forEach(function (item) { item.classList.add("is-seen"); });
}

/* ─── Counter Animation (Proof Bar) ─── */
function animateCounters() {
  var counters = document.querySelectorAll(".proof-number[data-count]");
  counters.forEach(function (counter) {
    var target = parseInt(counter.dataset.count, 10);
    var suffix = counter.dataset.suffix || "";
    var duration = 2200;
    var start = null;

    function step(timestamp) {
      if (!start) start = timestamp;
      var elapsed = timestamp - start;
      var progress = Math.min(elapsed / duration, 1);
      /* Ease-out cubic for a smooth deceleration */
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(eased * target);
      counter.textContent = current.toLocaleString("en") + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}

var proofBar = document.querySelector(".proof-bar");
if (proofBar && "IntersectionObserver" in window && !reducedMotion) {
  var counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      animateCounters();
      counterObserver.unobserve(entry.target);
    });
  }, { threshold: 0.35 });
  counterObserver.observe(proofBar);
} else if (proofBar) {
  /* Reduced motion or no IntersectionObserver — show final values immediately */
  document.querySelectorAll(".proof-number[data-count]").forEach(function (counter) {
    var target = parseInt(counter.dataset.count, 10);
    var suffix = counter.dataset.suffix || "";
    counter.textContent = target.toLocaleString("en") + suffix;
  });
}

/* ═══════════════════════════════════════════════════════════════════
   GLOBAL DYNAMIC LIGHTNING & REACTIVE GRID SYSTEM
   Procedural strikes at random viewport locations & reactive grid glow
   ═══════════════════════════════════════════════════════════════════ */
(function initGlobalLightningSystem() {
  if (reducedMotion) return;

  var stage = document.getElementById("globalLightningStage");
  var globalGrid = document.getElementById("globalGrid");
  var gridIlluminated = document.getElementById("gridIlluminated");
  var skyFlash = document.getElementById("skyFlash");
  var heroCarvedRa3d = document.getElementById("heroCarvedRa3d");

  if (!stage || !globalGrid) return;

  /* Click on carved inscription calls down an immediate lightning strike */
  if (heroCarvedRa3d) {
    heroCarvedRa3d.addEventListener("click", function () {
      triggerLightningStrike();
    });
  }

  /* Midpoint displacement generator for jagged natural lightning */
  function getBoltPoints(x1, y1, x2, y2, displacement, iterations) {
    var points = [{ x: x1, y: y1 }, { x: x2, y: y2 }];
    for (var i = 0; i < iterations; i++) {
      var next = [points[0]];
      for (var j = 0; j < points.length - 1; j++) {
        var p1 = points[j];
        var p2 = points[j + 1];
        var midX = (p1.x + p2.x) / 2;
        var midY = (p1.y + p2.y) / 2;
        var normX = -(p2.y - p1.y);
        var normY = (p2.x - p1.x);
        var len = Math.sqrt(normX * normX + normY * normY);
        if (len > 0) { normX /= len; normY /= len; }
        var offset = (Math.random() - 0.5) * displacement;
        next.push({ x: midX + normX * offset, y: midY + normY * offset });
        next.push(p2);
      }
      points = next;
      displacement *= 0.52;
    }
    return points;
  }

  function pointsToPath(points) {
    if (!points || points.length === 0) return "";
    var d = "M " + Math.round(points[0].x) + " " + Math.round(points[0].y);
    for (var i = 1; i < points.length; i++) {
      d += " L " + Math.round(points[i].x) + " " + Math.round(points[i].y);
    }
    return d;
  }

  function triggerLightningStrike() {
    if (document.hidden) return;

    var viewW = window.innerWidth;
    var viewH = window.innerHeight;

    /* Random origin anywhere across the top viewport */
    var startX = Math.round(viewW * (0.12 + Math.random() * 0.76));
    var startY = Math.round(Math.random() * -30);
    var endY = Math.round(viewH * (0.65 + Math.random() * 0.4));
    var driftX = (Math.random() - 0.5) * 320;
    var endX = Math.max(20, Math.min(viewW - 20, startX + driftX));

    /* Generate main bolt path (optimized to 4 iterations for 60/120fps smoothness) */
    var mainPoints = getBoltPoints(startX, startY, endX, endY, 130, 4);
    var mainPathD = pointsToPath(mainPoints);

    /* Generate 2 random branches */
    var branchPathsD = [];
    var branchCount = 2;
    for (var b = 0; b < branchCount; b++) {
      var splitIdx = Math.floor(mainPoints.length * (0.28 + b * 0.35));
      if (mainPoints[splitIdx]) {
        var origin = mainPoints[splitIdx];
        var angle = (b % 2 === 0 ? 1 : -1) * (0.45 + Math.random() * 0.55);
        var branchLen = 70 + Math.random() * 110;
        var bEndX = origin.x + Math.sin(angle) * branchLen;
        var bEndY = origin.y + Math.cos(angle) * branchLen;
        var bPoints = getBoltPoints(origin.x, origin.y, bEndX, bEndY, 40, 2);
        branchPathsD.push(pointsToPath(bPoints));
      }
    }

    /* 1. Update Reactive Grid position & trigger illumination flash without forced reflow */
    globalGrid.style.setProperty("--strike-x", startX + "px");
    globalGrid.style.setProperty("--strike-y", Math.max(60, Math.min(viewH * 0.45, startY + 120)) + "px");

    if (gridIlluminated) gridIlluminated.classList.remove("flash-active");
    if (skyFlash) skyFlash.classList.remove("flash-active");
    if (heroCarvedRa3d) heroCarvedRa3d.classList.remove("flash-active");

    requestAnimationFrame(function () {
      if (gridIlluminated) gridIlluminated.classList.add("flash-active");
      if (skyFlash) skyFlash.classList.add("flash-active");
      if (heroCarvedRa3d) heroCarvedRa3d.classList.add("flash-active");
    });

    /* 2. Build Bolt SVG (reusing static #globalLightningBloom filter) */
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "global-bolt-svg bolt-anim");
    svg.setAttribute("viewBox", "0 0 " + viewW + " " + viewH);
    svg.setAttribute("preserveAspectRatio", "none");

    /* Glow path */
    var glowPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    glowPath.setAttribute("class", "global-bolt-glow");
    glowPath.setAttribute("d", mainPathD);
    svg.appendChild(glowPath);

    /* Core path */
    var corePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    corePath.setAttribute("class", "global-bolt-core");
    corePath.setAttribute("d", mainPathD);
    svg.appendChild(corePath);

    /* Branch paths */
    branchPathsD.forEach(function (bD) {
      var bP = document.createElementNS("http://www.w3.org/2000/svg", "path");
      bP.setAttribute("class", "global-bolt-branch");
      bP.setAttribute("d", bD);
      svg.appendChild(bP);
    });

    stage.appendChild(svg);

    /* 3. Remove bolt SVG and reset illumination after animation */
    setTimeout(function () {
      if (svg && svg.parentNode) {
        svg.parentNode.removeChild(svg);
      }
      if (gridIlluminated) gridIlluminated.classList.remove("flash-active");
      if (skyFlash) skyFlash.classList.remove("flash-active");
      if (heroCarvedRa3d) heroCarvedRa3d.classList.remove("flash-active");
    }, 620);
  }

  /* Schedule recurring random strikes (pauses automatically in background tabs) */
  function scheduleNextStrike() {
    var minDelay = 4800;
    var maxDelay = 9500;
    var delay = minDelay + Math.random() * (maxDelay - minDelay);

    setTimeout(function () {
      if (!document.hidden) {
        triggerLightningStrike();

        /* 20% chance of an echo / secondary thunder shock 350-600ms later */
        if (Math.random() < 0.2) {
          setTimeout(function () {
            if (!document.hidden) triggerLightningStrike();
          }, 360 + Math.random() * 240);
        }
      }

      scheduleNextStrike();
    }, delay);
  }

  /* First ambient strike shortly after load */
  setTimeout(triggerLightningStrike, 1800);
  scheduleNextStrike();
})();

