/*
    json2.js
    2013-05-26

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, regexp: true */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (typeof JSON !== 'object') {
    JSON = {};
}

(function () {
    'use strict';

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function () {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear()     + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate())      + 'T' +
                    f(this.getUTCHours())     + ':' +
                    f(this.getUTCMinutes())   + ':' +
                    f(this.getUTCSeconds())   + 'Z'
                : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function () {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                    ? '[]'
                    : gap
                    ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                    : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0
                ? '{}'
                : gap
                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());
'use strict';

// Add ECMA262-5 method binding if not supported natively
//
if (!('bind' in Function.prototype)) {
	Function.prototype.bind= function(owner) {
		var that= this;
		if (arguments.length<=1) {
			return function() {
				return that.apply(owner, arguments);
			};
		} else {
			var args= Array.prototype.slice.call(arguments, 1);
			return function() {
				return that.apply(owner, arguments.length===0? args : args.concat(Array.prototype.slice.call(arguments)));
			};
		}
	};
}

// Add ECMA262-5 string trim if not supported natively
//
if (!('trim' in String.prototype)) {
	String.prototype.trim= function() {
		return this.replace(/^\s+/, '').replace(/\s+$/, '');
	};
}

// Add ECMA262-5 Array methods if not supported natively
//
if (!('indexOf' in Array.prototype)) {
	Array.prototype.indexOf= function(find, i /*opt*/) {
		if (i===undefined) i= 0;
		if (i<0) i+= this.length;
		if (i<0) i= 0;
		for (var n= this.length; i<n; i++)
			if (i in this && this[i]===find)
				return i;
		return -1;
	};
}
if (!('lastIndexOf' in Array.prototype)) {
	Array.prototype.lastIndexOf= function(find, i /*opt*/) {
		if (i===undefined) i= this.length-1;
		if (i<0) i+= this.length;
		if (i>this.length-1) i= this.length-1;
		for (i++; i-->0;) /* i++ because from-argument is sadly inclusive */
			if (i in this && this[i]===find)
				return i;
		return -1;
	};
}
if (!('forEach' in Array.prototype)) {
	Array.prototype.forEach= function(action, that /*opt*/) {
		for (var i= 0, n= this.length; i<n; i++)
			if (i in this)
				action.call(that, this[i], i, this);
	};
}
if (!('map' in Array.prototype)) {
	Array.prototype.map= function(mapper, that /*opt*/) {
		var other= new Array(this.length);
		for (var i= 0, n= this.length; i<n; i++)
			if (i in this)
				other[i]= mapper.call(that, this[i], i, this);
		return other;
	};
}
if (!('filter' in Array.prototype)) {
	Array.prototype.filter= function(filter, that /*opt*/) {
		var other= [], v;
		for (var i=0, n= this.length; i<n; i++)
			if (i in this && filter.call(that, v= this[i], i, this))
				other.push(v);
		return other;
	};
}
if (!('every' in Array.prototype)) {
	Array.prototype.every= function(tester, that /*opt*/) {
		for (var i= 0, n= this.length; i<n; i++)
			if (i in this && !tester.call(that, this[i], i, this))
				return false;
		return true;
	};
}
if (!('some' in Array.prototype)) {
	Array.prototype.some= function(tester, that /*opt*/) {
		for (var i= 0, n= this.length; i<n; i++)
			if (i in this && tester.call(that, this[i], i, this))
				return true;
		return false;
	};
}
 var entityObj = [
	{
		id: 12341234,
		name: "Anchorage Capital CLO 2013-1, Limited/LLC",
		issued: "27-Jun-13",
		published: "8-Aug-13",
		profile: "Some data about Achorage",
		glossary:[ 
			"The sum of the principal balances of all collateral obligations or pledged obligations.(Achorage)",
			"Fitch Interpretation",
			"New Data",
			"Defined as \"target initial par amount.\" An amount equal to $500,000,000."
		],
		priority:[ 
			"1. Taxes, governmental fees, and administrative expenses (subject to a cap of $250,000 p.a. plus 0.02% p.a. of the CPA)",
			"2. Base management fee (15 bps)",
			"3. Hedge counterparties",
			"4. Class A interest",
			"5. Class B interest",
			"6. Class A/B coverage tests"
		],
		chart: [
			"GoldenTree Asset Mgmt",
			"650",
			"5/2/13",
			"4.0",
			"2.0",
			"4/25/25"
		], 
		replacements: [
			"a) 66 2/3% of the aggregate outstanding amount of the controlling class, and b) 66 2/3% of subordinated notes (excluding notes held by the portfolio manager).",
			"a) An intentional breach of provisions in the portfolio management agreement (PMA) or indenture by the portfolio manager that are applicable to it. b) A breach in any material respect of any provision in the PMA or indenture that has a material adverse effect on any noteholder and the portfolio manager fails to cure such breach within 30 days of notice. c)  The portfolio manager is wound up or dissolved; or there is appointed over it or a substantial portion of its assets a receiver, administrator, administrative receiver, trustee or similar officer; or it ceases to be able to pay its debts when due and payable, applies for or consents to appointment of a custodian, liquidator or sequestrator; any bankruptcy, reorganization, arrangement, readjustement of debt, insolvency or dissolution; or it permits or suffers all or any substnaital part of its properties or assets to be sequestered or attached by court order. d) The occurrence and continuance of an EoD consisting of a failure to pay principal or interest on the notes and results from any breach of its duties as portfolio manager. e)  An act by the portfolio manager that constitutes fraud or criminal activity in performance of its obligations under the PMA, or the portfolio manager being convicted of a felony offense related to its primary business.", 
			"Not applicable",
			"Not applicable",
			"Within 60 days of the resignation or removal of the manager while the notes are outstanding: (i) a majority of the subordinated notes shall propose a replacent portfolio manager that satisfies the criteria set forth in Section 13(f) by delivering notice to the issuer, portfolio manager and the trustee; (ii) a majority of the controlling class shall have 30 days from receipt of such notice to object to the replacement portfolio manager by notice of such objection to the trustee: (a) if no notice of objection is received by the trustee within 30 days, such proposed replacement portfolio manager shall be appointed by the issuer as successor portfolio manager; (b) if an objection is received, the holders of the controling class and subordinated notes shall be notified; within 30 days of receipt of notice of such objection, either a majority of the subordinated notes or the majority of the controlling class may propose (the class of securities making such propsoal being the \"Proposing Class\") a replacement portfolio manager that satisfies the criteria set forth in Section 13(f).  A majority of the class of noteholders not comprising the Proposing Class shall have 30 days to deliver notice of objection. ; (1) If no notice of objection is received by the Proposing Class, the issuer or the trustee within the 30 days, such proposed replacement portfolio manager shall be appointed by the issuer; (2) If a notice of objection is received within 30 days, then either group of noteholders may again propose a replacement portfolio manager  in accordance with the foregoing but 150 days following the date of resignation or removal of the portfolio manager, (i) the resigning or removed portfolio manager, (ii) a majority of the controlling class or (iii) a majority of the subordinated notes may petition a court of competent jurisidction for the appointment of a replacement portfolio manager, which appointment shall not require the consent of, or be subject to the disapproval of, the issuer or any noteholder so long as such replacement portfolio manager (x) is not a person that was previously objected to and (y) meets the criteria set forth in Section 13(f). The resigned or removed manager will be entitled to receive any base management fees, subordinated management fees and incentive management fees accrued and unpaid as of the effective date of such resignation or removal on each payment date that the fees are paid in accordance to the priority of payments, pro rata with the fees payable to the successor portfolio manager." 
		]
	},
	{
		id: 23452345,
		name: "Avery Point II CLO, Limited/Corp.",
		issued: "20-Jun-13",
		published: "12-Aug-13",
		profile: "Some data about Avery Point",
		glossary:[ 
			"The sum of the principal balances of all collateral obligations or pledged obligations.(Avery)",
			"Moody Interpretation",
			"New Data 1",
			"An amount equal to $500,000,000."
		],
		priority:[ 
			"1. Taxes non-payment"
		],
		chart: [
			"Sanktay Advisors",
			"500",
			"6/20/13",
			"4.0",
			"2.0",
			"7/15/25"
		],
		replacements: []
	},
	{
		id: 43563456,
		name: "Brookside Mill CLO Ltd./LLC",
		issued: "23-May-13",
		published: "26-Aug-13",
		profile: "Some data about Brookside",
		glossary:[ 
			"The sum of the principal balances of all collateral debt obligations.(Brookside)",
			"Fitch Interpretation",
			"New Data 3",
			""
		],
		priority:[ 
					"1. Taxes non-payment"
				],
		chart: [
			"Sanktay Advisors",
			"500",
			"6/20/13",
			"4.0",
			"2.0",
			"7/15/25"
		],
		replacements: [
		   			"a) 66 2/3% of the aggregate outstanding amount of the controlling class, and b) 66 2/3% of subordinated notes (excluding notes held by the portfolio manager).",
		   			"a) An intentional breach of provisions in the portfolio management agreement (PMA) or indenture by the portfolio manager that are applicable to it. b) A breach in any material respect of any provision in the PMA or indenture that has a material adverse effect on any noteholder and the portfolio manager fails to cure such breach within 30 days of notice. c)  The portfolio manager is wound up or dissolved; or there is appointed over it or a substantial portion of its assets a receiver, administrator, administrative receiver, trustee or similar officer; or it ceases to be able to pay its debts when due and payable, applies for or consents to appointment of a custodian, liquidator or sequestrator; any bankruptcy, reorganization, arrangement, readjustement of debt, insolvency or dissolution; or it permits or suffers all or any substnaital part of its properties or assets to be sequestered or attached by court order. d) The occurrence and continuance of an EoD consisting of a failure to pay principal or interest on the notes and results from any breach of its duties as portfolio manager. e)  An act by the portfolio manager that constitutes fraud or criminal activity in performance of its obligations under the PMA, or the portfolio manager being convicted of a felony offense related to its primary business.", 
		   			"Not applicable",
		   			"Not applicable",
		   			"Within 60 days of the resignation or removal of the manager while the notes are outstanding: (i) a majority of the subordinated notes shall propose a replacent portfolio manager that satisfies the criteria set forth in Section 13(f) by delivering notice to the issuer, portfolio manager and the trustee; (ii) a majority of the controlling class shall have 30 days from receipt of such notice to object to the replacement portfolio manager by notice of such objection to the trustee: (a) if no notice of objection is received by the trustee within 30 days, such proposed replacement portfolio manager shall be appointed by the issuer as successor portfolio manager; (b) if an objection is received, the holders of the controling class and subordinated notes shall be notified; within 30 days of receipt of notice of such objection, either a majority of the subordinated notes or the majority of the controlling class may propose (the class of securities making such propsoal being the \"Proposing Class\") a replacement portfolio manager that satisfies the criteria set forth in Section 13(f).  A majority of the class of noteholders not comprising the Proposing Class shall have 30 days to deliver notice of objection. ; (1) If no notice of objection is received by the Proposing Class, the issuer or the trustee within the 30 days, such proposed replacement portfolio manager shall be appointed by the issuer; (2) If a notice of objection is received within 30 days, then either group of noteholders may again propose a replacement portfolio manager  in accordance with the foregoing but 150 days following the date of resignation or removal of the portfolio manager, (i) the resigning or removed portfolio manager, (ii) a majority of the controlling class or (iii) a majority of the subordinated notes may petition a court of competent jurisidction for the appointment of a replacement portfolio manager, which appointment shall not require the consent of, or be subject to the disapproval of, the issuer or any noteholder so long as such replacement portfolio manager (x) is not a person that was previously objected to and (y) meets the criteria set forth in Section 13(f). The resigned or removed manager will be entitled to receive any base management fees, subordinated management fees and incentive management fees accrued and unpaid as of the effective date of such resignation or removal on each payment date that the fees are paid in accordance to the priority of payments, pro rata with the fees payable to the successor portfolio manager." 
		   		]
	},
	{
		id: 56785687,
		name: "Regatta II Funding L.P./LLC",
		issued: "23-May-13",
		published: "26-Aug-13",
		profile: "Some data about Brookside",
		glossary:[ 
			"The sum of the principal balances of all collateral debt obligations.(Brookside)",
			"Fitch Interpretation",
			"New Data 7",
			""
		],
		priority:[ 
					"1. Taxes non-payment"
				],
		chart: [
			"Sanktay Advisors",
			"450",
			"6/20/13",
			"4.0",
			"2.0",
			"7/15/25"
		],
		replacements: [
		   			"a) 66 2/3% of the aggregate outstanding amount of the controlling class, and b) 66 2/3% of subordinated notes (excluding notes held by the portfolio manager).",
		   			"a) An intentional breach of provisions in the portfolio management agreement (PMA) or indenture by the portfolio manager that are applicable to it. b) A breach in any material respect of any provision in the PMA or indenture that has a material adverse effect on any noteholder and the portfolio manager fails to cure such breach within 30 days of notice. c)  The portfolio manager is wound up or dissolved; or there is appointed over it or a substantial portion of its assets a receiver, administrator, administrative receiver, trustee or similar officer; or it ceases to be able to pay its debts when due and payable, applies for or consents to appointment of a custodian, liquidator or sequestrator; any bankruptcy, reorganization, arrangement, readjustement of debt, insolvency or dissolution; or it permits or suffers all or any substnaital part of its properties or assets to be sequestered or attached by court order. d) The occurrence and continuance of an EoD consisting of a failure to pay principal or interest on the notes and results from any breach of its duties as portfolio manager. e)  An act by the portfolio manager that constitutes fraud or criminal activity in performance of its obligations under the PMA, or the portfolio manager being convicted of a felony offense related to its primary business.", 
		   			"Not applicable",
		   			"Not applicable",
		   			"Within 60 days of the resignation or removal of the manager while the notes are outstanding: (i) a majority of the subordinated notes shall propose a replacent portfolio manager that satisfies the criteria set forth in Section 13(f) by delivering notice to the issuer, portfolio manager and the trustee; (ii) a majority of the controlling class shall have 30 days from receipt of such notice to object to the replacement portfolio manager by notice of such objection to the trustee: (a) if no notice of objection is received by the trustee within 30 days, such proposed replacement portfolio manager shall be appointed by the issuer as successor portfolio manager; (b) if an objection is received, the holders of the controling class and subordinated notes shall be notified; within 30 days of receipt of notice of such objection, either a majority of the subordinated notes or the majority of the controlling class may propose (the class of securities making such propsoal being the \"Proposing Class\") a replacement portfolio manager that satisfies the criteria set forth in Section 13(f).  A majority of the class of noteholders not comprising the Proposing Class shall have 30 days to deliver notice of objection. ; (1) If no notice of objection is received by the Proposing Class, the issuer or the trustee within the 30 days, such proposed replacement portfolio manager shall be appointed by the issuer; (2) If a notice of objection is received within 30 days, then either group of noteholders may again propose a replacement portfolio manager  in accordance with the foregoing but 150 days following the date of resignation or removal of the portfolio manager, (i) the resigning or removed portfolio manager, (ii) a majority of the controlling class or (iii) a majority of the subordinated notes may petition a court of competent jurisidction for the appointment of a replacement portfolio manager, which appointment shall not require the consent of, or be subject to the disapproval of, the issuer or any noteholder so long as such replacement portfolio manager (x) is not a person that was previously objected to and (y) meets the criteria set forth in Section 13(f). The resigned or removed manager will be entitled to receive any base management fees, subordinated management fees and incentive management fees accrued and unpaid as of the effective date of such resignation or removal on each payment date that the fees are paid in accordance to the priority of payments, pro rata with the fees payable to the successor portfolio manager." 
		   		]
	},
	{
		id: 67896798,
		name: "LCM XIV Limited Partnership/LLC",
		issued: "23-May-13",
		published: "26-Aug-13",
		profile: "Some data about Brookside",
		glossary:[ 
			"The sum of the principal balances of all collateral debt obligations.(Brookside)",
			"Fitch Interpretation",
			"New Data 10",
			"Defined as \"target initial par amount.\" An amount equal to $500,000,000."
		],
		priority:[ 
					"1. Taxes non-payment"
				],
		chart: [
			"Sanktay Advisors",
			"710",
			"6/20/13",
			"4.0",
			"2.0",
			"7/15/25"
		],
		replacements: [
		   			"a) 66 2/3% of the aggregate outstanding amount of the controlling class, and b) 66 2/3% of subordinated notes (excluding notes held by the portfolio manager).",
		   			"a) An intentional breach of provisions in the portfolio management agreement (PMA) or indenture by the portfolio manager that are applicable to it. b) A breach in any material respect of any provision in the PMA or indenture that has a material adverse effect on any noteholder and the portfolio manager fails to cure such breach within 30 days of notice. c)  The portfolio manager is wound up or dissolved; or there is appointed over it or a substantial portion of its assets a receiver, administrator, administrative receiver, trustee or similar officer; or it ceases to be able to pay its debts when due and payable, applies for or consents to appointment of a custodian, liquidator or sequestrator; any bankruptcy, reorganization, arrangement, readjustement of debt, insolvency or dissolution; or it permits or suffers all or any substnaital part of its properties or assets to be sequestered or attached by court order. d) The occurrence and continuance of an EoD consisting of a failure to pay principal or interest on the notes and results from any breach of its duties as portfolio manager. e)  An act by the portfolio manager that constitutes fraud or criminal activity in performance of its obligations under the PMA, or the portfolio manager being convicted of a felony offense related to its primary business.", 
		   			"Not applicable",
		   			"Not applicable",
		   			"Within 60 days of the resignation or removal of the manager while the notes are outstanding: (i) a majority of the subordinated notes shall propose a replacent portfolio manager that satisfies the criteria set forth in Section 13(f) by delivering notice to the issuer, portfolio manager and the trustee; (ii) a majority of the controlling class shall have 30 days from receipt of such notice to object to the replacement portfolio manager by notice of such objection to the trustee: (a) if no notice of objection is received by the trustee within 30 days, such proposed replacement portfolio manager shall be appointed by the issuer as successor portfolio manager; (b) if an objection is received, the holders of the controling class and subordinated notes shall be notified; within 30 days of receipt of notice of such objection, either a majority of the subordinated notes or the majority of the controlling class may propose (the class of securities making such propsoal being the \"Proposing Class\") a replacement portfolio manager that satisfies the criteria set forth in Section 13(f).  A majority of the class of noteholders not comprising the Proposing Class shall have 30 days to deliver notice of objection. ; (1) If no notice of objection is received by the Proposing Class, the issuer or the trustee within the 30 days, such proposed replacement portfolio manager shall be appointed by the issuer; (2) If a notice of objection is received within 30 days, then either group of noteholders may again propose a replacement portfolio manager  in accordance with the foregoing but 150 days following the date of resignation or removal of the portfolio manager, (i) the resigning or removed portfolio manager, (ii) a majority of the controlling class or (iii) a majority of the subordinated notes may petition a court of competent jurisidction for the appointment of a replacement portfolio manager, which appointment shall not require the consent of, or be subject to the disapproval of, the issuer or any noteholder so long as such replacement portfolio manager (x) is not a person that was previously objected to and (y) meets the criteria set forth in Section 13(f). The resigned or removed manager will be entitled to receive any base management fees, subordinated management fees and incentive management fees accrued and unpaid as of the effective date of such resignation or removal on each payment date that the fees are paid in accordance to the priority of payments, pro rata with the fees payable to the successor portfolio manager." 
		   		]
	},
	{
		id: 78097809,
		name: "KVK CLO2013-1 Ltd.",
		issued: "23-May-13",
		published: "26-Aug-13",
		profile: "Some data about Brookside",
		glossary:[ 
			"The sum of the principal balances of all collateral debt obligations.(Brookside)",
			"Fitch Interpretation",
			"New Data 32345",
			""
		],
		priority:[ 
					"1. Taxes non-payment"
				],
		chart: [
			"Sanktay Advisors",
			"710",
			"6/20/13",
			"4.0",
			"2.0",
			"7/15/25"
		],
		replacements: [
		   			"a) 66 2/3% of the aggregate outstanding amount of the controlling class, and b) 66 2/3% of subordinated notes (excluding notes held by the portfolio manager).",
		   			"a) An intentional breach of provisions in the portfolio management agreement (PMA) or indenture by the portfolio manager that are applicable to it. b) A breach in any material respect of any provision in the PMA or indenture that has a material adverse effect on any noteholder and the portfolio manager fails to cure such breach within 30 days of notice. c)  The portfolio manager is wound up or dissolved; or there is appointed over it or a substantial portion of its assets a receiver, administrator, administrative receiver, trustee or similar officer; or it ceases to be able to pay its debts when due and payable, applies for or consents to appointment of a custodian, liquidator or sequestrator; any bankruptcy, reorganization, arrangement, readjustement of debt, insolvency or dissolution; or it permits or suffers all or any substnaital part of its properties or assets to be sequestered or attached by court order. d) The occurrence and continuance of an EoD consisting of a failure to pay principal or interest on the notes and results from any breach of its duties as portfolio manager. e)  An act by the portfolio manager that constitutes fraud or criminal activity in performance of its obligations under the PMA, or the portfolio manager being convicted of a felony offense related to its primary business.", 
		   			"Not applicable",
		   			"Not applicable",
		   			"Within 60 days of the resignation or removal of the manager while the notes are outstanding: (i) a majority of the subordinated notes shall propose a replacent portfolio manager that satisfies the criteria set forth in Section 13(f) by delivering notice to the issuer, portfolio manager and the trustee; (ii) a majority of the controlling class shall have 30 days from receipt of such notice to object to the replacement portfolio manager by notice of such objection to the trustee: (a) if no notice of objection is received by the trustee within 30 days, such proposed replacement portfolio manager shall be appointed by the issuer as successor portfolio manager; (b) if an objection is received, the holders of the controling class and subordinated notes shall be notified; within 30 days of receipt of notice of such objection, either a majority of the subordinated notes or the majority of the controlling class may propose (the class of securities making such propsoal being the \"Proposing Class\") a replacement portfolio manager that satisfies the criteria set forth in Section 13(f).  A majority of the class of noteholders not comprising the Proposing Class shall have 30 days to deliver notice of objection. ; (1) If no notice of objection is received by the Proposing Class, the issuer or the trustee within the 30 days, such proposed replacement portfolio manager shall be appointed by the issuer; (2) If a notice of objection is received within 30 days, then either group of noteholders may again propose a replacement portfolio manager  in accordance with the foregoing but 150 days following the date of resignation or removal of the portfolio manager, (i) the resigning or removed portfolio manager, (ii) a majority of the controlling class or (iii) a majority of the subordinated notes may petition a court of competent jurisidction for the appointment of a replacement portfolio manager, which appointment shall not require the consent of, or be subject to the disapproval of, the issuer or any noteholder so long as such replacement portfolio manager (x) is not a person that was previously objected to and (y) meets the criteria set forth in Section 13(f). The resigned or removed manager will be entitled to receive any base management fees, subordinated management fees and incentive management fees accrued and unpaid as of the effective date of such resignation or removal on each payment date that the fees are paid in accordance to the priority of payments, pro rata with the fees payable to the successor portfolio manager." 
		   		]
	}
];
 
 var mapObj = {
	 glossary: ["Aggregate Principal Balance (APB)", "Document Provision", "New Data", "Aggregate Ramp-Up Par Amount (ARUPA)"],
	 chart: {
		 names: ["Collateral Manager", "Target Portfolio Amount ($ Mil.)", "Closing Date", "Reinvestment (Years)", "Non-Call (Years)", "Maturity Date" ],
		 calcs: [0, 1, 0, 1, 1, 0]
	 },
	 priority: ["Label", "New Label"],
	 replacements: ["Termination for Cause", "Cause", "Waiver Provisions", "Key Person clause", "Relacement Process and Compensation"]
};


/*
 AngularJS v1.2.5
 (c) 2010-2014 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(W,N,r){'use strict';function G(b){return function(){var a=arguments[0],c,a="["+(b?b+":":"")+a+"] http://errors.angularjs.org/1.2.5/"+(b?b+"/":"")+a;for(c=1;c<arguments.length;c++)a=a+(1==c?"?":"&")+"p"+(c-1)+"="+encodeURIComponent("function"==typeof arguments[c]?arguments[c].toString().replace(/ \{[\s\S]*$/,""):"undefined"==typeof arguments[c]?"undefined":"string"!=typeof arguments[c]?JSON.stringify(arguments[c]):arguments[c]);return Error(a)}}function pb(b){if(null==b||Aa(b))return!1;var a=
b.length;return 1===b.nodeType&&a?!0:D(b)||L(b)||0===a||"number"===typeof a&&0<a&&a-1 in b}function q(b,a,c){var d;if(b)if(A(b))for(d in b)"prototype"!=d&&("length"!=d&&"name"!=d&&b.hasOwnProperty(d))&&a.call(c,b[d],d);else if(b.forEach&&b.forEach!==q)b.forEach(a,c);else if(pb(b))for(d=0;d<b.length;d++)a.call(c,b[d],d);else for(d in b)b.hasOwnProperty(d)&&a.call(c,b[d],d);return b}function Ob(b){var a=[],c;for(c in b)b.hasOwnProperty(c)&&a.push(c);return a.sort()}function Nc(b,a,c){for(var d=Ob(b),
e=0;e<d.length;e++)a.call(c,b[d[e]],d[e]);return d}function Pb(b){return function(a,c){b(c,a)}}function Za(){for(var b=ja.length,a;b;){b--;a=ja[b].charCodeAt(0);if(57==a)return ja[b]="A",ja.join("");if(90==a)ja[b]="0";else return ja[b]=String.fromCharCode(a+1),ja.join("")}ja.unshift("0");return ja.join("")}function Qb(b,a){a?b.$$hashKey=a:delete b.$$hashKey}function w(b){var a=b.$$hashKey;q(arguments,function(a){a!==b&&q(a,function(a,c){b[c]=a})});Qb(b,a);return b}function R(b){return parseInt(b,
10)}function Rb(b,a){return w(new (w(function(){},{prototype:b})),a)}function s(){}function Ba(b){return b}function ca(b){return function(){return b}}function H(b){return"undefined"===typeof b}function z(b){return"undefined"!==typeof b}function U(b){return null!=b&&"object"===typeof b}function D(b){return"string"===typeof b}function qb(b){return"number"===typeof b}function La(b){return"[object Date]"===$a.call(b)}function L(b){return"[object Array]"===$a.call(b)}function A(b){return"function"===typeof b}
function ab(b){return"[object RegExp]"===$a.call(b)}function Aa(b){return b&&b.document&&b.location&&b.alert&&b.setInterval}function Oc(b){return!(!b||!(b.nodeName||b.on&&b.find))}function Pc(b,a,c){var d=[];q(b,function(b,g,f){d.push(a.call(c,b,g,f))});return d}function bb(b,a){if(b.indexOf)return b.indexOf(a);for(var c=0;c<b.length;c++)if(a===b[c])return c;return-1}function Ma(b,a){var c=bb(b,a);0<=c&&b.splice(c,1);return a}function ga(b,a){if(Aa(b)||b&&b.$evalAsync&&b.$watch)throw Na("cpws");if(a){if(b===
a)throw Na("cpi");if(L(b))for(var c=a.length=0;c<b.length;c++)a.push(ga(b[c]));else{c=a.$$hashKey;q(a,function(b,c){delete a[c]});for(var d in b)a[d]=ga(b[d]);Qb(a,c)}}else(a=b)&&(L(b)?a=ga(b,[]):La(b)?a=new Date(b.getTime()):ab(b)?a=RegExp(b.source):U(b)&&(a=ga(b,{})));return a}function Qc(b,a){a=a||{};for(var c in b)b.hasOwnProperty(c)&&"$$"!==c.substr(0,2)&&(a[c]=b[c]);return a}function ta(b,a){if(b===a)return!0;if(null===b||null===a)return!1;if(b!==b&&a!==a)return!0;var c=typeof b,d;if(c==typeof a&&
"object"==c)if(L(b)){if(!L(a))return!1;if((c=b.length)==a.length){for(d=0;d<c;d++)if(!ta(b[d],a[d]))return!1;return!0}}else{if(La(b))return La(a)&&b.getTime()==a.getTime();if(ab(b)&&ab(a))return b.toString()==a.toString();if(b&&b.$evalAsync&&b.$watch||a&&a.$evalAsync&&a.$watch||Aa(b)||Aa(a)||L(a))return!1;c={};for(d in b)if("$"!==d.charAt(0)&&!A(b[d])){if(!ta(b[d],a[d]))return!1;c[d]=!0}for(d in a)if(!c.hasOwnProperty(d)&&"$"!==d.charAt(0)&&a[d]!==r&&!A(a[d]))return!1;return!0}return!1}function Sb(){return N.securityPolicy&&
N.securityPolicy.isActive||N.querySelector&&!(!N.querySelector("[ng-csp]")&&!N.querySelector("[data-ng-csp]"))}function rb(b,a){var c=2<arguments.length?ua.call(arguments,2):[];return!A(a)||a instanceof RegExp?a:c.length?function(){return arguments.length?a.apply(b,c.concat(ua.call(arguments,0))):a.apply(b,c)}:function(){return arguments.length?a.apply(b,arguments):a.call(b)}}function Rc(b,a){var c=a;"string"===typeof b&&"$"===b.charAt(0)?c=r:Aa(a)?c="$WINDOW":a&&N===a?c="$DOCUMENT":a&&(a.$evalAsync&&
a.$watch)&&(c="$SCOPE");return c}function oa(b,a){return"undefined"===typeof b?r:JSON.stringify(b,Rc,a?"  ":null)}function Tb(b){return D(b)?JSON.parse(b):b}function Oa(b){b&&0!==b.length?(b=v(""+b),b=!("f"==b||"0"==b||"false"==b||"no"==b||"n"==b||"[]"==b)):b=!1;return b}function ha(b){b=x(b).clone();try{b.empty()}catch(a){}var c=x("<div>").append(b).html();try{return 3===b[0].nodeType?v(c):c.match(/^(<[^>]+>)/)[1].replace(/^<([\w\-]+)/,function(a,b){return"<"+v(b)})}catch(d){return v(c)}}function Ub(b){try{return decodeURIComponent(b)}catch(a){}}
function Vb(b){var a={},c,d;q((b||"").split("&"),function(b){b&&(c=b.split("="),d=Ub(c[0]),z(d)&&(b=z(c[1])?Ub(c[1]):!0,a[d]?L(a[d])?a[d].push(b):a[d]=[a[d],b]:a[d]=b))});return a}function Wb(b){var a=[];q(b,function(b,d){L(b)?q(b,function(b){a.push(va(d,!0)+(!0===b?"":"="+va(b,!0)))}):a.push(va(d,!0)+(!0===b?"":"="+va(b,!0)))});return a.length?a.join("&"):""}function sb(b){return va(b,!0).replace(/%26/gi,"&").replace(/%3D/gi,"=").replace(/%2B/gi,"+")}function va(b,a){return encodeURIComponent(b).replace(/%40/gi,
"@").replace(/%3A/gi,":").replace(/%24/g,"$").replace(/%2C/gi,",").replace(/%20/g,a?"%20":"+")}function Sc(b,a){function c(a){a&&d.push(a)}var d=[b],e,g,f=["ng:app","ng-app","x-ng-app","data-ng-app"],h=/\sng[:\-]app(:\s*([\w\d_]+);?)?\s/;q(f,function(a){f[a]=!0;c(N.getElementById(a));a=a.replace(":","\\:");b.querySelectorAll&&(q(b.querySelectorAll("."+a),c),q(b.querySelectorAll("."+a+"\\:"),c),q(b.querySelectorAll("["+a+"]"),c))});q(d,function(a){if(!e){var b=h.exec(" "+a.className+" ");b?(e=a,g=
(b[2]||"").replace(/\s+/g,",")):q(a.attributes,function(b){!e&&f[b.name]&&(e=a,g=b.value)})}});e&&a(e,g?[g]:[])}function Xb(b,a){var c=function(){b=x(b);if(b.injector()){var c=b[0]===N?"document":ha(b);throw Na("btstrpd",c);}a=a||[];a.unshift(["$provide",function(a){a.value("$rootElement",b)}]);a.unshift("ng");c=Yb(a);c.invoke(["$rootScope","$rootElement","$compile","$injector","$animate",function(a,b,c,d,e){a.$apply(function(){b.data("$injector",d);c(b)(a)})}]);return c},d=/^NG_DEFER_BOOTSTRAP!/;
if(W&&!d.test(W.name))return c();W.name=W.name.replace(d,"");Pa.resumeBootstrap=function(b){q(b,function(b){a.push(b)});c()}}function cb(b,a){a=a||"_";return b.replace(Tc,function(b,d){return(d?a:"")+b.toLowerCase()})}function tb(b,a,c){if(!b)throw Na("areq",a||"?",c||"required");return b}function Qa(b,a,c){c&&L(b)&&(b=b[b.length-1]);tb(A(b),a,"not a function, got "+(b&&"object"==typeof b?b.constructor.name||"Object":typeof b));return b}function wa(b,a){if("hasOwnProperty"===b)throw Na("badname",
a);}function ub(b,a,c){if(!a)return b;a=a.split(".");for(var d,e=b,g=a.length,f=0;f<g;f++)d=a[f],b&&(b=(e=b)[d]);return!c&&A(b)?rb(e,b):b}function vb(b){var a=b[0];b=b[b.length-1];if(a===b)return x(a);var c=[a];do{a=a.nextSibling;if(!a)break;c.push(a)}while(a!==b);return x(c)}function Uc(b){var a=G("$injector"),c=G("ng");b=b.angular||(b.angular={});b.$$minErr=b.$$minErr||G;return b.module||(b.module=function(){var b={};return function(e,g,f){if("hasOwnProperty"===e)throw c("badname","module");g&&
b.hasOwnProperty(e)&&(b[e]=null);return b[e]||(b[e]=function(){function b(a,d,e){return function(){c[e||"push"]([a,d,arguments]);return n}}if(!g)throw a("nomod",e);var c=[],d=[],m=b("$injector","invoke"),n={_invokeQueue:c,_runBlocks:d,requires:g,name:e,provider:b("$provide","provider"),factory:b("$provide","factory"),service:b("$provide","service"),value:b("$provide","value"),constant:b("$provide","constant","unshift"),animation:b("$animateProvider","register"),filter:b("$filterProvider","register"),
controller:b("$controllerProvider","register"),directive:b("$compileProvider","directive"),config:m,run:function(a){d.push(a);return this}};f&&m(f);return n}())}}())}function Ra(b){return b.replace(Vc,function(a,b,d,e){return e?d.toUpperCase():d}).replace(Wc,"Moz$1")}function wb(b,a,c,d){function e(b){var e=c&&b?[this.filter(b)]:[this],l=a,k,m,n,p,t,C;if(!d||null!=b)for(;e.length;)for(k=e.shift(),m=0,n=k.length;m<n;m++)for(p=x(k[m]),l?p.triggerHandler("$destroy"):l=!l,t=0,p=(C=p.children()).length;t<
p;t++)e.push(Ca(C[t]));return g.apply(this,arguments)}var g=Ca.fn[b],g=g.$original||g;e.$original=g;Ca.fn[b]=e}function I(b){if(b instanceof I)return b;if(!(this instanceof I)){if(D(b)&&"<"!=b.charAt(0))throw xb("nosel");return new I(b)}if(D(b)){var a=N.createElement("div");a.innerHTML="<div>&#160;</div>"+b;a.removeChild(a.firstChild);yb(this,a.childNodes);x(N.createDocumentFragment()).append(this)}else yb(this,b)}function zb(b){return b.cloneNode(!0)}function Da(b){Zb(b);var a=0;for(b=b.childNodes||
[];a<b.length;a++)Da(b[a])}function $b(b,a,c,d){if(z(d))throw xb("offargs");var e=ka(b,"events");ka(b,"handle")&&(H(a)?q(e,function(a,c){Ab(b,c,a);delete e[c]}):q(a.split(" "),function(a){H(c)?(Ab(b,a,e[a]),delete e[a]):Ma(e[a]||[],c)}))}function Zb(b,a){var c=b[db],d=Sa[c];d&&(a?delete Sa[c].data[a]:(d.handle&&(d.events.$destroy&&d.handle({},"$destroy"),$b(b)),delete Sa[c],b[db]=r))}function ka(b,a,c){var d=b[db],d=Sa[d||-1];if(z(c))d||(b[db]=d=++Xc,d=Sa[d]={}),d[a]=c;else return d&&d[a]}function ac(b,
a,c){var d=ka(b,"data"),e=z(c),g=!e&&z(a),f=g&&!U(a);d||f||ka(b,"data",d={});if(e)d[a]=c;else if(g){if(f)return d&&d[a];w(d,a)}else return d}function Bb(b,a){return b.getAttribute?-1<(" "+(b.getAttribute("class")||"")+" ").replace(/[\n\t]/g," ").indexOf(" "+a+" "):!1}function Cb(b,a){a&&b.setAttribute&&q(a.split(" "),function(a){b.setAttribute("class",aa((" "+(b.getAttribute("class")||"")+" ").replace(/[\n\t]/g," ").replace(" "+aa(a)+" "," ")))})}function Db(b,a){if(a&&b.setAttribute){var c=(" "+
(b.getAttribute("class")||"")+" ").replace(/[\n\t]/g," ");q(a.split(" "),function(a){a=aa(a);-1===c.indexOf(" "+a+" ")&&(c+=a+" ")});b.setAttribute("class",aa(c))}}function yb(b,a){if(a){a=a.nodeName||!z(a.length)||Aa(a)?[a]:a;for(var c=0;c<a.length;c++)b.push(a[c])}}function bc(b,a){return eb(b,"$"+(a||"ngController")+"Controller")}function eb(b,a,c){b=x(b);9==b[0].nodeType&&(b=b.find("html"));for(a=L(a)?a:[a];b.length;){for(var d=0,e=a.length;d<e;d++)if((c=b.data(a[d]))!==r)return c;b=b.parent()}}
function cc(b){for(var a=0,c=b.childNodes;a<c.length;a++)Da(c[a]);for(;b.firstChild;)b.removeChild(b.firstChild)}function dc(b,a){var c=fb[a.toLowerCase()];return c&&ec[b.nodeName]&&c}function Yc(b,a){var c=function(c,e){c.preventDefault||(c.preventDefault=function(){c.returnValue=!1});c.stopPropagation||(c.stopPropagation=function(){c.cancelBubble=!0});c.target||(c.target=c.srcElement||N);if(H(c.defaultPrevented)){var g=c.preventDefault;c.preventDefault=function(){c.defaultPrevented=!0;g.call(c)};
c.defaultPrevented=!1}c.isDefaultPrevented=function(){return c.defaultPrevented||!1===c.returnValue};q(a[e||c.type],function(a){a.call(b,c)});8>=E?(c.preventDefault=null,c.stopPropagation=null,c.isDefaultPrevented=null):(delete c.preventDefault,delete c.stopPropagation,delete c.isDefaultPrevented)};c.elem=b;return c}function Ea(b){var a=typeof b,c;"object"==a&&null!==b?"function"==typeof(c=b.$$hashKey)?c=b.$$hashKey():c===r&&(c=b.$$hashKey=Za()):c=b;return a+":"+c}function Ta(b){q(b,this.put,this)}
function fc(b){var a,c;"function"==typeof b?(a=b.$inject)||(a=[],b.length&&(c=b.toString().replace(Zc,""),c=c.match($c),q(c[1].split(ad),function(b){b.replace(bd,function(b,c,d){a.push(d)})})),b.$inject=a):L(b)?(c=b.length-1,Qa(b[c],"fn"),a=b.slice(0,c)):Qa(b,"fn",!0);return a}function Yb(b){function a(a){return function(b,c){if(U(b))q(b,Pb(a));else return a(b,c)}}function c(a,b){wa(a,"service");if(A(b)||L(b))b=n.instantiate(b);if(!b.$get)throw Ua("pget",a);return m[a+h]=b}function d(a,b){return c(a,
{$get:b})}function e(a){var b=[],c,d,h,g;q(a,function(a){if(!k.get(a)){k.put(a,!0);try{if(D(a))for(c=Va(a),b=b.concat(e(c.requires)).concat(c._runBlocks),d=c._invokeQueue,h=0,g=d.length;h<g;h++){var f=d[h],l=n.get(f[0]);l[f[1]].apply(l,f[2])}else A(a)?b.push(n.invoke(a)):L(a)?b.push(n.invoke(a)):Qa(a,"module")}catch(m){throw L(a)&&(a=a[a.length-1]),m.message&&(m.stack&&-1==m.stack.indexOf(m.message))&&(m=m.message+"\n"+m.stack),Ua("modulerr",a,m.stack||m.message||m);}}});return b}function g(a,b){function c(d){if(a.hasOwnProperty(d)){if(a[d]===
f)throw Ua("cdep",l.join(" <- "));return a[d]}try{return l.unshift(d),a[d]=f,a[d]=b(d)}finally{l.shift()}}function d(a,b,e){var h=[],g=fc(a),f,k,l;k=0;for(f=g.length;k<f;k++){l=g[k];if("string"!==typeof l)throw Ua("itkn",l);h.push(e&&e.hasOwnProperty(l)?e[l]:c(l))}a.$inject||(a=a[f]);return a.apply(b,h)}return{invoke:d,instantiate:function(a,b){var c=function(){},e;c.prototype=(L(a)?a[a.length-1]:a).prototype;c=new c;e=d(a,c,b);return U(e)||A(e)?e:c},get:c,annotate:fc,has:function(b){return m.hasOwnProperty(b+
h)||a.hasOwnProperty(b)}}}var f={},h="Provider",l=[],k=new Ta,m={$provide:{provider:a(c),factory:a(d),service:a(function(a,b){return d(a,["$injector",function(a){return a.instantiate(b)}])}),value:a(function(a,b){return d(a,ca(b))}),constant:a(function(a,b){wa(a,"constant");m[a]=b;p[a]=b}),decorator:function(a,b){var c=n.get(a+h),d=c.$get;c.$get=function(){var a=t.invoke(d,c);return t.invoke(b,null,{$delegate:a})}}}},n=m.$injector=g(m,function(){throw Ua("unpr",l.join(" <- "));}),p={},t=p.$injector=
g(p,function(a){a=n.get(a+h);return t.invoke(a.$get,a)});q(e(b),function(a){t.invoke(a||s)});return t}function cd(){var b=!0;this.disableAutoScrolling=function(){b=!1};this.$get=["$window","$location","$rootScope",function(a,c,d){function e(a){var b=null;q(a,function(a){b||"a"!==v(a.nodeName)||(b=a)});return b}function g(){var b=c.hash(),d;b?(d=f.getElementById(b))?d.scrollIntoView():(d=e(f.getElementsByName(b)))?d.scrollIntoView():"top"===b&&a.scrollTo(0,0):a.scrollTo(0,0)}var f=a.document;b&&d.$watch(function(){return c.hash()},
function(){d.$evalAsync(g)});return g}]}function dd(b,a,c,d){function e(a){try{a.apply(null,ua.call(arguments,1))}finally{if(C--,0===C)for(;B.length;)try{B.pop()()}catch(b){c.error(b)}}}function g(a,b){(function la(){q(K,function(a){a()});u=b(la,a)})()}function f(){y=null;P!=h.url()&&(P=h.url(),q(ba,function(a){a(h.url())}))}var h=this,l=a[0],k=b.location,m=b.history,n=b.setTimeout,p=b.clearTimeout,t={};h.isMock=!1;var C=0,B=[];h.$$completeOutstandingRequest=e;h.$$incOutstandingRequestCount=function(){C++};
h.notifyWhenNoOutstandingRequests=function(a){q(K,function(a){a()});0===C?a():B.push(a)};var K=[],u;h.addPollFn=function(a){H(u)&&g(100,n);K.push(a);return a};var P=k.href,Z=a.find("base"),y=null;h.url=function(a,c){k!==b.location&&(k=b.location);if(a){if(P!=a)return P=a,d.history?c?m.replaceState(null,"",a):(m.pushState(null,"",a),Z.attr("href",Z.attr("href"))):(y=a,c?k.replace(a):k.href=a),h}else return y||k.href.replace(/%27/g,"'")};var ba=[],Q=!1;h.onUrlChange=function(a){if(!Q){if(d.history)x(b).on("popstate",
f);if(d.hashchange)x(b).on("hashchange",f);else h.addPollFn(f);Q=!0}ba.push(a);return a};h.baseHref=function(){var a=Z.attr("href");return a?a.replace(/^https?\:\/\/[^\/]*/,""):""};var Y={},X="",$=h.baseHref();h.cookies=function(a,b){var d,e,g,h;if(a)b===r?l.cookie=escape(a)+"=;path="+$+";expires=Thu, 01 Jan 1970 00:00:00 GMT":D(b)&&(d=(l.cookie=escape(a)+"="+escape(b)+";path="+$).length+1,4096<d&&c.warn("Cookie '"+a+"' possibly not set or overflowed because it was too large ("+d+" > 4096 bytes)!"));
else{if(l.cookie!==X)for(X=l.cookie,d=X.split("; "),Y={},g=0;g<d.length;g++)e=d[g],h=e.indexOf("="),0<h&&(a=unescape(e.substring(0,h)),Y[a]===r&&(Y[a]=unescape(e.substring(h+1))));return Y}};h.defer=function(a,b){var c;C++;c=n(function(){delete t[c];e(a)},b||0);t[c]=!0;return c};h.defer.cancel=function(a){return t[a]?(delete t[a],p(a),e(s),!0):!1}}function ed(){this.$get=["$window","$log","$sniffer","$document",function(b,a,c,d){return new dd(b,d,a,c)}]}function fd(){this.$get=function(){function b(b,
d){function e(a){a!=n&&(p?p==a&&(p=a.n):p=a,g(a.n,a.p),g(a,n),n=a,n.n=null)}function g(a,b){a!=b&&(a&&(a.p=b),b&&(b.n=a))}if(b in a)throw G("$cacheFactory")("iid",b);var f=0,h=w({},d,{id:b}),l={},k=d&&d.capacity||Number.MAX_VALUE,m={},n=null,p=null;return a[b]={put:function(a,b){var c=m[a]||(m[a]={key:a});e(c);if(!H(b))return a in l||f++,l[a]=b,f>k&&this.remove(p.key),b},get:function(a){var b=m[a];if(b)return e(b),l[a]},remove:function(a){var b=m[a];b&&(b==n&&(n=b.p),b==p&&(p=b.n),g(b.n,b.p),delete m[a],
delete l[a],f--)},removeAll:function(){l={};f=0;m={};n=p=null},destroy:function(){m=h=l=null;delete a[b]},info:function(){return w({},h,{size:f})}}}var a={};b.info=function(){var b={};q(a,function(a,e){b[e]=a.info()});return b};b.get=function(b){return a[b]};return b}}function gd(){this.$get=["$cacheFactory",function(b){return b("templates")}]}function hc(b,a){var c={},d="Directive",e=/^\s*directive\:\s*([\d\w\-_]+)\s+(.*)$/,g=/(([\d\w\-_]+)(?:\:([^;]+))?;?)/,f=/^(on[a-z]+|formaction)$/;this.directive=
function l(a,e){wa(a,"directive");D(a)?(tb(e,"directiveFactory"),c.hasOwnProperty(a)||(c[a]=[],b.factory(a+d,["$injector","$exceptionHandler",function(b,d){var e=[];q(c[a],function(c,g){try{var f=b.invoke(c);A(f)?f={compile:ca(f)}:!f.compile&&f.link&&(f.compile=ca(f.link));f.priority=f.priority||0;f.index=g;f.name=f.name||a;f.require=f.require||f.controller&&f.name;f.restrict=f.restrict||"A";e.push(f)}catch(l){d(l)}});return e}])),c[a].push(e)):q(a,Pb(l));return this};this.aHrefSanitizationWhitelist=
function(b){return z(b)?(a.aHrefSanitizationWhitelist(b),this):a.aHrefSanitizationWhitelist()};this.imgSrcSanitizationWhitelist=function(b){return z(b)?(a.imgSrcSanitizationWhitelist(b),this):a.imgSrcSanitizationWhitelist()};this.$get=["$injector","$interpolate","$exceptionHandler","$http","$templateCache","$parse","$controller","$rootScope","$document","$sce","$animate","$$sanitizeUri",function(a,b,m,n,p,t,C,B,K,u,P,Z){function y(a,b,c,d,e){a instanceof x||(a=x(a));q(a,function(b,c){3==b.nodeType&&
b.nodeValue.match(/\S+/)&&(a[c]=x(b).wrap("<span></span>").parent()[0])});var g=Q(a,b,a,c,d,e);return function(b,c,d){tb(b,"scope");var e=c?Fa.clone.call(a):a;q(d,function(a,b){e.data("$"+b+"Controller",a)});d=0;for(var f=e.length;d<f;d++){var k=e[d];1!=k.nodeType&&9!=k.nodeType||e.eq(d).data("$scope",b)}ba(e,"ng-scope");c&&c(e,b);g&&g(b,e,e);return e}}function ba(a,b){try{a.addClass(b)}catch(c){}}function Q(a,b,c,d,e,g){function f(a,c,d,e){var g,l,m,p,n,t,C,da=[];n=0;for(t=c.length;n<t;n++)da.push(c[n]);
C=n=0;for(t=k.length;n<t;C++)l=da[C],c=k[n++],g=k[n++],m=x(l),c?(c.scope?(p=a.$new(),m.data("$scope",p),ba(m,"ng-scope")):p=a,(m=c.transclude)||!e&&b?c(g,p,l,d,Y(a,m||b)):c(g,p,l,d,e)):g&&g(a,l.childNodes,r,e)}for(var k=[],l,m,p,n=0;n<a.length;n++)m=new Eb,l=X(a[n],[],m,0===n?d:r,e),l=(g=l.length?M(l,a[n],m,b,c,null,[],[],g):null)&&g.terminal||!a[n].childNodes||!a[n].childNodes.length?null:Q(a[n].childNodes,g?g.transclude:b),k.push(g),k.push(l),p=p||g||l,g=null;return p?f:null}function Y(a,b){return function(c,
d,e){var g=!1;c||(c=a.$new(),g=c.$$transcluded=!0);d=b(c,d,e);if(g)d.on("$destroy",rb(c,c.$destroy));return d}}function X(a,b,c,d,f){var k=c.$attr,l;switch(a.nodeType){case 1:la(b,ma(Ga(a).toLowerCase()),"E",d,f);var m,p,n;l=a.attributes;for(var t=0,C=l&&l.length;t<C;t++){var B=!1,y=!1;m=l[t];if(!E||8<=E||m.specified){p=m.name;n=ma(p);xa.test(n)&&(p=cb(n.substr(6),"-"));var P=n.replace(/(Start|End)$/,"");n===P+"Start"&&(B=p,y=p.substr(0,p.length-5)+"end",p=p.substr(0,p.length-6));n=ma(p.toLowerCase());
k[n]=p;c[n]=m=aa(E&&"href"==p?decodeURIComponent(a.getAttribute(p,2)):m.value);dc(a,n)&&(c[n]=!0);I(a,b,m,n);la(b,n,"A",d,f,B,y)}}a=a.className;if(D(a)&&""!==a)for(;l=g.exec(a);)n=ma(l[2]),la(b,n,"C",d,f)&&(c[n]=aa(l[3])),a=a.substr(l.index+l[0].length);break;case 3:v(b,a.nodeValue);break;case 8:try{if(l=e.exec(a.nodeValue))n=ma(l[1]),la(b,n,"M",d,f)&&(c[n]=aa(l[2]))}catch(K){}}b.sort(s);return b}function $(a,b,c){var d=[],e=0;if(b&&a.hasAttribute&&a.hasAttribute(b)){do{if(!a)throw ia("uterdir",b,
c);1==a.nodeType&&(a.hasAttribute(b)&&e++,a.hasAttribute(c)&&e--);d.push(a);a=a.nextSibling}while(0<e)}else d.push(a);return x(d)}function O(a,b,c){return function(d,e,g,f,k){e=$(e[0],b,c);return a(d,e,g,f,k)}}function M(a,c,d,e,g,f,l,p,n){function B(a,b,c,d){if(a){c&&(a=O(a,c,d));a.require=F.require;if(Q===F||F.$$isolateScope)a=T(a,{isolateScope:!0});l.push(a)}if(b){c&&(b=O(b,c,d));b.require=F.require;if(Q===F||F.$$isolateScope)b=T(b,{isolateScope:!0});p.push(b)}}function P(a,b,c){var d,e="data",
g=!1;if(D(a)){for(;"^"==(d=a.charAt(0))||"?"==d;)a=a.substr(1),"^"==d&&(e="inheritedData"),g=g||"?"==d;d=null;c&&"data"===e&&(d=c[a]);d=d||b[e]("$"+a+"Controller");if(!d&&!g)throw ia("ctreq",a,ea);}else L(a)&&(d=[],q(a,function(a){d.push(P(a,b,c))}));return d}function K(a,e,g,f,n){function B(a,b){var c;2>arguments.length&&(b=a,a=r);Ha&&(c=O);return n(a,b,c)}var y,da,Y,u,$,J,O={},X;y=c===g?d:Qc(d,new Eb(x(g),d.$attr));da=y.$$element;if(Q){var S=/^\s*([@=&])(\??)\s*(\w*)\s*$/;f=x(g);J=e.$new(!0);M&&
M===Q.$$originalDirective?f.data("$isolateScope",J):f.data("$isolateScopeNoTemplate",J);ba(f,"ng-isolate-scope");q(Q.scope,function(a,c){var d=a.match(S)||[],g=d[3]||c,f="?"==d[2],d=d[1],l,m,n,p;J.$$isolateBindings[c]=d+g;switch(d){case "@":y.$observe(g,function(a){J[c]=a});y.$$observers[g].$$scope=e;y[g]&&(J[c]=b(y[g])(e));break;case "=":if(f&&!y[g])break;m=t(y[g]);p=m.literal?ta:function(a,b){return a===b};n=m.assign||function(){l=J[c]=m(e);throw ia("nonassign",y[g],Q.name);};l=J[c]=m(e);J.$watch(function(){var a=
m(e);p(a,J[c])||(p(a,l)?n(e,a=J[c]):J[c]=a);return l=a},null,m.literal);break;case "&":m=t(y[g]);J[c]=function(a){return m(e,a)};break;default:throw ia("iscp",Q.name,c,a);}})}X=n&&B;Z&&q(Z,function(a){var b={$scope:a===Q||a.$$isolateScope?J:e,$element:da,$attrs:y,$transclude:X},c;$=a.controller;"@"==$&&($=y[a.name]);c=C($,b);O[a.name]=c;Ha||da.data("$"+a.name+"Controller",c);a.controllerAs&&(b.$scope[a.controllerAs]=c)});f=0;for(Y=l.length;f<Y;f++)try{u=l[f],u(u.isolateScope?J:e,da,y,u.require&&P(u.require,
da,O),X)}catch(v){m(v,ha(da))}f=e;Q&&(Q.template||null===Q.templateUrl)&&(f=J);a&&a(f,g.childNodes,r,n);for(f=p.length-1;0<=f;f--)try{u=p[f],u(u.isolateScope?J:e,da,y,u.require&&P(u.require,da,O),X)}catch(hd){m(hd,ha(da))}}n=n||{};var Y=-Number.MAX_VALUE,u,Z=n.controllerDirectives,Q=n.newIsolateScopeDirective,M=n.templateDirective;n=n.nonTlbTranscludeDirective;for(var la=!1,Ha=!1,s=d.$$element=x(c),F,ea,v,w=e,G,I=0,E=a.length;I<E;I++){F=a[I];var xa=F.$$start,gb=F.$$end;xa&&(s=$(c,xa,gb));v=r;if(Y>
F.priority)break;if(v=F.scope)u=u||F,F.templateUrl||(H("new/isolated scope",Q,F,s),U(v)&&(Q=F));ea=F.name;!F.templateUrl&&F.controller&&(v=F.controller,Z=Z||{},H("'"+ea+"' controller",Z[ea],F,s),Z[ea]=F);if(v=F.transclude)la=!0,F.$$tlb||(H("transclusion",n,F,s),n=F),"element"==v?(Ha=!0,Y=F.priority,v=$(c,xa,gb),s=d.$$element=x(N.createComment(" "+ea+": "+d[ea]+" ")),c=s[0],R(g,x(ua.call(v,0)),c),w=y(v,e,Y,f&&f.name,{nonTlbTranscludeDirective:n})):(v=x(zb(c)).contents(),s.empty(),w=y(v,e));if(F.template)if(H("template",
M,F,s),M=F,v=A(F.template)?F.template(s,d):F.template,v=ic(v),F.replace){f=F;v=x("<div>"+aa(v)+"</div>").contents();c=v[0];if(1!=v.length||1!==c.nodeType)throw ia("tplrt",ea,"");R(g,s,c);E={$attr:{}};v=X(c,[],E);var V=a.splice(I+1,a.length-(I+1));Q&&S(v);a=a.concat(v).concat(V);gc(d,E);E=a.length}else s.html(v);if(F.templateUrl)H("template",M,F,s),M=F,F.replace&&(f=F),K=z(a.splice(I,a.length-I),s,d,g,w,l,p,{controllerDirectives:Z,newIsolateScopeDirective:Q,templateDirective:M,nonTlbTranscludeDirective:n}),
E=a.length;else if(F.compile)try{G=F.compile(s,d,w),A(G)?B(null,G,xa,gb):G&&B(G.pre,G.post,xa,gb)}catch(W){m(W,ha(s))}F.terminal&&(K.terminal=!0,Y=Math.max(Y,F.priority))}K.scope=u&&!0===u.scope;K.transclude=la&&w;return K}function S(a){for(var b=0,c=a.length;b<c;b++)a[b]=Rb(a[b],{$$isolateScope:!0})}function la(b,e,g,f,k,n,p){if(e===k)return null;k=null;if(c.hasOwnProperty(e)){var t;e=a.get(e+d);for(var C=0,B=e.length;C<B;C++)try{t=e[C],(f===r||f>t.priority)&&-1!=t.restrict.indexOf(g)&&(n&&(t=Rb(t,
{$$start:n,$$end:p})),b.push(t),k=t)}catch(y){m(y)}}return k}function gc(a,b){var c=b.$attr,d=a.$attr,e=a.$$element;q(a,function(d,e){"$"!=e.charAt(0)&&(b[e]&&(d+=("style"===e?";":" ")+b[e]),a.$set(e,d,!0,c[e]))});q(b,function(b,g){"class"==g?(ba(e,b),a["class"]=(a["class"]?a["class"]+" ":"")+b):"style"==g?(e.attr("style",e.attr("style")+";"+b),a.style=(a.style?a.style+";":"")+b):"$"==g.charAt(0)||a.hasOwnProperty(g)||(a[g]=b,d[g]=c[g])})}function z(a,b,c,d,e,g,f,k){var l=[],m,t,C=b[0],B=a.shift(),
y=w({},B,{templateUrl:null,transclude:null,replace:null,$$originalDirective:B}),P=A(B.templateUrl)?B.templateUrl(b,c):B.templateUrl;b.empty();n.get(u.getTrustedResourceUrl(P),{cache:p}).success(function(n){var p,K;n=ic(n);if(B.replace){n=x("<div>"+aa(n)+"</div>").contents();p=n[0];if(1!=n.length||1!==p.nodeType)throw ia("tplrt",B.name,P);n={$attr:{}};R(d,b,p);var u=X(p,[],n);U(B.scope)&&S(u);a=u.concat(a);gc(c,n)}else p=C,b.html(n);a.unshift(y);m=M(a,p,c,e,b,B,g,f,k);q(d,function(a,c){a==p&&(d[c]=
b[0])});for(t=Q(b[0].childNodes,e);l.length;){n=l.shift();K=l.shift();var ba=l.shift(),Z=l.shift(),u=b[0];K!==C&&(u=zb(p),R(ba,x(K),u));K=m.transclude?Y(n,m.transclude):Z;m(t,n,u,d,K)}l=null}).error(function(a,b,c,d){throw ia("tpload",d.url);});return function(a,b,c,d,e){l?(l.push(b),l.push(c),l.push(d),l.push(e)):m(t,b,c,d,e)}}function s(a,b){var c=b.priority-a.priority;return 0!==c?c:a.name!==b.name?a.name<b.name?-1:1:a.index-b.index}function H(a,b,c,d){if(b)throw ia("multidir",b.name,c.name,a,
ha(d));}function v(a,c){var d=b(c,!0);d&&a.push({priority:0,compile:ca(function(a,b){var c=b.parent(),e=c.data("$binding")||[];e.push(d);ba(c.data("$binding",e),"ng-binding");a.$watch(d,function(a){b[0].nodeValue=a})})})}function G(a,b){if("srcdoc"==b)return u.HTML;var c=Ga(a);if("xlinkHref"==b||"FORM"==c&&"action"==b||"IMG"!=c&&("src"==b||"ngSrc"==b))return u.RESOURCE_URL}function I(a,c,d,e){var g=b(d,!0);if(g){if("multiple"===e&&"SELECT"===Ga(a))throw ia("selmulti",ha(a));c.push({priority:100,compile:function(){return{pre:function(c,
d,l){d=l.$$observers||(l.$$observers={});if(f.test(e))throw ia("nodomevents");if(g=b(l[e],!0,G(a,e)))l[e]=g(c),(d[e]||(d[e]=[])).$$inter=!0,(l.$$observers&&l.$$observers[e].$$scope||c).$watch(g,function(a,b){"class"===e&&a!=b?l.$updateClass(a,b):l.$set(e,a)})}}}})}}function R(a,b,c){var d=b[0],e=b.length,g=d.parentNode,f,l;if(a)for(f=0,l=a.length;f<l;f++)if(a[f]==d){a[f++]=c;l=f+e-1;for(var k=a.length;f<k;f++,l++)l<k?a[f]=a[l]:delete a[f];a.length-=e-1;break}g&&g.replaceChild(c,d);a=N.createDocumentFragment();
a.appendChild(d);c[x.expando]=d[x.expando];d=1;for(e=b.length;d<e;d++)g=b[d],x(g).remove(),a.appendChild(g),delete b[d];b[0]=c;b.length=1}function T(a,b){return w(function(){return a.apply(null,arguments)},a,b)}var Eb=function(a,b){this.$$element=a;this.$attr=b||{}};Eb.prototype={$normalize:ma,$addClass:function(a){a&&0<a.length&&P.addClass(this.$$element,a)},$removeClass:function(a){a&&0<a.length&&P.removeClass(this.$$element,a)},$updateClass:function(a,b){this.$removeClass(jc(b,a));this.$addClass(jc(a,
b))},$set:function(a,b,c,d){var e=dc(this.$$element[0],a);e&&(this.$$element.prop(a,b),d=e);this[a]=b;d?this.$attr[a]=d:(d=this.$attr[a])||(this.$attr[a]=d=cb(a,"-"));e=Ga(this.$$element);if("A"===e&&"href"===a||"IMG"===e&&"src"===a)this[a]=b=Z(b,"src"===a);!1!==c&&(null===b||b===r?this.$$element.removeAttr(d):this.$$element.attr(d,b));(c=this.$$observers)&&q(c[a],function(a){try{a(b)}catch(c){m(c)}})},$observe:function(a,b){var c=this,d=c.$$observers||(c.$$observers={}),e=d[a]||(d[a]=[]);e.push(b);
B.$evalAsync(function(){e.$$inter||b(c[a])});return b}};var ea=b.startSymbol(),Ha=b.endSymbol(),ic="{{"==ea||"}}"==Ha?Ba:function(a){return a.replace(/\{\{/g,ea).replace(/}}/g,Ha)},xa=/^ngAttr[A-Z]/;return y}]}function ma(b){return Ra(b.replace(id,""))}function jc(b,a){var c="",d=b.split(/\s+/),e=a.split(/\s+/),g=0;a:for(;g<d.length;g++){for(var f=d[g],h=0;h<e.length;h++)if(f==e[h])continue a;c+=(0<c.length?" ":"")+f}return c}function jd(){var b={},a=/^(\S+)(\s+as\s+(\w+))?$/;this.register=function(a,
d){wa(a,"controller");U(a)?w(b,a):b[a]=d};this.$get=["$injector","$window",function(c,d){return function(e,g){var f,h,l;D(e)&&(f=e.match(a),h=f[1],l=f[3],e=b.hasOwnProperty(h)?b[h]:ub(g.$scope,h,!0)||ub(d,h,!0),Qa(e,h,!0));f=c.instantiate(e,g);if(l){if(!g||"object"!=typeof g.$scope)throw G("$controller")("noscp",h||e.name,l);g.$scope[l]=f}return f}}]}function kd(){this.$get=["$window",function(b){return x(b.document)}]}function ld(){this.$get=["$log",function(b){return function(a,c){b.error.apply(b,
arguments)}}]}function kc(b){var a={},c,d,e;if(!b)return a;q(b.split("\n"),function(b){e=b.indexOf(":");c=v(aa(b.substr(0,e)));d=aa(b.substr(e+1));c&&(a[c]=a[c]?a[c]+(", "+d):d)});return a}function lc(b){var a=U(b)?b:r;return function(c){a||(a=kc(b));return c?a[v(c)]||null:a}}function mc(b,a,c){if(A(c))return c(b,a);q(c,function(c){b=c(b,a)});return b}function md(){var b=/^\s*(\[|\{[^\{])/,a=/[\}\]]\s*$/,c=/^\)\]\}',?\n/,d={"Content-Type":"application/json;charset=utf-8"},e=this.defaults={transformResponse:[function(d){D(d)&&
(d=d.replace(c,""),b.test(d)&&a.test(d)&&(d=Tb(d)));return d}],transformRequest:[function(a){return U(a)&&"[object File]"!==$a.call(a)?oa(a):a}],headers:{common:{Accept:"application/json, text/plain, */*"},post:d,put:d,patch:d},xsrfCookieName:"XSRF-TOKEN",xsrfHeaderName:"X-XSRF-TOKEN"},g=this.interceptors=[],f=this.responseInterceptors=[];this.$get=["$httpBackend","$browser","$cacheFactory","$rootScope","$q","$injector",function(a,b,c,d,n,p){function t(a){function c(a){var b=w({},a,{data:mc(a.data,
a.headers,d.transformResponse)});return 200<=a.status&&300>a.status?b:n.reject(b)}var d={transformRequest:e.transformRequest,transformResponse:e.transformResponse},g=function(a){function b(a){var c;q(a,function(b,d){A(b)&&(c=b(),null!=c?a[d]=c:delete a[d])})}var c=e.headers,d=w({},a.headers),g,f,c=w({},c.common,c[v(a.method)]);b(c);b(d);a:for(g in c){a=v(g);for(f in d)if(v(f)===a)continue a;d[g]=c[g]}return d}(a);w(d,a);d.headers=g;d.method=Ia(d.method);(a=Fb(d.url)?b.cookies()[d.xsrfCookieName||
e.xsrfCookieName]:r)&&(g[d.xsrfHeaderName||e.xsrfHeaderName]=a);var f=[function(a){g=a.headers;var b=mc(a.data,lc(g),a.transformRequest);H(a.data)&&q(g,function(a,b){"content-type"===v(b)&&delete g[b]});H(a.withCredentials)&&!H(e.withCredentials)&&(a.withCredentials=e.withCredentials);return C(a,b,g).then(c,c)},r],h=n.when(d);for(q(u,function(a){(a.request||a.requestError)&&f.unshift(a.request,a.requestError);(a.response||a.responseError)&&f.push(a.response,a.responseError)});f.length;){a=f.shift();
var k=f.shift(),h=h.then(a,k)}h.success=function(a){h.then(function(b){a(b.data,b.status,b.headers,d)});return h};h.error=function(a){h.then(null,function(b){a(b.data,b.status,b.headers,d)});return h};return h}function C(b,c,g){function f(a,b,c){u&&(200<=a&&300>a?u.put(r,[a,b,kc(c)]):u.remove(r));l(b,a,c);d.$$phase||d.$apply()}function l(a,c,d){c=Math.max(c,0);(200<=c&&300>c?p.resolve:p.reject)({data:a,status:c,headers:lc(d),config:b})}function k(){var a=bb(t.pendingRequests,b);-1!==a&&t.pendingRequests.splice(a,
1)}var p=n.defer(),C=p.promise,u,q,r=B(b.url,b.params);t.pendingRequests.push(b);C.then(k,k);(b.cache||e.cache)&&(!1!==b.cache&&"GET"==b.method)&&(u=U(b.cache)?b.cache:U(e.cache)?e.cache:K);if(u)if(q=u.get(r),z(q)){if(q.then)return q.then(k,k),q;L(q)?l(q[1],q[0],ga(q[2])):l(q,200,{})}else u.put(r,C);H(q)&&a(b.method,r,c,f,g,b.timeout,b.withCredentials,b.responseType);return C}function B(a,b){if(!b)return a;var c=[];Nc(b,function(a,b){null===a||H(a)||(L(a)||(a=[a]),q(a,function(a){U(a)&&(a=oa(a));
c.push(va(b)+"="+va(a))}))});return a+(-1==a.indexOf("?")?"?":"&")+c.join("&")}var K=c("$http"),u=[];q(g,function(a){u.unshift(D(a)?p.get(a):p.invoke(a))});q(f,function(a,b){var c=D(a)?p.get(a):p.invoke(a);u.splice(b,0,{response:function(a){return c(n.when(a))},responseError:function(a){return c(n.reject(a))}})});t.pendingRequests=[];(function(a){q(arguments,function(a){t[a]=function(b,c){return t(w(c||{},{method:a,url:b}))}})})("get","delete","head","jsonp");(function(a){q(arguments,function(a){t[a]=
function(b,c,d){return t(w(d||{},{method:a,url:b,data:c}))}})})("post","put");t.defaults=e;return t}]}function nd(){this.$get=["$browser","$window","$document",function(b,a,c){return od(b,pd,b.defer,a.angular.callbacks,c[0])}]}function od(b,a,c,d,e){function g(a,b){var c=e.createElement("script"),d=function(){c.onreadystatechange=c.onload=c.onerror=null;e.body.removeChild(c);b&&b()};c.type="text/javascript";c.src=a;E&&8>=E?c.onreadystatechange=function(){/loaded|complete/.test(c.readyState)&&d()}:
c.onload=c.onerror=function(){d()};e.body.appendChild(c);return d}var f=-1;return function(e,l,k,m,n,p,t,C){function B(){u=f;r&&r();y&&y.abort()}function K(a,d,e,g){var f=ya(l).protocol;ba&&c.cancel(ba);r=y=null;d="file"==f&&0===d?e?200:404:d;a(1223==d?204:d,e,g);b.$$completeOutstandingRequest(s)}var u;b.$$incOutstandingRequestCount();l=l||b.url();if("jsonp"==v(e)){var P="_"+(d.counter++).toString(36);d[P]=function(a){d[P].data=a};var r=g(l.replace("JSON_CALLBACK","angular.callbacks."+P),function(){d[P].data?
K(m,200,d[P].data):K(m,u||-2);delete d[P]})}else{var y=new a;y.open(e,l,!0);q(n,function(a,b){z(a)&&y.setRequestHeader(b,a)});y.onreadystatechange=function(){if(4==y.readyState){var a=null,b=null;u!==f&&(a=y.getAllResponseHeaders(),b=y.responseType?y.response:y.responseText);K(m,u||y.status,b,a)}};t&&(y.withCredentials=!0);C&&(y.responseType=C);y.send(k||null)}if(0<p)var ba=c(B,p);else p&&p.then&&p.then(B)}}function qd(){var b="{{",a="}}";this.startSymbol=function(a){return a?(b=a,this):b};this.endSymbol=
function(b){return b?(a=b,this):a};this.$get=["$parse","$exceptionHandler","$sce",function(c,d,e){function g(g,k,m){for(var n,p,t=0,C=[],B=g.length,K=!1,u=[];t<B;)-1!=(n=g.indexOf(b,t))&&-1!=(p=g.indexOf(a,n+f))?(t!=n&&C.push(g.substring(t,n)),C.push(t=c(K=g.substring(n+f,p))),t.exp=K,t=p+h,K=!0):(t!=B&&C.push(g.substring(t)),t=B);(B=C.length)||(C.push(""),B=1);if(m&&1<C.length)throw nc("noconcat",g);if(!k||K)return u.length=B,t=function(a){try{for(var b=0,c=B,f;b<c;b++)"function"==typeof(f=C[b])&&
(f=f(a),f=m?e.getTrusted(m,f):e.valueOf(f),null===f||H(f)?f="":"string"!=typeof f&&(f=oa(f))),u[b]=f;return u.join("")}catch(h){a=nc("interr",g,h.toString()),d(a)}},t.exp=g,t.parts=C,t}var f=b.length,h=a.length;g.startSymbol=function(){return b};g.endSymbol=function(){return a};return g}]}function rd(){this.$get=["$rootScope","$window","$q",function(b,a,c){function d(d,f,h,l){var k=a.setInterval,m=a.clearInterval,n=c.defer(),p=n.promise,t=0,C=z(l)&&!l;h=z(h)?h:0;p.then(null,null,d);p.$$intervalId=
k(function(){n.notify(t++);0<h&&t>=h&&(n.resolve(t),m(p.$$intervalId),delete e[p.$$intervalId]);C||b.$apply()},f);e[p.$$intervalId]=n;return p}var e={};d.cancel=function(a){return a&&a.$$intervalId in e?(e[a.$$intervalId].reject("canceled"),clearInterval(a.$$intervalId),delete e[a.$$intervalId],!0):!1};return d}]}function sd(){this.$get=function(){return{id:"en-us",NUMBER_FORMATS:{DECIMAL_SEP:".",GROUP_SEP:",",PATTERNS:[{minInt:1,minFrac:0,maxFrac:3,posPre:"",posSuf:"",negPre:"-",negSuf:"",gSize:3,
lgSize:3},{minInt:1,minFrac:2,maxFrac:2,posPre:"\u00a4",posSuf:"",negPre:"(\u00a4",negSuf:")",gSize:3,lgSize:3}],CURRENCY_SYM:"$"},DATETIME_FORMATS:{MONTH:"January February March April May June July August September October November December".split(" "),SHORTMONTH:"Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" "),DAY:"Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "),SHORTDAY:"Sun Mon Tue Wed Thu Fri Sat".split(" "),AMPMS:["AM","PM"],medium:"MMM d, y h:mm:ss a","short":"M/d/yy h:mm a",
fullDate:"EEEE, MMMM d, y",longDate:"MMMM d, y",mediumDate:"MMM d, y",shortDate:"M/d/yy",mediumTime:"h:mm:ss a",shortTime:"h:mm a"},pluralCat:function(b){return 1===b?"one":"other"}}}}function oc(b){b=b.split("/");for(var a=b.length;a--;)b[a]=sb(b[a]);return b.join("/")}function pc(b,a,c){b=ya(b,c);a.$$protocol=b.protocol;a.$$host=b.hostname;a.$$port=R(b.port)||td[b.protocol]||null}function qc(b,a,c){var d="/"!==b.charAt(0);d&&(b="/"+b);b=ya(b,c);a.$$path=decodeURIComponent(d&&"/"===b.pathname.charAt(0)?
b.pathname.substring(1):b.pathname);a.$$search=Vb(b.search);a.$$hash=decodeURIComponent(b.hash);a.$$path&&"/"!=a.$$path.charAt(0)&&(a.$$path="/"+a.$$path)}function na(b,a){if(0===a.indexOf(b))return a.substr(b.length)}function Wa(b){var a=b.indexOf("#");return-1==a?b:b.substr(0,a)}function Gb(b){return b.substr(0,Wa(b).lastIndexOf("/")+1)}function rc(b,a){this.$$html5=!0;a=a||"";var c=Gb(b);pc(b,this,b);this.$$parse=function(a){var e=na(c,a);if(!D(e))throw Hb("ipthprfx",a,c);qc(e,this,b);this.$$path||
(this.$$path="/");this.$$compose()};this.$$compose=function(){var a=Wb(this.$$search),b=this.$$hash?"#"+sb(this.$$hash):"";this.$$url=oc(this.$$path)+(a?"?"+a:"")+b;this.$$absUrl=c+this.$$url.substr(1)};this.$$rewrite=function(d){var e;if((e=na(b,d))!==r)return d=e,(e=na(a,e))!==r?c+(na("/",e)||e):b+d;if((e=na(c,d))!==r)return c+e;if(c==d+"/")return c}}function Ib(b,a){var c=Gb(b);pc(b,this,b);this.$$parse=function(d){var e=na(b,d)||na(c,d),e="#"==e.charAt(0)?na(a,e):this.$$html5?e:"";if(!D(e))throw Hb("ihshprfx",
d,a);qc(e,this,b);d=this.$$path;var g=/^\/?.*?:(\/.*)/;0===e.indexOf(b)&&(e=e.replace(b,""));g.exec(e)||(d=(e=g.exec(d))?e[1]:d);this.$$path=d;this.$$compose()};this.$$compose=function(){var c=Wb(this.$$search),e=this.$$hash?"#"+sb(this.$$hash):"";this.$$url=oc(this.$$path)+(c?"?"+c:"")+e;this.$$absUrl=b+(this.$$url?a+this.$$url:"")};this.$$rewrite=function(a){if(Wa(b)==Wa(a))return a}}function sc(b,a){this.$$html5=!0;Ib.apply(this,arguments);var c=Gb(b);this.$$rewrite=function(d){var e;if(b==Wa(d))return d;
if(e=na(c,d))return b+a+e;if(c===d+"/")return c}}function hb(b){return function(){return this[b]}}function tc(b,a){return function(c){if(H(c))return this[b];this[b]=a(c);this.$$compose();return this}}function ud(){var b="",a=!1;this.hashPrefix=function(a){return z(a)?(b=a,this):b};this.html5Mode=function(b){return z(b)?(a=b,this):a};this.$get=["$rootScope","$browser","$sniffer","$rootElement",function(c,d,e,g){function f(a){c.$broadcast("$locationChangeSuccess",h.absUrl(),a)}var h,l=d.baseHref(),
k=d.url();a?(l=k.substring(0,k.indexOf("/",k.indexOf("//")+2))+(l||"/"),e=e.history?rc:sc):(l=Wa(k),e=Ib);h=new e(l,"#"+b);h.$$parse(h.$$rewrite(k));g.on("click",function(a){if(!a.ctrlKey&&!a.metaKey&&2!=a.which){for(var b=x(a.target);"a"!==v(b[0].nodeName);)if(b[0]===g[0]||!(b=b.parent())[0])return;var e=b.prop("href"),f=h.$$rewrite(e);e&&(!b.attr("target")&&f&&!a.isDefaultPrevented())&&(a.preventDefault(),f!=d.url()&&(h.$$parse(f),c.$apply(),W.angular["ff-684208-preventDefault"]=!0))}});h.absUrl()!=
k&&d.url(h.absUrl(),!0);d.onUrlChange(function(a){h.absUrl()!=a&&(c.$broadcast("$locationChangeStart",a,h.absUrl()).defaultPrevented?d.url(h.absUrl()):(c.$evalAsync(function(){var b=h.absUrl();h.$$parse(a);f(b)}),c.$$phase||c.$digest()))});var m=0;c.$watch(function(){var a=d.url(),b=h.$$replace;m&&a==h.absUrl()||(m++,c.$evalAsync(function(){c.$broadcast("$locationChangeStart",h.absUrl(),a).defaultPrevented?h.$$parse(a):(d.url(h.absUrl(),b),f(a))}));h.$$replace=!1;return m});return h}]}function vd(){var b=
!0,a=this;this.debugEnabled=function(a){return z(a)?(b=a,this):b};this.$get=["$window",function(c){function d(a){a instanceof Error&&(a.stack?a=a.message&&-1===a.stack.indexOf(a.message)?"Error: "+a.message+"\n"+a.stack:a.stack:a.sourceURL&&(a=a.message+"\n"+a.sourceURL+":"+a.line));return a}function e(a){var b=c.console||{},e=b[a]||b.log||s;return e.apply?function(){var a=[];q(arguments,function(b){a.push(d(b))});return e.apply(b,a)}:function(a,b){e(a,null==b?"":b)}}return{log:e("log"),info:e("info"),
warn:e("warn"),error:e("error"),debug:function(){var c=e("debug");return function(){b&&c.apply(a,arguments)}}()}}]}function pa(b,a){if("constructor"===b)throw za("isecfld",a);return b}function Xa(b,a){if(b){if(b.constructor===b)throw za("isecfn",a);if(b.document&&b.location&&b.alert&&b.setInterval)throw za("isecwindow",a);if(b.children&&(b.nodeName||b.on&&b.find))throw za("isecdom",a);}return b}function ib(b,a,c,d,e){e=e||{};a=a.split(".");for(var g,f=0;1<a.length;f++){g=pa(a.shift(),d);var h=b[g];
h||(h={},b[g]=h);b=h;b.then&&e.unwrapPromises&&(qa(d),"$$v"in b||function(a){a.then(function(b){a.$$v=b})}(b),b.$$v===r&&(b.$$v={}),b=b.$$v)}g=pa(a.shift(),d);return b[g]=c}function uc(b,a,c,d,e,g,f){pa(b,g);pa(a,g);pa(c,g);pa(d,g);pa(e,g);return f.unwrapPromises?function(f,l){var k=l&&l.hasOwnProperty(b)?l:f,m;if(null===k||k===r)return k;(k=k[b])&&k.then&&(qa(g),"$$v"in k||(m=k,m.$$v=r,m.then(function(a){m.$$v=a})),k=k.$$v);if(!a||null===k||k===r)return k;(k=k[a])&&k.then&&(qa(g),"$$v"in k||(m=k,
m.$$v=r,m.then(function(a){m.$$v=a})),k=k.$$v);if(!c||null===k||k===r)return k;(k=k[c])&&k.then&&(qa(g),"$$v"in k||(m=k,m.$$v=r,m.then(function(a){m.$$v=a})),k=k.$$v);if(!d||null===k||k===r)return k;(k=k[d])&&k.then&&(qa(g),"$$v"in k||(m=k,m.$$v=r,m.then(function(a){m.$$v=a})),k=k.$$v);if(!e||null===k||k===r)return k;(k=k[e])&&k.then&&(qa(g),"$$v"in k||(m=k,m.$$v=r,m.then(function(a){m.$$v=a})),k=k.$$v);return k}:function(g,f){var k=f&&f.hasOwnProperty(b)?f:g;if(null===k||k===r)return k;k=k[b];if(!a||
null===k||k===r)return k;k=k[a];if(!c||null===k||k===r)return k;k=k[c];if(!d||null===k||k===r)return k;k=k[d];return e&&null!==k&&k!==r?k=k[e]:k}}function vc(b,a,c){if(Jb.hasOwnProperty(b))return Jb[b];var d=b.split("."),e=d.length,g;if(a.csp)g=6>e?uc(d[0],d[1],d[2],d[3],d[4],c,a):function(b,g){var f=0,h;do h=uc(d[f++],d[f++],d[f++],d[f++],d[f++],c,a)(b,g),g=r,b=h;while(f<e);return h};else{var f="var l, fn, p;\n";q(d,function(b,d){pa(b,c);f+="if(s === null || s === undefined) return s;\nl=s;\ns="+
(d?"s":'((k&&k.hasOwnProperty("'+b+'"))?k:s)')+'["'+b+'"];\n'+(a.unwrapPromises?'if (s && s.then) {\n pw("'+c.replace(/(["\r\n])/g,"\\$1")+'");\n if (!("$$v" in s)) {\n p=s;\n p.$$v = undefined;\n p.then(function(v) {p.$$v=v;});\n}\n s=s.$$v\n}\n':"")});var f=f+"return s;",h=new Function("s","k","pw",f);h.toString=function(){return f};g=function(a,b){return h(a,b,qa)}}"hasOwnProperty"!==b&&(Jb[b]=g);return g}function wd(){var b={},a={csp:!1,unwrapPromises:!1,logPromiseWarnings:!0};this.unwrapPromises=
function(b){return z(b)?(a.unwrapPromises=!!b,this):a.unwrapPromises};this.logPromiseWarnings=function(b){return z(b)?(a.logPromiseWarnings=b,this):a.logPromiseWarnings};this.$get=["$filter","$sniffer","$log",function(c,d,e){a.csp=d.csp;qa=function(b){a.logPromiseWarnings&&!wc.hasOwnProperty(b)&&(wc[b]=!0,e.warn("[$parse] Promise found in the expression `"+b+"`. Automatic unwrapping of promises in Angular expressions is deprecated."))};return function(d){var e;switch(typeof d){case "string":if(b.hasOwnProperty(d))return b[d];
e=new Kb(a);e=(new Ya(e,c,a)).parse(d,!1);"hasOwnProperty"!==d&&(b[d]=e);return e;case "function":return d;default:return s}}}]}function xd(){this.$get=["$rootScope","$exceptionHandler",function(b,a){return yd(function(a){b.$evalAsync(a)},a)}]}function yd(b,a){function c(a){return a}function d(a){return f(a)}var e=function(){var h=[],l,k;return k={resolve:function(a){if(h){var c=h;h=r;l=g(a);c.length&&b(function(){for(var a,b=0,d=c.length;b<d;b++)a=c[b],l.then(a[0],a[1],a[2])})}},reject:function(a){k.resolve(f(a))},
notify:function(a){if(h){var c=h;h.length&&b(function(){for(var b,d=0,e=c.length;d<e;d++)b=c[d],b[2](a)})}},promise:{then:function(b,f,g){var k=e(),C=function(d){try{k.resolve((A(b)?b:c)(d))}catch(e){k.reject(e),a(e)}},B=function(b){try{k.resolve((A(f)?f:d)(b))}catch(c){k.reject(c),a(c)}},K=function(b){try{k.notify((A(g)?g:c)(b))}catch(d){a(d)}};h?h.push([C,B,K]):l.then(C,B,K);return k.promise},"catch":function(a){return this.then(null,a)},"finally":function(a){function b(a,c){var d=e();c?d.resolve(a):
d.reject(a);return d.promise}function d(e,f){var g=null;try{g=(a||c)()}catch(h){return b(h,!1)}return g&&A(g.then)?g.then(function(){return b(e,f)},function(a){return b(a,!1)}):b(e,f)}return this.then(function(a){return d(a,!0)},function(a){return d(a,!1)})}}}},g=function(a){return a&&A(a.then)?a:{then:function(c){var d=e();b(function(){d.resolve(c(a))});return d.promise}}},f=function(c){return{then:function(f,g){var m=e();b(function(){try{m.resolve((A(g)?g:d)(c))}catch(b){m.reject(b),a(b)}});return m.promise}}};
return{defer:e,reject:f,when:function(h,l,k,m){var n=e(),p,t=function(b){try{return(A(l)?l:c)(b)}catch(d){return a(d),f(d)}},C=function(b){try{return(A(k)?k:d)(b)}catch(c){return a(c),f(c)}},B=function(b){try{return(A(m)?m:c)(b)}catch(d){a(d)}};b(function(){g(h).then(function(a){p||(p=!0,n.resolve(g(a).then(t,C,B)))},function(a){p||(p=!0,n.resolve(C(a)))},function(a){p||n.notify(B(a))})});return n.promise},all:function(a){var b=e(),c=0,d=L(a)?[]:{};q(a,function(a,e){c++;g(a).then(function(a){d.hasOwnProperty(e)||
(d[e]=a,--c||b.resolve(d))},function(a){d.hasOwnProperty(e)||b.reject(a)})});0===c&&b.resolve(d);return b.promise}}}function zd(){var b=10,a=G("$rootScope"),c=null;this.digestTtl=function(a){arguments.length&&(b=a);return b};this.$get=["$injector","$exceptionHandler","$parse","$browser",function(d,e,g,f){function h(){this.$id=Za();this.$$phase=this.$parent=this.$$watchers=this.$$nextSibling=this.$$prevSibling=this.$$childHead=this.$$childTail=null;this["this"]=this.$root=this;this.$$destroyed=!1;
this.$$asyncQueue=[];this.$$postDigestQueue=[];this.$$listeners={};this.$$isolateBindings={}}function l(b){if(n.$$phase)throw a("inprog",n.$$phase);n.$$phase=b}function k(a,b){var c=g(a);Qa(c,b);return c}function m(){}h.prototype={constructor:h,$new:function(a){a?(a=new h,a.$root=this.$root,a.$$asyncQueue=this.$$asyncQueue,a.$$postDigestQueue=this.$$postDigestQueue):(a=function(){},a.prototype=this,a=new a,a.$id=Za());a["this"]=a;a.$$listeners={};a.$parent=this;a.$$watchers=a.$$nextSibling=a.$$childHead=
a.$$childTail=null;a.$$prevSibling=this.$$childTail;this.$$childHead?this.$$childTail=this.$$childTail.$$nextSibling=a:this.$$childHead=this.$$childTail=a;return a},$watch:function(a,b,d){var e=k(a,"watch"),g=this.$$watchers,f={fn:b,last:m,get:e,exp:a,eq:!!d};c=null;if(!A(b)){var h=k(b||s,"listener");f.fn=function(a,b,c){h(c)}}if("string"==typeof a&&e.constant){var l=f.fn;f.fn=function(a,b,c){l.call(this,a,b,c);Ma(g,f)}}g||(g=this.$$watchers=[]);g.unshift(f);return function(){Ma(g,f)}},$watchCollection:function(a,
b){var c=this,d,e,f=0,h=g(a),l=[],k={},m=0;return this.$watch(function(){e=h(c);var a,b;if(U(e))if(pb(e))for(d!==l&&(d=l,m=d.length=0,f++),a=e.length,m!==a&&(f++,d.length=m=a),b=0;b<a;b++)d[b]!==e[b]&&(f++,d[b]=e[b]);else{d!==k&&(d=k={},m=0,f++);a=0;for(b in e)e.hasOwnProperty(b)&&(a++,d.hasOwnProperty(b)?d[b]!==e[b]&&(f++,d[b]=e[b]):(m++,d[b]=e[b],f++));if(m>a)for(b in f++,d)d.hasOwnProperty(b)&&!e.hasOwnProperty(b)&&(m--,delete d[b])}else d!==e&&(d=e,f++);return f},function(){b(e,d,c)})},$digest:function(){var d,
f,g,h,k=this.$$asyncQueue,q=this.$$postDigestQueue,r,v,y=b,s,x=[],z,X,$;l("$digest");c=null;do{v=!1;for(s=this;k.length;){try{$=k.shift(),$.scope.$eval($.expression)}catch(O){n.$$phase=null,e(O)}c=null}a:do{if(h=s.$$watchers)for(r=h.length;r--;)try{if(d=h[r])if((f=d.get(s))!==(g=d.last)&&!(d.eq?ta(f,g):"number"==typeof f&&"number"==typeof g&&isNaN(f)&&isNaN(g)))v=!0,c=d,d.last=d.eq?ga(f):f,d.fn(f,g===m?f:g,s),5>y&&(z=4-y,x[z]||(x[z]=[]),X=A(d.exp)?"fn: "+(d.exp.name||d.exp.toString()):d.exp,X+="; newVal: "+
oa(f)+"; oldVal: "+oa(g),x[z].push(X));else if(d===c){v=!1;break a}}catch(M){n.$$phase=null,e(M)}if(!(h=s.$$childHead||s!==this&&s.$$nextSibling))for(;s!==this&&!(h=s.$$nextSibling);)s=s.$parent}while(s=h);if(v&&!y--)throw n.$$phase=null,a("infdig",b,oa(x));}while(v||k.length);for(n.$$phase=null;q.length;)try{q.shift()()}catch(S){e(S)}},$destroy:function(){if(!this.$$destroyed){var a=this.$parent;this.$broadcast("$destroy");this.$$destroyed=!0;this!==n&&(a.$$childHead==this&&(a.$$childHead=this.$$nextSibling),
a.$$childTail==this&&(a.$$childTail=this.$$prevSibling),this.$$prevSibling&&(this.$$prevSibling.$$nextSibling=this.$$nextSibling),this.$$nextSibling&&(this.$$nextSibling.$$prevSibling=this.$$prevSibling),this.$parent=this.$$nextSibling=this.$$prevSibling=this.$$childHead=this.$$childTail=null)}},$eval:function(a,b){return g(a)(this,b)},$evalAsync:function(a){n.$$phase||n.$$asyncQueue.length||f.defer(function(){n.$$asyncQueue.length&&n.$digest()});this.$$asyncQueue.push({scope:this,expression:a})},
$$postDigest:function(a){this.$$postDigestQueue.push(a)},$apply:function(a){try{return l("$apply"),this.$eval(a)}catch(b){e(b)}finally{n.$$phase=null;try{n.$digest()}catch(c){throw e(c),c;}}},$on:function(a,b){var c=this.$$listeners[a];c||(this.$$listeners[a]=c=[]);c.push(b);return function(){c[bb(c,b)]=null}},$emit:function(a,b){var c=[],d,f=this,g=!1,h={name:a,targetScope:f,stopPropagation:function(){g=!0},preventDefault:function(){h.defaultPrevented=!0},defaultPrevented:!1},l=[h].concat(ua.call(arguments,
1)),k,m;do{d=f.$$listeners[a]||c;h.currentScope=f;k=0;for(m=d.length;k<m;k++)if(d[k])try{d[k].apply(null,l)}catch(n){e(n)}else d.splice(k,1),k--,m--;if(g)break;f=f.$parent}while(f);return h},$broadcast:function(a,b){var c=this,d=this,f={name:a,targetScope:this,preventDefault:function(){f.defaultPrevented=!0},defaultPrevented:!1},g=[f].concat(ua.call(arguments,1)),h,k;do{c=d;f.currentScope=c;d=c.$$listeners[a]||[];h=0;for(k=d.length;h<k;h++)if(d[h])try{d[h].apply(null,g)}catch(l){e(l)}else d.splice(h,
1),h--,k--;if(!(d=c.$$childHead||c!==this&&c.$$nextSibling))for(;c!==this&&!(d=c.$$nextSibling);)c=c.$parent}while(c=d);return f}};var n=new h;return n}]}function Ad(){var b=/^\s*(https?|ftp|mailto|tel|file):/,a=/^\s*(https?|ftp|file):|data:image\//;this.aHrefSanitizationWhitelist=function(a){return z(a)?(b=a,this):b};this.imgSrcSanitizationWhitelist=function(b){return z(b)?(a=b,this):a};this.$get=function(){return function(c,d){var e=d?a:b,g;if(!E||8<=E)if(g=ya(c).href,""!==g&&!g.match(e))return"unsafe:"+
g;return c}}}function Bd(b){if("self"===b)return b;if(D(b)){if(-1<b.indexOf("***"))throw ra("iwcard",b);b=b.replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g,"\\$1").replace(/\x08/g,"\\x08").replace("\\*\\*",".*").replace("\\*","[^:/.?&;]*");return RegExp("^"+b+"$")}if(ab(b))return RegExp("^"+b.source+"$");throw ra("imatcher");}function xc(b){var a=[];z(b)&&q(b,function(b){a.push(Bd(b))});return a}function Cd(){this.SCE_CONTEXTS=fa;var b=["self"],a=[];this.resourceUrlWhitelist=function(a){arguments.length&&
(b=xc(a));return b};this.resourceUrlBlacklist=function(b){arguments.length&&(a=xc(b));return a};this.$get=["$injector",function(c){function d(a){var b=function(a){this.$$unwrapTrustedValue=function(){return a}};a&&(b.prototype=new a);b.prototype.valueOf=function(){return this.$$unwrapTrustedValue()};b.prototype.toString=function(){return this.$$unwrapTrustedValue().toString()};return b}var e=function(a){throw ra("unsafe");};c.has("$sanitize")&&(e=c.get("$sanitize"));var g=d(),f={};f[fa.HTML]=d(g);
f[fa.CSS]=d(g);f[fa.URL]=d(g);f[fa.JS]=d(g);f[fa.RESOURCE_URL]=d(f[fa.URL]);return{trustAs:function(a,b){var c=f.hasOwnProperty(a)?f[a]:null;if(!c)throw ra("icontext",a,b);if(null===b||b===r||""===b)return b;if("string"!==typeof b)throw ra("itype",a);return new c(b)},getTrusted:function(c,d){if(null===d||d===r||""===d)return d;var g=f.hasOwnProperty(c)?f[c]:null;if(g&&d instanceof g)return d.$$unwrapTrustedValue();if(c===fa.RESOURCE_URL){var g=ya(d.toString()),m,n,p=!1;m=0;for(n=b.length;m<n;m++)if("self"===
b[m]?Fb(g):b[m].exec(g.href)){p=!0;break}if(p)for(m=0,n=a.length;m<n;m++)if("self"===a[m]?Fb(g):a[m].exec(g.href)){p=!1;break}if(p)return d;throw ra("insecurl",d.toString());}if(c===fa.HTML)return e(d);throw ra("unsafe");},valueOf:function(a){return a instanceof g?a.$$unwrapTrustedValue():a}}}]}function Dd(){var b=!0;this.enabled=function(a){arguments.length&&(b=!!a);return b};this.$get=["$parse","$sniffer","$sceDelegate",function(a,c,d){if(b&&c.msie&&8>c.msieDocumentMode)throw ra("iequirks");var e=
ga(fa);e.isEnabled=function(){return b};e.trustAs=d.trustAs;e.getTrusted=d.getTrusted;e.valueOf=d.valueOf;b||(e.trustAs=e.getTrusted=function(a,b){return b},e.valueOf=Ba);e.parseAs=function(b,c){var d=a(c);return d.literal&&d.constant?d:function(a,c){return e.getTrusted(b,d(a,c))}};var g=e.parseAs,f=e.getTrusted,h=e.trustAs;q(fa,function(a,b){var c=v(b);e[Ra("parse_as_"+c)]=function(b){return g(a,b)};e[Ra("get_trusted_"+c)]=function(b){return f(a,b)};e[Ra("trust_as_"+c)]=function(b){return h(a,b)}});
return e}]}function Ed(){this.$get=["$window","$document",function(b,a){var c={},d=R((/android (\d+)/.exec(v((b.navigator||{}).userAgent))||[])[1]),e=/Boxee/i.test((b.navigator||{}).userAgent),g=a[0]||{},f=g.documentMode,h,l=/^(Moz|webkit|O|ms)(?=[A-Z])/,k=g.body&&g.body.style,m=!1,n=!1;if(k){for(var p in k)if(m=l.exec(p)){h=m[0];h=h.substr(0,1).toUpperCase()+h.substr(1);break}h||(h="WebkitOpacity"in k&&"webkit");m=!!("transition"in k||h+"Transition"in k);n=!!("animation"in k||h+"Animation"in k);
!d||m&&n||(m=D(g.body.style.webkitTransition),n=D(g.body.style.webkitAnimation))}return{history:!(!b.history||!b.history.pushState||4>d||e),hashchange:"onhashchange"in b&&(!f||7<f),hasEvent:function(a){if("input"==a&&9==E)return!1;if(H(c[a])){var b=g.createElement("div");c[a]="on"+a in b}return c[a]},csp:Sb(),vendorPrefix:h,transitions:m,animations:n,msie:E,msieDocumentMode:f}}]}function Fd(){this.$get=["$rootScope","$browser","$q","$exceptionHandler",function(b,a,c,d){function e(e,h,l){var k=c.defer(),
m=k.promise,n=z(l)&&!l;h=a.defer(function(){try{k.resolve(e())}catch(a){k.reject(a),d(a)}finally{delete g[m.$$timeoutId]}n||b.$apply()},h);m.$$timeoutId=h;g[h]=k;return m}var g={};e.cancel=function(b){return b&&b.$$timeoutId in g?(g[b.$$timeoutId].reject("canceled"),delete g[b.$$timeoutId],a.defer.cancel(b.$$timeoutId)):!1};return e}]}function ya(b,a){var c=b;E&&(T.setAttribute("href",c),c=T.href);T.setAttribute("href",c);return{href:T.href,protocol:T.protocol?T.protocol.replace(/:$/,""):"",host:T.host,
search:T.search?T.search.replace(/^\?/,""):"",hash:T.hash?T.hash.replace(/^#/,""):"",hostname:T.hostname,port:T.port,pathname:"/"===T.pathname.charAt(0)?T.pathname:"/"+T.pathname}}function Fb(b){b=D(b)?ya(b):b;return b.protocol===yc.protocol&&b.host===yc.host}function Gd(){this.$get=ca(W)}function zc(b){function a(d,e){if(U(d)){var g={};q(d,function(b,c){g[c]=a(c,b)});return g}return b.factory(d+c,e)}var c="Filter";this.register=a;this.$get=["$injector",function(a){return function(b){return a.get(b+
c)}}];a("currency",Ac);a("date",Bc);a("filter",Hd);a("json",Id);a("limitTo",Jd);a("lowercase",Kd);a("number",Cc);a("orderBy",Dc);a("uppercase",Ld)}function Hd(){return function(b,a,c){if(!L(b))return b;var d=typeof c,e=[];e.check=function(a){for(var b=0;b<e.length;b++)if(!e[b](a))return!1;return!0};"function"!==d&&(c="boolean"===d&&c?function(a,b){return Pa.equals(a,b)}:function(a,b){b=(""+b).toLowerCase();return-1<(""+a).toLowerCase().indexOf(b)});var g=function(a,b){if("string"==typeof b&&"!"===
b.charAt(0))return!g(a,b.substr(1));switch(typeof a){case "boolean":case "number":case "string":return c(a,b);case "object":switch(typeof b){case "object":return c(a,b);default:for(var d in a)if("$"!==d.charAt(0)&&g(a[d],b))return!0}return!1;case "array":for(d=0;d<a.length;d++)if(g(a[d],b))return!0;return!1;default:return!1}};switch(typeof a){case "boolean":case "number":case "string":a={$:a};case "object":for(var f in a)"$"==f?function(){if(a[f]){var b=f;e.push(function(c){return g(c,a[b])})}}():
function(){if("undefined"!=typeof a[f]){var b=f;e.push(function(c){return g(ub(c,b),a[b])})}}();break;case "function":e.push(a);break;default:return b}for(var d=[],h=0;h<b.length;h++){var l=b[h];e.check(l)&&d.push(l)}return d}}function Ac(b){var a=b.NUMBER_FORMATS;return function(b,d){H(d)&&(d=a.CURRENCY_SYM);return Ec(b,a.PATTERNS[1],a.GROUP_SEP,a.DECIMAL_SEP,2).replace(/\u00A4/g,d)}}function Cc(b){var a=b.NUMBER_FORMATS;return function(b,d){return Ec(b,a.PATTERNS[0],a.GROUP_SEP,a.DECIMAL_SEP,d)}}
function Ec(b,a,c,d,e){if(isNaN(b)||!isFinite(b))return"";var g=0>b;b=Math.abs(b);var f=b+"",h="",l=[],k=!1;if(-1!==f.indexOf("e")){var m=f.match(/([\d\.]+)e(-?)(\d+)/);m&&"-"==m[2]&&m[3]>e+1?f="0":(h=f,k=!0)}if(k)0<e&&(-1<b&&1>b)&&(h=b.toFixed(e));else{f=(f.split(Fc)[1]||"").length;H(e)&&(e=Math.min(Math.max(a.minFrac,f),a.maxFrac));f=Math.pow(10,e);b=Math.round(b*f)/f;b=(""+b).split(Fc);f=b[0];b=b[1]||"";var m=0,n=a.lgSize,p=a.gSize;if(f.length>=n+p)for(m=f.length-n,k=0;k<m;k++)0===(m-k)%p&&0!==
k&&(h+=c),h+=f.charAt(k);for(k=m;k<f.length;k++)0===(f.length-k)%n&&0!==k&&(h+=c),h+=f.charAt(k);for(;b.length<e;)b+="0";e&&"0"!==e&&(h+=d+b.substr(0,e))}l.push(g?a.negPre:a.posPre);l.push(h);l.push(g?a.negSuf:a.posSuf);return l.join("")}function Lb(b,a,c){var d="";0>b&&(d="-",b=-b);for(b=""+b;b.length<a;)b="0"+b;c&&(b=b.substr(b.length-a));return d+b}function V(b,a,c,d){c=c||0;return function(e){e=e["get"+b]();if(0<c||e>-c)e+=c;0===e&&-12==c&&(e=12);return Lb(e,a,d)}}function jb(b,a){return function(c,
d){var e=c["get"+b](),g=Ia(a?"SHORT"+b:b);return d[g][e]}}function Bc(b){function a(a){var b;if(b=a.match(c)){a=new Date(0);var g=0,f=0,h=b[8]?a.setUTCFullYear:a.setFullYear,l=b[8]?a.setUTCHours:a.setHours;b[9]&&(g=R(b[9]+b[10]),f=R(b[9]+b[11]));h.call(a,R(b[1]),R(b[2])-1,R(b[3]));g=R(b[4]||0)-g;f=R(b[5]||0)-f;h=R(b[6]||0);b=Math.round(1E3*parseFloat("0."+(b[7]||0)));l.call(a,g,f,h,b)}return a}var c=/^(\d{4})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/;
return function(c,e){var g="",f=[],h,l;e=e||"mediumDate";e=b.DATETIME_FORMATS[e]||e;D(c)&&(c=Md.test(c)?R(c):a(c));qb(c)&&(c=new Date(c));if(!La(c))return c;for(;e;)(l=Nd.exec(e))?(f=f.concat(ua.call(l,1)),e=f.pop()):(f.push(e),e=null);q(f,function(a){h=Od[a];g+=h?h(c,b.DATETIME_FORMATS):a.replace(/(^'|'$)/g,"").replace(/''/g,"'")});return g}}function Id(){return function(b){return oa(b,!0)}}function Jd(){return function(b,a){if(!L(b)&&!D(b))return b;a=R(a);if(D(b))return a?0<=a?b.slice(0,a):b.slice(a,
b.length):"";var c=[],d,e;a>b.length?a=b.length:a<-b.length&&(a=-b.length);0<a?(d=0,e=a):(d=b.length+a,e=b.length);for(;d<e;d++)c.push(b[d]);return c}}function Dc(b){return function(a,c,d){function e(a,b){return Oa(b)?function(b,c){return a(c,b)}:a}if(!L(a)||!c)return a;c=L(c)?c:[c];c=Pc(c,function(a){var c=!1,d=a||Ba;if(D(a)){if("+"==a.charAt(0)||"-"==a.charAt(0))c="-"==a.charAt(0),a=a.substring(1);d=b(a)}return e(function(a,b){var c;c=d(a);var e=d(b),f=typeof c,g=typeof e;f==g?("string"==f&&(c=
c.toLowerCase(),e=e.toLowerCase()),c=c===e?0:c<e?-1:1):c=f<g?-1:1;return c},c)});for(var g=[],f=0;f<a.length;f++)g.push(a[f]);return g.sort(e(function(a,b){for(var d=0;d<c.length;d++){var e=c[d](a,b);if(0!==e)return e}return 0},d))}}function sa(b){A(b)&&(b={link:b});b.restrict=b.restrict||"AC";return ca(b)}function Gc(b,a){function c(a,c){c=c?"-"+cb(c,"-"):"";b.removeClass((a?kb:lb)+c).addClass((a?lb:kb)+c)}var d=this,e=b.parent().controller("form")||mb,g=0,f=d.$error={},h=[];d.$name=a.name||a.ngForm;
d.$dirty=!1;d.$pristine=!0;d.$valid=!0;d.$invalid=!1;e.$addControl(d);b.addClass(Ja);c(!0);d.$addControl=function(a){wa(a.$name,"input");h.push(a);a.$name&&(d[a.$name]=a)};d.$removeControl=function(a){a.$name&&d[a.$name]===a&&delete d[a.$name];q(f,function(b,c){d.$setValidity(c,!0,a)});Ma(h,a)};d.$setValidity=function(a,b,h){var n=f[a];if(b)n&&(Ma(n,h),n.length||(g--,g||(c(b),d.$valid=!0,d.$invalid=!1),f[a]=!1,c(!0,a),e.$setValidity(a,!0,d)));else{g||c(b);if(n){if(-1!=bb(n,h))return}else f[a]=n=[],
g++,c(!1,a),e.$setValidity(a,!1,d);n.push(h);d.$valid=!1;d.$invalid=!0}};d.$setDirty=function(){b.removeClass(Ja).addClass(nb);d.$dirty=!0;d.$pristine=!1;e.$setDirty()};d.$setPristine=function(){b.removeClass(nb).addClass(Ja);d.$dirty=!1;d.$pristine=!0;q(h,function(a){a.$setPristine()})}}function ob(b,a,c,d,e,g){var f=!1;a.on("compositionstart",function(){f=!0});a.on("compositionend",function(){f=!1});var h=function(){if(!f){var e=a.val();Oa(c.ngTrim||"T")&&(e=aa(e));d.$viewValue!==e&&b.$apply(function(){d.$setViewValue(e)})}};
if(e.hasEvent("input"))a.on("input",h);else{var l,k=function(){l||(l=g.defer(function(){h();l=null}))};a.on("keydown",function(a){a=a.keyCode;91===a||(15<a&&19>a||37<=a&&40>=a)||k()});if(e.hasEvent("paste"))a.on("paste cut",k)}a.on("change",h);d.$render=function(){a.val(d.$isEmpty(d.$viewValue)?"":d.$viewValue)};var m=c.ngPattern,n=function(a,b){if(d.$isEmpty(b)||a.test(b))return d.$setValidity("pattern",!0),b;d.$setValidity("pattern",!1);return r};m&&((e=m.match(/^\/(.*)\/([gim]*)$/))?(m=RegExp(e[1],
e[2]),e=function(a){return n(m,a)}):e=function(c){var d=b.$eval(m);if(!d||!d.test)throw G("ngPattern")("noregexp",m,d,ha(a));return n(d,c)},d.$formatters.push(e),d.$parsers.push(e));if(c.ngMinlength){var p=R(c.ngMinlength);e=function(a){if(!d.$isEmpty(a)&&a.length<p)return d.$setValidity("minlength",!1),r;d.$setValidity("minlength",!0);return a};d.$parsers.push(e);d.$formatters.push(e)}if(c.ngMaxlength){var t=R(c.ngMaxlength);e=function(a){if(!d.$isEmpty(a)&&a.length>t)return d.$setValidity("maxlength",
!1),r;d.$setValidity("maxlength",!0);return a};d.$parsers.push(e);d.$formatters.push(e)}}function Mb(b,a){b="ngClass"+b;return function(){return{restrict:"AC",link:function(c,d,e){function g(b){if(!0===a||c.$index%2===a){var d=f(b||"");h?ta(b,h)||e.$updateClass(d,f(h)):e.$addClass(d)}h=ga(b)}function f(a){if(L(a))return a.join(" ");if(U(a)){var b=[];q(a,function(a,c){a&&b.push(c)});return b.join(" ")}return a}var h;c.$watch(e[b],g,!0);e.$observe("class",function(a){g(c.$eval(e[b]))});"ngClass"!==
b&&c.$watch("$index",function(d,g){var h=d&1;if(h!==g&1){var n=f(c.$eval(e[b]));h===a?e.$addClass(n):e.$removeClass(n)}})}}}}var v=function(b){return D(b)?b.toLowerCase():b},Ia=function(b){return D(b)?b.toUpperCase():b},E,x,Ca,ua=[].slice,Pd=[].push,$a=Object.prototype.toString,Na=G("ng"),Pa=W.angular||(W.angular={}),Va,Ga,ja=["0","0","0"];E=R((/msie (\d+)/.exec(v(navigator.userAgent))||[])[1]);isNaN(E)&&(E=R((/trident\/.*; rv:(\d+)/.exec(v(navigator.userAgent))||[])[1]));s.$inject=[];Ba.$inject=
[];var aa=function(){return String.prototype.trim?function(b){return D(b)?b.trim():b}:function(b){return D(b)?b.replace(/^\s\s*/,"").replace(/\s\s*$/,""):b}}();Ga=9>E?function(b){b=b.nodeName?b:b[0];return b.scopeName&&"HTML"!=b.scopeName?Ia(b.scopeName+":"+b.nodeName):b.nodeName}:function(b){return b.nodeName?b.nodeName:b[0].nodeName};var Tc=/[A-Z]/g,Qd={full:"1.2.5",major:1,minor:2,dot:5,codeName:"singularity-expansion"},Sa=I.cache={},db=I.expando="ng-"+(new Date).getTime(),Xc=1,Hc=W.document.addEventListener?
function(b,a,c){b.addEventListener(a,c,!1)}:function(b,a,c){b.attachEvent("on"+a,c)},Ab=W.document.removeEventListener?function(b,a,c){b.removeEventListener(a,c,!1)}:function(b,a,c){b.detachEvent("on"+a,c)},Vc=/([\:\-\_]+(.))/g,Wc=/^moz([A-Z])/,xb=G("jqLite"),Fa=I.prototype={ready:function(b){function a(){c||(c=!0,b())}var c=!1;"complete"===N.readyState?setTimeout(a):(this.on("DOMContentLoaded",a),I(W).on("load",a))},toString:function(){var b=[];q(this,function(a){b.push(""+a)});return"["+b.join(", ")+
"]"},eq:function(b){return 0<=b?x(this[b]):x(this[this.length+b])},length:0,push:Pd,sort:[].sort,splice:[].splice},fb={};q("multiple selected checked disabled readOnly required open".split(" "),function(b){fb[v(b)]=b});var ec={};q("input select option textarea button form details".split(" "),function(b){ec[Ia(b)]=!0});q({data:ac,inheritedData:eb,scope:function(b){return x(b).data("$scope")||eb(b.parentNode||b,["$isolateScope","$scope"])},isolateScope:function(b){return x(b).data("$isolateScope")||
x(b).data("$isolateScopeNoTemplate")},controller:bc,injector:function(b){return eb(b,"$injector")},removeAttr:function(b,a){b.removeAttribute(a)},hasClass:Bb,css:function(b,a,c){a=Ra(a);if(z(c))b.style[a]=c;else{var d;8>=E&&(d=b.currentStyle&&b.currentStyle[a],""===d&&(d="auto"));d=d||b.style[a];8>=E&&(d=""===d?r:d);return d}},attr:function(b,a,c){var d=v(a);if(fb[d])if(z(c))c?(b[a]=!0,b.setAttribute(a,d)):(b[a]=!1,b.removeAttribute(d));else return b[a]||(b.attributes.getNamedItem(a)||s).specified?
d:r;else if(z(c))b.setAttribute(a,c);else if(b.getAttribute)return b=b.getAttribute(a,2),null===b?r:b},prop:function(b,a,c){if(z(c))b[a]=c;else return b[a]},text:function(){function b(b,d){var e=a[b.nodeType];if(H(d))return e?b[e]:"";b[e]=d}var a=[];9>E?(a[1]="innerText",a[3]="nodeValue"):a[1]=a[3]="textContent";b.$dv="";return b}(),val:function(b,a){if(H(a)){if("SELECT"===Ga(b)&&b.multiple){var c=[];q(b.options,function(a){a.selected&&c.push(a.value||a.text)});return 0===c.length?null:c}return b.value}b.value=
a},html:function(b,a){if(H(a))return b.innerHTML;for(var c=0,d=b.childNodes;c<d.length;c++)Da(d[c]);b.innerHTML=a},empty:cc},function(b,a){I.prototype[a]=function(a,d){var e,g;if(b!==cc&&(2==b.length&&b!==Bb&&b!==bc?a:d)===r){if(U(a)){for(e=0;e<this.length;e++)if(b===ac)b(this[e],a);else for(g in a)b(this[e],g,a[g]);return this}e=b.$dv;g=e===r?Math.min(this.length,1):this.length;for(var f=0;f<g;f++){var h=b(this[f],a,d);e=e?e+h:h}return e}for(e=0;e<this.length;e++)b(this[e],a,d);return this}});q({removeData:Zb,
dealoc:Da,on:function a(c,d,e,g){if(z(g))throw xb("onargs");var f=ka(c,"events"),h=ka(c,"handle");f||ka(c,"events",f={});h||ka(c,"handle",h=Yc(c,f));q(d.split(" "),function(d){var g=f[d];if(!g){if("mouseenter"==d||"mouseleave"==d){var m=N.body.contains||N.body.compareDocumentPosition?function(a,c){var d=9===a.nodeType?a.documentElement:a,e=c&&c.parentNode;return a===e||!!(e&&1===e.nodeType&&(d.contains?d.contains(e):a.compareDocumentPosition&&a.compareDocumentPosition(e)&16))}:function(a,c){if(c)for(;c=
c.parentNode;)if(c===a)return!0;return!1};f[d]=[];a(c,{mouseleave:"mouseout",mouseenter:"mouseover"}[d],function(a){var c=a.relatedTarget;c&&(c===this||m(this,c))||h(a,d)})}else Hc(c,d,h),f[d]=[];g=f[d]}g.push(e)})},off:$b,replaceWith:function(a,c){var d,e=a.parentNode;Da(a);q(new I(c),function(c){d?e.insertBefore(c,d.nextSibling):e.replaceChild(c,a);d=c})},children:function(a){var c=[];q(a.childNodes,function(a){1===a.nodeType&&c.push(a)});return c},contents:function(a){return a.childNodes||[]},
append:function(a,c){q(new I(c),function(c){1!==a.nodeType&&11!==a.nodeType||a.appendChild(c)})},prepend:function(a,c){if(1===a.nodeType){var d=a.firstChild;q(new I(c),function(c){a.insertBefore(c,d)})}},wrap:function(a,c){c=x(c)[0];var d=a.parentNode;d&&d.replaceChild(c,a);c.appendChild(a)},remove:function(a){Da(a);var c=a.parentNode;c&&c.removeChild(a)},after:function(a,c){var d=a,e=a.parentNode;q(new I(c),function(a){e.insertBefore(a,d.nextSibling);d=a})},addClass:Db,removeClass:Cb,toggleClass:function(a,
c,d){H(d)&&(d=!Bb(a,c));(d?Db:Cb)(a,c)},parent:function(a){return(a=a.parentNode)&&11!==a.nodeType?a:null},next:function(a){if(a.nextElementSibling)return a.nextElementSibling;for(a=a.nextSibling;null!=a&&1!==a.nodeType;)a=a.nextSibling;return a},find:function(a,c){return a.getElementsByTagName?a.getElementsByTagName(c):[]},clone:zb,triggerHandler:function(a,c,d){c=(ka(a,"events")||{})[c];d=d||[];var e=[{preventDefault:s,stopPropagation:s}];q(c,function(c){c.apply(a,e.concat(d))})}},function(a,c){I.prototype[c]=
function(c,e,g){for(var f,h=0;h<this.length;h++)H(f)?(f=a(this[h],c,e,g),z(f)&&(f=x(f))):yb(f,a(this[h],c,e,g));return z(f)?f:this};I.prototype.bind=I.prototype.on;I.prototype.unbind=I.prototype.off});Ta.prototype={put:function(a,c){this[Ea(a)]=c},get:function(a){return this[Ea(a)]},remove:function(a){var c=this[a=Ea(a)];delete this[a];return c}};var $c=/^function\s*[^\(]*\(\s*([^\)]*)\)/m,ad=/,/,bd=/^\s*(_?)(\S+?)\1\s*$/,Zc=/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg,Ua=G("$injector"),Rd=G("$animate"),Sd=
["$provide",function(a){this.$$selectors={};this.register=function(c,d){var e=c+"-animation";if(c&&"."!=c.charAt(0))throw Rd("notcsel",c);this.$$selectors[c.substr(1)]=e;a.factory(e,d)};this.$get=["$timeout",function(a){return{enter:function(d,e,g,f){g?g.after(d):(e&&e[0]||(e=g.parent()),e.append(d));f&&a(f,0,!1)},leave:function(d,e){d.remove();e&&a(e,0,!1)},move:function(a,c,g,f){this.enter(a,c,g,f)},addClass:function(d,e,g){e=D(e)?e:L(e)?e.join(" "):"";q(d,function(a){Db(a,e)});g&&a(g,0,!1)},removeClass:function(d,
e,g){e=D(e)?e:L(e)?e.join(" "):"";q(d,function(a){Cb(a,e)});g&&a(g,0,!1)},enabled:s}}]}],ia=G("$compile");hc.$inject=["$provide","$$sanitizeUriProvider"];var id=/^(x[\:\-_]|data[\:\-_])/i,pd=W.XMLHttpRequest||function(){try{return new ActiveXObject("Msxml2.XMLHTTP.6.0")}catch(a){}try{return new ActiveXObject("Msxml2.XMLHTTP.3.0")}catch(c){}try{return new ActiveXObject("Msxml2.XMLHTTP")}catch(d){}throw G("$httpBackend")("noxhr");},nc=G("$interpolate"),Td=/^([^\?#]*)(\?([^#]*))?(#(.*))?$/,td={http:80,
https:443,ftp:21},Hb=G("$location");sc.prototype=Ib.prototype=rc.prototype={$$html5:!1,$$replace:!1,absUrl:hb("$$absUrl"),url:function(a,c){if(H(a))return this.$$url;var d=Td.exec(a);d[1]&&this.path(decodeURIComponent(d[1]));(d[2]||d[1])&&this.search(d[3]||"");this.hash(d[5]||"",c);return this},protocol:hb("$$protocol"),host:hb("$$host"),port:hb("$$port"),path:tc("$$path",function(a){return"/"==a.charAt(0)?a:"/"+a}),search:function(a,c){switch(arguments.length){case 0:return this.$$search;case 1:if(D(a))this.$$search=
Vb(a);else if(U(a))this.$$search=a;else throw Hb("isrcharg");break;default:H(c)||null===c?delete this.$$search[a]:this.$$search[a]=c}this.$$compose();return this},hash:tc("$$hash",Ba),replace:function(){this.$$replace=!0;return this}};var za=G("$parse"),wc={},qa,Ka={"null":function(){return null},"true":function(){return!0},"false":function(){return!1},undefined:s,"+":function(a,c,d,e){d=d(a,c);e=e(a,c);return z(d)?z(e)?d+e:d:z(e)?e:r},"-":function(a,c,d,e){d=d(a,c);e=e(a,c);return(z(d)?d:0)-(z(e)?
e:0)},"*":function(a,c,d,e){return d(a,c)*e(a,c)},"/":function(a,c,d,e){return d(a,c)/e(a,c)},"%":function(a,c,d,e){return d(a,c)%e(a,c)},"^":function(a,c,d,e){return d(a,c)^e(a,c)},"=":s,"===":function(a,c,d,e){return d(a,c)===e(a,c)},"!==":function(a,c,d,e){return d(a,c)!==e(a,c)},"==":function(a,c,d,e){return d(a,c)==e(a,c)},"!=":function(a,c,d,e){return d(a,c)!=e(a,c)},"<":function(a,c,d,e){return d(a,c)<e(a,c)},">":function(a,c,d,e){return d(a,c)>e(a,c)},"<=":function(a,c,d,e){return d(a,c)<=
e(a,c)},">=":function(a,c,d,e){return d(a,c)>=e(a,c)},"&&":function(a,c,d,e){return d(a,c)&&e(a,c)},"||":function(a,c,d,e){return d(a,c)||e(a,c)},"&":function(a,c,d,e){return d(a,c)&e(a,c)},"|":function(a,c,d,e){return e(a,c)(a,c,d(a,c))},"!":function(a,c,d){return!d(a,c)}},Ud={n:"\n",f:"\f",r:"\r",t:"\t",v:"\v","'":"'",'"':'"'},Kb=function(a){this.options=a};Kb.prototype={constructor:Kb,lex:function(a){this.text=a;this.index=0;this.ch=r;this.lastCh=":";this.tokens=[];var c;for(a=[];this.index<this.text.length;){this.ch=
this.text.charAt(this.index);if(this.is("\"'"))this.readString(this.ch);else if(this.isNumber(this.ch)||this.is(".")&&this.isNumber(this.peek()))this.readNumber();else if(this.isIdent(this.ch))this.readIdent(),this.was("{,")&&("{"===a[0]&&(c=this.tokens[this.tokens.length-1]))&&(c.json=-1===c.text.indexOf("."));else if(this.is("(){}[].,;:?"))this.tokens.push({index:this.index,text:this.ch,json:this.was(":[,")&&this.is("{[")||this.is("}]:,")}),this.is("{[")&&a.unshift(this.ch),this.is("}]")&&a.shift(),
this.index++;else if(this.isWhitespace(this.ch)){this.index++;continue}else{var d=this.ch+this.peek(),e=d+this.peek(2),g=Ka[this.ch],f=Ka[d],h=Ka[e];h?(this.tokens.push({index:this.index,text:e,fn:h}),this.index+=3):f?(this.tokens.push({index:this.index,text:d,fn:f}),this.index+=2):g?(this.tokens.push({index:this.index,text:this.ch,fn:g,json:this.was("[,:")&&this.is("+-")}),this.index+=1):this.throwError("Unexpected next character ",this.index,this.index+1)}this.lastCh=this.ch}return this.tokens},
is:function(a){return-1!==a.indexOf(this.ch)},was:function(a){return-1!==a.indexOf(this.lastCh)},peek:function(a){a=a||1;return this.index+a<this.text.length?this.text.charAt(this.index+a):!1},isNumber:function(a){return"0"<=a&&"9">=a},isWhitespace:function(a){return" "===a||"\r"===a||"\t"===a||"\n"===a||"\v"===a||"\u00a0"===a},isIdent:function(a){return"a"<=a&&"z">=a||"A"<=a&&"Z">=a||"_"===a||"$"===a},isExpOperator:function(a){return"-"===a||"+"===a||this.isNumber(a)},throwError:function(a,c,d){d=
d||this.index;c=z(c)?"s "+c+"-"+this.index+" ["+this.text.substring(c,d)+"]":" "+d;throw za("lexerr",a,c,this.text);},readNumber:function(){for(var a="",c=this.index;this.index<this.text.length;){var d=v(this.text.charAt(this.index));if("."==d||this.isNumber(d))a+=d;else{var e=this.peek();if("e"==d&&this.isExpOperator(e))a+=d;else if(this.isExpOperator(d)&&e&&this.isNumber(e)&&"e"==a.charAt(a.length-1))a+=d;else if(!this.isExpOperator(d)||e&&this.isNumber(e)||"e"!=a.charAt(a.length-1))break;else this.throwError("Invalid exponent")}this.index++}a*=
1;this.tokens.push({index:c,text:a,json:!0,fn:function(){return a}})},readIdent:function(){for(var a=this,c="",d=this.index,e,g,f,h;this.index<this.text.length;){h=this.text.charAt(this.index);if("."===h||this.isIdent(h)||this.isNumber(h))"."===h&&(e=this.index),c+=h;else break;this.index++}if(e)for(g=this.index;g<this.text.length;){h=this.text.charAt(g);if("("===h){f=c.substr(e-d+1);c=c.substr(0,e-d);this.index=g;break}if(this.isWhitespace(h))g++;else break}d={index:d,text:c};if(Ka.hasOwnProperty(c))d.fn=
Ka[c],d.json=Ka[c];else{var l=vc(c,this.options,this.text);d.fn=w(function(a,c){return l(a,c)},{assign:function(d,e){return ib(d,c,e,a.text,a.options)}})}this.tokens.push(d);f&&(this.tokens.push({index:e,text:".",json:!1}),this.tokens.push({index:e+1,text:f,json:!1}))},readString:function(a){var c=this.index;this.index++;for(var d="",e=a,g=!1;this.index<this.text.length;){var f=this.text.charAt(this.index),e=e+f;if(g)"u"===f?(f=this.text.substring(this.index+1,this.index+5),f.match(/[\da-f]{4}/i)||
this.throwError("Invalid unicode escape [\\u"+f+"]"),this.index+=4,d+=String.fromCharCode(parseInt(f,16))):d=(g=Ud[f])?d+g:d+f,g=!1;else if("\\"===f)g=!0;else{if(f===a){this.index++;this.tokens.push({index:c,text:e,string:d,json:!0,fn:function(){return d}});return}d+=f}this.index++}this.throwError("Unterminated quote",c)}};var Ya=function(a,c,d){this.lexer=a;this.$filter=c;this.options=d};Ya.ZERO=function(){return 0};Ya.prototype={constructor:Ya,parse:function(a,c){this.text=a;this.json=c;this.tokens=
this.lexer.lex(a);c&&(this.assignment=this.logicalOR,this.functionCall=this.fieldAccess=this.objectIndex=this.filterChain=function(){this.throwError("is not valid json",{text:a,index:0})});var d=c?this.primary():this.statements();0!==this.tokens.length&&this.throwError("is an unexpected token",this.tokens[0]);d.literal=!!d.literal;d.constant=!!d.constant;return d},primary:function(){var a;if(this.expect("("))a=this.filterChain(),this.consume(")");else if(this.expect("["))a=this.arrayDeclaration();
else if(this.expect("{"))a=this.object();else{var c=this.expect();(a=c.fn)||this.throwError("not a primary expression",c);c.json&&(a.constant=!0,a.literal=!0)}for(var d;c=this.expect("(","[",".");)"("===c.text?(a=this.functionCall(a,d),d=null):"["===c.text?(d=a,a=this.objectIndex(a)):"."===c.text?(d=a,a=this.fieldAccess(a)):this.throwError("IMPOSSIBLE");return a},throwError:function(a,c){throw za("syntax",c.text,a,c.index+1,this.text,this.text.substring(c.index));},peekToken:function(){if(0===this.tokens.length)throw za("ueoe",
this.text);return this.tokens[0]},peek:function(a,c,d,e){if(0<this.tokens.length){var g=this.tokens[0],f=g.text;if(f===a||f===c||f===d||f===e||!(a||c||d||e))return g}return!1},expect:function(a,c,d,e){return(a=this.peek(a,c,d,e))?(this.json&&!a.json&&this.throwError("is not valid json",a),this.tokens.shift(),a):!1},consume:function(a){this.expect(a)||this.throwError("is unexpected, expecting ["+a+"]",this.peek())},unaryFn:function(a,c){return w(function(d,e){return a(d,e,c)},{constant:c.constant})},
ternaryFn:function(a,c,d){return w(function(e,g){return a(e,g)?c(e,g):d(e,g)},{constant:a.constant&&c.constant&&d.constant})},binaryFn:function(a,c,d){return w(function(e,g){return c(e,g,a,d)},{constant:a.constant&&d.constant})},statements:function(){for(var a=[];;)if(0<this.tokens.length&&!this.peek("}",")",";","]")&&a.push(this.filterChain()),!this.expect(";"))return 1===a.length?a[0]:function(c,d){for(var e,g=0;g<a.length;g++){var f=a[g];f&&(e=f(c,d))}return e}},filterChain:function(){for(var a=
this.expression(),c;;)if(c=this.expect("|"))a=this.binaryFn(a,c.fn,this.filter());else return a},filter:function(){for(var a=this.expect(),c=this.$filter(a.text),d=[];;)if(a=this.expect(":"))d.push(this.expression());else{var e=function(a,e,h){h=[h];for(var l=0;l<d.length;l++)h.push(d[l](a,e));return c.apply(a,h)};return function(){return e}}},expression:function(){return this.assignment()},assignment:function(){var a=this.ternary(),c,d;return(d=this.expect("="))?(a.assign||this.throwError("implies assignment but ["+
this.text.substring(0,d.index)+"] can not be assigned to",d),c=this.ternary(),function(d,g){return a.assign(d,c(d,g),g)}):a},ternary:function(){var a=this.logicalOR(),c,d;if(this.expect("?")){c=this.ternary();if(d=this.expect(":"))return this.ternaryFn(a,c,this.ternary());this.throwError("expected :",d)}else return a},logicalOR:function(){for(var a=this.logicalAND(),c;;)if(c=this.expect("||"))a=this.binaryFn(a,c.fn,this.logicalAND());else return a},logicalAND:function(){var a=this.equality(),c;if(c=
this.expect("&&"))a=this.binaryFn(a,c.fn,this.logicalAND());return a},equality:function(){var a=this.relational(),c;if(c=this.expect("==","!=","===","!=="))a=this.binaryFn(a,c.fn,this.equality());return a},relational:function(){var a=this.additive(),c;if(c=this.expect("<",">","<=",">="))a=this.binaryFn(a,c.fn,this.relational());return a},additive:function(){for(var a=this.multiplicative(),c;c=this.expect("+","-");)a=this.binaryFn(a,c.fn,this.multiplicative());return a},multiplicative:function(){for(var a=
this.unary(),c;c=this.expect("*","/","%");)a=this.binaryFn(a,c.fn,this.unary());return a},unary:function(){var a;return this.expect("+")?this.primary():(a=this.expect("-"))?this.binaryFn(Ya.ZERO,a.fn,this.unary()):(a=this.expect("!"))?this.unaryFn(a.fn,this.unary()):this.primary()},fieldAccess:function(a){var c=this,d=this.expect().text,e=vc(d,this.options,this.text);return w(function(c,d,h){return e(h||a(c,d),d)},{assign:function(e,f,h){return ib(a(e,h),d,f,c.text,c.options)}})},objectIndex:function(a){var c=
this,d=this.expression();this.consume("]");return w(function(e,g){var f=a(e,g),h=d(e,g),l;if(!f)return r;(f=Xa(f[h],c.text))&&(f.then&&c.options.unwrapPromises)&&(l=f,"$$v"in f||(l.$$v=r,l.then(function(a){l.$$v=a})),f=f.$$v);return f},{assign:function(e,g,f){var h=d(e,f);return Xa(a(e,f),c.text)[h]=g}})},functionCall:function(a,c){var d=[];if(")"!==this.peekToken().text){do d.push(this.expression());while(this.expect(","))}this.consume(")");var e=this;return function(g,f){for(var h=[],l=c?c(g,f):
g,k=0;k<d.length;k++)h.push(d[k](g,f));k=a(g,f,l)||s;Xa(l,e.text);Xa(k,e.text);h=k.apply?k.apply(l,h):k(h[0],h[1],h[2],h[3],h[4]);return Xa(h,e.text)}},arrayDeclaration:function(){var a=[],c=!0;if("]"!==this.peekToken().text){do{var d=this.expression();a.push(d);d.constant||(c=!1)}while(this.expect(","))}this.consume("]");return w(function(c,d){for(var f=[],h=0;h<a.length;h++)f.push(a[h](c,d));return f},{literal:!0,constant:c})},object:function(){var a=[],c=!0;if("}"!==this.peekToken().text){do{var d=
this.expect(),d=d.string||d.text;this.consume(":");var e=this.expression();a.push({key:d,value:e});e.constant||(c=!1)}while(this.expect(","))}this.consume("}");return w(function(c,d){for(var e={},l=0;l<a.length;l++){var k=a[l];e[k.key]=k.value(c,d)}return e},{literal:!0,constant:c})}};var Jb={},ra=G("$sce"),fa={HTML:"html",CSS:"css",URL:"url",RESOURCE_URL:"resourceUrl",JS:"js"},T=N.createElement("a"),yc=ya(W.location.href,!0);zc.$inject=["$provide"];Ac.$inject=["$locale"];Cc.$inject=["$locale"];var Fc=
".",Od={yyyy:V("FullYear",4),yy:V("FullYear",2,0,!0),y:V("FullYear",1),MMMM:jb("Month"),MMM:jb("Month",!0),MM:V("Month",2,1),M:V("Month",1,1),dd:V("Date",2),d:V("Date",1),HH:V("Hours",2),H:V("Hours",1),hh:V("Hours",2,-12),h:V("Hours",1,-12),mm:V("Minutes",2),m:V("Minutes",1),ss:V("Seconds",2),s:V("Seconds",1),sss:V("Milliseconds",3),EEEE:jb("Day"),EEE:jb("Day",!0),a:function(a,c){return 12>a.getHours()?c.AMPMS[0]:c.AMPMS[1]},Z:function(a){a=-1*a.getTimezoneOffset();return a=(0<=a?"+":"")+(Lb(Math[0<
a?"floor":"ceil"](a/60),2)+Lb(Math.abs(a%60),2))}},Nd=/((?:[^yMdHhmsaZE']+)|(?:'(?:[^']|'')*')|(?:E+|y+|M+|d+|H+|h+|m+|s+|a|Z))(.*)/,Md=/^\-?\d+$/;Bc.$inject=["$locale"];var Kd=ca(v),Ld=ca(Ia);Dc.$inject=["$parse"];var Vd=ca({restrict:"E",compile:function(a,c){8>=E&&(c.href||c.name||c.$set("href",""),a.append(N.createComment("IE fix")));if(!c.href&&!c.name)return function(a,c){c.on("click",function(a){c.attr("href")||a.preventDefault()})}}}),Nb={};q(fb,function(a,c){if("multiple"!=a){var d=ma("ng-"+
c);Nb[d]=function(){return{priority:100,compile:function(){return function(a,g,f){a.$watch(f[d],function(a){f.$set(c,!!a)})}}}}}});q(["src","srcset","href"],function(a){var c=ma("ng-"+a);Nb[c]=function(){return{priority:99,link:function(d,e,g){g.$observe(c,function(c){c&&(g.$set(a,c),E&&e.prop(a,g[a]))})}}}});var mb={$addControl:s,$removeControl:s,$setValidity:s,$setDirty:s,$setPristine:s};Gc.$inject=["$element","$attrs","$scope"];var Ic=function(a){return["$timeout",function(c){return{name:"form",
restrict:a?"EAC":"E",controller:Gc,compile:function(){return{pre:function(a,e,g,f){if(!g.action){var h=function(a){a.preventDefault?a.preventDefault():a.returnValue=!1};Hc(e[0],"submit",h);e.on("$destroy",function(){c(function(){Ab(e[0],"submit",h)},0,!1)})}var l=e.parent().controller("form"),k=g.name||g.ngForm;k&&ib(a,k,f,k);if(l)e.on("$destroy",function(){l.$removeControl(f);k&&ib(a,k,r,k);w(f,mb)})}}}}}]},Wd=Ic(),Xd=Ic(!0),Yd=/^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/,
Zd=/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/,$d=/^\s*(\-|\+)?(\d+|(\d*(\.\d*)))\s*$/,Jc={text:ob,number:function(a,c,d,e,g,f){ob(a,c,d,e,g,f);e.$parsers.push(function(a){var c=e.$isEmpty(a);if(c||$d.test(a))return e.$setValidity("number",!0),""===a?null:c?a:parseFloat(a);e.$setValidity("number",!1);return r});e.$formatters.push(function(a){return e.$isEmpty(a)?"":""+a});d.min&&(a=function(a){var c=parseFloat(d.min);if(!e.$isEmpty(a)&&a<c)return e.$setValidity("min",!1),r;e.$setValidity("min",
!0);return a},e.$parsers.push(a),e.$formatters.push(a));d.max&&(a=function(a){var c=parseFloat(d.max);if(!e.$isEmpty(a)&&a>c)return e.$setValidity("max",!1),r;e.$setValidity("max",!0);return a},e.$parsers.push(a),e.$formatters.push(a));e.$formatters.push(function(a){if(e.$isEmpty(a)||qb(a))return e.$setValidity("number",!0),a;e.$setValidity("number",!1);return r})},url:function(a,c,d,e,g,f){ob(a,c,d,e,g,f);a=function(a){if(e.$isEmpty(a)||Yd.test(a))return e.$setValidity("url",!0),a;e.$setValidity("url",
!1);return r};e.$formatters.push(a);e.$parsers.push(a)},email:function(a,c,d,e,g,f){ob(a,c,d,e,g,f);a=function(a){if(e.$isEmpty(a)||Zd.test(a))return e.$setValidity("email",!0),a;e.$setValidity("email",!1);return r};e.$formatters.push(a);e.$parsers.push(a)},radio:function(a,c,d,e){H(d.name)&&c.attr("name",Za());c.on("click",function(){c[0].checked&&a.$apply(function(){e.$setViewValue(d.value)})});e.$render=function(){c[0].checked=d.value==e.$viewValue};d.$observe("value",e.$render)},checkbox:function(a,
c,d,e){var g=d.ngTrueValue,f=d.ngFalseValue;D(g)||(g=!0);D(f)||(f=!1);c.on("click",function(){a.$apply(function(){e.$setViewValue(c[0].checked)})});e.$render=function(){c[0].checked=e.$viewValue};e.$isEmpty=function(a){return a!==g};e.$formatters.push(function(a){return a===g});e.$parsers.push(function(a){return a?g:f})},hidden:s,button:s,submit:s,reset:s},Kc=["$browser","$sniffer",function(a,c){return{restrict:"E",require:"?ngModel",link:function(d,e,g,f){f&&(Jc[v(g.type)]||Jc.text)(d,e,g,f,c,a)}}}],
lb="ng-valid",kb="ng-invalid",Ja="ng-pristine",nb="ng-dirty",ae=["$scope","$exceptionHandler","$attrs","$element","$parse",function(a,c,d,e,g){function f(a,c){c=c?"-"+cb(c,"-"):"";e.removeClass((a?kb:lb)+c).addClass((a?lb:kb)+c)}this.$modelValue=this.$viewValue=Number.NaN;this.$parsers=[];this.$formatters=[];this.$viewChangeListeners=[];this.$pristine=!0;this.$dirty=!1;this.$valid=!0;this.$invalid=!1;this.$name=d.name;var h=g(d.ngModel),l=h.assign;if(!l)throw G("ngModel")("nonassign",d.ngModel,ha(e));
this.$render=s;this.$isEmpty=function(a){return H(a)||""===a||null===a||a!==a};var k=e.inheritedData("$formController")||mb,m=0,n=this.$error={};e.addClass(Ja);f(!0);this.$setValidity=function(a,c){n[a]!==!c&&(c?(n[a]&&m--,m||(f(!0),this.$valid=!0,this.$invalid=!1)):(f(!1),this.$invalid=!0,this.$valid=!1,m++),n[a]=!c,f(c,a),k.$setValidity(a,c,this))};this.$setPristine=function(){this.$dirty=!1;this.$pristine=!0;e.removeClass(nb).addClass(Ja)};this.$setViewValue=function(d){this.$viewValue=d;this.$pristine&&
(this.$dirty=!0,this.$pristine=!1,e.removeClass(Ja).addClass(nb),k.$setDirty());q(this.$parsers,function(a){d=a(d)});this.$modelValue!==d&&(this.$modelValue=d,l(a,d),q(this.$viewChangeListeners,function(a){try{a()}catch(d){c(d)}}))};var p=this;a.$watch(function(){var c=h(a);if(p.$modelValue!==c){var d=p.$formatters,e=d.length;for(p.$modelValue=c;e--;)c=d[e](c);p.$viewValue!==c&&(p.$viewValue=c,p.$render())}return c})}],be=function(){return{require:["ngModel","^?form"],controller:ae,link:function(a,
c,d,e){var g=e[0],f=e[1]||mb;f.$addControl(g);a.$on("$destroy",function(){f.$removeControl(g)})}}},ce=ca({require:"ngModel",link:function(a,c,d,e){e.$viewChangeListeners.push(function(){a.$eval(d.ngChange)})}}),Lc=function(){return{require:"?ngModel",link:function(a,c,d,e){if(e){d.required=!0;var g=function(a){if(d.required&&e.$isEmpty(a))e.$setValidity("required",!1);else return e.$setValidity("required",!0),a};e.$formatters.push(g);e.$parsers.unshift(g);d.$observe("required",function(){g(e.$viewValue)})}}}},
de=function(){return{require:"ngModel",link:function(a,c,d,e){var g=(a=/\/(.*)\//.exec(d.ngList))&&RegExp(a[1])||d.ngList||",";e.$parsers.push(function(a){if(!H(a)){var c=[];a&&q(a.split(g),function(a){a&&c.push(aa(a))});return c}});e.$formatters.push(function(a){return L(a)?a.join(", "):r});e.$isEmpty=function(a){return!a||!a.length}}}},ee=/^(true|false|\d+)$/,fe=function(){return{priority:100,compile:function(a,c){return ee.test(c.ngValue)?function(a,c,g){g.$set("value",a.$eval(g.ngValue))}:function(a,
c,g){a.$watch(g.ngValue,function(a){g.$set("value",a)})}}}},ge=sa(function(a,c,d){c.addClass("ng-binding").data("$binding",d.ngBind);a.$watch(d.ngBind,function(a){c.text(a==r?"":a)})}),he=["$interpolate",function(a){return function(c,d,e){c=a(d.attr(e.$attr.ngBindTemplate));d.addClass("ng-binding").data("$binding",c);e.$observe("ngBindTemplate",function(a){d.text(a)})}}],ie=["$sce","$parse",function(a,c){return function(d,e,g){e.addClass("ng-binding").data("$binding",g.ngBindHtml);var f=c(g.ngBindHtml);
d.$watch(function(){return(f(d)||"").toString()},function(c){e.html(a.getTrustedHtml(f(d))||"")})}}],je=Mb("",!0),ke=Mb("Odd",0),le=Mb("Even",1),me=sa({compile:function(a,c){c.$set("ngCloak",r);a.removeClass("ng-cloak")}}),ne=[function(){return{scope:!0,controller:"@",priority:500}}],Mc={};q("click dblclick mousedown mouseup mouseover mouseout mousemove mouseenter mouseleave keydown keyup keypress submit focus blur copy cut paste".split(" "),function(a){var c=ma("ng-"+a);Mc[c]=["$parse",function(d){return{compile:function(e,
g){var f=d(g[c]);return function(c,d,e){d.on(v(a),function(a){c.$apply(function(){f(c,{$event:a})})})}}}}]});var oe=["$animate",function(a){return{transclude:"element",priority:600,terminal:!0,restrict:"A",$$tlb:!0,link:function(c,d,e,g,f){var h,l;c.$watch(e.ngIf,function(g){Oa(g)?l||(l=c.$new(),f(l,function(c){c[c.length++]=N.createComment(" end ngIf: "+e.ngIf+" ");h={clone:c};a.enter(c,d.parent(),d)})):(l&&(l.$destroy(),l=null),h&&(a.leave(vb(h.clone)),h=null))})}}}],pe=["$http","$templateCache",
"$anchorScroll","$animate","$sce",function(a,c,d,e,g){return{restrict:"ECA",priority:400,terminal:!0,transclude:"element",controller:Pa.noop,compile:function(f,h){var l=h.ngInclude||h.src,k=h.onload||"",m=h.autoscroll;return function(f,h,q,r,B){var s=0,u,v,x=function(){u&&(u.$destroy(),u=null);v&&(e.leave(v),v=null)};f.$watch(g.parseAsResourceUrl(l),function(g){var l=function(){!z(m)||m&&!f.$eval(m)||d()},q=++s;g?(a.get(g,{cache:c}).success(function(a){if(q===s){var c=f.$new();r.template=a;a=B(c,
function(a){x();e.enter(a,null,h,l)});u=c;v=a;u.$emit("$includeContentLoaded");f.$eval(k)}}).error(function(){q===s&&x()}),f.$emit("$includeContentRequested")):(x(),r.template=null)})}}}}],qe=["$compile",function(a){return{restrict:"ECA",priority:-400,require:"ngInclude",link:function(c,d,e,g){d.html(g.template);a(d.contents())(c)}}}],re=sa({priority:450,compile:function(){return{pre:function(a,c,d){a.$eval(d.ngInit)}}}}),se=sa({terminal:!0,priority:1E3}),te=["$locale","$interpolate",function(a,c){var d=
/{}/g;return{restrict:"EA",link:function(e,g,f){var h=f.count,l=f.$attr.when&&g.attr(f.$attr.when),k=f.offset||0,m=e.$eval(l)||{},n={},p=c.startSymbol(),t=c.endSymbol(),r=/^when(Minus)?(.+)$/;q(f,function(a,c){r.test(c)&&(m[v(c.replace("when","").replace("Minus","-"))]=g.attr(f.$attr[c]))});q(m,function(a,e){n[e]=c(a.replace(d,p+h+"-"+k+t))});e.$watch(function(){var c=parseFloat(e.$eval(h));if(isNaN(c))return"";c in m||(c=a.pluralCat(c-k));return n[c](e,g,!0)},function(a){g.text(a)})}}}],ue=["$parse",
"$animate",function(a,c){var d=G("ngRepeat");return{transclude:"element",priority:1E3,terminal:!0,$$tlb:!0,link:function(e,g,f,h,l){var k=f.ngRepeat,m=k.match(/^\s*(.+)\s+in\s+(.*?)\s*(\s+track\s+by\s+(.+)\s*)?$/),n,p,t,r,s,v,u={$id:Ea};if(!m)throw d("iexp",k);f=m[1];h=m[2];(m=m[4])?(n=a(m),p=function(a,c,d){v&&(u[v]=a);u[s]=c;u.$index=d;return n(e,u)}):(t=function(a,c){return Ea(c)},r=function(a){return a});m=f.match(/^(?:([\$\w]+)|\(([\$\w]+)\s*,\s*([\$\w]+)\))$/);if(!m)throw d("iidexp",f);s=m[3]||
m[1];v=m[2];var z={};e.$watchCollection(h,function(a){var f,h,m=g[0],n,u={},H,O,M,S,D,w,G=[];if(pb(a))D=a,n=p||t;else{n=p||r;D=[];for(M in a)a.hasOwnProperty(M)&&"$"!=M.charAt(0)&&D.push(M);D.sort()}H=D.length;h=G.length=D.length;for(f=0;f<h;f++)if(M=a===D?f:D[f],S=a[M],S=n(M,S,f),wa(S,"`track by` id"),z.hasOwnProperty(S))w=z[S],delete z[S],u[S]=w,G[f]=w;else{if(u.hasOwnProperty(S))throw q(G,function(a){a&&a.scope&&(z[a.id]=a)}),d("dupes",k,S);G[f]={id:S};u[S]=!1}for(M in z)z.hasOwnProperty(M)&&(w=
z[M],f=vb(w.clone),c.leave(f),q(f,function(a){a.$$NG_REMOVED=!0}),w.scope.$destroy());f=0;for(h=D.length;f<h;f++){M=a===D?f:D[f];S=a[M];w=G[f];G[f-1]&&(m=G[f-1].clone[G[f-1].clone.length-1]);if(w.scope){O=w.scope;n=m;do n=n.nextSibling;while(n&&n.$$NG_REMOVED);w.clone[0]!=n&&c.move(vb(w.clone),null,x(m));m=w.clone[w.clone.length-1]}else O=e.$new();O[s]=S;v&&(O[v]=M);O.$index=f;O.$first=0===f;O.$last=f===H-1;O.$middle=!(O.$first||O.$last);O.$odd=!(O.$even=0===(f&1));w.scope||l(O,function(a){a[a.length++]=
N.createComment(" end ngRepeat: "+k+" ");c.enter(a,null,x(m));m=a;w.scope=O;w.clone=a;u[w.id]=w})}z=u})}}}],ve=["$animate",function(a){return function(c,d,e){c.$watch(e.ngShow,function(c){a[Oa(c)?"removeClass":"addClass"](d,"ng-hide")})}}],we=["$animate",function(a){return function(c,d,e){c.$watch(e.ngHide,function(c){a[Oa(c)?"addClass":"removeClass"](d,"ng-hide")})}}],xe=sa(function(a,c,d){a.$watch(d.ngStyle,function(a,d){d&&a!==d&&q(d,function(a,d){c.css(d,"")});a&&c.css(a)},!0)}),ye=["$animate",
function(a){return{restrict:"EA",require:"ngSwitch",controller:["$scope",function(){this.cases={}}],link:function(c,d,e,g){var f,h,l=[];c.$watch(e.ngSwitch||e.on,function(d){for(var m=0,n=l.length;m<n;m++)l[m].$destroy(),a.leave(h[m]);h=[];l=[];if(f=g.cases["!"+d]||g.cases["?"])c.$eval(e.change),q(f,function(d){var e=c.$new();l.push(e);d.transclude(e,function(c){var e=d.element;h.push(c);a.enter(c,e.parent(),e)})})})}}}],ze=sa({transclude:"element",priority:800,require:"^ngSwitch",compile:function(a,
c){return function(a,e,g,f,h){f.cases["!"+c.ngSwitchWhen]=f.cases["!"+c.ngSwitchWhen]||[];f.cases["!"+c.ngSwitchWhen].push({transclude:h,element:e})}}}),Ae=sa({transclude:"element",priority:800,require:"^ngSwitch",link:function(a,c,d,e,g){e.cases["?"]=e.cases["?"]||[];e.cases["?"].push({transclude:g,element:c})}}),Be=sa({controller:["$element","$transclude",function(a,c){if(!c)throw G("ngTransclude")("orphan",ha(a));this.$transclude=c}],link:function(a,c,d,e){e.$transclude(function(a){c.empty();c.append(a)})}}),
Ce=["$templateCache",function(a){return{restrict:"E",terminal:!0,compile:function(c,d){"text/ng-template"==d.type&&a.put(d.id,c[0].text)}}}],De=G("ngOptions"),Ee=ca({terminal:!0}),Fe=["$compile","$parse",function(a,c){var d=/^\s*(.*?)(?:\s+as\s+(.*?))?(?:\s+group\s+by\s+(.*))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+(.*?)(?:\s+track\s+by\s+(.*?))?$/,e={$setViewValue:s};return{restrict:"E",require:["select","?ngModel"],controller:["$element","$scope",
"$attrs",function(a,c,d){var l=this,k={},m=e,n;l.databound=d.ngModel;l.init=function(a,c,d){m=a;n=d};l.addOption=function(c){wa(c,'"option value"');k[c]=!0;m.$viewValue==c&&(a.val(c),n.parent()&&n.remove())};l.removeOption=function(a){this.hasOption(a)&&(delete k[a],m.$viewValue==a&&this.renderUnknownOption(a))};l.renderUnknownOption=function(c){c="? "+Ea(c)+" ?";n.val(c);a.prepend(n);a.val(c);n.prop("selected",!0)};l.hasOption=function(a){return k.hasOwnProperty(a)};c.$on("$destroy",function(){l.renderUnknownOption=
s})}],link:function(e,f,h,l){function k(a,c,d,e){d.$render=function(){var a=d.$viewValue;e.hasOption(a)?(y.parent()&&y.remove(),c.val(a),""===a&&u.prop("selected",!0)):H(a)&&u?c.val(""):e.renderUnknownOption(a)};c.on("change",function(){a.$apply(function(){y.parent()&&y.remove();d.$setViewValue(c.val())})})}function m(a,c,d){var e;d.$render=function(){var a=new Ta(d.$viewValue);q(c.find("option"),function(c){c.selected=z(a.get(c.value))})};a.$watch(function(){ta(e,d.$viewValue)||(e=ga(d.$viewValue),
d.$render())});c.on("change",function(){a.$apply(function(){var a=[];q(c.find("option"),function(c){c.selected&&a.push(c.value)});d.$setViewValue(a)})})}function n(e,f,g){function h(){var a={"":[]},c=[""],d,k,r,s,x;s=g.$modelValue;x=t(e)||[];var B=n?Ob(x):x,H,A,J;A={};r=!1;var E,I;if(v)if(u&&L(s))for(r=new Ta([]),J=0;J<s.length;J++)A[m]=s[J],r.put(u(e,A),s[J]);else r=new Ta(s);for(J=0;H=B.length,J<H;J++){k=J;if(n){k=B[J];if("$"===k.charAt(0))continue;A[n]=k}A[m]=x[k];d=p(e,A)||"";(k=a[d])||(k=a[d]=
[],c.push(d));v?d=z(r.remove(u?u(e,A):q(e,A))):(u?(d={},d[m]=s,d=u(e,d)===u(e,A)):d=s===q(e,A),r=r||d);E=l(e,A);E=z(E)?E:"";k.push({id:u?u(e,A):n?B[J]:J,label:E,selected:d})}v||(w||null===s?a[""].unshift({id:"",label:"",selected:!r}):r||a[""].unshift({id:"?",label:"",selected:!0}));A=0;for(B=c.length;A<B;A++){d=c[A];k=a[d];y.length<=A?(s={element:G.clone().attr("label",d),label:k.label},x=[s],y.push(x),f.append(s.element)):(x=y[A],s=x[0],s.label!=d&&s.element.attr("label",s.label=d));E=null;J=0;for(H=
k.length;J<H;J++)r=k[J],(d=x[J+1])?(E=d.element,d.label!==r.label&&E.text(d.label=r.label),d.id!==r.id&&E.val(d.id=r.id),E[0].selected!==r.selected&&E.prop("selected",d.selected=r.selected)):(""===r.id&&w?I=w:(I=D.clone()).val(r.id).attr("selected",r.selected).text(r.label),x.push({element:I,label:r.label,id:r.id,selected:r.selected}),E?E.after(I):s.element.append(I),E=I);for(J++;x.length>J;)x.pop().element.remove()}for(;y.length>A;)y.pop()[0].element.remove()}var k;if(!(k=s.match(d)))throw De("iexp",
s,ha(f));var l=c(k[2]||k[1]),m=k[4]||k[6],n=k[5],p=c(k[3]||""),q=c(k[2]?k[1]:m),t=c(k[7]),u=k[8]?c(k[8]):null,y=[[{element:f,label:""}]];w&&(a(w)(e),w.removeClass("ng-scope"),w.remove());f.empty();f.on("change",function(){e.$apply(function(){var a,c=t(e)||[],d={},h,k,l,p,s,x,w;if(v)for(k=[],p=0,x=y.length;p<x;p++)for(a=y[p],l=1,s=a.length;l<s;l++){if((h=a[l].element)[0].selected){h=h.val();n&&(d[n]=h);if(u)for(w=0;w<c.length&&(d[m]=c[w],u(e,d)!=h);w++);else d[m]=c[h];k.push(q(e,d))}}else if(h=f.val(),
"?"==h)k=r;else if(""===h)k=null;else if(u)for(w=0;w<c.length;w++){if(d[m]=c[w],u(e,d)==h){k=q(e,d);break}}else d[m]=c[h],n&&(d[n]=h),k=q(e,d);g.$setViewValue(k)})});g.$render=h;e.$watch(h)}if(l[1]){var p=l[0],t=l[1],v=h.multiple,s=h.ngOptions,w=!1,u,D=x(N.createElement("option")),G=x(N.createElement("optgroup")),y=D.clone();l=0;for(var A=f.children(),I=A.length;l<I;l++)if(""===A[l].value){u=w=A.eq(l);break}p.init(t,w,y);if(v&&(h.required||h.ngRequired)){var E=function(a){t.$setValidity("required",
!h.required||a&&a.length);return a};t.$parsers.push(E);t.$formatters.unshift(E);h.$observe("required",function(){E(t.$viewValue)})}s?n(e,f,t):v?m(e,f,t):k(e,f,t,p)}}}}],Ge=["$interpolate",function(a){var c={addOption:s,removeOption:s};return{restrict:"E",priority:100,compile:function(d,e){if(H(e.value)){var g=a(d.text(),!0);g||e.$set("value",d.text())}return function(a,d,e){var k=d.parent(),m=k.data("$selectController")||k.parent().data("$selectController");m&&m.databound?d.prop("selected",!1):m=
c;g?a.$watch(g,function(a,c){e.$set("value",a);a!==c&&m.removeOption(c);m.addOption(a)}):m.addOption(e.value);d.on("$destroy",function(){m.removeOption(e.value)})}}}}],He=ca({restrict:"E",terminal:!0});(Ca=W.jQuery)?(x=Ca,w(Ca.fn,{scope:Fa.scope,isolateScope:Fa.isolateScope,controller:Fa.controller,injector:Fa.injector,inheritedData:Fa.inheritedData}),wb("remove",!0,!0,!1),wb("empty",!1,!1,!1),wb("html",!1,!1,!0)):x=I;Pa.element=x;(function(a){w(a,{bootstrap:Xb,copy:ga,extend:w,equals:ta,element:x,
forEach:q,injector:Yb,noop:s,bind:rb,toJson:oa,fromJson:Tb,identity:Ba,isUndefined:H,isDefined:z,isString:D,isFunction:A,isObject:U,isNumber:qb,isElement:Oc,isArray:L,version:Qd,isDate:La,lowercase:v,uppercase:Ia,callbacks:{counter:0},$$minErr:G,$$csp:Sb});Va=Uc(W);try{Va("ngLocale")}catch(c){Va("ngLocale",[]).provider("$locale",sd)}Va("ng",["ngLocale"],["$provide",function(a){a.provider({$$sanitizeUri:Ad});a.provider("$compile",hc).directive({a:Vd,input:Kc,textarea:Kc,form:Wd,script:Ce,select:Fe,
style:He,option:Ge,ngBind:ge,ngBindHtml:ie,ngBindTemplate:he,ngClass:je,ngClassEven:le,ngClassOdd:ke,ngCloak:me,ngController:ne,ngForm:Xd,ngHide:we,ngIf:oe,ngInclude:pe,ngInit:re,ngNonBindable:se,ngPluralize:te,ngRepeat:ue,ngShow:ve,ngStyle:xe,ngSwitch:ye,ngSwitchWhen:ze,ngSwitchDefault:Ae,ngOptions:Ee,ngTransclude:Be,ngModel:be,ngList:de,ngChange:ce,required:Lc,ngRequired:Lc,ngValue:fe}).directive({ngInclude:qe}).directive(Nb).directive(Mc);a.provider({$anchorScroll:cd,$animate:Sd,$browser:ed,$cacheFactory:fd,
$controller:jd,$document:kd,$exceptionHandler:ld,$filter:zc,$interpolate:qd,$interval:rd,$http:md,$httpBackend:nd,$location:ud,$log:vd,$parse:wd,$rootScope:zd,$q:xd,$sce:Dd,$sceDelegate:Cd,$sniffer:Ed,$templateCache:gd,$timeout:Fd,$window:Gd})}])})(Pa);x(N).ready(function(){Sc(N,Xb)})})(window,document);!angular.$$csp()&&angular.element(document).find("head").prepend('<style type="text/css">@charset "UTF-8";[ng\\:cloak],[ng-cloak],[data-ng-cloak],[x-ng-cloak],.ng-cloak,.x-ng-cloak,.ng-hide{display:none !important;}ng\\:form{display:block;}.ng-animate-start{border-spacing:1px 1px;-ms-zoom:1.0001;}.ng-animate-active{border-spacing:0px 0px;-ms-zoom:1;}</style>');
//# sourceMappingURL=angular.min.js.map

/*
 AngularJS v1.2.5
 (c) 2010-2014 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(h,e,A){'use strict';function u(w,q,k){return{restrict:"ECA",terminal:!0,priority:400,transclude:"element",link:function(a,c,b,f,n){function y(){l&&(l.$destroy(),l=null);g&&(k.leave(g),g=null)}function v(){var b=w.current&&w.current.locals;if(b&&b.$template){var b=a.$new(),f=w.current;g=n(b,function(d){k.enter(d,null,g||c,function(){!e.isDefined(t)||t&&!a.$eval(t)||q()});y()});l=f.scope=b;l.$emit("$viewContentLoaded");l.$eval(h)}else y()}var l,g,t=b.autoscroll,h=b.onload||"";a.$on("$routeChangeSuccess",
v);v()}}}function z(e,h,k){return{restrict:"ECA",priority:-400,link:function(a,c){var b=k.current,f=b.locals;c.html(f.$template);var n=e(c.contents());b.controller&&(f.$scope=a,f=h(b.controller,f),b.controllerAs&&(a[b.controllerAs]=f),c.data("$ngControllerController",f),c.children().data("$ngControllerController",f));n(a)}}}h=e.module("ngRoute",["ng"]).provider("$route",function(){function h(a,c){return e.extend(new (e.extend(function(){},{prototype:a})),c)}function q(a,e){var b=e.caseInsensitiveMatch,
f={originalPath:a,regexp:a},h=f.keys=[];a=a.replace(/([().])/g,"\\$1").replace(/(\/)?:(\w+)([\?|\*])?/g,function(a,e,b,c){a="?"===c?c:null;c="*"===c?c:null;h.push({name:b,optional:!!a});e=e||"";return""+(a?"":e)+"(?:"+(a?e:"")+(c&&"(.+?)"||"([^/]+)")+(a||"")+")"+(a||"")}).replace(/([\/$\*])/g,"\\$1");f.regexp=RegExp("^"+a+"$",b?"i":"");return f}var k={};this.when=function(a,c){k[a]=e.extend({reloadOnSearch:!0},c,a&&q(a,c));if(a){var b="/"==a[a.length-1]?a.substr(0,a.length-1):a+"/";k[b]=e.extend({redirectTo:a},
q(b,c))}return this};this.otherwise=function(a){this.when(null,a);return this};this.$get=["$rootScope","$location","$routeParams","$q","$injector","$http","$templateCache","$sce",function(a,c,b,f,n,q,v,l){function g(){var d=t(),m=r.current;if(d&&m&&d.$$route===m.$$route&&e.equals(d.pathParams,m.pathParams)&&!d.reloadOnSearch&&!x)m.params=d.params,e.copy(m.params,b),a.$broadcast("$routeUpdate",m);else if(d||m)x=!1,a.$broadcast("$routeChangeStart",d,m),(r.current=d)&&d.redirectTo&&(e.isString(d.redirectTo)?
c.path(u(d.redirectTo,d.params)).search(d.params).replace():c.url(d.redirectTo(d.pathParams,c.path(),c.search())).replace()),f.when(d).then(function(){if(d){var a=e.extend({},d.resolve),c,b;e.forEach(a,function(d,c){a[c]=e.isString(d)?n.get(d):n.invoke(d)});e.isDefined(c=d.template)?e.isFunction(c)&&(c=c(d.params)):e.isDefined(b=d.templateUrl)&&(e.isFunction(b)&&(b=b(d.params)),b=l.getTrustedResourceUrl(b),e.isDefined(b)&&(d.loadedTemplateUrl=b,c=q.get(b,{cache:v}).then(function(a){return a.data})));
e.isDefined(c)&&(a.$template=c);return f.all(a)}}).then(function(c){d==r.current&&(d&&(d.locals=c,e.copy(d.params,b)),a.$broadcast("$routeChangeSuccess",d,m))},function(c){d==r.current&&a.$broadcast("$routeChangeError",d,m,c)})}function t(){var a,b;e.forEach(k,function(f,k){var p;if(p=!b){var s=c.path();p=f.keys;var l={};if(f.regexp)if(s=f.regexp.exec(s)){for(var g=1,q=s.length;g<q;++g){var n=p[g-1],r="string"==typeof s[g]?decodeURIComponent(s[g]):s[g];n&&r&&(l[n.name]=r)}p=l}else p=null;else p=null;
p=a=p}p&&(b=h(f,{params:e.extend({},c.search(),a),pathParams:a}),b.$$route=f)});return b||k[null]&&h(k[null],{params:{},pathParams:{}})}function u(a,c){var b=[];e.forEach((a||"").split(":"),function(a,d){if(0===d)b.push(a);else{var e=a.match(/(\w+)(.*)/),f=e[1];b.push(c[f]);b.push(e[2]||"");delete c[f]}});return b.join("")}var x=!1,r={routes:k,reload:function(){x=!0;a.$evalAsync(g)}};a.$on("$locationChangeSuccess",g);return r}]});h.provider("$routeParams",function(){this.$get=function(){return{}}});
h.directive("ngView",u);h.directive("ngView",z);u.$inject=["$route","$anchorScroll","$animate"];z.$inject=["$compile","$controller","$route"]})(window,window.angular);
//# sourceMappingURL=angular-route.min.js.map
var controllers = {
	entityListController: function($scope, $location, filterFilter, sharedService) {
		$scope.sharedData = sharedService.sharedObject;
		
		//add vars to local scope for editing
		$scope.predicate = $scope.sharedData.defaultPredicate;
		$scope.entities  = $scope.sharedData.entities;
		$scope.selection = $scope.sharedData.selection.group; 
		
		
		//add "selected" node to each entity data object
		if($scope.entities.length && !$scope.selection.length && !$scope.entities[0].selected){
			angular.forEach($scope.entities, function addSelectedNode(value, key){
				value.selected = false;
			});
		}
		
		//get the currently entites which should be selected
		$scope.selectedEntities = function selectedEntities(){
			return filterFilter( $scope.entities, { selected: true } );
		};
		
		//watch the state of the "selected" node on each data object and modify the selection array
		$scope.$watch( 'entities|filter:{selected:true}', function( nv ){
			$scope.selection = nv.map( function( entity ){
				return entity.id;
			});
		}, true);
		
		//validates and sets the current selection in the shared service var
		$scope.setSelection = function(){
			if(!$scope.selection.length || $scope.selection.length < sharedService.sharedObject.selection.min ){
				alert("Select at least two deals to compare.");
			} else if($scope.selection.length > sharedService.sharedObject.selection.max ){
				alert("You can select a maximum of "+ sharedService.sharedObject.selection.max);
			} else {
				sharedService.sharedObject.selection.group = $scope.selection;
				$location.path( sharedService.sharedObject.comparison.dflt );
			}
		}
	},
	
	
	entityController: function($scope) {
		//Simple entity View - Possible removal
		$scope.sharedData = sharedService.sharedObject;
		$scope.entities  = $scope.sharedData.entities;
	},
	
	
	//TODO - Abstract this so that it can be used for all basic comparisons
	compareGlossaryController: function($scope, $location, sharedService) {
		$scope.sharedData = sharedService.sharedObject;
		
		if(!$scope.sharedData.selection.group.length){
			$location.path( "/list" );
		}
		
		//move selected entity objects into local array for faster iteration
		$scope.selectedEntities = [];
		angular.forEach($scope.sharedData.entities, function(entValue, entKey){
			angular.forEach($scope.sharedData.selection.group, function(selValue, selKey){
				if(selValue === entValue.id){
					$scope.selectedEntities.push(entValue);
				}
			});
		});
		
		//iterate through selected entities and map to page glossary
		$scope.displayData = [];
		angular.forEach($scope.sharedData.dataMap.glossary, function(mapValue, mapKey){
			var row = { name: $scope.sharedData.dataMap.glossary[mapKey], cols: [] }
			angular.forEach($scope.selectedEntities, function(entValue, entKey){
				row.cols.push(entValue.glossary[mapKey]);
			});
			$scope.displayData.push(row);
		});
	},
	
	
	compareReplacementsController: function($scope, $location, sharedService) {
		$scope.sharedData = sharedService.sharedObject;
		
		if(!$scope.sharedData.selection.group.length){
			$location.path( "/list" );
		}
		
		//move selected entity objects into local array for faster iteration
		$scope.selectedEntities = [];
		angular.forEach($scope.sharedData.entities, function(entValue, entKey){
			angular.forEach($scope.sharedData.selection.group, function(selValue, selKey){
				if(selValue === entValue.id){
					$scope.selectedEntities.push(entValue);
				}
			});
		});
		
		//iterate through selected entities and map to page glossary
		$scope.displayData = [];
		angular.forEach($scope.sharedData.dataMap.replacements, function(mapValue, mapKey){
			var row = { name: $scope.sharedData.dataMap.replacements[mapKey], cols: [] }
			angular.forEach($scope.selectedEntities, function(entValue, entKey){
				row.cols.push(entValue.replacements[mapKey]);
			});
			$scope.displayData.push(row);
		});
	},
	
	
	
	compareBasicController: function($scope, $location, sharedService) {
		$scope.sharedData = sharedService.sharedObject;
		
		if(!$scope.sharedData.selection.group.length){
			$location.path( "/list" );
		}
		
		//move selected entity objects into local array for faster iteration
		$scope.selectedEntities = [];
		angular.forEach($scope.sharedData.entities, function(entValue, entKey){
			angular.forEach($scope.sharedData.selection.group, function(selValue, selKey){
				if(selValue === entValue.id){
					$scope.selectedEntities.push(entValue);
				}
			});
		});
		
		$scope.displayData = [];
		
		angular.forEach($scope.selectedEntities, function(entValue, entKey) {
			
		});
		/*iterate through selected entities and map to page glossary
		$scope.displayData = [];
		angular.forEach($scope.sharedData.dataMap.priority, function(mapValue, mapKey){
			var row = { name: $scope.sharedData.dataMap.priority[mapKey], cols: [] }
			angular.forEach($scope.selectedEntities, function(entValue, entKey){
				row.cols.push(entValue.priority[mapKey]);
			});
			$scope.displayData.push(row);
		});*/
	},
	
	
	compareChartController: function($scope, $location, sharedService) {
		$scope.sharedData = sharedService.sharedObject;
		
		if(!$scope.sharedData.selection.group.length){
			$location.path( "/list" );
		}
		
		//move selected entity objects into local array for faster iteration
		$scope.selectedEntities = [];
		angular.forEach($scope.sharedData.entities, function(entValue, entKey){
			angular.forEach($scope.sharedData.selection.group, function(selValue, selKey){
				if(selValue === entValue.id){
					$scope.selectedEntities.push(entValue);
				}
			});
		});
		
		//iterate through selected entities and map to page glossary
		$scope.displayData = [];
		angular.forEach($scope.sharedData.dataMap.chart.names, function(mapValue, mapKey){
			var row = { name: $scope.sharedData.dataMap.chart.names[mapKey], cols: [] }
			angular.forEach($scope.selectedEntities, function(entValue, entKey){
				row.cols.push(entValue.chart[mapKey]);
			});
			$scope.displayData.push(row);
		});
		
		//calculate data if necessary
		$scope.calcData = { titles: ["Average", "Min", "Max"] };
		
		angular.forEach($scope.sharedData.dataMap.chart.calcs, function(mapValue, mapKey){
			
			if(!mapValue){
				tempArray = [0, 0, 0];
			} else {
				var average = 0, min = 0, max = 0,
					temp = 0, tempArray = [], 
					colLength = $scope.displayData[mapKey].cols.length;
				
				//Calculate Average
				for (var i = 0; i < colLength; i++) {
					average += parseFloat($scope.displayData[mapKey].cols[i]) / colLength || 0;
				}
				tempArray.push(parseFloat(average).toFixed(2));
				
				//Calculage Min
				tempArray.push(parseFloat(average * .9123).toFixed(2) || 0);
				
				//Calculate Max
				tempArray.push(parseFloat(average * 1.175).toFixed(2) || 0);
			}
			angular.forEach(tempArray, function(value,key){
				$scope.displayData[mapKey].cols.push(value);
			});
		});
	}
}

var cloApp = angular.module( 'cloApp', ['ngRoute'] );

	cloApp.factory("sharedService", function(){
		return { sharedObject: { 
			selection:{
				group:[],
				min:2,
				max:5
			},
			entities: entityObj,
			dataMap: mapObj,
			defaultPredicate: "name",
			comparison:{
				current: "",
				dflt:"/compare_chart"
			}
		}}
	});

cloApp.config( function( $routeProvider ){
	$routeProvider
	.when('/list',
			{
				controller: 'entityListController',
				templateUrl: 'partials/entityListView.html'
			})
	.when('/entity',
			{
				controller: 'entityController',
				templateUrl: 'partials/entityView.html'
			})
	.when('/compare_glossary',
			{
				controller: 'compareGlossaryController',
				templateUrl: 'partials/compareView.html'
			})
	.when('/compare_priority',
			{
				controller: 'basicCompareController',
				templateUrl: 'partials/compareView.html'
			})
	.when('/compare_replacements',
			{
				controller: 'compareReplacementsController',
				templateUrl: 'partials/compareView.html'
			})
	.when('/compare_chart',
			{
				controller: 'compareChartController',
				templateUrl: 'partials/compareView.html'
			})
	.otherwise({redirectTo: '/list'});
});

cloApp.controller( controllers );