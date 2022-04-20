import { expect } from "chai";
import { describe } from "mocha";
import { Multiaddr } from "multiaddr";
import { Protocols, Waku, WakuMessage } from "js-waku";
import { v4 as uuidv4 } from "uuid";
import delay from "./delay.js";

export default function runAll(nodes) {
  describe("Run Waku Test Suite", () => {
    const wakus = [];

    afterEach(function () {
      wakus.forEach((waku) => {
        waku.stop().catch((e) => console.log("Waku failed to stop", e));
      });
    });

    it("Connect", async function () {
      // This test depends on fleets.status.im being online.
      // This dependence must be removed once DNS discovery is implemented
      this.timeout(20000);

      const peerIds = nodes.map((a) => {
        const ma = new Multiaddr(a);
        return ma.getPeerId();
      });

      expect(nodes.length).to.eq(3);

      const promises = nodes.map(async (node, i) => {
        wakus[i] = await Waku.create({
          bootstrap: { peers: [node] },
        });

        return new Promise((resolve) => {
          wakus[i].libp2p.connectionManager.on("peer:connect", (connection) => {
            resolve(connection.remotePeer);
          });
        }).then((peerId) => {
          console.log("connected", peerId.toB58String());
          expect(peerId.toB58String()).to.eq(peerIds[i]);
        });
      });

      await Promise.all(promises);
    });

    it("Relay", async function () {
      // This test depends on fleets.status.im being online.
      // This dependence must be removed once DNS discovery is implemented
      this.timeout(60000);

      const id = uuidv4();

      expect(nodes.length).to.eq(3);

      const promises = nodes.map(async (node, i) => {
        wakus[i] = await Waku.create({
          bootstrap: { peers: [node] },
        });

        await wakus[i].waitForRemotePeer([Protocols.Relay]);
        console.log(node + ": ready");
      });

      await Promise.all(promises);
      // All connected and relay ready

      const contentTopic = `/waku-tests/1/relay-test-${id}/utf8`;

      const messages = [];

      wakus.forEach((waku) => {
        waku.relay.addObserver(
          (message) => {
            messages.push({
              msg: message.payloadAsUtf8,
              timestamp: message.timestamp,
              rcvd: new Date(),
            });
          },
          [contentTopic]
        );
      });

      const relayPromises = wakus.map(async (waku, i) => {
        const msg = await WakuMessage.fromUtf8String(
          `sent via ${nodes[i]} - ${id}`,
          contentTopic
        );
        return waku.relay.send(msg);
      });

      await Promise.all(relayPromises);
      await delay(30000);

      console.log(messages);

      messages.forEach((msg) => {
        const diff = msg.rcvd.getTime() - msg.timestamp.getTime();
        console.log(msg.timestamp, msg.rcvd, diff + "ms");
      });

      expect(messages.length).to.gte(nodes.length);

      for (let i = 0; i < wakus.length; i++) {
        expect(messages.map((m) => m.msg)).to.contain(`sent via ${nodes[i]} - ${id}`);
      }
    });

    it("Light Push", async function () {
      // This test depends on fleets.status.im being online.
      // This dependence must be removed once DNS discovery is implemented
      this.timeout(60000);

      const id = uuidv4();

      expect(nodes.length).to.eq(3);

      const promises = nodes.map(async (node, i) => {
        wakus[i] = await Waku.create({
          bootstrap: { peers: [node] },
        });

        await wakus[i].waitForRemotePeer([Protocols.LightPush]);
        console.log(node + ": ready");
      });

      await Promise.all(promises);
      // All connected and relay ready

      const contentTopic = `/waku-tests/1/light-push-${id}/utf8`;

      const messages = [];

      wakus.forEach((waku) => {
        waku.relay.addObserver(
          (message) => {
            messages.push({
              msg: message.payloadAsUtf8,
              timestamp: message.timestamp,
              rcvd: new Date(),
            });
          },
          [contentTopic]
        );
      });

      const relayPromises = wakus.map(async (waku, i) => {
        const msg = await WakuMessage.fromUtf8String(
          `sent via ${nodes[i]} - ${id}`,
          contentTopic
        );
        return waku.lightPush.push(msg);
      });

      await Promise.all(relayPromises);

      console.log(messages);

      messages.forEach((msg) => {
        const diff = msg.rcvd.getTime() - msg.timestamp.getTime();
        console.log(msg.timestamp, msg.rcvd, diff + "ms");
      });

      expect(messages.length).to.gte(nodes.length);

      for (let i = 0; i < wakus.length; i++) {
        expect(messages.map((m) => m.msg)).to.contain(`sent via ${nodes[i]} - ${id}`);
      }
    });

    it("Store", async function () {
      // This test depends on fleets.status.im being online.
      // This dependence must be removed once DNS discovery is implemented
      this.timeout(30000);

      expect(nodes.length).to.eq(3);

      const id = uuidv4();

      const promises = nodes.map(async (node, i) => {
        wakus[i] = await Waku.create({
          bootstrap: { peers: [node] },
        });

        await wakus[i].waitForRemotePeer([Protocols.Relay]);
        console.log(node + ": ready");
      });

      await Promise.all(promises);
      // All connected and relay ready

      const contentTopic = `/waku-tests/1/store-test-${id}/utf8`;

      const relayPromises = wakus.map(async (waku, i) => {
        const msg = await WakuMessage.fromUtf8String(
          `sent via ${nodes[i]} - ${id}`,
          contentTopic
        );
        return waku.relay.send(msg);
      });

      await Promise.all(relayPromises);
      await delay(5000);

      const storePromises = wakus.map(async (waku, index) => {
        const messages = await waku.store.queryHistory([contentTopic]);
        const payloads = messages.map((msg) => msg.payloadAsUtf8);
        console.log(index, payloads);

        for (let i = 0; i < wakus.length; i++) {
          expect(payloads).to.contain(`sent via ${nodes[i]} - ${id}`);
        }
      });

      await Promise.all(storePromises);
    });
  });
}
