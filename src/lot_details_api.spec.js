import { imposterPort } from "../test/config";
import { LotDetailsAPIClient } from "./api";
import { LotDetails } from "./lotDetails";
import { startAndClearStubs, writeStubs, stopStubs } from "../test/mountebank";

import {
  Response,
  Imposter,
  Mountebank,
  Stub,
  EqualPredicate,
  FlexiPredicate,
  Operator,
  HttpMethod,
  NotFoundResponse,
} from "@anev/ts-mountebank";

const mb = new Mountebank();
const imposter = new Imposter()
  .withPort(imposterPort)
  .withRecordRequests(true);

beforeAll(() => startAndClearStubs());
afterEach(() => writeStubs(mb, imposterPort));
afterAll(() => stopStubs());

describe("LotDetails API Contract Tests", () => {
  const lotApi = new LotDetailsAPIClient(`http://localhost:${imposterPort}`);

  const expectedLotSummary = {
    lot_summary: {
      "parent": {
          "parent_name": {"key":"Protein Name", "value": "insulin", "type": "string",
              "template_loc": {"down": 1, "right": 0, "value": "right"}},
          "parent_corp_name": {"key":"Protein Num", "value": "MFT-000123", "type": "string",
              "template_loc": {"down": 2, "right": 0, "value": "right"}}
      },
      "lot": {
          "corp_name": {"key":"Protein Lot Num", "value": "MFT-000123-001", "type": "string",
              "template_loc": {"down": 3, "right": 0, "value": "right"}},
          "lot_produced_date": {"key":"Production Date", "value": "2022 Mar 03 05:12 PDT", "type": "date",
              "template_loc": {"down": 4, "right": 0, "value": "right"}},
          "lot_produced_by": {"key":"Produced By", "value": "john.mcneil", "type": "string",
              "template_loc": {"down": 5, "right": 1, "value": "right"}},
          "lot_purified_date": {"key":"Purification Date", "value": "2022 Mar 07 09:00 PDT", "type": "date",
              "template_loc": {"down": 6, "right": 0, "value": "right"}},
          "lot_purity":  {"key":"Purity (%)", "value": "92", "type": "percent",
              "template_loc": {"down": 7, "right": 1, "value": "right"}},
          "lot_amount_produced":  {"key":"Amount Produced (mg)", "value": "22", "type": "number",
              "template_loc": {"down": 8, "right": 1, "value": "right"}},
          "lot_eln_record":  {"key":"ELN Record", "value": "[Lot MFT-000123-001 Production Production](http://eln.com/eln12355)", "type": "url",
              "template_loc": {"down": 9, "right": 0, "value": "right"}}
      }
    }
  };

  

  describe("Retrieving details for a lot", () => {
    beforeAll(async () => {
    //   imposter
    //   .withStub(
    //     new Stub()
    //       .withPredicate(
    //         new EqualPredicate()
    //           .withMethod(HttpMethod.GET)
    //           .withPath("/lotDetails/display_lot_summary")
    //       )
    //       .withResponse(
    //         new Response().withStatusCode(200).withJSONBody(expectedLotSummary)
    //       )
    //   )
    //   .withStub(new Stub().withResponse(new NotFoundResponse()));

    //   await mb.createImposter(imposter);
    // });
      // Arrange
      imposter
        .withStub(
          new Stub()
            .withPredicate(
              new FlexiPredicate()
                .withMethod(HttpMethod.GET)
                .withPath("/lotDetails/display_lot_summary")
                .withOperator(Operator.equals)
                .withQuery({
                  "mft_key": "Protein Lot Num",
                  "value": "MFT-000123-001"
                })
            )
            .withResponse(
              new Response().withStatusCode(200).withJSONBody(expectedLotSummary)
            )
        )
        .withStub(new Stub().withResponse(new NotFoundResponse())
      );

      await mb.createImposter(imposter);
    });

    test("Protein Lot MFT-000123-001 exists", async () => {
      // Act
      const lotDetails = await lotApi.getLotDetails("Protein Lot Num", "MFT-000123-001");
      // Assert - did we get the expected response
      expect(lotDetails).toStrictEqual(new LotDetails(expectedLotSummary));
    });

    test("Protein Lot does not exist", async () => {
      await expect(lotApi.getLotDetails("Protein Lot Num", "MFT-000000-000")).rejects.toThrow(
        "Request failed with status code 404"
      );
    });
    test("Entity key does not exist", async () => {
      await expect(lotApi.getLotDetails("NotAThing Lot Num", "MFT-000123-001")).rejects.toThrow(
        "Request failed with status code 404"
      );
    });
  });
});


