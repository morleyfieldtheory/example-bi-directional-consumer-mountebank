import { imposterPort } from "../test/config";
import { ProductAPIClient } from "./api";
import { Product } from "./product";
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

describe("Product API Contract Tests", () => {
  const productApi = new ProductAPIClient(`http://localhost:${imposterPort}`);


  const expectedProduct = {
    id: "10",
    type: "CREDIT_CARD",
    name: "28 Degrees",
  };

  describe("retrieving products", () => {
    test("products exists", async () => {
      // Arrange
      imposter
        .withStub(
          new Stub()
            .withPredicate(
              new EqualPredicate()
                .withMethod(HttpMethod.GET)
                .withPath("/products/products")
            )
            .withResponse(
              new Response().withStatusCode(200).withJSONBody([expectedProduct])
            )
        )
      await mb.createImposter(imposter);

      // make request to Pact mock server
      const products = await productApi.getAllProducts();

      // assert that we got the expected response
      expect(products).toStrictEqual([new Product(expectedProduct)]);
    });
  });

  describe("retrieving a product", () => {
    beforeAll(async () => {
      // Arrange
      imposter
        .withStub(
          new Stub()
            .withPredicate(
              new EqualPredicate()
                .withMethod(HttpMethod.GET)
                .withPath("/products/product/10")
            )
            .withResponse(
              new Response().withStatusCode(200).withJSONBody(expectedProduct)
            )
        )
        .withStub(new Stub().withResponse(new NotFoundResponse()));

      await mb.createImposter(imposter);
    });
    test("ID 10 exists", async () => {
      // Act
      const product = await productApi.getProduct("10");

      // Assert - did we get the expected response
      expect(product).toStrictEqual(new Product(expectedProduct));
    });

    test("product does not exist", async () => {
      // Act + Assert
      await expect(productApi.getProduct("11")).rejects.toThrow(
        "Request failed with status code 404"
      );
    });
  });
});



