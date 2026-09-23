(function () {
  "use strict";

  /* ---------- element refs ---------- */
  var els = {
    input:        document.getElementById("targetInput"),
    reason:       document.getElementById("reasonSelect"),
    start:        document.getElementById("startBtn"),
    stop:         document.getElementById("stopBtn"),
    reset:        document.getElementById("resetBtn"),
    official:     document.getElementById("officialBtn"),
    status:       document.getElementById("statusPill"),
    activityText: document.getElementById("activityText"),
    target:       document.getElementById("targetValue"),
    reports:      document.getElementById("reportsValue"),
    opens:        document.getElementById("opensValue"),
    last:         document.getElementById("lastValue"),
    error:        document.getElementById("inputError")
  };

  /* ---------- state ---------- */
  var state = {
    status: "IDLE",
    reports: 0,
    opens: 0,
    timer: null
  };

  /* ---------- helpers ---------- */
  function nowTime() {
    var d = new Date();
    return d.toLocaleTimeString([], { hour12: false });
  }

  function bump(el, value) {
    el.textContent = String(value);
    el.classList.remove("pop");
    void el.offsetWidth; /* force reflow so the animation restarts */
    el.classList.add("pop");
  }

  function setStatus(status) {
    state.status = status;
    els.status.textContent = status;
    els.status.className = "pill " + status.toLowerCase();
    document.body.classList.toggle("running", status === "RUNNING");

    els.start.disabled = (status === "RUNNING");
    els.stop.disabled  = (status !== "RUNNING");

    if (status === "RUNNING") {
      els.activityText.textContent = "Simulating activity…";
    } else if (status === "STOPPED") {
      els.activityText.textContent = "Stopped by user";
    } else {
      els.activityText.textContent = "Idle — no activity";
    }
  }

  function showError() {
    els.error.classList.add("show");
    els.input.classList.add("invalid", "shake");
    setTimeout(function () {
      els.input.classList.remove("shake");
    }, 420);
  }

  function hideError() {
    els.error.classList.remove("show");
    els.input.classList.remove("invalid");
  }

  /* ---------- simulation ---------- */
  function stopSimulation(silent) {
    if (state.timer !== null) {
      clearInterval(state.timer);
      state.timer = null;
    }
    if (!silent) setStatus("STOPPED");
  }

  function startSimulation() {
    var target = els.input.value.trim();

    if (!target) {
      showError();
      return;
    }
    hideError();

    /* reset counters for a fresh run */
    state.reports = 0;
    state.opens = 0;
    bump(els.reports, 0);
    bump(els.opens, 0);

    els.target.textContent = target;
    els.target.title = target;
    els.last.textContent = nowTime();

    setStatus("RUNNING");

    /* Purely visual counter animation — nothing is transmitted anywhere. */
    state.timer = setInterval(function () {
      state.reports += 1;
      bump(els.reports, state.reports);

      /* every 4th simulated request also "opens" the official flow */
      if (state.reports % 4 === 0) {
        state.opens += 1;
        bump(els.opens, state.opens);
      }

      els.last.textContent = nowTime();
    }, 420);
  }

  function resetAll() {
    stopSimulation(true);
    state.reports = 0;
    state.opens = 0;
    els.reports.textContent = "0";
    els.opens.textContent = "0";
    els.target.textContent = "—";
    els.target.removeAttribute("title");
    els.last.textContent = "—";
    els.input.value = "";
    hideError();
    setStatus("IDLE");
  }

  /* ---------- events ---------- */
  els.start.addEventListener("click", startSimulation);

  els.stop.addEventListener("click", function () {
    stopSimulation(false);
  });

  els.reset.addEventListener("click", resetAll);

  els.input.addEventListener("input", hideError);

  els.input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      startSimulation();
    }
  });

  /* Opens Facebook's own official Help Centre in a new tab.
     No data from this page is sent along with it. */
  els.official.addEventListener("click", function () {
    window.open(
      "https://www.facebook.com/help/",
      "_blank",
      "noopener,noreferrer"
    );
  });

  /* ---------- init ---------- */
  setStatus("IDLE");
  els.target.textContent = "—";
})();
