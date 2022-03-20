window._commentsDbMap = {};

window.countComments = async function (commentAddr) {
    const commentDb = _commentsDbMap[commentAddr] || await (async () => {
        const db = await window._orbitdb.feed(commentAddr);
        await db.load();
        _commentsDbMap[commentAddr] = db;
        return db;
    })();
    return commentDb.iterator({limit: -1}).collect().length;
}
window._getComments = async function (commentAddr, offset, limit) {
    const commentDb = _commentsDbMap[commentAddr] || await (async () => {
        const db = await window._orbitdb.feed(commentAddr);
        await db.load();
        _commentsDbMap[commentAddr] = db;
        return db;
    })();
    const comments = commentDb.iterator({limit: limit, gt: offset || undefined})
        .collect();
    console.log(comments);
    return comments;
}
window.getComments = async function (commentAddr, offset, limit) {
    const all = (await _getComments(commentAddr, offset, limit)).map(it => it.payload.value);
    const urls = await Promise.all(all.map(it => {
        if (it.userDp.indexOf("blob") < 0) {
            return getBinaryUrl(it.userDp);
        } else {
            return new Promise(resolve => resolve(it.userDp));
        }
    }));
    all.forEach((it, i) => {
        it.userDp = urls[i];
    })
    console.log("Comments",all);
    return JSON.stringify(all);
}

window.addComment = async function (commentAddr, jsonStr) {
    console.log(commentAddr);
    const json = JSON.parse(jsonStr);
    const commentDb = _commentsDbMap[commentAddr] || await (async () => {
        const db = await window._orbitdb.feed(commentAddr);
        await db.load();
        _commentsDbMap[commentAddr] = db;
        return db;
    })();
    json.username = window._myDb.get("user").username;
    json.userId = getDbId();
    json.timestamp = new Date().getTime();
    json.userDp = window._myDb.get("user").photoUrl;
    await commentDb.add(json);
}

window.removeComment = async function (commentAddr, hash) {
    const commentDb = _commentsDbMap[commentAddr] || await (async () => {
        const db = await window._orbitdb.feed(commentAddr);
        await db.load();
        _commentsDbMap[commentAddr] = db;
        return db;
    })();
    await commentDb.remove(hash);
}

window.like = async function (commentAddr) {
    const json = {
        username: window._myDb.get("user").username,
        userId: getDbId(),
        comment: 'liked',
        timestamp: new Date().getTime() * 1000,
        userDp: window._myDb.get("user").photoUrl,
        isLike: true
    };
    await addComment(commentAddr, JSON.stringify(json));
}

window.unlike = async function (commentAddr) {
    const all = await _getComments(commentAddr, null, -1);
    const json = all.find(it => it.payload.value.userId === getDbId() && it.payload.value.isLike);
    await removeComment(commentAddr, json.payload.hash);
}