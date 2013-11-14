var ImageLoader = function(){
    this.result = undefined;
    this.loadImage = function( imgsrc, cvs ){
        var that = this;
        // create an Image object
        img = new Image();
        img.onload = function(){
            that.result = RGBAImage.fromImage(img, cvs);
            that.result.render(cvs);
        };
        img.src = imgsrc;
    };
};