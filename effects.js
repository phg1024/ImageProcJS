/**
 * Created by Peihong Guo on 11/28/13.
 */

// color filters of various visual effects
var effects = {
    sepia : function(src) {
        var round = Math.round;
        return src.map(function(c) {
            var r = round(c.r * .393 + c.g * .769 + c.b * .189);
            var g = round(c.r * .349 + c.g * .686 + c.b * .168);
            var b = round(c.r * .272 + c.g * .534 + c.b * .131);
            var cc = new Color(r, g, b, c.a);
            return cc.clamp();
        });
    },
    autumn : function(src) {
        return src.map(function(c) {
            var cc = new Color(c.r + c.g * 1.25 - c.b * 1.25, c.g, c.b, c.a);
            return cc.clamp();
        });
    }
};
