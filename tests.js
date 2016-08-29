'use strict';
/* Tests */

/* If in browser or print not defined */
if(typeof window !=="undefined" && window.navigator || typeof print ==="undefined")
	var print=function(a){
		console.log(a);
	}

if(typeof require !=="undefined"){
	try{
		var Fraction = require('./index.js').Fraction;
	} catch (e) {
	}
}

function assert(value, message)
{
    if (!value)
        throw new Error('AssertionError ' + message);
}

function assertEquals(a, b)
{
    if (!(a === b))
        throw new Error('AssertionError: ' + a + ' !=== ' + b);
}

function equalityTests()
{
    var pairs = [
                 // maybe this is unreasonable...
                 // not even the python standard fraction library gets
                 // irrational decimals right
//               [new Fraction(1/3),   new Fraction(1, 3)],  // FAILS XXX, poor rounding handling
//               [new Fraction(2,3), new Fraction(2/3)],  // FAILS XXX, poor rounding handling
                 [new Fraction('2/3'), new Fraction(2, 3)],
                 [new Fraction('1/4'), new Fraction('0.25')],
                 [new Fraction('3/2'), new Fraction('1 1/2')],
                 [new Fraction('7/8'), new Fraction('0.875')],
                 [new Fraction('7/8'), new Fraction('0,875')], // Comma separator
                 [new Fraction('1/3'), new Fraction(1, 3)],
                 [new Fraction('1/9'), new Fraction(1, 9)],
                 [new Fraction('4/7'), new Fraction('4/7')],

                 [new Fraction(2, 9), new Fraction(new Fraction(2, 9))],

                 [new Fraction(2, 9), new Fraction(2, 9)],
                 [new Fraction(2, 9), new Fraction(new Number(2), 9)],
                 [new Fraction(2, 9), new Fraction(2, new Number(9))],
                 [new Fraction(2, 9), new Fraction(new Number(2), new Number(9))],

                 [new Fraction(2, 9), new Fraction('2', '9')],
                 [new Fraction(2, 9), new Fraction(new String('2'), '9')],
                 [new Fraction(2, 9), new Fraction('2', new String('9'))],
                 [new Fraction(2, 9), new Fraction(new String('2'), new String('9'))],

                 [new Fraction(1), new Fraction(1)],
                 [new Fraction(1), new Fraction(new Number(1))],
                 [new Fraction('1'), new Fraction(1)],
                 [new Fraction(1), new Fraction(new String(1))],
                 [new Fraction(1), new Fraction(new String('1'))],

                 [(new Fraction(1.66668)).snap(), new Fraction('1 2/3')], // Positive greater than actual
                 [(new Fraction(1.66666)).snap(), new Fraction('1 2/3')], // Positive less than actual
                 [(new Fraction(-1.66666)).snap(), new Fraction(-5,3)], // Negative less than actual
                 [(new Fraction(-1.66668)).snap(), new Fraction(-5,3)], // Negative greater than actual
                 [(new Fraction(3)).snap(), new Fraction(3)], // Positive integer
                 [(new Fraction(-3)).snap(), new Fraction(-3)], // Negative integer
                 [(new Fraction(.0003)).snap(), new Fraction(.0003)], // Positive unsnappable
                 [(new Fraction(-.0003)).snap(), new Fraction(-.0003)], // Negative unsnappable
                ];
    var pair;
    while (pair = pairs.pop())
    {
        print('testing ' + pair);
        for (var i in pair)
        {
            assert(pair[i]);
        }
        print('?: ' + pair[0] + ' === ' + pair[1])
        assertEquals(pair[0].numerator, pair[1].numerator);
        assertEquals(pair[0].denominator, pair[1].denominator);
        print('pass');
    }

}

function tests()
{
    equalityTests();
}

/* pretty-printer, converts fractions into whole numbers and fractions */
/* well, let it be legacy ;-) */
Fraction.prototype.toStringOld = function()
{
    if (this.denominator==='NaN') return 'NaN';
    var wholepart = this.numerator / this.denominator;
    wholepart = (wholepart > 0) ? Math.floor(wholepart) : Math.ceil(wholepart);
    var numerator = this.numerator % this.denominator
    var denominator = this.denominator;
    var result = [];
    if (wholepart != 0)
        result.push(wholepart);
    if (numerator != 0)
        result.push(((wholepart===0) ? numerator : Math.abs(numerator)) + '/' + denominator);
    return result.length > 0 ? result.join(' ') : "0";
}


/* Test of optimization. It looks ugly, but it's only a test */
function speed_toString(){

	var testArray = [];
	var testCount = 1000000;
	for(var i = 0; i < testCount; i++)
	{
		testArray.push(new Fraction(
			Math.ceil(Math.random() * 20000 - 10000),
			Math.ceil(Math.random() * 20000 - 10000)
		));
	}

	//Firstly, test the old function

	//Make a variable not to allow optimization of FOR by cutting it of (not sure that this is necessary)
	var tempString = '';
	var currentTime = new Date().getTime();
	for(i = 0; i < testCount; i++)
	{
		tempString = testArray[i].toStringOld();
	}
	var oldTime = new Date().getTime() - currentTime;
	console.log('Old function time per one fraction (ms): ' + oldTime / testCount);

    currentTime = new Date().getTime();
	for(i = 0; i < testCount; i++)
	{
		tempString = testArray[i].toString();
	}
	var newTime = new Date().getTime() - currentTime;
	console.log('New function time per one fraction (ms): ' + newTime / testCount);
}


Fraction.prototype.addOld = function(b)
{
    var a = this.clone();
    if (b instanceof Fraction) {
        b = b.clone();
    } else {
        b = new Fraction(b);
    }
    var td = a.denominator;
    a.rescale(b.denominator);
    b.rescale(td);

    a.numerator += b.numerator;

    return a.normalize();
}

function speed_add(){

	var testArray = [];
	var testCount = 1000000;
	for(var i = 0; i < testCount; i++)
	{
		testArray.push(new Fraction(
			Math.ceil(Math.random() * 20000 - 10000),
			Math.ceil(Math.random() * 20000 - 10000)
		));
	}

	//Firstly, test the old function

	//Make a variable not to allow optimization of FOR by cutting it of (not sure that this is necessary)
	var temp = '';
	var currentTime = new Date().getTime();
	for(i = 1; i < testCount; i++)
	{
		temp = testArray[i].addOld(testArray[i-1]);
	}
	var oldTime = new Date().getTime() - currentTime;
	console.log('Old function time per one fraction (ms): ' + oldTime / testCount);

    currentTime = new Date().getTime();
	for(i = 0; i < testCount; i++)
	{
		temp = testArray[i].add(testArray[i-1]);
	}
	var newTime = new Date().getTime() - currentTime;
	console.log('New function time per one fraction (ms): ' + newTime / testCount);
}

/* Unit test for toString() */
function test_toString(){
    var pairs = [
                 [new Fraction(1,3), '1/3'],
                 [new Fraction(2,3), '2/3'],
                 [new Fraction('2/3'), '2/3'],
                 [new Fraction('5/3'), '1 2/3'],
                 [new Fraction(-5,3), '-1 2/3'],
                 [new Fraction(-2,3), '-2/3'],
                 [new Fraction(0,3), '0'],
                 [new Fraction(6,3), '2'],
                 [new Fraction(-6,3), '-2'],
                ];
    var pairsSlice=pairs.slice();
    var pair;
    while (pair = pairs.pop())
    {
        print('?: ' + pair[0] + ' === ' + pair[1])
        assert(pair[0].toTeX(1) === pair[1], ' ' + pair[0].toString());
        print('pass');
    }
    print('Once more testing...');
    //And one more time - in case we run into a bug by changing this (yes, I did!)
    while (pair = pairsSlice.pop())
    {
        print('?: ' + pair[0] + ' === ' + pair[2])
        assert(pair[0].toTeX() === pair[2], ' ' + pair[0].toString());
        print('pass');
    }
}

/* Unit test for toTeX() */
function test_toTeX(){
    var pairs = [
                 [new Fraction(1,3), '\\frac{1}{3}', '\\frac{1}{3}'],
                 [new Fraction(2,3), '\\frac{2}{3}', '\\frac{2}{3}'],
                 [new Fraction('2/3'), '\\frac{2}{3}', '\\frac{2}{3}'],
                 [new Fraction('5/3'), '1\\frac{2}{3}', '\\frac{5}{3}'],
                 [new Fraction(-5,3), '-1\\frac{2}{3}', '-\\frac{5}{3}'],
                 [new Fraction(-2,3), '-\\frac{2}{3}', '-\\frac{2}{3}'],
                 [new Fraction(0,3), '0', '0'],
                 [new Fraction(6,3), '2', '2'],
                 [new Fraction(-6,3), '-2', '-2'],
                ];
    var pairsSlice=pairs.slice();
    var pair;
    while (pair = pairs.pop())
    {
        print('?: ' + pair[0] + ' === ' + pair[1]);
        assert(pair[0].toString() === pair[1], ' ' + pair[0].toTeX(1));
        print('pass');
    }
    //And one more time - without whole part
    print('Once more testing...');
    pairs=pairsSlice.slice();
    while (pair = pairsSlice.pop())
    {
        print('?: ' + pair[0] + ' === ' + pair[1]);
        assert(pair[0].toString() === pair[1], ' ' + pair[0].toTeX());
        print('pass');
    }
}

function test_add(){
    var pairs = [
                 [new Fraction(1,3), new Fraction(1,2), '5/6'],
                 [new Fraction(-1,3), new Fraction(1,2), '1/6'],
                ];
    var pairsSlice=pairs.slice();
    var pair;
    while (pair = pairs.pop())
    {
        print('?: ' + pair[0] + ' + ' + pair[1] + ' === ' + pair[2]);
        var res=pair[0].add(pair[1]).toString()
        assert(res === pair[2], res);
        print('pass');
    }
}

// run 'em
tests();
