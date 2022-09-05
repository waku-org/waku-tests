import { describe } from "mocha";
import runAll from "./index.js";
import { fleets } from "js-waku/lib/predefined_bootstrap_nodes";

const prodFleet = fleets.fleets["wakuv2.prod"]["waku-websocket"];
const nodes = Object.values(prodFleet);

describe("Predefined Prod Fleet", () => {
  runAll(nodes);
});
