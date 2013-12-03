/**
 * Created by PhG on 12/3/13.
 */

function benchmark( func ) {
    var startT = new Date();
    func();
    var endT = new Date();
    console.log('time cost = ' + (endT - startT) + 'ms');
}