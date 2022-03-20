const MD5 = require('md5.js');

const md5 = function (str) {
    return new MD5().update(str).digest('hex');
}
window.countMyPosts = async function () {
    return window._myDb.get("posts").count;
}

window.getMyPosts = async function (offset, limit) {
    const all = window._postDb.iterator({limit: limit, gt: offset || undefined})
        .collect()
        .map(it=>{
            const result = it.payload.value;
            result.postId = it.hash;
            return result;
        });
    const urls = await Promise.all(all.map(it=>{
        if (it.mediaUrl.indexOf("blob") < 0) {
            return getBinaryUrl(it.mediaUrl);
        } else {
            return new Promise(resolve => resolve(it.mediaUrl));
        }
    }))
    const result = all.map((it, i)=>{
        it.mediaUrl = urls[i];
        return it;
    });
    console.log(result);
    return JSON.stringify(result);
}
window.postMine = async function (p) {
    const json = JSON.parse(p);
    const commentsDb = await _orbitdb.feed(md5(p));
    json.commentAddr = commentsDb.id;
    json.ownerId = getDbId();
    json.username = window._myDb.get("user").username;
    json.timestamp = new Date().getTime();
    await window._postDb.add(json);
    await window._myDb.set("posts", {count: window._myDb.get("posts").count + 1});
}
window.deleteMyPost = async function (hash) {
    await window._postDb.remove(hash);
    await window._myDb.set("posts", {count: window._myDb.get("posts").count - 1});
}