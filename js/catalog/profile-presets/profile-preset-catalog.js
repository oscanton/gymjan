import { createLookup } from "../../shared/collection-utils.js";

import profileMuscleGainMale2300 from "./profile-preset-muscle-gain-male-2300.js";
import profileStandardMale2000 from "./profile-preset-standard-male-2000.js";
import profileWeightLossFemale1500 from "./profile-preset-weight-loss-female-1500.js";

export const PROFILES_DB = [
  profileWeightLossFemale1500,
  profileStandardMale2000,
  profileMuscleGainMale2300,
];

export const PROFILE_BY_ID = createLookup(PROFILES_DB);
