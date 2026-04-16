import { createLookup } from "../../shared/collection-utils.js";

import activityCardio1a from "./routine-template-cardio-1a.js";
import activityGymfullbody4c from "./routine-template-gym-full-body-4c.js";
import activityGymlegs3c from "./routine-template-gym-legs-3c.js";
import activityRest1a from "./routine-template-rest-1a.js";

export const ROUTINES_DB = [
  activityGymfullbody4c,
  activityRest1a,
  activityGymlegs3c,
  activityCardio1a,
];

export const ROUTINE_TEMPLATE_BY_ID = createLookup(ROUTINES_DB);
