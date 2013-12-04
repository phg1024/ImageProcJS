function Color(r, g, b, a)
{
    this.r = r; this.g = g; this.b = b; this.a = a;
}

Color.RED = new Color(255, 0, 0, 255);
Color.GREEN = new Color(0, 255, 0, 255);
Color.BLUE = new Color(0, 0, 255, 255);
Color.YELLOW = new Color(255, 255, 0, 255);
Color.PURPLE = new Color(255, 0, 255, 255);
Color.CYAN = new Color(0, 255, 255, 255);
Color.WHITE = new Color(255, 255, 255, 255);
Color.BLACK = new Color(0, 0, 0, 255);
Color.GRAY = new Color(128, 128, 128, 255);

Color.prototype.setColor = function(that)
{
    if( that != null &&
        that.constructor === Color )
    {
        this.r = that.r; this.g = that.g; this.b = that.b; this.a = that.a;
        return this;
    }
    else
        return null;
};

Color.prototype.distance = function( that ) {
    var dr = this.r - that.r;
    var dg = this.g - that.g;
    var db = this.b - that.b;

    return (dr * dr + dg * dg + db * db);
};

Color.prototype.equal = function( that ) {
    return (this.r == that.r && this.g == that.g && this.b == that.b);
};

Color.prototype.add = function(that) {
    return new Color(this.r + that.r, this.g + that.g, this.b + that.b, this.a + that.a);
};

// only r, g, b channels are modified
Color.prototype.addc = function(that) {
    return new Color(this.r + that.r, this.g + that.g, this.b + that.b, this.a);
};

Color.prototype.sub = function(that) {
    return new Color(this.r - that.r, this.g - that.g, this.b - that.b, this.a - that.a);
};

// only r, g, b channels are modified
Color.prototype.subc = function(that) {
    return new Color(this.r - that.r, this.g - that.g, this.b - that.b, this.a);
};

Color.prototype.mul = function(c)
{
    return new Color(this.r * c, this.g * c, this.b * c, this.a * c);
};

// only r, g, b channels are modified
Color.prototype.mulc = function(c) {
    return new Color(this.r * c, this.g * c, this.b * c, this.a);
};

Color.prototype.div = function(c) {
    var invC = 1.0 / c;
    return this.mul(invC);
};

Color.prototype.divc = function(c) {
    var invC = 1.0 / c;
    return this.mulc(invC);
};

Color.prototype.normalize = function() {
    var invA = 1.0 / this.a;
    this.r *= invA;
    this.g *= invA;
    this.b *= invA;

    return this;
};

Color.prototype.clamp = function() {
    this.r = clamp(this.r, 0, 255);
    this.g = clamp(this.g, 0, 255);
    this.b = clamp(this.b, 0, 255);
    this.a = clamp(this.a, 0, 255);
    return this;
};

Color.prototype.round = function() {
    this.r = Math.round(this.r);
    this.g = Math.round(this.g);
    this.b = Math.round(this.b);
    this.a = Math.round(this.a);
    return this;
};

Color.interpolate = function(c1, c2, t)
{
    return c1.mul(t).add(c2.mul(1-t));
};

Color.rand = function() {
    return new Color(
        Math.random() * 255,
        Math.random() * 255,
        Math.random() * 255,
        Math.random() * 255
    );
};

Color.zero = function() {
    return new Color(0, 0, 0, 0);
};