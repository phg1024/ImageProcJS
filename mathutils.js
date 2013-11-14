/**
 * Created by PhG on 11/14/13.
 */

var clamp = function(v, lower, upper) {
    return Math.max(lower, Math.min(v, upper));
}