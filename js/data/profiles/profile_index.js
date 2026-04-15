import { createLookup } from "../../core/utils.js";

import profileMuscleGainMale2300 from "./profile_muscle_gain_male_2300.js";
import profileStandardMale2000 from "./profile_standard_male_2000.js";
import profileWeightLossFemale1500 from "./profile_weight_loss_female_1500.js";

export const PROFILES_DB = [
  profileWeightLossFemale1500,
  profileStandardMale2000,
  profileMuscleGainMale2300,
];

export const PROFILE_BY_ID = createLookup(PROFILES_DB);
