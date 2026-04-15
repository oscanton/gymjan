import { createLookup } from "../../core/utils.js";

import activityCardio1a from "./activity_cardio_1a.js";
import activityGymfullbody4c from "./activity_gymfullbody_4c.js";
import activityGymlegs3c from "./activity_gymlegs_3c.js";
import activityRest1a from "./activity_rest_1a.js";

export const ROUTINES_DB = [
  activityGymfullbody4c,
  activityRest1a,
  activityGymlegs3c,
  activityCardio1a,
];

export const ROUTINE_TEMPLATE_BY_ID = createLookup(ROUTINES_DB);
