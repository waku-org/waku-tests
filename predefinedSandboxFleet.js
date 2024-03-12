import { describe } from "mocha";
import runAll from "./index.js";
import { fleets } from "js-waku/lib/predefined_bootstrap_nodes";

const sandboxFleet = fleets.fleets["waku.sandbox"]["waku-websocket"];
const nodes = Object.values(sandboxFleet);

describe("Predefined Sandbox Fleet", () => {
  runAll(nodes);
});
