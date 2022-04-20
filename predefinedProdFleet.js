import { describe } from "mocha";
import { discovery } from "js-waku";
import runAll from "./index.js";

const prodFleet =
  discovery.predefined.fleets.fleets["wakuv2.prod"]["waku-websocket"];
const nodes = Object.values(prodFleet);

describe("Predefined Prod Fleet", () => {
  runAll(nodes);
});
