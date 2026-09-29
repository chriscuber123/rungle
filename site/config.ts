// The puzzle: climb from today's start word to GOAL one letter at a time.
export const GOAL = "rung";

// Puzzle #1 is this date (US Eastern). A new start word begins at midnight ET.
export const LAUNCH_DATE = "2026-09-28";

// Start words are drawn from this pool, keeping only those whose par
// (shortest ladder to GOAL) is between MIN_PAR and MAX_PAR. The first word is
// used on launch day; the rest rotate in a fixed shuffled order.
export const MIN_PAR = 5;
export const MAX_PAR = 6;
export const START_POOL = `
  word
  aged army away baby ball bath bear been beer bell blow blue bomb boom both
  bowl call calm camp card cash cell chat chip city coal coat cold cook cool
  copy crew crop date dawn deal dear deep dial disc door down draw drew dual
  duty each earn easy edge else even ever fact fail fair fall farm fear feel
  fell fill film firm fish flat flow form four free from fuel full gain gear
  gift girl glad goal gold golf gray grew grey grow hair half hall harm hate
  have hear help here hero high hill hire holy hour item join keen keep knee
  lady load loan look lord loss mail main meal mean mill mood moon much navy
  near neck next only open over pain pair palm path plan play plot plus poll
  pool poor seek seem seen self sell shop shot show shut sign skin slip slow
  snow soft soil sold soon soul spot star stay step stop tall team tell term
  than that them then they thin till told toll tool tour town tree true twin
  unit vary very view wall warm wash weak wear week well were what when
  will wish with wood work yard year your zero
`.trim().split(/\s+/);
