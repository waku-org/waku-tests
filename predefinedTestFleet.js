import { describe } from "mocha";
import { discovery } from "js-waku";
import runAll from "./index.js";

const testFleet =
  discovery.predefined.fleets.fleets["wakuv2.test"]["waku-websocket"];
const nodes = Object.values(testFleet);

describe("Predefined Test Fleet", () => {
  runAll(nodes);
});
