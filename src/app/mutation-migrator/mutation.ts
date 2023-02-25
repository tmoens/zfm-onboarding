import {GenericType} from '../generics/generic-type';
import {PatchableAttr} from '../shared/patching/patchable-attr';


export class Mutation extends GenericType{
  allele: PatchableAttr = new PatchableAttr();
  gene: PatchableAttr = new PatchableAttr();
  source: PatchableAttr = new PatchableAttr();
  nickname: PatchableAttr = new PatchableAttr();
  comment: PatchableAttr = new PatchableAttr();
  screenType: PatchableAttr = new PatchableAttr();
  mutationType: PatchableAttr = new PatchableAttr();

  override get id(): string {
    return this.allele.current;
  }
  override get informalName(): string {
    return this.gene.current;
  }



  getPatchableAttrValue(attrName: string): string | null {
    if (this[attrName as keyof Mutation] && this[attrName as keyof Mutation] instanceof PatchableAttr) {
      return (this[attrName as keyof Mutation] as PatchableAttr).current;
    }  else {
      return null;
    }
  }
}
