export class GenericType{
  datafillFromJson(item: any) {
    //The details have to be implemented for each type
  }
  isValid(): boolean {
    // Needs overriding
    return true;
  }
  get uniqueName(): string {
    return 'No idea';
  }
}
