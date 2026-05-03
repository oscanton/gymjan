import { createLookup } from "../../shared/collection-utils.js";

import activityDescanso from "./routine-template-rest.js";
import activityFuerzaA from "./routine-template-strength-a.js";
import activityFuerzaB from "./routine-template-strength-b.js";
import activityFuerzaC from "./routine-template-strength-c.js";
import activityRecuperacion from "./routine-template-recovery.js";
import activitySpinning from "./routine-template-spinning.js";

export const ROUTINES_DB = [
  activityDescanso,
  activityRecuperacion,
  activityFuerzaA,
  activityFuerzaB,
  activityFuerzaC,
  activitySpinning,
];

export const LEGACY_ROUTINE_TEMPLATE_ID_MAP = {
  activity_rest_1a: "activity_recuperacion",
  activity_cardio_1a: "activity_spinning",
  activity_gymfullbody_4c: "activity_fuerza_a",
  activity_gymlegs_3c: "activity_fuerza_b",
};

export const ROUTINE_TEMPLATE_BY_ID = createLookup(ROUTINES_DB);
