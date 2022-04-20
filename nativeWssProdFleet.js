import { describe } from "mocha";
import runAll from "./index.js";

const nodes = [
  "/dns4/node-01.ac-cn-hongkong-c.wakuv2.prod.statusim.net/tcp/8000/wss/p2p/16Uiu2HAm4v86W3bmT1BiH6oSPzcsSr24iDQpSN5Qa992BCjjwgrD",
  "/dns4/node-01.do-ams3.wakuv2.prod.statusim.net/tcp/8000/wss/p2p/16Uiu2HAmL5okWopX7NqZWBUKVqW8iUxCEmd5GMHLVPwCgzYzQv3e",
  "/dns4/node-01.gc-us-central1-a.wakuv2.prod.statusim.net/tcp/8000/wss/p2p/16Uiu2HAmVkKntsECaYfefR1V2yCR79CegLATuTPE6B9TxgxBiiiA",
];

describe("Prod Fleet Native WSS", () => {
  runAll(nodes);
});
