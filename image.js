function RGBAImage( w, h, data )
{
	this.type = 'RGBAImage';
    this.w = w;
    this.h = h;
    this.data = new Uint8Array(w*h*4);	
    data && this.data.set(data);	
}

// get a pixel from the image
RGBAImage.prototype.getPixel = function(x, y) {
    var idx = (y * this.w + x) * 4;
    return new Color(
        this.data[idx+0],
        this.data[idx+1],
        this.data[idx+2],
        this.data[idx+3]
    );
}

// bilinear sample of the image
RGBAImage.prototype.sample = function(x, y) {
    var w = this.w, h = this.h;
    var ty = Math.floor(y);
    var dy = Math.ceil(y);

    var lx = Math.floor(x);
    var rx = Math.ceil(x);

    var fx = x - lx;
    var fy = y - ty;

    var c = this.getPixel(lx, ty).mul((1-fy) * (1-fx))
        .add(this.getPixel(lx, dy).mul(fy * (1-fx)))
        .add(this.getPixel(rx, ty).mul((1-fy) * fx))
        .add(this.getPixel(rx, dy).mul(fy * fx));

    c.clamp();

    return c;
};

// set a pixel value in the image
RGBAImage.prototype.setPixel = function(x, y, c) {
    var idx = (y * this.w + x) * 4;
    this.data[idx] = c.r;
    this.data[idx+1] = c.g;
    this.data[idx+2] = c.b;
    this.data[idx+3] = c.a;
};

// utility function
// per-pixel operation
RGBAImage.prototype.apply = function( f ) {
    for(var y=0;y<this.h;y++) {
        for(var x=0;x<this.w;x++) {
            this.setPixel(x, y, f(this.getPixel(x, y)));
        }
    }
    return this;
};

// utility function
// per-pixel operation
RGBAImage.prototype.map = function( f ) {
    var dst = new RGBAImage(this.w, this.h);
	for(var y=0;y<this.h;y++) {
		for(var x=0;x<this.w;x++) {
			dst.setPixel(x, y, f(this.getPixel(x, y)));
		}
	}
	return dst;
};

// for web-gl
RGBAImage.prototype.uploadTexture = function( ctx, texId )
{
    var w = this.w;
    var h = this.h;

    ctx.bindTexture(ctx.TEXTURE_2D, texId);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.NEAREST);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.NEAREST);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.CLAMP_TO_EDGE);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.CLAMP_TO_EDGE);
    ctx.texImage2D(ctx.TEXTURE_2D, 0,  ctx.RGBA, w, h, 0, ctx.RGBA, ctx.UNSIGNED_BYTE, this.data);
};

// for html canvas
RGBAImage.prototype.toImageData = function( ctx ) {
    var imgData = ctx.createImageData(this.w, this.h);
    imgData.data.set(this.data);
    return imgData;
};

/* render the image to the passed canvas */
RGBAImage.prototype.render = function( cvs ) {
	canvas.width = this.w;
	canvas.height = this.h;
	context.putImageData(this.toImageData(context), 0, 0);
};

/* get RGBA image data from the passed image object */
RGBAImage.fromImage = function( img, cvs ) {
    var w = img.width;
    var h = img.height;

    // resize the canvas for drawing
    cvs.width = w;
	cvs.height = h;
	var ctx = cvs.getContext('2d');

    // render the image to the canvas in order to obtain image data
    ctx.drawImage(img, 0, 0);
    var imgData = ctx.getImageData(0, 0, w, h);
    var newImage = new RGBAImage(w, h, imgData.data);
    imgData = null;

    // clear up the canvas
    ctx.clearRect(0, 0, w, h);
    return newImage;
};