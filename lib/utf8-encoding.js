(function(root) {

  if (typeof TextDecoder === "undefined") {
    function TextEncoder(encoding) {
      if (encoding !== 'utf8') throw 'TextDecoder only supports utf8';
    }
    TextEncoder.prototype.encode = function (string) {
      var octets = [];
      var length = string.length;
      var i = 0;
      while (i < length) {
        var codePoint = string.codePointAt(i);
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
        octets.push(bits | (codePoint >> c));
        c -= 6;
        while (c >= 0) {
          octets.push(0x80 | ((codePoint >> c) & 0x3F));
          c -= 6;
        }
        i += codePoint >= 0x10000 ? 2 : 1;
      }
      return octets;
    };
    root.TextEncoder = TextEncoder;
  }

  if (typeof TextDecoder === "undefined") {
    function TextDecoder(encoding) {
      if (encoding !== 'utf8') throw 'TextDecoder only supports utf8';
    }
    TextDecoder.prototype.decode = function (octets) {
      var string = "";
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
        string += String.fromCodePoint(codePoint);
        i += bytesNeeded + 1;
      }
      return string
    };
    root.TextDecoder = TextDecoder;
  }

})(this);
