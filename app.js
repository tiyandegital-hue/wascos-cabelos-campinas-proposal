/* Wasco's Cabelos — app.js
   Business name is ONE swappable constant. All WhatsApp links point at the
   verified number +55 19 99113-7341. No external requests. */
(function () {
  "use strict";

  var BUSINESS = "Wasco's Cabelos";
  var WA_NUMBER = "5519991137341"; // (19) 99113-7341
  var WA_DISPLAY = "(19) 99113-7341";

  function waLink(message) {
    return "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(message);
  }

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "Fechar ✕" : "Menu ☰";
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "Menu ☰";
      }
    });
  }

  /* ---------- Gallery filters + live counter ---------- */
  var chips = document.querySelectorAll(".chip[data-filter]");
  var cards = document.querySelectorAll(".work-card[data-cat]");
  var counter = document.getElementById("result-count");
  function updateCount(n) {
    if (!counter) return;
    counter.textContent = n === 1
      ? "1 trabalho exibido"
      : n + " trabalhos exibidos";
  }
  if (chips.length && cards.length) {
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) { c.setAttribute("aria-pressed", "false"); });
        chip.setAttribute("aria-pressed", "true");
        var f = chip.getAttribute("data-filter");
        var shown = 0;
        cards.forEach(function (card) {
          var show = f === "all" || card.getAttribute("data-cat") === f;
          card.hidden = !show;
          if (show) shown++;
        });
        updateCount(shown);
      });
    });
    updateCount(cards.length);
  }

  /* ---------- Agendar: 3-step WhatsApp booking ---------- */
  var booking = document.getElementById("booking-flow");
  if (booking) {
    var svcButtons = booking.querySelectorAll(".svc-toggle");
    var nameInput = document.getElementById("bk-name");
    var dateInput = document.getElementById("bk-date");
    var shiftInputs = booking.querySelectorAll('input[name="bk-shift"]');
    var preview = document.getElementById("wa-preview-text");
    var sendBtn = document.getElementById("bk-send");
    var dateHint = document.getElementById("bk-date-hint");

    function selectedServices() {
      var out = [];
      svcButtons.forEach(function (b) {
        if (b.getAttribute("aria-pressed") === "true") out.push(b.getAttribute("data-service"));
      });
      return out;
    }
    function selectedShift() {
      var s = null;
      shiftInputs.forEach(function (r) { if (r.checked) s = r.value; });
      return s;
    }
    function formatDateBR(iso) {
      if (!iso) return "";
      var parts = iso.split("-");
      if (parts.length !== 3) return iso;
      return parts[2] + "/" + parts[1] + "/" + parts[0];
    }
    function composeMessage() {
      var name = nameInput.value.trim();
      var date = formatDateBR(dateInput.value);
      var shift = selectedShift();
      var svcs = selectedServices();
      var lines = ["Olá, equipe " + BUSINESS + "! Gostaria de agendar um horário."];
      if (svcs.length) lines.push("Serviço(s): " + svcs.join(", ") + ".");
      if (date) lines.push("Data desejada: " + date + (shift ? " (" + shift + ")" : "") + ".");
      else if (shift) lines.push("Turno preferido: " + shift + ".");
      if (name) lines.push("Meu nome é " + name + ".");
      lines.push("Podem me confirmar os horários disponíveis?");
      return lines.join("\n");
    }
    function renderPreview() {
      var msg = composeMessage();
      preview.textContent = msg;
      var now = new Date();
      var hh = String(now.getHours()).padStart(2, "0");
      var mm = String(now.getMinutes()).padStart(2, "0");
      document.getElementById("wa-preview-time").textContent = hh + ":" + mm + " ✓✓";
      sendBtn.href = waLink(msg);
      var ready = selectedServices().length > 0 && nameInput.value.trim() !== "" && dateInput.value !== "" && selectedShift();
      sendBtn.classList.toggle("is-disabled", !ready);
      sendBtn.setAttribute("aria-disabled", ready ? "false" : "true");
    }
    svcButtons.forEach(function (b) {
      b.addEventListener("click", function () {
        var on = b.getAttribute("aria-pressed") === "true";
        b.setAttribute("aria-pressed", on ? "false" : "true");
        renderPreview();
      });
    });
    [nameInput, dateInput].forEach(function (el) {
      el.addEventListener("input", renderPreview);
      el.addEventListener("change", renderPreview);
    });
    shiftInputs.forEach(function (r) { r.addEventListener("change", renderPreview); });
    sendBtn.addEventListener("click", function (e) {
      if (sendBtn.getAttribute("aria-disabled") === "true") {
        e.preventDefault();
        var missing = [];
        if (!selectedServices().length) missing.push("escolha ao menos um serviço");
        if (!nameInput.value.trim()) missing.push("informe seu nome");
        if (!dateInput.value) missing.push("escolha a data");
        if (!selectedShift()) missing.push("escolha o turno");
        alert("Para enviar, falta: " + missing.join("; ") + ".");
        if (!selectedServices().length) svcButtons[0].focus();
        else if (!nameInput.value.trim()) nameInput.focus();
        else if (!dateInput.value) dateInput.focus();
      }
    });
    // Today as minimum date
    var today = new Date();
    var iso = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
    dateInput.min = iso;
    if (dateHint) dateHint.textContent = "Escolha a data no formato dia/mês/ano.";
    renderPreview();
  }

  /* ---------- Contato form -> WhatsApp ---------- */
  var contactForm = document.getElementById("contact-form");
  if (contactForm) {
    var success = document.getElementById("contact-success");
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      ["ct-name", "ct-phone"].forEach(function (id) {
        var input = document.getElementById(id);
        var field = input.closest(".field");
        if (!input.value.trim()) { field.classList.add("invalid"); ok = false; }
        else field.classList.remove("invalid");
      });
      if (!ok) return;
      var name = document.getElementById("ct-name").value.trim();
      var phone = document.getElementById("ct-phone").value.trim();
      var service = document.getElementById("ct-service").value;
      var period = "";
      contactForm.querySelectorAll('input[name="ct-period"]:checked').forEach(function (r) { period = r.value; });
      var message = document.getElementById("ct-message").value.trim();
      var lines = ["Olá, equipe " + BUSINESS + "!"];
      lines.push("Meu nome é " + name + " (WhatsApp: " + phone + ").");
      if (service) lines.push("Serviço desejado: " + service + ".");
      if (period) lines.push("Dia/período de preferência: " + period + ".");
      if (message) lines.push("Mensagem: " + message);
      lines.push("Aguardo o retorno. Obrigado(a)!");
      var url = waLink(lines.join("\n"));
      if (success) {
        success.classList.add("show");
        success.querySelector("a").href = url;
      }
      window.open(url, "_blank", "noopener");
    });
    ["ct-name", "ct-phone"].forEach(function (id) {
      document.getElementById(id).addEventListener("input", function (e) {
        e.target.closest(".field").classList.remove("invalid");
      });
    });
  }

  /* ---------- "Quero esse" gallery links carry the work name ---------- */
  document.querySelectorAll("[data-wa-work]").forEach(function (a) {
    var work = a.getAttribute("data-wa-work");
    a.href = waLink("Olá, equipe " + BUSINESS + "! Vi o trabalho \"" + work + "\" na galeria e quero um parecido. Podem me passar mais informações?");
  });
})();
