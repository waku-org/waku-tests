import { describe } from "mocha";
import runAll from "./index.js";

const nodes = [
  "/dns4/nim-01.ac-cn-hongkong-c.waku.connect.statusim.net/tcp/443/wss/p2p/16Uiu2HAm75XUMGev2Ti74G3wUzhyxCtbaDKVWzNwbq3tn5WfzRd4",
  "/dns4/nim-01.do-ams3.waku.connect.statusim.net/tcp/443/wss/p2p/16Uiu2HAm9VLETt1xBwDAwfKxj2XvAZDw73Bn4HQf11U26JGDxqZD",
  "/dns4/nim-01.gc-us-central1-a.waku.connect.statusim.net/tcp/443/wss/p2p/16Uiu2HAmMi8xaj9W22a67shGg5wtw1nZDNtfrTPHkgKA5Uhvnvbn",
];

describe("Waku Connect Fleet", () => {
  runAll(nodes);
});
