// A condensed record of all the patches in play for a stock.

import {AttrPatch} from '../shared/patching/attr-patch';

export interface StockPatch {
  stockName?: AttrPatch;
  dob?: AttrPatch;
  mom?: AttrPatch;
  dad?: AttrPatch;
  countEnteringNursery?: AttrPatch;
  countLeavingNursery?: AttrPatch;
  researcher?: AttrPatch;
  genetics?: AttrPatch;
  comment?: AttrPatch;
}
