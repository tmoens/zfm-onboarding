// A rawStock is a record of data about a stock as received from a customer.
// only required fields are the name, dob and genetics

export class RawStock {
  name: string = '';  // something like 2301.02, but you get crazy stuff, and you get duplicates.
  dob: string = '';  // fertilization date as a string, again you can get just about anything.
  countEnteringNursery?: number;
  countLeavingNursery?: number;
  researcher?: string;
  mom?: string;  // Best case is the id of a younger stock, but who knows
  dad?: string;
  genetics: string = ''; // a string that contains ad-hoc identifiers for the markers carried by the stock
  comment?: string; // some comment specific to the stock
}
