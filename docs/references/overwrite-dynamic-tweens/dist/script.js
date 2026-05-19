gsap.registerPlugin(CustomEase, CustomWiggle);
 
/* ── code modal ── */
var modalSnippets = [
  // 0 — overwrite: true + wiggle
  '// wiggle loop\ngsap.to(btn, {\n  rotation: 12,\n  duration: 1.5,\n  repeat: -1,\n  ease: "wiggle({wiggles:8, type:easeOut})"\n});\n\n// magnetic pull — overwrite: true kills the wiggle!\nzone.addEventListener("mousemove", (e) => {\n  const rect = zone.getBoundingClientRect();\n  const x = gsap.utils.mapRange(rect.left, rect.right,-rect.width / 2, rect.width / 2, e.clientX);\n  const y = gsap.utils.mapRange(rect.top, rect.bottom, -rect.height / 2, rect.height / 2, e.clientY);\n\n  gsap.to(btn, {\n    x: x * strength,\n    y: y * strength,\n    duration: 0.4,\n    ease: "power2.out",\n    overwrite: true\n  });\n});\n\nzone.addEventListener("mouseleave", () => {\n  gsap.to(btn, { x: 0, y: 0,\n    duration: 0.7,\n    ease: "elastic.out(1, 0.4)",\n    overwrite: true\n  });\n});',
 
  // 1 — overwrite: "auto" + wiggle
  '// wiggle loop\ngsap.to(btn, {\n  rotation: 12,\n  duration: 1.5,\n  repeat: -1,\n  ease: "wiggle({wiggles:8, type:easeOut})"\n});\n\n// magnetic pull — overwrite: "auto" keeps the wiggle!\nzone.addEventListener("mousemove", (e) => {\n  const rect = zone.getBoundingClientRect();\n  const x = gsap.utils.mapRange(rect.left, rect.right,-rect.width / 2, rect.width / 2, e.clientX);\n  const y = gsap.utils.mapRange(rect.top, rect.bottom, -rect.height / 2, rect.height / 2, e.clientY);\n\n  gsap.to(btn, {\n    x: x * strength,\n    y: y * strength,\n    duration: 0.4,\n    ease: "power2.out",\n    overwrite: "auto"\n  });\n});\n\nzone.addEventListener("mouseleave", () => {\n  gsap.to(btn, { x: 0, y: 0,\n    duration: 0.7,\n    ease: "elastic.out(1, 0.4)",\n    overwrite: "auto"\n  });\n  // wiggle is still running\n});',
 
  // 2 — no wiggle, overwrite: true
  '// no wiggle — simply overwriting x and y. \nzone.addEventListener("mousemove", (e) => {\n  const rect = zone.getBoundingClientRect();\n  const x = gsap.utils.mapRange(rect.left, rect.right,-rect.width / 2, rect.width / 2, e.clientX);\n  const y = gsap.utils.mapRange(rect.top, rect.bottom,-rect.height / 2, rect.height / 2, e.clientY);\n\n  gsap.to(btn, {\n    x: x * strength,\n    y: y * strength,\n    duration: 0.4,\n    ease: "power2.out",\n    overwrite: true\n  });\n});\n\nzone.addEventListener("mouseleave", () => {\n  gsap.to(btn, { \n    x: 0, \n    y: 0,\n    duration: 0.7,\n    ease: "elastic.out(1, 0.4)",\n    overwrite: true\n  });\n});',
 
  // 3 — overwrite: false (long move, snappy leave)
  '// magnetic pull — LONG duration on mousemove\nzone.addEventListener("mousemove", (e) => {\n  const rect = zone.getBoundingClientRect();\n  const x = gsap.utils.mapRange(rect.left, rect.right,-rect.width / 2, rect.width / 2, e.clientX);\n  const y = gsap.utils.mapRange(rect.top, rect.bottom, -rect.height / 2, rect.height / 2, e.clientY);\n\n  gsap.to(btn, {\n    x: x * strength,\n    y: y * strength,\n    duration: 1.5,        // slow follow\n    ease: "power2.out",\n    overwrite: false       // default — won\'t kill anything\n  });\n});\n\n// SHORT snappy mouseleave — finishes fast,\n// but the old long mousemove tween is still going\n// and reclaims x/y → visible snap-back!\nzone.addEventListener("mouseleave", () => {\n  gsap.to(btn, { x: 0, y: 0,\n    duration: 0.15,\n    ease: "power2.out",\n    overwrite: false\n  });\n});'
];
 
var overlay = document.getElementById("modalOverlay");
var modalCode = document.getElementById("modalCode");
 
document.querySelectorAll(".code-peek").forEach(function(btn) {
  btn.addEventListener("click", function(e) {
    e.stopPropagation();
    var idx = parseInt(btn.getAttribute("data-code"));
    modalCode.textContent = modalSnippets[idx];
    if (window.Prism) Prism.highlightElement(modalCode);
    overlay.classList.add("open");
  });
});
 
document.getElementById("modalClose").addEventListener("click", function() {
  overlay.classList.remove("open");
});
 
overlay.addEventListener("click", function(e) {
  if (e.target === overlay) overlay.classList.remove("open");
});
 
/* ── magnetic buttons ── */
var zones = document.querySelectorAll(".mag-zone");
var strength = 0.4;
var labelStrength = 0.24;
 
zones.forEach(function(zone) {
  var btn = zone.querySelector(".mag-btn");
  var label = btn.querySelector(".label");
  var mode = zone.getAttribute("data-mode");
  var overwrite = mode === "true" ? true : mode === "false" ? false : "auto";
  var isFalse = mode === "false";
  var hasWiggle = zone.getAttribute("data-wiggle") === "true";
 
  // attention-seeking wiggle (if enabled)
  if (hasWiggle) {
    gsap.to(btn, {
      rotation: 12,
      duration: 1.5,
      repeat: -1,
      ease: "wiggle({wiggles:8,type:easeOut})"
    });
  }
 
  zone.addEventListener("mousemove", function(e) {
    var rect = zone.getBoundingClientRect();
    var mapX = gsap.utils.mapRange(rect.left, rect.right, -rect.width / 2, rect.width / 2, e.clientX);
    var mapY = gsap.utils.mapRange(rect.top, rect.bottom, -rect.height / 2, rect.height / 2, e.clientY);
 
    gsap.to(btn, {
      x: mapX * strength,
      y: mapY * strength,
      duration: isFalse ? 1.5 : 0.4,
      ease: "power2.out",
      overwrite: overwrite
    });
 
    gsap.to(label, {
      x: mapX * labelStrength,
      y: mapY * labelStrength,
      duration: isFalse ? 1.5 : 0.4,
      ease: "power2.out",
      overwrite: true
    });
  });
 
  zone.addEventListener("mouseleave", function() {
    gsap.to(btn, {
      x: 0, y: 0,
      duration: isFalse ? 0.5 : 0.7,
      ease: isFalse ? "power2.out" : "elastic.out(1,0.4)",
      overwrite: overwrite
    });
 
    gsap.to(label, {
      x: 0, y: 0,
      duration: isFalse ? 0.5 : 0.7,
      ease: isFalse ? "power2.out" : "elastic.out(1,0.4)",
      overwrite: true
    });
  });
});