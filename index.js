import { expect } from "chai";
import { describe } from "mocha";
import { Multiaddr } from "multiaddr";
import { Protocols, Waku, WakuMessage } from "js-waku";
import { discovery } from "js-waku";
import { v4 as uuidv4 } from "uuid";
import delay from "./delay.js";

const prodFleet =
  discovery.predefined.fleets.fleets["wakuv2.prod"]["waku-websocket"];
const testFleet =
  discovery.predefined.fleets.fleets["wakuv2.test"]["waku-websocket"];

describe("Test nwaku fleets", () => {
  describe("Prod Fleet", () => {
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

      const nodes = Object.values(prodFleet);

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
        }).then((connectedPeerID) => {
          const peerId = connectedPeerID;
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

      const nodes = Object.values(prodFleet);

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

      const contentTopic = "/js-waku-testing/1/relay-test/utf8";

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
          `sent from ${i} - ${id}`,
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
        expect(messages.map((m) => m.msg)).to.contain(`sent from ${i} - ${id}`);
      }
    });

    it("Light Push", async function () {
      // This test depends on fleets.status.im being online.
      // This dependence must be removed once DNS discovery is implemented
      this.timeout(60000);

      const id = uuidv4();

      const nodes = Object.values(prodFleet);

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

      const contentTopic = "/js-waku-testing/1/relay-test/utf8";

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
          `sent from ${i} - ${id}`,
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
        expect(messages.map((m) => m.msg)).to.contain(`sent from ${i} - ${id}`);
      }
    });

    it("Store", async function () {
      // This test depends on fleets.status.im being online.
      // This dependence must be removed once DNS discovery is implemented
      this.timeout(30000);

      const nodes = Object.values(prodFleet);

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

      const contentTopic = "/js-waku-testing/1/store-test/utf8";

      const relayPromises = wakus.map(async (waku, i) => {
        const msg = await WakuMessage.fromUtf8String(
          `sent from ${i} - ${id}`,
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
          expect(payloads).to.contain(`sent from ${i} - ${id}`);
        }
      });

      await Promise.all(storePromises);
    });
  });

  describe("Test Fleet", () => {
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

      const nodes = Object.values(testFleet);

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

      const nodes = Object.values(testFleet);

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

      const contentTopic = "/js-waku-testing/1/relay-test/utf8";

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
          `sent from ${i} - ${id}`,
          contentTopic
        );
        return waku.relay.send(msg);
      });

      await Promise.all(relayPromises);
      await delay(20000);

      console.log(messages);

      messages.forEach((msg) => {
        const diff = msg.rcvd.getTime() - msg.timestamp.getTime();
        console.log(msg.timestamp, msg.rcvd, diff + "ms");
      });

      expect(messages.length).to.gte(nodes.length);

      for (let i = 0; i < wakus.length; i++) {
        expect(messages.map((m) => m.msg)).to.contain(`sent from ${i} - ${id}`);
      }
    });

    it("Light Push", async function () {
      // This test depends on fleets.status.im being online.
      // This dependence must be removed once DNS discovery is implemented
      this.timeout(60000);

      const id = uuidv4();

      const nodes = Object.values(testFleet);

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

      const contentTopic = "/js-waku-testing/1/relay-test/utf8";

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
          `sent from ${i} - ${id}`,
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
        expect(messages.map((m) => m.msg)).to.contain(`sent from ${i} - ${id}`);
      }
    });

    it("Store", async function () {
      // This test depends on fleets.status.im being online.
      // This dependence must be removed once DNS discovery is implemented
      this.timeout(30000);

      const nodes = Object.values(testFleet);

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

      const contentTopic = "/js-waku-testing/1/store-test/utf8";

      const relayPromises = wakus.map(async (waku, i) => {
        const msg = await WakuMessage.fromUtf8String(
          `sent from ${i} - ${id}`,
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
          expect(payloads).to.contain(`sent from ${i} - ${id}`);
        }
      });

      await Promise.all(storePromises);
    });
  });
});
