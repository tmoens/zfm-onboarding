// Typescript does not allow enums with values as objects.
// The following is a clever workaround from the internet...
import {ZFTypes} from "./zf-types";

export class ZFTool {
  static readonly SPLASH_LOGIN  = new ZFTool(
    'splash',
    ZFTypes.SPLASH,
    'Welcome');
  static readonly STOCK_MIGRATOR  = new ZFTool(
    'stock-migrator',
    ZFTypes.STOCK_MIGRATOR,
    'Stock Migrator');
  static readonly USER_MIGRATOR  = new ZFTool(
    'user-migrator',
    ZFTypes.USER_MIGRATOR,
    'Users');

  // private to disallow creating other instances than the static ones above.
  private constructor(
    public readonly route: string,
    public readonly type: ZFTypes,
    public readonly display_name: any,
  ) {
  }

  // If you talk about a particular tool without specifying an attribute, you get its route.
  toString() {
    return this.route;
  }
}
