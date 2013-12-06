/**
 * Created by Peihong Guo on 11/28/13.
 */

// color filters of various visual effects
var effects = {
    sepia : function(src) {
        var round = Math.round;
        return src.map(function(r, g, b, a) {
            var nr = round(r * .393 + g * .769 + b * .189);
            var ng = round(r * .349 + g * .686 + b * .168);
            var nb = round(r * .272 + g * .534 + b * .131);
            var cc = new Color(nr, ng, nb, a);
            return cc.clamp();
        });
    },
    autumn : function(src) {
        return src.map(function(r, g, b, a) {
            var nr = r + g * 1.25 - b * 1.25;
            var ng = g;
            var nb = b;
            var cc = new Color(nr, ng, nb, a);
            return cc.clamp();
        });
    }
};
