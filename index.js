'use strict';
/*
fraction.js
A Javascript fraction library.

Copyright (c) 2009  Erik Garrison <erik@hypervolu.me>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/


/* Fractions */
/* 
 *
 * Fraction objects are comprised of a numerator and a denomenator.  These
 * values can be accessed at fraction.numerator and fraction.denomenator.
 *
 * Fractions are always returned and stored in lowest-form normalized format.
 * This is accomplished via Fraction.normalize.
 *
 * The following mathematical operations on fractions are supported:
 *
 * Fraction.equals
 * Fraction.add
 * Fraction.subtract
 * Fraction.multiply
 * Fraction.divide
 *
 * These operations accept both numbers and fraction objects.  (Best results
 * are guaranteed when the input is a fraction object.)  They all return a new
 * Fraction object.
 *
 * Usage:
 *
 * TODO
 *
 */

/*
 * The Fraction constructor takes one of:
 *   an explicit numerator (integer) and denominator (integer),
 *   a string representation of the fraction (string),
 *   or a floating-point number (float)
 *
 * These initialization methods are provided for convenience.  Because of
 * rounding issues the best results will be given when the fraction is
 * constructed from an explicit integer numerator and denomenator, and not a
 * decimal number.
 *
 *
 * e.g. new Fraction(1, 2) --> 1/2
 *      new Fraction('1/2') --> 1/2
 *      new Fraction('2 3/4') --> 11/4  (prints as 2 3/4)
 *
 */
var Fraction = function(numerator, denominator)
{
    /* double argument invocation */
    if (typeof numerator !== 'undefined' && denominator) {
        if (
			(typeof(  numerator) === 'number' ||   numerator instanceof Number)
		&&
			(typeof(denominator) === 'number' || denominator instanceof Number)
		){
            this.numerator = numerator;
            this.denominator = denominator;
        } else if (
			(typeof(  numerator) === 'string' ||   numerator instanceof String)
		&&
			(typeof(denominator) === 'string' || denominator instanceof String)
		) {
            // what are they?
            // hmm....
            // assume they are floats?
            this.numerator = parseFloat(numerator.replace(",","."));
            this.denominator = parseFloat(denominator.replace(",","."));
        }
        // TODO: should we handle cases when one argument is String and another is Number?
    /* single-argument invocation */
    } else if (typeof denominator === 'undefined') {
        var num = numerator; // swap variable names for legibility
		if (num instanceof Fraction) {
			this.numerator = num.numerator;
			this.denominator = num.denominator;
		} else if (typeof(num) === 'number' || num instanceof Number) {  // just a straight number init
            this.numerator = num;
            this.denominator = 1;
        } else if (typeof(num) === 'string' || num instanceof String) {
            var a, b;  // hold the first and second part of the fraction, e.g. a = '1' and b = '2/3' in 1 2/3
                       // or a = '2/3' and b = undefined if we are just passed a single-part number
            var arr = num.split(' ');
            if (arr[0]) a = arr[0];
            if (arr[1]) b = arr[1];
            /* compound fraction e.g. 'A B/C' */
            //  if a is an integer ...
            if (a % 1 === 0 && b && b.match('/')) {
                return (new Fraction(a)).add(new Fraction(b));
            } else if (a && !b) {
                /* simple fraction e.g. 'A/B' */
                if ((typeof(a) === 'string' || a instanceof String) && a.match('/')) {
                    // it's not a whole number... it's actually a fraction without a whole part written
                    var f = a.split('/');
                    this.numerator = f[0]; this.denominator = f[1];
                /* string floating point */
                } else if ((typeof(a) === 'string' || a instanceof String) && a.match('\.')) {
                    return new Fraction(parseFloat(a.replace(",",".")));
                /* whole number e.g. 'A' */
                } else { // just passed a whole number as a string
                    this.numerator = parseInt(a);
                    this.denominator = 1;
                }
            } else {
                return undefined; // could not parse
            }
        }
    }
    this.normalize();
}


Fraction.prototype.clone = function()
{
    return new Fraction(this.numerator, this.denominator);
}

/* pretty-printer, converts fractions into whole numbers and fractions */
Fraction.prototype.toString = function()
{
	if (isNaN(this.denominator))
//	if (this.denominator !== this.denominator) //They say it would be faster. (?)
		return 'NaN';
    var result = '';
    if ((this.numerator < 0) != (this.denominator < 0))
        result = '-';
    var numerator = Math.abs(this.numerator);
    var denominator = Math.abs(this.denominator);

    var wholepart = Math.floor(numerator / denominator);
    numerator = numerator % denominator;
    if (wholepart != 0)
        result += wholepart;
    if (numerator != 0)
    {
		if(wholepart != 0)
			result+=' ';
        result += numerator + '/' + denominator;
	}
    return result.length > 0 ? result : '0';
}

/* pretty-printer to support TeX notation (using with MathJax, KaTeX, etc) */
Fraction.prototype.toTeX = function(mixed)
{
	if (isNaN(this.denominator))
		return 'NaN';
    var result = '';
    if ((this.numerator < 0) != (this.denominator < 0))
        result = '-';
    var numerator = Math.abs(this.numerator);
    var denominator = Math.abs(this.denominator);

    if(!mixed){
		//We want a simple fraction, without wholepart extracted
		if(denominator === 1)
			return result + numerator;
		else
			return result + '\\frac{' + numerator + '}{' + denominator + '}';
	}
    var wholepart = Math.floor(numerator / denominator);
    numerator = numerator % denominator;
    if (wholepart != 0)
        result += wholepart;
    if (numerator != 0)
        result += '\\frac{' + numerator + '}{' + denominator + '}';
    return result.length > 0 ? result : '0';
}

/* destructively rescale the fraction by some integral factor */
Fraction.prototype.rescale = function(factor)
{
    this.numerator *= factor;
    this.denominator *= factor;
    return this;
}

Fraction.prototype.add = function(b)
{
    var a = this.clone();
    if (b instanceof Fraction) {
        b = b.clone();
    } else {
        b = new Fraction(b);
    }
    var td = a.denominator;
    a.rescale(b.denominator);
    a.numerator += b.numerator * td;

    return a.normalize();
}


Fraction.prototype.subtract = function(b)
{
    var a = this.clone();
    if (b instanceof Fraction) {
        b = b.clone();  // we scale our argument destructively, so clone
    } else {
        b = new Fraction(b);
    }
    var td = a.denominator;
    a.rescale(b.denominator);
    a.numerator -= b.numerator * td;

    return a.normalize();
}


Fraction.prototype.multiply = function(b)
{
    var a = this.clone();
    if (b instanceof Fraction)
    {
        a.numerator *= b.numerator;
        a.denominator *= b.denominator;
    } else if (typeof b === 'number') {
        a.numerator *= b;
    } else {
        return a.multiply(new Fraction(b));
    }
    return a.normalize();
}

Fraction.prototype.divide = function(b)
{
    var a = this.clone();
    if (b instanceof Fraction)
    {
        a.numerator *= b.denominator;
        a.denominator *= b.numerator;
    } else if (typeof b === 'number') {
        a.denominator *= b;
    } else {
        return a.divide(new Fraction(b));
    }
    return a.normalize();
}

Fraction.prototype.equals = function(b)
{
    if (!(b instanceof Fraction)) {
        b = new Fraction(b);
    }
    // fractions that are equal should have equal normalized forms
    var a = this.clone().normalize();
    var b = b.clone().normalize();
    return (a.numerator === b.numerator && a.denominator === b.denominator);
}


/* Utility functions */

/* Destructively normalize the fraction to its smallest representation. 
 * e.g. 4/16 -> 1/4, 14/28 -> 1/2, etc.
 * This is called after all math ops.
 */
Fraction.prototype.normalize = (function()
{

    var isFloat = function(n)
    {
        return (typeof(n) === 'number' &&
                ((n > 0 && n % 1 > 0 && n % 1 < 1) || 
                 (n < 0 && n % -1 < 0 && n % -1 > -1))
               );
    }

    var roundToPlaces = function(n, places) 
    {
        if (!places) {
            return Math.round(n);
        } else {
            var scalar = Math.pow(10, places);
            return Math.round(n*scalar)/scalar;
        }
    }
        
    return (function() {

        // XXX hackish.  Is there a better way to address this issue?
        //
        /* first check if we have decimals, and if we do eliminate them
         * multiply by the 10 ^ number of decimal places in the number
         * round the number to nine decimal places
         * to avoid js floating point funnies
         */
        if (isFloat(this.denominator)) {
            var rounded = roundToPlaces(this.denominator, 9);
            var scaleup = Math.pow(10, rounded.toString().split('.')[1].length);
            this.denominator = Math.round(this.denominator * scaleup); // this !!! should be a whole number
            //this.numerator *= scaleup;
            this.numerator *= scaleup;
        } 
        if (isFloat(this.numerator)) {
            var rounded = roundToPlaces(this.numerator, 9);
            var scaleup = Math.pow(10, rounded.toString().split('.')[1].length);
            this.numerator = Math.round(this.numerator * scaleup); // this !!! should be a whole number
            //this.numerator *= scaleup;
            this.denominator *= scaleup;
        }
        var gcf = Fraction.gcf(this.numerator, this.denominator);
        this.numerator /= gcf;
        this.denominator /= gcf;
        if (this.denominator < 0) {
            this.numerator *= -1;
            this.denominator *= -1;
        }
        return this;
    });

})();


/* Takes two numbers and returns their greatest common factor. */
//Adapted from Ratio.js
Fraction.gcf = function(a, b) {
    if (arguments.length < 2) {
        return a;
    }
    var c;
    a = Math.abs(a);
    b = Math.abs(b);
/*  //It seems to be no need in these checks
    // Same as isNaN() but faster
    if (a !== a || b !== b) {
        return NaN;
    }
    //Same as !isFinite() but faster
    if (a === Infinity || a === -Infinity || b === Infinity || b === -Infinity) {
        return Infinity;
     }
     // Checks if a or b are decimals
     if ((a % 1 !== 0) || (b % 1 !== 0)) {
         throw new Error("Can only operate on integers");
     }
*/

    while (b) {
        c = a % b;
        a = b;
        b = c;
    }
    return a;
};

//Not needed now
// Adapted from: 
// http://www.btinternet.com/~se16/js/factor.htm
Fraction.primeFactors = function(n) 
{

    var num = Math.abs(n);
    var factors = [];
    var _factor = 2;  // first potential prime factor

    while (_factor * _factor <= num)  // should we keep looking for factors?
    {      
      if (num % _factor === 0)  // this is a factor
        { 
            factors.push(_factor);  // so keep it
            num = num/_factor;  // and divide our search point by it
        }
        else
        {
            _factor++;  // and increment
        }
    }

    if (num != 1)                    // If there is anything left at the end...
    {                                // ...this must be the last prime factor
        factors.push(num);           //    so it too should be recorded
    }

    return factors;                  // Return the prime factors
}


Fraction.prototype.snap = function(max, threshold) {
    if (!threshold) threshold = .0001;
    if (!max) max = 100;

    var negative = (this.numerator < 0);
    var decimal = this.numerator / this.denominator;
    var fraction = Math.abs(decimal % 1);
    var remainder = negative ? Math.ceil(decimal) : Math.floor(decimal);

    for(var denominator = 1; denominator <= max; ++denominator) {
        for(var numerator = 0; numerator <= max; ++numerator) {
            var approximation = Math.abs(numerator/denominator);
            if (Math.abs(approximation - fraction) < threshold) {
                return new Fraction(remainder * denominator + numerator * (negative ? -1 : 1), denominator);
            }
        }
    }

    return new Fraction(this.numerator, this.denominator);
};

/* If not in browser */
if(typeof module !== "undefined")
    module.exports.Fraction = Fraction
