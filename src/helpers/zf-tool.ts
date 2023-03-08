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
  static readonly RESEARCHER_MIGRATOR  = new ZFTool(
    'user-migrator',
    ZFTypes.RESEARCHER_MIGRATOR,
    'Researchers');
  static readonly PI_MIGRATOR  = new ZFTool(
    'pi-migrator',
    ZFTypes.PI_MIGRATOR,
    'PIs');
  static readonly TRANSGENE_MIGRATOR  = new ZFTool(
    'transgene-migrator',
    ZFTypes.TRANSGENE_MIGRATOR,
    'Transgenes');
  static readonly MUTATION_MIGRATOR  = new ZFTool(
    'mutation-migrator',
    ZFTypes.MUTATION_MIGRATOR,
    'Mutations');

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
