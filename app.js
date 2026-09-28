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
   GLOBAL DYNAMIC LIGHTNING & ELECTRIFIED CTA SYSTEM
   1. Welcome Dual-Strike: Left & Right lightning bolts converge onto Hero CTA,
      igniting and permanently electrifying the button.
   2. Scroll-Stop Trigger: Fires atmospheric thunderbolts when user pauses scrolling.
   3. Ambient Periodic Strikes: High-voltage atmospheric pulses during idle reading.
   ═══════════════════════════════════════════════════════════════════ */
(function initGlobalLightningSystem() {
  if (reducedMotion) return;

  var stage = document.getElementById("globalLightningStage");
  var globalGrid = document.getElementById("globalGrid");
  var gridIlluminated = document.getElementById("gridIlluminated");
  var skyFlash = document.getElementById("skyFlash");
  var heroPrimaryCta = document.getElementById("heroPrimaryCta");

  if (!stage || !globalGrid) return;

  var lastStrikeTime = 0;
  var MIN_STRIKE_COOLDOWN = 4500; /* Minimum 4.5s cooldown between automatic strikes */

  /* Midpoint displacement generator for jagged natural lightning (3-4 iterations = optimal 60/120fps) */
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

  /* ─── 1. Welcome Dual-Strike Targeting Hero CTA ─── */
  function triggerCtaActivationStrike() {
    if (document.hidden) return;
    if (!heroPrimaryCta) {
      triggerAtmosphericStrike();
      return;
    }

    var viewW = window.innerWidth;
    var viewH = window.innerHeight;
    var ctaRect = heroPrimaryCta.getBoundingClientRect();

    /* Target center of CTA button */
    var targetX = Math.round(ctaRect.left + ctaRect.width / 2);
    var targetY = Math.round(ctaRect.top + ctaRect.height / 2);

    /* Left bolt starts from top-left, right bolt from top-right */
    var leftStartX = Math.round(viewW * 0.08);
    var leftStartY = Math.round(Math.random() * -15);
    var rightStartX = Math.round(viewW * 0.92);
    var rightStartY = Math.round(Math.random() * -15);

    var leftPoints = getBoltPoints(leftStartX, leftStartY, targetX, targetY, 95, 3);
    var rightPoints = getBoltPoints(rightStartX, rightStartY, targetX, targetY, 95, 3);

    var leftPathD = pointsToPath(leftPoints);
    var rightPathD = pointsToPath(rightPoints);

    /* Generate minor branches for extra realism */
    var branchPathsD = [];
    [leftPoints, rightPoints].forEach(function (bolt) {
      if (bolt.length > 4) {
        var split = bolt[Math.floor(bolt.length * 0.45)];
        var bPoints = getBoltPoints(split.x, split.y, split.x + (Math.random() - 0.5) * 80, split.y + 70, 30, 2);
        branchPathsD.push(pointsToPath(bPoints));
      }
    });

    /* Illumination & sky flash */
    globalGrid.style.setProperty("--strike-x", targetX + "px");
    globalGrid.style.setProperty("--strike-y", targetY + "px");

    if (gridIlluminated) gridIlluminated.classList.remove("flash-active");
    if (skyFlash) skyFlash.classList.remove("flash-active");

    requestAnimationFrame(function () {
      if (gridIlluminated) gridIlluminated.classList.add("flash-active");
      if (skyFlash) skyFlash.classList.add("flash-active");
      heroPrimaryCta.classList.add("is-impact-flashing");
      heroPrimaryCta.classList.add("is-electrified");
      var ctaWrapper = document.getElementById("ctaElectricWrapper");
      if (ctaWrapper) ctaWrapper.classList.add("is-charged");
    });

    /* Build SVG container */
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "targeted-bolt-svg bolt-anim");
    svg.setAttribute("viewBox", "0 0 " + viewW + " " + viewH);
    svg.setAttribute("preserveAspectRatio", "none");

    /* Left bolt glow + core */
    var lGlow = document.createElementNS("http://www.w3.org/2000/svg", "path");
    lGlow.setAttribute("class", "targeted-bolt-glow");
    lGlow.setAttribute("d", leftPathD);
    svg.appendChild(lGlow);

    var lCore = document.createElementNS("http://www.w3.org/2000/svg", "path");
    lCore.setAttribute("class", "targeted-bolt-core");
    lCore.setAttribute("d", leftPathD);
    svg.appendChild(lCore);

    /* Right bolt glow + core */
    var rGlow = document.createElementNS("http://www.w3.org/2000/svg", "path");
    rGlow.setAttribute("class", "targeted-bolt-glow");
    rGlow.setAttribute("d", rightPathD);
    svg.appendChild(rGlow);

    var rCore = document.createElementNS("http://www.w3.org/2000/svg", "path");
    rCore.setAttribute("class", "targeted-bolt-core");
    rCore.setAttribute("d", rightPathD);
    svg.appendChild(rCore);

    /* Branches */
    branchPathsD.forEach(function (bD) {
      var bP = document.createElementNS("http://www.w3.org/2000/svg", "path");
      bP.setAttribute("class", "targeted-bolt-branch");
      bP.setAttribute("d", bD);
      svg.appendChild(bP);
    });

    stage.appendChild(svg);

    /* Clean up bolt SVG and reset impact flash (keeps .is-electrified active!) */
    setTimeout(function () {
      if (svg && svg.parentNode) svg.parentNode.removeChild(svg);
      if (gridIlluminated) gridIlluminated.classList.remove("flash-active");
      if (skyFlash) skyFlash.classList.remove("flash-active");
      heroPrimaryCta.classList.remove("is-impact-flashing");
    }, 620);
  }

  /* ─── 2. Atmospheric Background Strike ─── */
  function triggerAtmosphericStrike(customTargetX, customTargetY) {
    if (document.hidden) return;

    var viewW = window.innerWidth;
    var viewH = window.innerHeight;

    var startX = Math.round(viewW * (0.15 + Math.random() * 0.7));
    var startY = Math.round(Math.random() * -20);
    var endY = typeof customTargetY === "number" ? customTargetY : Math.round(viewH * (0.6 + Math.random() * 0.35));
    var driftX = (Math.random() - 0.5) * 280;
    var endX = typeof customTargetX === "number" ? customTargetX : Math.max(25, Math.min(viewW - 25, startX + driftX));

    var mainPoints = getBoltPoints(startX, startY, endX, endY, 110, 3);
    var mainPathD = pointsToPath(mainPoints);

    /* Minor branch */
    var branchPathsD = [];
    if (mainPoints.length > 5) {
      var splitIdx = Math.floor(mainPoints.length * 0.42);
      var origin = mainPoints[splitIdx];
      var branchAngle = Math.random() > 0.5 ? 0.6 : -0.6;
      var bPoints = getBoltPoints(origin.x, origin.y, origin.x + Math.sin(branchAngle) * 85, origin.y + Math.cos(branchAngle) * 95, 35, 2);
      branchPathsD.push(pointsToPath(bPoints));
    }

    globalGrid.style.setProperty("--strike-x", startX + "px");
    globalGrid.style.setProperty("--strike-y", Math.max(60, Math.min(viewH * 0.45, startY + 120)) + "px");

    if (gridIlluminated) gridIlluminated.classList.remove("flash-active");
    if (skyFlash) skyFlash.classList.remove("flash-active");

    requestAnimationFrame(function () {
      if (gridIlluminated) gridIlluminated.classList.add("flash-active");
      if (skyFlash) skyFlash.classList.add("flash-active");
    });

    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "global-bolt-svg bolt-anim");
    svg.setAttribute("viewBox", "0 0 " + viewW + " " + viewH);
    svg.setAttribute("preserveAspectRatio", "none");

    var glowPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    glowPath.setAttribute("class", "global-bolt-glow");
    glowPath.setAttribute("d", mainPathD);
    svg.appendChild(glowPath);

    var corePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    corePath.setAttribute("class", "global-bolt-core");
    corePath.setAttribute("d", mainPathD);
    svg.appendChild(corePath);

    branchPathsD.forEach(function (bD) {
      var bP = document.createElementNS("http://www.w3.org/2000/svg", "path");
      bP.setAttribute("class", "global-bolt-branch");
      bP.setAttribute("d", bD);
      svg.appendChild(bP);
    });

    stage.appendChild(svg);

    setTimeout(function () {
      if (svg && svg.parentNode) svg.parentNode.removeChild(svg);
      if (gridIlluminated) gridIlluminated.classList.remove("flash-active");
      if (skyFlash) skyFlash.classList.remove("flash-active");
    }, 620);
  }

  /* ─── 3. Scroll-Stop Lightning Trigger ─── */
  /* Detects when user scrolls and pauses to read, then fires lightning */
  var scrollStopTimer = null;
  window.addEventListener("scroll", function () {
    clearTimeout(scrollStopTimer);
    scrollStopTimer = setTimeout(function () {
      if (document.hidden) return;
      var now = Date.now();
      if (now - lastStrikeTime < MIN_STRIKE_COOLDOWN) return;

      lastStrikeTime = now;
      triggerAtmosphericStrike();
    }, 550);
  }, { passive: true });

  /* ─── 4. Periodic Ambient Strikes (Idle reading) ─── */
  function scheduleAmbientStrike() {
    var minDelay = 9000;
    var maxDelay = 15000;
    var delay = minDelay + Math.random() * (maxDelay - minDelay);

    setTimeout(function () {
      if (!document.hidden) {
        var now = Date.now();
        if (now - lastStrikeTime >= MIN_STRIKE_COOLDOWN) {
          lastStrikeTime = now;
          triggerAtmosphericStrike();
        }
      }
      scheduleAmbientStrike();
    }, delay);
  }

  /* ─── 5. Initial Welcome Strike Sequence ─── */
  /* 1. يضرب ضربتين في السماء مرة واحدة */
  /* 2. وبعد كدا يضرب الزرار كأنه بيشحنه وتفضل الشحنات الكهربائية العشوائية شغالة */
  setTimeout(function () {
    if (document.hidden) return;

    var viewW = window.innerWidth;
    var viewH = window.innerHeight;

    /* الخطوة 1: ضربتين في السماء مرة واحدة */
    triggerAtmosphericStrike(Math.round(viewW * 0.22), Math.round(viewH * 0.48));
    triggerAtmosphericStrike(Math.round(viewW * 0.78), Math.round(viewH * 0.52));

    /* الخطوة 2: بعد كده يضرب الزرار كأنه بيشحنه */
    setTimeout(function () {
      if (document.hidden) return;
      lastStrikeTime = Date.now();
      triggerCtaActivationStrike();
      scheduleAmbientStrike();
    }, 720);
  }, 420);
})();

