// Node preload used only for offline CLI characterization; never imported by the app.
import {
  models,
  version,
  summary,
  metrics,
  listPage,
  timestamp,
} from "../fixtures/models.mjs";
const RealDate = Date;
globalThis.Date = class extends RealDate {
  constructor(...args) {
    super(...(args.length ? args : [timestamp]));
  }
  static now() {
    return RealDate.parse(timestamp);
  }
};
globalThis.fetch = async (url) => {
  const u = new URL(url);
  let value;
  if (u.pathname === "/v1/models")
    value = {
      data: [
        {
          id: "video-one",
          pricing: {
            route_prices_usd_per_second: [
              {
                request_type: "text",
                price_tiers_usd_per_second: [
                  {
                    public_price_usd_per_second: "0.04",
                    atlascloud_routes: [{ provider: "private" }],
                  },
                ],
              },
            ],
          },
        },
      ],
    };
  else if (u.pathname.endsWith("/version")) value = version;
  else if (u.pathname.endsWith("/summary")) value = summary;
  else if (u.pathname.endsWith("/metrics")) value = metrics;
  else if (u.pathname === "/public/v1/models")
    value = listPage(Number(u.searchParams.get("page")));
  else value = models.find((model) => u.pathname.endsWith("/" + model.slug));
  if (!value) throw new Error(`Unmocked fixture URL: ${url}`);
  return {
    status: 200,
    ok: true,
    url: "",
    headers: new Headers({ etag: "v1" }),
    json: async () => structuredClone(value),
  };
};
