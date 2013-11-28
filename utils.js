function handleFileSelect(evt, imgloader, cvs) {
    var files = evt.target.files; // FileList object

    // Loop through the FileList and upload the first image encountered.
    for (var i = 0, f; f = files[i]; i++) {

        // Only process image files.
        if (!f.type.match('image.*')) {
            continue;
        }
		else {
			uploadImage( f, cvs );
		}
    }

    function uploadImage( file, cvs ) {
        var fr;

        if (typeof window.FileReader !== 'function') {
            write("The file API isn't supported on this browser yet.");
            return;
        }

        fr = new FileReader();
        fr.onload = function() {
            imgloader.loadImage(fr.result, cvs);
        };
        fr.readAsDataURL(file);
    }
}