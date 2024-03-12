import { describe } from "mocha";
import runAll from "./index.js";

const nodes = [
  "/dns4/node-01.ac-cn-hongkong-c.waku.test.statusim.net/tcp/8000/wss/p2p/16Uiu2HAkzHaTP5JsUwfR9NR8Rj9HC24puS6ocaU8wze4QrXr9iXp",
  "/dns4/node-01.do-ams3.waku.test.statusim.net/tcp/8000/wss/p2p/16Uiu2HAkykgaECHswi3YKJ5dMLbq2kPVCo89fcyTd38UcQD6ej5W",
  "/dns4/node-01.gc-us-central1-a.waku.test.statusim.net/tcp/8000/wss/p2p/16Uiu2HAmDCp8XJ9z1ev18zuv8NHekAsjNyezAvmMfFEJkiharitG",
];

describe("Test Fleet Native WSS", () => {
  runAll(nodes);
});
