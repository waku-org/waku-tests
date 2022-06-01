import { describe } from "mocha";
import waku from "@waku/staging";
import runAll from "./index.js";

const { discovery } = waku;

const testFleet =
  discovery.predefined.fleets.fleets["wakuv2.test"]["waku-websocket"];
const nodes = Object.values(testFleet);

describe("Predefined Test Fleet", () => {
  runAll(nodes);
});
