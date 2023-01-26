export class LotDetails {
  constructor({lot_summary}) {
      if (!lot_summary) {
      throw Error("lot_summary is a required property")
    }
    this.lot_summary = lot_summary;
  }
}
