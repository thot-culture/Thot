(() => {
  "use strict";

  function wound(module) {
    const scene = module.querySelector(".plante-rosette");
    const leaves = [...module.querySelectorAll("[data-leaf]")];
    const status = module.querySelector("[data-status]");
    const step = module.querySelector("[data-step]");
    const microscope = module.querySelector("[data-microscope]");
    const compare = module.querySelector("[data-compare]");
    const microView = module.querySelector("#vue-calcium");
    const microStatus = module.querySelector("[data-micro-status]");
    const conclusion = module.querySelector("[data-conclusion]");
    const messages = [
      "Démarrer la simulation",
      "Observer les signaux",
      "Comprendre les défenses",
      "Simulation terminée"
    ];
    const observations = [
      "Des cellules végétales viennent d'être endommagées.",
      "Une blessure peut déclencher des signaux qui atteignent d'autres tissus. L'éclat successif des nervures représente des variations locales du signal.",
      "Des parties encore intactes peuvent participer à la réponse de défense."
    ];
    let selected;
    let phase = 0;
    let before = false;

    function render(message) {
      scene.dataset.phase = before ? 0 : phase;
      scene.dataset.selected = selected?.dataset.leaf ?? "";
      leaves.forEach(leaf => leaf.setAttribute("aria-pressed", String(leaf === selected)));
      status.textContent = message;
      step.textContent = messages[phase];
      step.disabled = !selected || phase === 3 || before;
      microscope.disabled = phase < 2;
      compare.disabled = phase < 2;
      compare.setAttribute("aria-pressed", String(before));
      microView.dataset.before = String(before);
      microStatus.textContent = before
        ? "Avant la blessure · fluorescence de référence."
        : "Après la blessure · la fluorescence augmente dans les cellules représentées.";
      conclusion.hidden = phase < 3 || before;
    }

    leaves.forEach(leaf => leaf.addEventListener("click", () => {
      selected = leaf;
      phase = 0;
      before = false;
      microView.hidden = true;
      microscope.setAttribute("aria-expanded", "false");
      render(`${leaf.getAttribute("aria-label")} : prête pour la simulation.`);
    }));
    step.addEventListener("click", () => {
      phase += 1;
      render(observations[phase - 1]);
      if (phase === 3) microscope.focus();
    });
    microscope.addEventListener("click", () => {
      microView.hidden = !microView.hidden;
      microscope.setAttribute("aria-expanded", String(!microView.hidden));
    });
    compare.addEventListener("click", () => {
      before = !before;
      render(before ? "Avant la blessure · tissus intacts." : `Après la blessure · ${observations[phase - 1]}`);
    });
    module.querySelector("[data-reset]").addEventListener("click", () => {
      selected = undefined;
      phase = 0;
      before = false;
      microView.hidden = true;
      microscope.setAttribute("aria-expanded", "false");
      render("Sélectionnez une feuille.");
      leaves[0].focus();
    });
  }

  function trap(module) {
    const scene = module.querySelector(".plantes-piege");
    const status = module.querySelector("[data-status]");
    const next = module.querySelector("[data-next]");
    const touch = module.querySelector("[data-touch]");
    const wait = module.querySelector("[data-wait]");
    const reset = module.querySelector("[data-reset]");
    const untimed = module.querySelector("[data-untimed]");
    const untimedInput = untimed.querySelector("input");
    const gauge = module.querySelector("[data-gauge]");
    const meter = gauge.querySelector("meter");
    const counter = gauge.querySelector("[data-impulses]");
    const prompts = [
      "1/3 · Le bon timing. Stimulez deux fois les poils sensitifs dans un délai rapproché.",
      "2/3 · Trop tard ! Stimulez un poil, puis laissez passer le délai simulé avant la seconde stimulation.",
      "3/3 · Le cas particulier. Activez le mode expérimental pour reproduire une déformation particulière du poil."
    ];
    const closeWindow = 12000;
    const slowDecay = 2400;
    let challenge = -1;
    let firstTouch = 0;
    let timer;
    let elapsed = false;

    function measure(value, pulses) {
      meter.value = value;
      if (pulses !== undefined) counter.textContent = `Potentiels d’action · ${pulses}`;
    }

    function prepare(focusControl) {
      clearInterval(timer);
      firstTouch = 0;
      elapsed = false;
      scene.dataset.outcome = "open";
      scene.dataset.pulse = "none";
      gauge.hidden = false;
      measure(0, 0);
      status.textContent = prompts[challenge];
      next.hidden = true;
      touch.hidden = false;
      touch.disabled = false;
      touch.textContent = challenge === 2 ? "Activer le mode expérimental" : "Stimuler un poil sensitif";
      wait.hidden = true;
      untimed.hidden = challenge !== 0;
      reset.hidden = false;
      if (focusControl) touch.focus();
    }

    function finish(outcome, message, value) {
      clearInterval(timer);
      measure(value, 2);
      scene.dataset.outcome = outcome;
      scene.dataset.pulse = "second";
      status.textContent = message;
      touch.disabled = true;
      wait.hidden = true;
      next.hidden = false;
      next.textContent = challenge === 2 ? "Voir la conclusion" : "Défi suivant";
      next.focus();
    }

    function letDecay() {
      clearInterval(timer);
      elapsed = true;
      measure(0, 1);
      touch.disabled = false;
      if (document.activeElement === wait) touch.focus();
      wait.hidden = true;
      status.textContent = "Le premier signal a diminué. Stimulez une seconde fois le poil sensitif.";
    }

    function stimulate() {
      if (challenge === 2) {
        finish("closed", "Une déformation mécanique particulière peut, dans certaines conditions, produire deux potentiels d’action et déclencher la fermeture. La forme et la durée du mouvement comptent.", 90);
        return;
      }
      if (!firstTouch) {
        firstTouch = performance.now();
        measure(52, 1);
        scene.dataset.pulse = "first";
        if (challenge === 0) {
          status.textContent = "Premier potentiel d’action. Stimulez une seconde fois le poil sensitif.";
          return;
        }
        status.textContent = "Premier potentiel d’action. Laissez diminuer le signal calcique avant de stimuler à nouveau.";
        wait.hidden = false;
        wait.focus();
        touch.disabled = true;
        timer = setInterval(() => {
          const fraction = Math.min(1, (performance.now() - firstTouch) / slowDecay);
          measure(Math.round(52 * (1 - fraction)));
          if (fraction === 1) letDecay();
        }, 150);
        return;
      }
      if (challenge === 1 && elapsed) {
        finish("escaped", "La mouche s’envole. Le piège reste ouvert : la réponse dépend notamment du temps écoulé entre les stimulations.", 52);
      } else if (untimedInput.checked || performance.now() - firstTouch <= closeWindow) {
        finish("closed", "La mouche est capturée. Deux stimulations rapprochées peuvent permettre à la dionée de déclencher la fermeture du piège.", 90);
      } else {
        prepare(false);
        status.textContent = "Le premier signal a diminué. Vous pouvez essayer deux stimulations plus rapprochées ou passer l’expérience.";
      }
    }

    next.addEventListener("click", () => {
      if (challenge < 2) {
        challenge += 1;
        prepare(true);
        return;
      }
      status.textContent = "Une plante peut intégrer plusieurs stimulations sans posséder de cerveau. Cette capacité ne démontre pas une mémoire consciente ni une douleur subjective.";
      touch.hidden = true;
      reset.textContent = "Rejouer les trois défis";
      reset.focus();
      next.hidden = true;
    });
    touch.addEventListener("click", stimulate);
    wait.addEventListener("click", letDecay);
    reset.addEventListener("click", () => {
      if (touch.hidden) challenge = 0;
      reset.textContent = "Recommencer";
      prepare(true);
    });
  }

  const evidenceCards = [
    ["Après une blessure, des variations de calcium peuvent être détectées dans des tissus éloignés.", 0,
      "Toyota et ses collègues ont visualisé ces variations chez Arabidopsis thaliana en 2018. Il s'agit d'un résultat expérimental.", 2],
    ["La cavitation pourrait contribuer à produire les ultrasons de certaines plantes.", 1,
      "La cavitation constitue un mécanisme physique proposé pour expliquer certaines émissions acoustiques. Les mécanismes précis restent étudiés.", 8],
    ["Les ultrasons enregistrés prouvent que les plantes ressentent la douleur.", 2,
      "Les émissions ultrasonores ont été observées. Elles ne démontrent pas l'existence d'une douleur consciente.", 8],
    ["Certains composés volatils provoquent des réponses calciques chez d'autres plantes exposées expérimentalement.", 0,
      "Aratani et ses collègues ont observé de telles réponses dans leurs expériences sur Arabidopsis thaliana en 2023.", 4],
    ["Les plantes émettent consciemment des composés volatils pour avertir leurs voisines.", 2,
      "Les réponses chimiques sont observables, mais elles ne prouvent aucune intention consciente chez la plante émettrice.", 4]
  ];

  function evidence(module) {
    const card = module.querySelector("[data-card]");
    const progress = module.querySelector("[data-progress]");
    const claim = module.querySelector("[data-claim]");
    const options = module.querySelector("[data-options]");
    const answers = [...options.querySelectorAll("[data-answer]")];
    const feedback = module.querySelector("[data-feedback]");
    const next = module.querySelector("[data-next]");
    const reset = module.querySelector("[data-reset]");
    const continuation = module.querySelector("[data-continue]");
    const skip = module.querySelector("[data-skip]");
    let index = -1;

    function showCard(position) {
      index = position;
      card.hidden = false;
      delete card.dataset.classified;
      options.hidden = false;
      answers.forEach(answer => { answer.disabled = false; });
      feedback.textContent = "";
      progress.textContent = `${index + 1}/${evidenceCards.length}`;
      claim.textContent = evidenceCards[index][0];
      reset.hidden = false;
      continuation.hidden = true;
      skip.hidden = false;
      card.focus();
      next.hidden = true;
    }

    answers.forEach(answer => answer.addEventListener("click", () => {
      const [, category, explanation, source] = evidenceCards[index];
      card.dataset.classified = String(category);
      const result = document.createElement("strong");
      result.textContent = `Classement : ${answers[category].textContent}.`;
      const reference = document.createElement("a");
      reference.href = `#ref${source}`;
      reference.textContent = `Source [${source}]`;
      const intro = Number(answer.dataset.answer) === category
        ? "" : "Regardons ce que les expériences permettent réellement d'affirmer. ";
      feedback.replaceChildren(intro, result, ` ${explanation} `, reference);
      next.textContent = index === evidenceCards.length - 1 ? "Voir le bilan" : "Carte suivante";
      next.hidden = false;
      next.focus();
      answers.forEach(option => { option.disabled = true; });
    }));

    next.addEventListener("click", () => {
      if (index + 1 < evidenceCards.length) {
        showCard(index + 1);
        return;
      }
      card.hidden = true;
      options.hidden = true;
      const conclusion = document.createElement("strong");
      conclusion.textContent = "Observer un phénomène ne signifie pas avoir expliqué toutes ses causes.";
      feedback.replaceChildren(conclusion, " Les plantes possèdent des mécanismes biologiques remarquables. Mais leur existence ne suffit pas à démontrer une douleur consciente.");
      continuation.hidden = false;
      continuation.focus();
      next.hidden = true;
      skip.hidden = true;
    });
    reset.addEventListener("click", () => showCard(0));
  }

  const initialize = { wound, trap, evidence };
  document.querySelectorAll("[data-plant]").forEach(module => {
    initialize[module.dataset.plant](module);
    module.querySelector("[data-interactive]").hidden = false;
  });
})();
