import {ObjectPatch} from './object-patch';
import {PatchableAttr} from './patchable-attr';
import {JsonForExcel} from './json-for-excel';

export abstract class GenericType{
  valid: boolean = false;
  originalInstance: JsonForExcel | null = null;
  get uniqueName(): string {
    return 'No idea';
  }
  notes: PatchableAttr = new PatchableAttr();
  abstract getPatchableAttrValue(attrName: string): string | null;


  updateValidity(): boolean {
    for (const value of Object.values(this)) {
      if (value instanceof PatchableAttr) {
        if (!value.isValid()) {
          this.valid = false;
          return this.valid;
        }
      }
    }
    this.valid = true;
    return this.valid;
  }
  extractPatch(): ObjectPatch | null {
    const objPatch: ObjectPatch = {};
    Object.entries(this).map(([key, value]) => {
      if (value instanceof PatchableAttr) {
        const attrPatch = value.extractPatch();
        if (attrPatch) {
          objPatch[key] = attrPatch;
        }
      }
    })
    if (Object.keys(objPatch).length > 0) {
      return objPatch;
    } else {
      return null;
    }
  }
  applyPatch(patch?: ObjectPatch): void {
    if (patch) {
      Object.entries(this).map(([key, value]) => {
        if (value instanceof PatchableAttr && patch[key]) {
          value.applyPatch(patch[key]);
        }
      })
    }
  }
  datafillFromJson(json: JsonForExcel): void {
    this.originalInstance = json;
    Object.entries(this).map(([key, value]) => {
      if (value instanceof PatchableAttr) {
        if (json[key]) {
          value.initialize(String(json[key]));
        }
      }
    })
    this.updateValidity();
  }
  extractJsonForExcel(): JsonForExcel | null {
    const json: JsonForExcel = {};
    const notes: string[] = [];
    if (this.notes.current) {
      notes.push(this.notes.current);
    }
    Object.entries(this).map(([key, value]) => {
      if (value instanceof PatchableAttr  && key !== 'notes') {
        if (value.isPatched()) {
          notes.push(`${key} changed from ${value.original}`)
        }
          json[key] = value.current;
      }
    })
    json['notes'] = notes.join('; ');
    return json;
  }
}
