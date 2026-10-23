(() => {
  const explications = {
    parents: {
      suivre: "Suivre la règle peut venir de la confiance, de l’accord avec son objectif ou du souhait d’éviter un conflit. Le geste seul ne dit pas lequel.",
      discuter: "Négocier peut reconnaître le rôle du parent tout en demandant que la règle soit expliquée ou adaptée.",
      refuser: "Le refus peut exprimer un besoin d’autonomie ou un désaccord sur la limite posée. Il ne suffit pas à conclure à un rejet des parents."
    },
    etat: {
      suivre: "Ne pas rejoindre la manifestation peut venir d’un accord avec la décision, de la prudence ou de la crainte des conséquences. Ces motifs ne sont pas équivalents.",
      discuter: "Chercher des explications peut être une façon de juger la décision et sa légitimité avant d’agir.",
      refuser: "Manifester est une forme de contestation collective ; les personnes présentes peuvent avoir des raisons très différentes."
    },
    direction: {
      suivre: "Libérer l’accès peut répondre à une inquiétude de sécurité, même si l’on n’est pas convaincu par toutes les décisions de la direction.",
      discuter: "Demander pourquoi permet de confronter une consigne à ses raisons, à son urgence et aux règles de l’établissement.",
      refuser: "Le refus peut signaler un désaccord ou une défiance ; il faut encore examiner le risque, les règles et les autres moyens de contestation."
    }
  };

  document.querySelectorAll(".authorite-case").forEach(cas => {
    const situation = cas.dataset.case;
    const retour = cas.querySelector(".authorite-feedback");
    if (!retour || !Object.hasOwn(explications, situation)) return;
    cas.querySelectorAll(".authorite-choice").forEach(bouton => {
      if (!Object.hasOwn(explications[situation], bouton.dataset.reaction)) return;
      bouton.addEventListener("click", () => {
        cas.querySelectorAll(".authorite-choice").forEach(option => option.setAttribute("aria-pressed", "false"));
        bouton.setAttribute("aria-pressed", "true");
        retour.textContent = explications[situation][bouton.dataset.reaction];
      });
      bouton.disabled = false;
    });
  });
})();
