var ImageLoader = function(mw){
    this.maxEdge = mw || 640;
    this.result = undefined;

    // load an image with the specified canvas object
    this.loadImage = function( imgsrc, cvs ){
        var that = this;
        // create an Image object
        img = new Image();
        img.onload = function(){
            var inImg = RGBAImage.fromImage(img, cvs);
            that.result = inImg.resize_longedge(that.maxEdge);
            that.result.render(cvs);
            $(document).trigger('imageloaded');
        };
        img.src = imgsrc;
    };
};