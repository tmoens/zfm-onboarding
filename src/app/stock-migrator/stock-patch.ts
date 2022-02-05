/**
 * A StockPatch is used to track a user's intent to "patch" some
 * erroneous value in a stock with a "patched" value.
 *
 * It has two stocks - containing the "before patching" and "after patching" values.
 *
 * For example, a Stock object for stock 1233.01 has a missing dob.  The user may create
 * a StockPatch 1233.01 with a valid dob. The "before" stock will have an empty dob and
 * the "after" stock with have the valid dob.
 *
 * When we go to "apply" the patch to stock 1233.01, we see that it has no dob (which matches
 * the patch's "before") value, so we can patch the dob to the "after" value.
 *
 * Here is the important bit.  You have to think of the software being run over and over against
 * constantly improving raw data in a spreadsheet. The patches have to persist until they are
 * applied to the user's raw data or until they are deleted. It is likely that at some point
 * the raw stock data for 1233.01 will be corrected (because the patch was used to rewrite the
 * raw-stock worksheet or because the user manually changed the raw-stock worksheet.  Then what
 * happens when the patch is applied to the data?
 * When we go to apply the patch to stock 1233.01, the stock now has a corrected dob, which
 * *does not* match the "before" value for the patch.  So, the patch has outlived its purpose
 * and will self-immolate.
 *
 * So, patches live until such time as the user makes the patch in the raw-stock worksheet.
 *
 */
import {Stock} from './stock';

// These are the only attributes of a stock we try to patch (for now)
// const stockPatchAttributes = ['dob', 'countEnteringNursery', 'countLeavingNursery',
//   'internalMom', 'internalDad', 'externalMom', 'externalDad',
//   'researcher',]

export class StockPatch {
  after: Stock;
  constructor(private before: Stock) {
    this.after = new Stock(-1);
  }

  // check if this patch is for a particular stock name
  checkName(stockName: string | undefined): boolean {
    return !!(this.before && this.before.stockName && this.before.stockName === stockName);
  }
  // When created, the patch was against a particular version of the stock.
  // Later on, if the stock has changed, we have to clean up the patch
  // The cleanup goes attribute by attribute like this:
  // - if the attribute was bing patched, then
  //   - if the value it was being changed FROM is not the same in the new stock as in the
  //     the original "before" stock, them the patch is no longer valid.
  // - after all the patches are checked, then the newStock replaces the baseStock
  cleanUp(newStock: Stock) {
    if (this.before.stockName !== newStock.stockName) {
      throw Error('Trying to apply a patch to a different stock than it was made for.')
    }
    // generic way did not work
    // for (const attribute of stockPatchAttributes) {
    //   if (this.after[attribute]) {
    //     if (this.before[attribute] !== newStock[attribute]) {
    //       this.after[attribute] = undefined;
    //     }
    //   }
    // }
    if (this.after.dob) {
      if (this.before.dob !== newStock.dob) {
        this.after.dob = undefined;
      }
    }
    if (this.after.internalMom) {
      if (this.before.internalMom !== newStock.internalMom) {
        this.after.internalMom = undefined;
      }
    }
    if (this.after.internalDad) {
      if (this.before.internalDad !== newStock.internalDad) {
        this.after.internalDad = undefined;
      }
    }
    if (this.after.externalMom) {
      if (this.before.externalMom !== newStock.externalMom) {
        this.after.externalMom = undefined;
      }
    }
    if (this.after.externalDad) {
      if (this.before.externalDad !== newStock.externalDad) {
        this.after.externalDad = undefined;
      }
    }
    if (this.after.countEnteringNursery) {
      if (this.before.countEnteringNursery !== newStock.countEnteringNursery) {
        this.after.countEnteringNursery = undefined;
      }
    }
    if (this.after.countLeavingNursery) {
      if (this.before.countLeavingNursery !== newStock.countLeavingNursery) {
        this.after.countLeavingNursery = undefined;
      }
    }
    if (this.after.researcher) {
      if (this.before.researcher !== newStock.researcher) {
        this.after.researcher = undefined;
      }
    }
  }
}
