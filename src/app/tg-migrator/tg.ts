import {GenericType} from '../generics/generic-type';
import {PatchableAttr} from '../generics/patchable-attr';

export class Transgene extends GenericType{
  name: PatchableAttr = new PatchableAttr();
  initials: PatchableAttr = new PatchableAttr();
  email: PatchableAttr = new PatchableAttr();
  username: PatchableAttr = new PatchableAttr();
  role: PatchableAttr = new PatchableAttr();
  isPrimaryInvestigator: PatchableAttr = new PatchableAttr();
  isResearcher: PatchableAttr = new PatchableAttr();
  isActive: PatchableAttr = new PatchableAttr();

  override get uniqueName(): string {
    return this.username.original;
  }

  getPatchableAttrValue(attrName: string): string | null {
    if (this[attrName as keyof Transgene] && this[attrName as keyof Transgene] instanceof PatchableAttr) {
      return (this[attrName as keyof Transgene] as PatchableAttr).current;
    }  else {
      return null;
    }
  }
}

