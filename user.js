const OrbitDB = require("orbit-db");
window.registerUser = async function (username) {
    const orbitdb = await OrbitDB.createInstance(window._ipfs);
    const db = await orbitdb.keyvalue(username);
    const followDb = await orbitdb.feed(username + ".follow");
    const postDb = await orbitdb.feed(username + ".posts");
    await db.load();
    await followDb.load();
    await postDb.load();
    db.events.on("replicated", address => {
        console.log(db.iterator({limit: -1}).collect())
    })
    console.log("UserDb:", db);
    console.log("FollowDb:", followDb);
    console.log("PostDb:", postDb);
    const previous = db.get("user");
    console.log("Previous", previous, db.get("posts"), db.get("followings"));

    if (!previous) {
        console.log("Create New User");
        db.set("user", {
            username: username,
            email: db.id,
            country: db.id,
            photoUrl: 'https://avatars.githubusercontent.com/u/1',
            bio: '',
            id: db.id,
            followDbId: followDb.id,
            postDbId: postDb.id,
        });
        db.set("posts", {count: 0});
        db.set("followings", {count: 0});
    }
    window._orbitdb = orbitdb;
    window._myDb = db;
    window._followDb = followDb;
    window._postDb = postDb;
    publishMe();
    return db.id;
}

window.login = async function (dbId) {
    const orbitdb = await OrbitDB.createInstance(window._ipfs);
    const db = await orbitdb.keyvalue(dbId, {localOnly: true});
    await db.load();
    const me = db.get("user");
    console.log("Login", me);
    const followDb = await orbitdb.feed(me.followDbId);
    const postDb = await orbitdb.feed(me.postDbId);
    await followDb.load();
    await postDb.load();
    window._orbitdb = orbitdb;
    window._myDb = db;
    window._followDb = followDb;
    window._postDb = postDb;
    publishMe();
    return db.id;
}

window.getDbId = function () {
    return window._myDb.id;
}

window.updateMyPhoto = async function (path) {
    const me = window._myDb.get("user");
    me.photoUrl = path;
    window._myDb.set("user", me);
}

window.getMyProfile = async function () {
    const me = window._myDb.get("user");
    if (me.photoUrl.indexOf("blob") < 0) {
        me.photoUrl = await getBinaryUrl(me.photoUrl);
    }
    return JSON.stringify(me);
}

window._userMap = {};

window.getUser = async function (userAddr) {
    const userDb = _commentsDbMap[userAddr] || await (async () => {
        const db = await window._orbitdb.keyvalue(userAddr);
        await db.load();
        _userMap[userAddr] = db;
        return db;
    })();
    const user = userDb.get("user");
    if (user.photoUrl.indexOf("blob") < 0) {
        user.photoUrl = await getBinaryUrl(user.photoUrl);
    }
    return JSON.stringify(user);
}

window.publishMe = function () {
    setInterval(() => {
        (async () => {
            await window._ipfs.pubsub.publish('news', new TextEncoder().encode(JSON.stringify({
                postDbId: window._postDb.id,
            })));
        })();
    }, 1000);
}