window._getAllFollowing = async function(){
    return window._followDb.iterator({limit: -1})
        .collect()
        .map((e) => e.payload);
}
window.getAllFollowing = async function () {
    const all = await _getAllFollowing();
    console.log(all);
    return JSON.stringify(all);
}
window.isFollowing = async function (dbId) {
    const all = window._followDb.iterator({limit: -1})
        .collect()
        .map((e) => e.payload.value.id)
        .filter(id => id === dbId)
    return all.length > 0;
}

window.follow = async function (dbId) {
    await window._followDb.add({postId: dbId,lastPost:null});
    await window._myDb.set("followings", {count: window._myDb.get("followings".count + 1)});
}

window.unFollow = async function (hash) {
    await window._followDb.remove(hash);
    await window._myDb.set("followings", {count: window._myDb.get("followings".count - 1)});
}
