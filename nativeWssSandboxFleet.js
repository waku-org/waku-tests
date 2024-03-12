import { describe } from "mocha";
import runAll from "./index.js";

const nodes = [
  "/dns4/node-01.ac-cn-hongkong-c.waku.sandbox.status.im/tcp/8000/wss/p2p/16Uiu2HAmSJvSJphxRdbnigUV5bjRRZFBhTtWFTSyiKaQByCjwmpV",
  "/dns4/node-01.do-ams3.waku.sandbox.status.im/tcp/8000/wss/p2p/16Uiu2HAmQSMNExfUYUqfuXWkD5DaNZnMYnigRxFKbk3tcEFQeQeE",
  "/dns4/node-01.gc-us-central1-a.waku.sandbox.status.im/tcp/8000/wss/p2p/16Uiu2HAm6fyqE1jB5MonzvoMdU8v76bWV8ZeNpncDamY1MQXfjdB",
];

describe("Sandbox Fleet Native WSS", () => {
  runAll(nodes);
});
