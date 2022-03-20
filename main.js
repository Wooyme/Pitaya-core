const IPFS = require('ipfs');
const WS = require('libp2p-websockets');
const filters = require('libp2p-websockets/src/filters');
const transportKey = WS.prototype[Symbol.toStringTag];

window.initIpfs = async function () {
    window._ipfs = await IPFS.create({
        repo: 'orbitdb/examples/browser/new/ipfs/0.33.1',
        start: true,
        preload: {
            enabled: false
        },
        EXPERIMENTAL: {
            pubsub: true,
        },
        config: {
            Addresses: {
                Swarm: ['/ip4/124.222.127.224/tcp/9090/wss/p2p-webrtc-star']
            },
            Bootstrap: ["/ip4/124.222.127.224/tcp/4004/ws/p2p/12D3KooWJPyRw5u4THL3E8gSGphS1MMk3RuHrAxHLiEyEq93GnU4"]
        },
        libp2p: {
            config: {
                transport: {
                    [transportKey]: {
                        filter: filters.all
                    }
                }
            }
        }
    });
    console.log("Create Ipfs:", window._ipfs);
    await window._ipfs.pubsub.subscribe('news', msg => {
        if(msg.from===window._ipfs.id){
            return;
        }
        const payload = JSON.parse(new TextDecoder('utf-8').decode(msg.data));
        if(!window._knownPostDb[payload.postDbId]){
            console.log("New post:", payload);
            window._knownPostDb[payload.postDbId] = {last:null};
        }
    });
    console.log("Subscribe to news");
}

