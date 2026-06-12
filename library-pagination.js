(function () {
  "use strict";

  const planner = window.DATE_PLANNER_DATA;
  if (!planner?.scenarioLibrary?.length) return;
  const allScenarios = planner.scenarioLibrary.slice();
  planner.scenarioLibrary = allScenarios.slice(0, 4);

  window.addEventListener("DOMContentLoaded", () => {
    planner.scenarioLibrary = allScenarios;
    if (typeof renderScenarioLibrary !== "function") return;

    const originalRender = renderScenarioLibrary;
    let expanded = false;

    function currentRows() {
      const filter = document.getElementById("scenarioFilter")?.value || "all";
      return allScenarios.filter((item) => filter === "all" || item.season === filter);
    }

    function updateButton(total) {
      let button = document.getElementById("scenarioMore");
      if (!button) {
        const grid = document.getElementById("scenarioGrid");
        if (!grid) return;
        grid.insertAdjacentHTML("afterend", '<div class="scenario-more-wrap"><button class="button secondary" id="scenarioMore" type="button"></button></div>');
        button = document.getElementById("scenarioMore");
        button.addEventListener("click", () => {
          expanded = !expanded;
          wrappedRender();
          if (!expanded) document.getElementById("reference-book")?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
      button.hidden = total <= 4;
      button.textContent = expanded ? "最初の4件に戻す" : `残り${Math.max(0, total - 4)}件を見る`;
    }

    function wrappedRender() {
      const rows = currentRows();
      planner.scenarioLibrary = expanded ? rows : rows.slice(0, 4);
      originalRender();
      planner.scenarioLibrary = allScenarios;
      updateButton(rows.length);
    }

    renderScenarioLibrary = wrappedRender;
    wrappedRender();
  });
})();
