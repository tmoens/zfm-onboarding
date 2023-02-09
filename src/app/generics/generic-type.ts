import {ObjectPatch} from '../shared/patching/object-patch';
import {PatchableAttr} from '../shared/patching/patchable-attr';
import {JsonForExcel} from './json-for-excel';

export abstract class GenericType{
  valid: boolean = false;
  originalInstance: JsonForExcel = {};
  abstract get uniqueName(): string;

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
  extractJsonForExcel(item: JsonForExcel): JsonForExcel | null {
    const notes: string[] = [];
    if (this.notes.current) {
      notes.push(this.notes.current);
    }
    Object.entries(this).map(([key, value]) => {
      if (value instanceof PatchableAttr  && key !== 'notes') {
        if (value.isPatched()) {
          if (value.original) {
            notes.push(`${key} changed from ${value.original}`)
          } else {
            notes.push(`${key} added`)
          }
        }
          item[key] = value.current;
      }
    })
    item['notes'] = notes.join('; ');
    return item;
  }
}
