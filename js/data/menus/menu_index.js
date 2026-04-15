import { createLookup } from "../../core/utils.js";

import menuGain1a from "./menu_gain_1a.js";
import menuFridayWeightloss from "./menu_friday_weightloss.js";
import menuMondayWeightloss from "./menu_monday_weightloss.js";
import menuSaturdayWeightloss from "./menu_saturday_weightloss.js";
import menuStandard1a from "./menu_standard_1a.js";
import menuSundayWeightloss from "./menu_sunday_weightloss.js";
import menuThursdayWeightloss from "./menu_thursday_weightloss.js";
import menuTuesdayWeightloss from "./menu_tuesday_weightloss.js";
import menuWednesdayWeightloss from "./menu_wednesday_weightloss.js";
import menuWeightloss2b from "./menu_weightloss_2b.js";

export const MENUS_DB = [
  menuWeightloss2b,
  menuStandard1a,
  menuGain1a,
  menuMondayWeightloss,
  menuTuesdayWeightloss,
  menuWednesdayWeightloss,
  menuThursdayWeightloss,
  menuFridayWeightloss,
  menuSaturdayWeightloss,
  menuSundayWeightloss,
];

export const MENU_TEMPLATE_BY_ID = createLookup(MENUS_DB);
