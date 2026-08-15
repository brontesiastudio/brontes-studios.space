(function () {
  "use strict";

  function normalizedBrazilianPhone(value) {
    var digits = String(value || "").replace(/\D/g, "");
    if ((digits.length === 12 || digits.length === 13) && digits.indexOf("55") === 0) {
      digits = digits.slice(2);
    }
    return digits;
  }

  function isValidBrazilianPhone(value) {
    var digits = normalizedBrazilianPhone(value);
    if (digits.length !== 10 && digits.length !== 11) return false;
    if (/^(\d)\1+$/.test(digits)) return false;

    var ddd = Number(digits.slice(0, 2));
    if (ddd < 11 || ddd > 99) return false;
    if (digits.length === 11 && digits.charAt(2) !== "9") return false;
    return true;
  }

  function isValidName(value) {
    var name = String(value || "").trim();
    return name.length >= 2 && /[A-Za-zÀ-ÿ]/.test(name);
  }

  function updateCaptureValidation() {
    var button = Array.prototype.find.call(document.querySelectorAll("button"), function (item) {
      return item.textContent.trim().indexOf("RESGATAR PRESENTE") >= 0;
    });
    if (!button) return;

    var inputs = document.querySelectorAll("input");
    var nameInput = Array.prototype.find.call(inputs, function (input) {
      return input.autocomplete === "name" || /nome/i.test(input.placeholder || "");
    });
    var phoneInput = Array.prototype.find.call(inputs, function (input) {
      return input.type === "tel" || input.autocomplete === "tel";
    });
    if (!nameInput || !phoneInput) return;

    var valid = isValidName(nameInput.value) && isValidBrazilianPhone(phoneInput.value);
    button.dataset.captureSubmit = "true";
    button.disabled = !valid;
    button.setAttribute("aria-disabled", valid ? "false" : "true");

    var message = document.querySelector("[data-brontes-validation]");
    if (!message) {
      message = document.createElement("p");
      message.setAttribute("data-brontes-validation", "true");
      button.insertAdjacentElement("afterend", message);
    }
    message.textContent = valid ? "" : "Digite seu nome e um WhatsApp válido para continuar.";
    message.hidden = valid;
  }

  document.addEventListener("input", function () {
    window.setTimeout(updateCaptureValidation, 0);
  });

  document.addEventListener("click", function (event) {
    var button = event.target.closest && event.target.closest("button[data-capture-submit='true']");
    if (button && button.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  function start() {
    updateCaptureValidation();
    new MutationObserver(updateCaptureValidation).observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
