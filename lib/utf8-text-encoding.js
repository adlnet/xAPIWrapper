(function(root) {

    // NOTES:
    // Provides utf8 only implementation of TextEncoder and TextDecoder for IE10+
    // https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder
    // https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder

    // It is a modified version of https://gist.github.com/Yaffle/5458286 for IE10+ and Uint8Array compatibility
    // https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder#Methods
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array

    if (typeof root.TextEncoder === 'undefined') {

      // Normalise String.prototype.codePointAt for IE10+
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/codePointAt
      function StringToCodePointAt(string, position) {
        if (String.prototype.codePointAt) return string.codePointAt(position);
        string = String(string);
        var size = string.length;
        // `ToInteger`
        var index = position ? Number(position) : 0;
        if (index != index) { // better `isNaN`
          index = 0;
        }
        // Account for out-of-bounds indices:
        if (index < 0 || index >= size) {
          return undefined;
        }
        // Get the first code unit
        var first = string.charCodeAt(index);
        var second;
        if ( // check if it’s the start of a surrogate pair
          first >= 0xD800 && first <= 0xDBFF && // high surrogate
          size > index + 1 // there is a next code unit
        ) {
          second = string.charCodeAt(index + 1);
          if (second >= 0xDC00 && second <= 0xDFFF) { // low surrogate
          // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
          return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
          }
        }
        return first;
      };

      function TextEncoder(encoding) {
        if (!encoding) encoding = 'utf8';
        switch (encoding) {
            case 'utf-8':
            case 'utf8':
                break;
            default:
                throw 'TextEncoder only supports utf8';
        }
      }
      TextEncoder.prototype.encode = function (string) {
        var octets = new Uint8Array(string.length * 3);
        var pos = -1;
        var length = string.length;
        var i = 0;
        while (i < length) {
          var codePoint = StringToCodePointAt(string, i);
          var c = 0;
          var bits = 0;
          if (codePoint <= 0x0000007F) {
            c = 0;
            bits = 0x00;
          } else if (codePoint <= 0x000007FF) {
            c = 6;
            bits = 0xC0;
          } else if (codePoint <= 0x0000FFFF) {
            c = 12;
            bits = 0xE0;
          } else if (codePoint <= 0x001FFFFF) {
            c = 18;
            bits = 0xF0;
          }
          octets[pos += 1] = (bits | (codePoint >> c));
          c -= 6;
          while (c >= 0) {
            octets[pos += 1] = (0x80 | ((codePoint >> c) & 0x3F));
            c -= 6;
          }
          i += codePoint >= 0x10000 ? 2 : 1;
        }
        return octets.subarray(0, pos+1);
      };

      root.TextEncoder = TextEncoder;

    }

    if (typeof root.TextDecoder === 'undefined') {

      // Normalise String.fromCodePointAt for IE10+
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/fromCodePoint
      function StringFromCodePoint(_) {
        if (String.fromCodePoint) return String.fromCodePoint(_);
        var codeUnits = [], codeLen = 0, result = '';
        for (var index=0, len = arguments.length; index !== len; ++index) {
          var codePoint = +arguments[index];
          // correctly handles all cases including `NaN`, `-Infinity`, `+Infinity`
          // The surrounding `!(...)` is required to correctly handle `NaN` cases
          // The (codePoint>>>0) === codePoint clause handles decimals and negatives
          if (!(codePoint < 0x10FFFF && (codePoint>>>0) === codePoint))
            throw RangeError('Invalid code point: ' + codePoint);
          if (codePoint <= 0xFFFF) { // BMP code point
            codeLen = codeUnits.push(codePoint);
          } else { // Astral code point; split in surrogate halves
            // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
            codePoint -= 0x10000;
            codeLen = codeUnits.push(
              (codePoint >> 10) + 0xD800,  // highSurrogate
              (codePoint % 0x400) + 0xDC00 // lowSurrogate
            );
          }
          if (codeLen >= 0x3fff) {
            result += String.fromCharCode.apply(null, codeUnits);
            codeUnits.length = 0;
          }
        }
        return result + String.fromCharCode.apply(null, codeUnits);
      };

      function TextDecoder(encoding) {
        if (!encoding) encoding = 'utf8';
        switch (encoding) {
            case 'utf-8':
            case 'utf8':
                break;
            default:
                throw 'TextDecoder only supports utf8';
        }
      }
      TextDecoder.prototype.decode = function (octets) {
        var string = '';
        var i = 0;
        while (i < octets.length) {
          var octet = octets[i];
          var bytesNeeded = 0;
          var codePoint = 0;
          if (octet <= 0x7F) {
            bytesNeeded = 0;
            codePoint = octet & 0xFF;
          } else if (octet <= 0xDF) {
            bytesNeeded = 1;
            codePoint = octet & 0x1F;
          } else if (octet <= 0xEF) {
            bytesNeeded = 2;
            codePoint = octet & 0x0F;
          } else if (octet <= 0xF4) {
            bytesNeeded = 3;
            codePoint = octet & 0x07;
          }
          if (octets.length - i - bytesNeeded > 0) {
            var k = 0;
            while (k < bytesNeeded) {
              octet = octets[i + k + 1];
              codePoint = (codePoint << 6) | (octet & 0x3F);
              k += 1;
            }
          } else {
            codePoint = 0xFFFD;
            bytesNeeded = octets.length - i;
          }
          string += StringFromCodePoint(codePoint);
          i += bytesNeeded + 1;
        }
        return string
      };

      root.TextDecoder = TextDecoder;

    }

  })(this);
