import { describe } from "mocha";
import { discovery } from "@waku/staging";
import runAll from "./index.js";

const prodFleet =
  discovery.predefined.fleets.fleets["wakuv2.prod"]["waku-websocket"];
const nodes = Object.values(prodFleet);

describe("Predefined Prod Fleet", () => {
  runAll(nodes);
});
