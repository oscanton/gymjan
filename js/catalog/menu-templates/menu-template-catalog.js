import { createLookup } from "../../shared/collection-utils.js";

import menuGain1a from "./menu-template-gain-1a.js";
import menuFridayWeightloss from "./menu-template-friday-weightloss.js";
import menuMondayWeightloss from "./menu-template-monday-weightloss.js";
import menuSaturdayWeightloss from "./menu-template-saturday-weightloss.js";
import menuStandard1a from "./menu-template-standard-1a.js";
import menuSundayWeightloss from "./menu-template-sunday-weightloss.js";
import menuThursdayWeightloss from "./menu-template-thursday-weightloss.js";
import menuTuesdayWeightloss from "./menu-template-tuesday-weightloss.js";
import menuWednesdayWeightloss from "./menu-template-wednesday-weightloss.js";
import menuWeightloss2b from "./menu-template-weightloss-2b.js";

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
