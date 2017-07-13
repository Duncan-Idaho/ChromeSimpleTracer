var Fmt = Fmt || {};

Fmt.utils = (function($$) {
	/*global toString:true*/

	// utils is a library of generic helper functions non-specific to axios

	var toString = Object.prototype.toString;

	/**
	 * Determine if a value is an Array
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is an Array, otherwise false
	 */
	function isArray(val) {
		return toString.call(val) === '[object Array]';
	}

	/**
	 * Determine if a value is an ArrayBuffer
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
	 */
	function isArrayBuffer(val) {
		return toString.call(val) === '[object ArrayBuffer]';
	}

	/**
	 * Determine if a value is a FormData
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is an FormData, otherwise false
	 */
	function isFormData(val) {
		return (typeof FormData !== 'undefined') && (val instanceof FormData);
	}

	/**
	 * Determine if a value is a view on an ArrayBuffer
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
	 */
	function isArrayBufferView(val) {
		var result;
		if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
			result = ArrayBuffer.isView(val);
		} else {
			result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
		}
		return result;
	}

	/**
	 * Determine if a value is a String
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a String, otherwise false
	 */
	function isString(val) {
		return typeof val === 'string';
	}

	/**
	 * Determine if a value is a Number
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Number, otherwise false
	 */
	function isNumber(val) {
		return typeof val === 'number';
	}

	/**
	 * Determine if a value is undefined
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if the value is undefined, otherwise false
	 */
	function isUndefined(val) {
		return typeof val === 'undefined';
	}

	/**
	 * Determine if a value is an Object
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is an Object, otherwise false
	 */
	function isObject(val) {
		return val !== null && typeof val === 'object';
	}

	/**
	 * Determine if a value is a Date
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Date, otherwise false
	 */
	function isDate(val) {
		return toString.call(val) === '[object Date]';
	}

	/**
	 * Determine if a value is a File
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a File, otherwise false
	 */
	function isFile(val) {
		return toString.call(val) === '[object File]';
	}

	/**
	 * Determine if a value is a Blob
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Blob, otherwise false
	 */
	function isBlob(val) {
		return toString.call(val) === '[object Blob]';
	}

	/**
	 * Determine if a value is a Function
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Function, otherwise false
	 */
	function isFunction(val) {
		return toString.call(val) === '[object Function]';
	}

	/**
	 * Determine if a value is a Stream
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Stream, otherwise false
	 */
	function isStream(val) {
		return isObject(val) && isFunction(val.pipe);
	}

	/**
	 * Determine if a value is a URLSearchParams object
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
	 */
	function isURLSearchParams(val) {
		return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
	}

	/**
	 * Trim excess whitespace off the beginning and end of a string
	 *
	 * @param {String} str The String to trim
	 * @returns {String} The String freed of excess whitespace
	 */
	function trim(str) {
		return str.replace(/^\s*/, '').replace(/\s*$/, '');
	}

	/**
	 * Determine if we're running in a standard browser environment
	 *
	 * This allows axios to run in a web worker, and react-native.
	 * Both environments support XMLHttpRequest, but not fully standard globals.
	 *
	 * web workers:
	 *  typeof window -> undefined
	 *  typeof document -> undefined
	 *
	 * react-native:
	 *  navigator.product -> 'ReactNative'
	 */
	function isStandardBrowserEnv() {
		if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
			return false;
		}
		return (
			typeof window !== 'undefined' &&
			typeof document !== 'undefined'
		);
	}

	/**
	 * Determines whether the specified URL is absolute
	 *
	 * @param {string} url The URL to test
	 * @returns {boolean} True if the specified URL is absolute, otherwise false
	 */
	function isAbsoluteURL(url) {
		// A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
		// RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
		// by any combination of letters, digits, plus, period, or hyphen.
		return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
	}

	/**
	 * Iterate over an Array or an Object invoking a function for each item.
	 *
	 * If `obj` is an Array callback will be called passing
	 * the value, index, and complete array for each item.
	 *
	 * If 'obj' is an Object callback will be called passing
	 * the value, key, and complete object for each property.
	 *
	 * @param {Object|Array} obj The object to iterate
	 * @param {Function} fn The callback to invoke for each item
	 */
	function forEach(obj, fn) {
		// Don't bother if no value provided
		if (obj === null || typeof obj === 'undefined') {
			return;
		}

		// Force an array if not already something iterable
		if (typeof obj !== 'object' && !isArray(obj)) {
			/*eslint no-param-reassign:0*/
			obj = [obj];
		}

		if (isArray(obj)) {
			// Iterate over array values
			for (var i = 0, l = obj.length; i < l; i++) {
				fn.call(null, obj[i], i, obj);
			}
		} else {
			// Iterate over object keys
			for (var key in obj) {
				if (Object.prototype.hasOwnProperty.call(obj, key)) {
					fn.call(null, obj[key], key, obj);
				}
			}
		}
	}

	/**
	 * Accepts varargs expecting each argument to be an object, then
	 * immutably merges the properties of each object and returns result.
	 *
	 * When multiple objects contain the same key the later object in
	 * the arguments list will take precedence.
	 *
	 * Example:
	 *
	 * ```js
	 * var result = merge({foo: 123}, {foo: 456});
	 * console.log(result.foo); // outputs 456
	 * ```
	 *
	 * @param {Object} obj1 Object to merge
	 * @returns {Object} Result of all merge properties
	 */
	function merge( /* obj1, obj2, obj3, ... */ ) {
		var result = {};

		function assignValue(val, key) {
			if (typeof result[key] === 'object' && typeof val === 'object') {
				result[key] = merge(result[key], val);
			} else {
				result[key] = val;
			}
		}

		for (var i = 0, l = arguments.length; i < l; i++) {
			forEach(arguments[i], assignValue);
		}
		return result;
	}

	/**
	 * Extends object a by mutably adding to it the properties of object b.
	 *
	 * @param {Object} a The object to be extended
	 * @param {Object} b The object to copy properties from
	 * @param {Object} thisArg The object to bind function to
	 * @return {Object} The resulting value of object a
	 */
	function extend(a, b, thisArg) {
		forEach(b, function assignValue(val, key) {
			if (thisArg && typeof val === 'function') {
				a[key] = bind(val, thisArg);
			} else {
				a[key] = val;
			}
		});
		return a;
	}

	return {
		isArray: isArray,
		isArrayBuffer: isArrayBuffer,
		isFormData: isFormData,
		isArrayBufferView: isArrayBufferView,
		isString: isString,
		isNumber: isNumber,
		isObject: isObject,
		isUndefined: isUndefined,
		isDate: isDate,
		isFile: isFile,
		isBlob: isBlob,
		isFunction: isFunction,
		isStream: isStream,
		isURLSearchParams: isURLSearchParams,
		isStandardBrowserEnv: isStandardBrowserEnv,
		isAbsoluteURL: isAbsoluteURL,
		forEach: forEach,
		merge: merge,
		extend: extend,
		trim: trim
	};

})(Fmt);

Fmt.http = (function($$) {

	function parseHeaders(headers) {
		var parsed = {};
		var key;
		var val;
		var i;

		if (!headers) {
			return parsed;
		}

		$$.utils.forEach(headers.split('\n'), function parser(line) {
			i = line.indexOf(':');
			key = $$.utils.trim(line.substr(0, i)).toLowerCase();
			val = $$.utils.trim(line.substr(i + 1));

			if (key) {
				parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
			}
		});

		return parsed;
	}

	function normalizeHeaderName(headers, normalizedName) {
		$$.utils.forEach(headers, function processHeader(value, name) {
			if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
				headers[normalizedName] = value;
				delete headers[name];
			}
		});
	}

	function encodeVal(val) {
		return encodeURIComponent(val).
		replace(/%40/gi, '@').
		replace(/%3A/gi, ':').
		replace(/%24/g, '$').
		replace(/%2C/gi, ',').
		replace(/%20/g, '+').
		replace(/%5B/gi, '[').
		replace(/%5D/gi, ']');
	}

	function buildURL(url, params, paramsSerializer) {
		/*eslint no-param-reassign:0*/
		if (!params) {
			return url;
		}

		var serializedParams;
		if (paramsSerializer) {
			serializedParams = paramsSerializer(params);
		} else if ($$.utils.isURLSearchParams(params)) {
			serializedParams = params.toString();
		} else {
			var parts = [];

			$$.utils.forEach(params, function serialize(val, key) {
				if (val === null || typeof val === 'undefined') {
					return;
				}

				if ($$.utils.isArray(val)) {
					key = key + '[]';
				}

				if (!$$.utils.isArray(val)) {
					val = [val];
				}

				$$.utils.forEach(val, function parseValue(v) {
					if (utils.isDate(v)) {
						v = v.toISOString();
					} else if (utils.isObject(v)) {
						v = JSON.stringify(v);
					}
					parts.push(encodeVal(key) + '=' + encodeVal(v));
				});
			});

			serializedParams = parts.join('&');
		}

		if (serializedParams) {
			url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
		}

		return url;
	}

	function combineURLs(baseURL, relativeURL) {
		return relativeURL ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '') : baseURL;
	}

	return {
		buildURL: buildURL,
		combineURLs: combineURLs,
		parseHeaders: parseHeaders,
		normalizeHeaderName: normalizeHeaderName
	}

})(Fmt);
