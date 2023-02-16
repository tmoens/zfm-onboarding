import {GenericType} from '../generics/generic-type';
import {PatchableAttr} from '../shared/patching/patchable-attr';

export class Tg extends GenericType{
  allele: PatchableAttr = new PatchableAttr();
  descriptor: PatchableAttr = new PatchableAttr();
  source: PatchableAttr = new PatchableAttr();
  nickname: PatchableAttr = new PatchableAttr();
  comment: PatchableAttr = new PatchableAttr();

  override get uniqueName(): string {
    return this.descriptor.current;
  }

  getPatchableAttrValue(attrName: string): string | null {
    if (this[attrName as keyof Tg] && this[attrName as keyof Tg] instanceof PatchableAttr) {
      return (this[attrName as keyof Tg] as PatchableAttr).current;
    }  else {
      return null;
    }
  }
}

