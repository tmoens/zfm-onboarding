import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';
import {GenericService} from '../generic-service';
import {GenericType} from '../generic-type';

export function uniquenessValidatorFC(service: GenericService<any>, exception: GenericType | null, attrName :string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    return uniquenessValidator(service, attrName, exception, control.value);
  }
}

export function uniquenessValidator(service: GenericService<any>, attrName: string, exception: GenericType | null, proposedValue: string): ValidationErrors | null {
  if (service.attrValueExistsAlready(attrName, exception, proposedValue)) {
    return {uniqueness: 'not unique'}
  } else {
    return null;
  }
}
