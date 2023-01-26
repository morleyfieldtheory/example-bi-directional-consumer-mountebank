const axios = require("axios");
const adapter = require("axios/lib/adapters/http");
const { Product } = require("./product");
const { LotDetails } = require("./lotDetails");

axios.defaults.adapter = adapter;

export class ProductAPIClient {
  BASE_ROUTE = "/products";
  constructor(url) {
    if (url === undefined || url === "") {
      url = process.env.BASE_URL;
    }
    if (url.endsWith("/")) {
      url = url.substr(0, url.length - 1);
    }
    this.url = url;
  }

  withPath(path) {
    if (!path.startsWith("/")) {
      path = "/" + path;
    }
    return `${this.url}${this.BASE_ROUTE}${path}`;
  }

  async getAllProducts() {
    return axios
      .get(this.withPath("/products"))
      .then((req) => req.data.map((p) => new Product(p)));
  }

  async getProduct(id) {
    return axios
      .get(this.withPath("/product/" + id))
      .then((req) => new Product(req.data));
  }
}


export class LotDetailsAPIClient {
  BASE_ROUTE = "/lotDetails";
  constructor(url) {
    if (url === undefined || url === "") {
      url = process.env.BASE_URL;
    }
    if (url.endsWith("/")) {
      url = url.substr(0, url.length - 1);
    }
    this.url = url;
  }

  withPath(path) {
    if (!path.startsWith("/")) {
      path = "/" + path;
    }
    return `${this.url}${this.BASE_ROUTE}${path}`;
  }

  async getLotDetails(mft_key, value) {
    return axios
      .get(this.withPath("/display_lot_summary")
      , {
        params: {
          "mft_key": mft_key,
          "value": value
        }
      })
      .then((req) => new LotDetails(req.data));
  }
}
