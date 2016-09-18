interface WirelessUser extends LoopBack.PersistedModel {

}
interface WirelessUserStatic extends LoopBack.PersistedModelStatic {

}

module.exports = function(wirelessUserStatic: WirelessUserStatic) {
    wirelessUserStatic.find = function(filter: LoopBack.PersistedModelStatic.FindFilter, cb: LoopBack.PersistedModelStatic.FindCallback<WirelessUser>): void {
        cb(null, []);
    }

    wirelessUserStatic.disableRemoteMethod("upsert", true);
}
