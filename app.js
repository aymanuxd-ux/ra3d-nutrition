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
    var targetCat = button.dataset.coachFilter;
    applyFilter(targetCat);
    var behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    document.getElementById("products").scrollIntoView({ behavior: behavior, block: "start" });

    /* Spotlight the matching product card */
    var matchingCard = null;
    for (var i = 0; i < productCards.length; i++) {
      if (productCards[i].dataset.category === targetCat) {
        matchingCard = productCards[i];
        break;
      }
    }
    if (matchingCard && !reducedMotion) {
      productCards.forEach(function (c) { c.classList.remove("is-spotlighted"); });
      setTimeout(function () {
        matchingCard.classList.add("is-spotlighted");
        setTimeout(function () {
          matchingCard.classList.remove("is-spotlighted");
        }, 2200);
      }, 450);
    }
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

    /* Target the top edge of the CTA button where thunder naturally strikes */
    var targetX = Math.round(ctaRect.left + ctaRect.width / 2);
    var targetY = Math.round(ctaRect.top + 4);

    /* Origin: directly above in the sky with a natural slight atmospheric slant */
    var startX = Math.round(targetX + (Math.random() - 0.5) * 80);
    var startY = Math.round(Math.random() * -20);

    /* Powerful jagged thunderbolt striking down directly into the button */
    var mainPoints = getBoltPoints(startX, startY, targetX, targetY, 75, 4);
    var mainPathD = pointsToPath(mainPoints);

    /* Natural branch fork in the upper sky */
    var branchPathsD = [];
    if (mainPoints.length > 5) {
      var split = mainPoints[Math.floor(mainPoints.length * 0.4)];
      var bFork = getBoltPoints(split.x, split.y, split.x + (Math.random() > 0.5 ? 55 : -55), split.y + 65, 28, 2);
      branchPathsD.push(pointsToPath(bFork));
    }

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

    /* Bolt Glow */
    var glow = document.createElementNS("http://www.w3.org/2000/svg", "path");
    glow.setAttribute("class", "targeted-bolt-glow");
    glow.setAttribute("d", mainPathD);
    svg.appendChild(glow);

    /* Bolt Core */
    var core = document.createElementNS("http://www.w3.org/2000/svg", "path");
    core.setAttribute("class", "targeted-bolt-core");
    core.setAttribute("d", mainPathD);
    svg.appendChild(core);

    /* Upper Sky Branch Fork */
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
  /* 1. يضرب ضربتين في السماء - مع فاصل زمني 65ms لتفادي تجميد الفريمات */
  /* 2. وبعد كدا يضرب الزرار كأنه بيشحنه وتفضل الشحنات الكهربائية شغالة */
  function startWelcomeSequence() {
    if (document.hidden) return;

    var viewW = window.innerWidth;
    var viewH = window.innerHeight;

    /* الخطوة 1: ضربتين في السماء بفارق ميكروثواني لتوزيع معالجة الإطارات */
    triggerAtmosphericStrike(Math.round(viewW * 0.22), Math.round(viewH * 0.48));
    setTimeout(function () {
      if (document.hidden) return;
      triggerAtmosphericStrike(Math.round(viewW * 0.78), Math.round(viewH * 0.52));
    }, 65);

    /* الخطوة 2: بعد كده يضرب الزرار كأنه بيشحنه */
    setTimeout(function () {
      if (document.hidden) return;
      lastStrikeTime = Date.now();
      triggerCtaActivationStrike();
      scheduleAmbientStrike();
    }, 780);
  }

  /* انتظر حتى يكتمل تحميل الصفحة واستقرار الفريمات لمنع أي تهنيج عند الفتح */
  if (document.readyState === "complete") {
    setTimeout(startWelcomeSequence, 650);
  } else {
    window.addEventListener("load", function () {
      setTimeout(startWelcomeSequence, 650);
    }, { once: true });
  }
})();

/* ═══════════════════════════════════════════════════════════════════
   DESKTOP 3D CARD TILT (SUBTLE LUXURY INTERACTION)
   ═══════════════════════════════════════════════════════════════════ */
if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reducedMotion) {
  productCards.forEach(function (card) {
    card.addEventListener("mousemove", function (e) {
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var centerX = rect.width / 2;
      var centerY = rect.height / 2;
      var rotateX = ((y - centerY) / centerY) * -3.5;
      var rotateY = ((x - centerX) / centerX) * 3.5;
      card.style.transform = "perspective(1000px) rotateX(" + rotateX.toFixed(2) + "deg) rotateY(" + rotateY.toFixed(2) + "deg) translateY(-4px)";
    });
    card.addEventListener("mouseleave", function () {
      card.style.transform = "";
    });
  });
}

/* ═══════════════════════════════════════════════════════════════════
   SCROLL DYNAMICS: READING PROGRESS, HEADER SHRINK, SCROLL SPY & BACK TO TOP
   ═══════════════════════════════════════════════════════════════════ */
(function initScrollDynamics() {
  var scrollProgressBar = document.getElementById("scrollProgressBar");
  var siteHeader = document.querySelector(".site-header");
  var backTopFloat = document.getElementById("backTopFloat");
  var navLinks = Array.from(document.querySelectorAll(".site-nav a"));
  var observedSections = [
    document.getElementById("products"),
    document.getElementById("why"),
    document.getElementById("reviews"),
    document.getElementById("approach"),
    document.getElementById("faq")
  ].filter(Boolean);

  var isScrollTicking = false;

  function onScrollUpdate() {
    var scrollY = window.scrollY || window.pageYOffset || 0;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;

    /* 1. Progress Bar */
    if (scrollProgressBar && docHeight > 0) {
      var progress = Math.min(Math.max(scrollY / docHeight, 0), 1);
      scrollProgressBar.style.transform = "scaleX(" + progress + ")";
    }

    /* 2. Header Scrolled State */
    if (siteHeader) {
      siteHeader.classList.toggle("is-scrolled", scrollY > 40);
    }

    /* 3. Back to Top Button */
    if (backTopFloat) {
      backTopFloat.classList.toggle("is-visible", scrollY > 450);
    }

    /* 4. Scroll Spy */
    if (navLinks.length > 0 && observedSections.length > 0) {
      var currentSectionId = "";
      var scrollOffset = scrollY + 160;

      for (var i = observedSections.length - 1; i >= 0; i--) {
        var section = observedSections[i];
        if (section.offsetTop <= scrollOffset) {
          currentSectionId = section.id;
          break;
        }
      }

      navLinks.forEach(function (link) {
        var href = link.getAttribute("href");
        var isCurrent = currentSectionId && href === "#" + currentSectionId;
        link.classList.toggle("is-current", Boolean(isCurrent));
      });
    }

    isScrollTicking = false;
  }

  window.addEventListener("scroll", function () {
    if (!isScrollTicking) {
      window.requestAnimationFrame(onScrollUpdate);
      isScrollTicking = true;
    }
  }, { passive: true });

  /* Back to Top Click */
  if (backTopFloat) {
    backTopFloat.addEventListener("click", function () {
      var behavior = reducedMotion ? "auto" : "smooth";
      window.scrollTo({ top: 0, behavior: behavior });
    });
  }

  /* Defer initial sync until browser is idle to eliminate forced synchronous reflow at startup */
  if (window.requestIdleCallback) {
    window.requestIdleCallback(onScrollUpdate);
  } else {
    setTimeout(onScrollUpdate, 350);
  }
})();


