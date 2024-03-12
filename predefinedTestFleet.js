import { describe } from "mocha";
import { fleets } from "js-waku/lib/predefined_bootstrap_nodes";
import runAll from "./index.js";

const testFleet = fleets.fleets["waku.test"]["waku-websocket"];
const nodes = Object.values(testFleet);

describe("Predefined Test Fleet", () => {
  runAll(nodes);
});
