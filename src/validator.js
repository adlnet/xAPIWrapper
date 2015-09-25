(function(ADL) {
    function Validator(obj) {};

    Validator.prototype.validateStatement = function(statement) {
        var statementObject;
        if (statement === undefined) {
            return makeV1SingleErrorReport(null, new ValidationError("statement", "No statement argument provided."));
        }
        if (statement === null) {
            return makeV1SingleErrorReport(null, new ValidationError("statement", "Null statement argument provided."));
        }
        if (isString(statement)) {
            try {
                statementObject = JSON.parse(statement);
                if (statementObject === null || (!isObject(statementObject) && !isArray(statementObject))) {
                    return makeV1SingleErrorReport(statementObject, new ValidationError("statement", "Null or non-object statement value parsed from provided statment JSON."));
                }
            } catch (e) {
                return makeV1SingleErrorReport(statement, new ValidationError("statement", "Invalid JSON. The statement could not be parsed: " + e.message));
            }
            return makeStatementReport(statementObject);
        }
        if (isObject(statement) || isArray(statement)) {
            return makeStatementReport(statement);
        }
        return makeV1SingleErrorReport(null, new ValidationError("statement", "Statement argument provided was not a valid object, array or a valid JSON string."));
    };

    ADL.Validator = Validator;
}(window.ADL = window.ADL || {}));

var uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
var iso8601DurationRegex = /^P((\d+([\.,]\d+)?Y)?(\d+([\.,]\d+)?M)?(\d+([\.,]\d+)?W)?(\d+([\.,]\d+)?D)?)?(T(\d+([\.,]\d+)?H)?(\d+([\.,]\d+)?M)?(\d+([\.,]\d+)?S)?)?$/;
var mailtoIriRegex = /(mailto)(:)([\w-+]+(?:\.[\w-+]+)*@(?:[\w-]+\.)+[a-zA-Z]{2,7})/i
var semVer1p0p0Regex = /^((\d+)\.(\d+)\.(\d+))(?:-([\dA-Za-z\-]+))?$/;
var base64Regex = /^(?:[A-Za-z0-9\+\/]{4})*(?:[A-Za-z0-9\+\/]{2}==|[A-Za-z0-9\+\/]{3}=|[A-Za-z0-9\+\/]{4})$/;
var sha1Regex = /\b([a-f0-9]{40})\b/;
var iriRegex = /^[a-z](?:[\-a-z0-9\+\.])*:(?:\/\/(?:(?:%[0-9a-f][0-9a-f]|[\-a-z0-9\._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\u10000-\u1FFFD\u20000-\u2FFFD\u30000-\u3FFFD\u40000-\u4FFFD\u50000-\u5FFFD\u60000-\u6FFFD\u70000-\u7FFFD\u80000-\u8FFFD\u90000-\u9FFFD\uA0000-\uAFFFD\uB0000-\uBFFFD\uC0000-\uCFFFD\uD0000-\uDFFFD\uE1000-\uEFFFD!\$&'\(\)\*\+,;=:])*@)?(?:\[(?:(?:(?:[0-9a-f]{1,4}:){6}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|::(?:[0-9a-f]{1,4}:){5}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:[0-9a-f]{1,4}:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|v[0-9a-f]+[\-a-z0-9\._~!\$&'\(\)\*\+,;=:]+)\]|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3}|(?:%[0-9a-f][0-9a-f]|[\-a-z0-9\._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\u10000-\u1FFFD\u20000-\u2FFFD\u30000-\u3FFFD\u40000-\u4FFFD\u50000-\u5FFFD\u60000-\u6FFFD\u70000-\u7FFFD\u80000-\u8FFFD\u90000-\u9FFFD\uA0000-\uAFFFD\uB0000-\uBFFFD\uC0000-\uCFFFD\uD0000-\uDFFFD\uE1000-\uEFFFD!\$&'\(\)\*\+,;=@])*)(?::[0-9]*)?(?:\/(?:(?:%[0-9a-f][0-9a-f]|[\-a-z0-9\._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\u10000-\u1FFFD\u20000-\u2FFFD\u30000-\u3FFFD\u40000-\u4FFFD\u50000-\u5FFFD\u60000-\u6FFFD\u70000-\u7FFFD\u80000-\u8FFFD\u90000-\u9FFFD\uA0000-\uAFFFD\uB0000-\uBFFFD\uC0000-\uCFFFD\uD0000-\uDFFFD\uE1000-\uEFFFD!\$&'\(\)\*\+,;=:@]))*)*|\/(?:(?:(?:(?:%[0-9a-f][0-9a-f]|[\-a-z0-9\._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\u10000-\u1FFFD\u20000-\u2FFFD\u30000-\u3FFFD\u40000-\u4FFFD\u50000-\u5FFFD\u60000-\u6FFFD\u70000-\u7FFFD\u80000-\u8FFFD\u90000-\u9FFFD\uA0000-\uAFFFD\uB0000-\uBFFFD\uC0000-\uCFFFD\uD0000-\uDFFFD\uE1000-\uEFFFD!\$&'\(\)\*\+,;=:@]))+)(?:\/(?:(?:%[0-9a-f][0-9a-f]|[\-a-z0-9\._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\u10000-\u1FFFD\u20000-\u2FFFD\u30000-\u3FFFD\u40000-\u4FFFD\u50000-\u5FFFD\u60000-\u6FFFD\u70000-\u7FFFD\u80000-\u8FFFD\u90000-\u9FFFD\uA0000-\uAFFFD\uB0000-\uBFFFD\uC0000-\uCFFFD\uD0000-\uDFFFD\uE1000-\uEFFFD!\$&'\(\)\*\+,;=:@]))*)*)?|(?:(?:(?:%[0-9a-f][0-9a-f]|[\-a-z0-9\._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\u10000-\u1FFFD\u20000-\u2FFFD\u30000-\u3FFFD\u40000-\u4FFFD\u50000-\u5FFFD\u60000-\u6FFFD\u70000-\u7FFFD\u80000-\u8FFFD\u90000-\u9FFFD\uA0000-\uAFFFD\uB0000-\uBFFFD\uC0000-\uCFFFD\uD0000-\uDFFFD\uE1000-\uEFFFD!\$&'\(\)\*\+,;=:@]))+)(?:\/(?:(?:%[0-9a-f][0-9a-f]|[\-a-z0-9\._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\u10000-\u1FFFD\u20000-\u2FFFD\u30000-\u3FFFD\u40000-\u4FFFD\u50000-\u5FFFD\u60000-\u6FFFD\u70000-\u7FFFD\u80000-\u8FFFD\u90000-\u9FFFD\uA0000-\uAFFFD\uB0000-\uBFFFD\uC0000-\uCFFFD\uD0000-\uDFFFD\uE1000-\uEFFFD!\$&'\(\)\*\+,;=:@]))*)*|(?!(?:%[0-9a-f][0-9a-f]|[\-a-z0-9\._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\u10000-\u1FFFD\u20000-\u2FFFD\u30000-\u3FFFD\u40000-\u4FFFD\u50000-\u5FFFD\u60000-\u6FFFD\u70000-\u7FFFD\u80000-\u8FFFD\u90000-\u9FFFD\uA0000-\uAFFFD\uB0000-\uBFFFD\uC0000-\uCFFFD\uD0000-\uDFFFD\uE1000-\uEFFFD!\$&'\(\)\*\+,;=:@])))(?:\?(?:(?:%[0-9a-f][0-9a-f]|[\-a-z0-9\._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\u10000-\u1FFFD\u20000-\u2FFFD\u30000-\u3FFFD\u40000-\u4FFFD\u50000-\u5FFFD\u60000-\u6FFFD\u70000-\u7FFFD\u80000-\u8FFFD\u90000-\u9FFFD\uA0000-\uAFFFD\uB0000-\uBFFFD\uC0000-\uCFFFD\uD0000-\uDFFFD\uE1000-\uEFFFD!\$&'\(\)\*\+,;=:@])|[\uE000-\uF8FF\uF0000-\uFFFFD|\u100000-\u10FFFD\/\?])*)?(?:\#(?:(?:%[0-9a-f][0-9a-f]|[\-a-z0-9\._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\u10000-\u1FFFD\u20000-\u2FFFD\u30000-\u3FFFD\u40000-\u4FFFD\u50000-\u5FFFD\u60000-\u6FFFD\u70000-\u7FFFD\u80000-\u8FFFD\u90000-\u9FFFD\uA0000-\uAFFFD\uB0000-\uBFFFD\uC0000-\uCFFFD\uD0000-\uDFFFD\uE1000-\uEFFFD!\$&'\(\)\*\+,;=:@])|[\/\?])*)?$/i;
var iso8601DateTimeRegex = /^(\d{4}|[+\-]\d{6})(?:-(\d{2})(?:-(\d{2}))?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{3}))?)?(?:(Z)|([+\-])(\d{2})(?::(\d{2}))?)?)?$/;
var bcp47Regex = /^(?:(en-GB-oed|i-(?:ami|bnn|default|enochian|hak|klingon|lux|mingo|navajo|pwn|tao|tay|tsu)|sgn-(?:BE-FR|BE-NL|CH-DE))|(art-lojban|cel-gaulish|no-(?:bok|nyn)|zh-(?:guoyu|hakka|min|min-nan|xiang)))$|^(x(?:-[0-9a-z]{1,8})+)$|^(?:((?:[a-z]{2,3}(?:(?:-[a-z]{3}){1,3})?)|[a-z]{4}|[a-z]{5,8})(?:-([a-z]{4}))?(?:-([a-z]{2}|[0-9]{3}))?((?:-(?:[a-z0-9]{5,8}|[0-9][a-z0-9]{3}))*)?((?:-[0-9a-wy-z](?:-[a-z0-9]{2,8}){1,})*)?(-x(?:-[0-9a-z]{1,8})+)?)$/i;
var toString = Object.prototype.toString;
var ifiPropertyNames = ["mbox", "mbox_sha1sum", "openid", "account"];
var cmiInteractionTypes = ["true-false", "choice", "fill-in",
                                "long-fill-in", "matching", "performance",
                                "sequencing", "likert", "numeric",
                                "other"];

function isString(obj) {
    return toString.call(obj) === '[object String]';
};

function isObject(obj) {
    return toString.call(obj) === '[object Object]';
};

function isArray (obj) {
    return toString.call(obj) === '[object Array]';
};

function isBoolean(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
};

function isNumber(obj) {
    return toString.call(obj) === '[object Number]';
};

function isNonNullMapObject(target) {
    return target !== null && isObject(target) && !isArray(target);
};

function isValidLanguageTag(target) {
    // TODO - use more precise 5646 handling, rather than this simplified BCP 47 regex, which combines RFC 5646 and RFC 4647.
    return target !== undefined && target !== null && isString(target) && bcp47Regex.test(target);
};

function getIFIs(target) {
    var ifis = [],
        i,
        propName,
        propValue;
    if (target === null || target === undefined) {
        return ifis;
    }
    for (i = 0; i < ifiPropertyNames.length; i += 1) {
        propName = ifiPropertyNames[i];
        propValue = target[propName];
        if (propValue !== undefined && propValue !== null) {
            ifis.push({ key: propName, value: propValue });
        }
    }
    return ifis;
};

function getIFICount(target) {
    return getIFIs(target).length;
};

function isGroup(actorOrGroup) {
    return (actorOrGroup.member !== null && actorOrGroup.member !== undefined) || actorOrGroup.objectType === "Group";
};

function addPropToTrace(trace, addendum) {
    if (addendum !== null && addendum !== undefined) {
        return trace + "." + addendum;
    }
    return trace;
};

function addLookupToTrace(trace, key) {
    if (key === null || key === undefined) {
        return trace;
    }
    if (isString(key)) {
        return trace + "[\"" + key + "\"]";
    }
    return trace + "[" + key + "]";
};

function localTraceToString(trace, addendum) {
    return addPropToTrace(trace, addendum);
};

function Report(results, version) {
    resultsArray = [];
    totalErrors = 0;
    for (var i=0; i<results.length; i++){
        var holder = {};
        var instance = results[i].instance;
        var errors = results[i].errors;
        holder.instance = instance === null || instance === undefined ? null : instance;
        holder.errors = errors === null || errors === undefined ? [] : errors;
        holder.version = version;
        resultsArray.push(holder);
        totalErrors += errors.length;
    }
    this.totalErrors = totalErrors;
    this.results = resultsArray;
};

function ValidationError(trace, message) {
    this.trace = trace;
    this.message = message;
};

function makeV1Report(results) {
    return new this.Report(results, "1.0.2");
};

function makeV1SingleErrorReport(instance, error) {
    return this.makeV1Report([{"instance": instance, "errors": error === null || error === undefined ? [] :
                                  [error]}]);
};

function makeStatementReport(statement) {
    var localErrors = [];
    var statementErrors = [];
    if (isObject(statement)){
        this.validateStatementParts(statement, "statement", localErrors, false);
        statementErrors.push({"instance": statement, "errors": localErrors});
    }
    else {
        for (var i=0; i<statement.length; i++){
            this.validateStatementParts(statement[i], "statement", localErrors, false);       
            statementErrors.push({"instance": statement[i], "errors": localErrors});
            localErrors = [];
        }
    }
    return this.makeV1Report(statementErrors);
};

function validateAbsenceOfNonWhitelistedProperties(target, allowedProperties, trace, errors) {
    var localErrors = errors || [],
        localTrace = trace || "",
        propertyName;
    for (propertyName in target) {
        if (target.hasOwnProperty(propertyName) && allowedProperties.indexOf(propertyName) === -1) {
            localErrors.push(new this.ValidationError(addPropToTrace(localTrace, propertyName), "Unexpected property '" + propertyName + "' not permitted"));
        }
    }
    return localErrors;
};

function validatePropertyIsString(parent, propertyName, trace, errors, isRequired) {
    var localErrors = errors || [],
        localTrace = trace || "",
        propValue = parent[propertyName];
    if (propValue !== undefined) {
        if (propValue === null || !isString(propValue)) {
            localErrors.push(new this.ValidationError(localTraceToString(localTrace, propertyName), propertyName + " property, if present, must be a string."));
        }
    } else if (isRequired) {
        localErrors.push(new this.ValidationError(localTraceToString(localTrace, propertyName), propertyName + " property was required to be a string but was absent."));
    }
    return localErrors;
};

function validatePropertyIsIri(target, propertyName, trace, errors, isRequired) {
    var localErrors = errors || [],
        localTrace = trace || "",
        propValue = target[propertyName];
    if (propValue !== undefined) {
        if (propValue === null || !isString(propValue)) {
            localErrors.push(new this.ValidationError(localTraceToString(localTrace, propertyName), propertyName + " property, if present, must be an IRI string."));
        } else if (!this.iriRegex.test(propValue)) {
            localErrors.push(new this.ValidationError(localTraceToString(localTrace, propertyName), propertyName + " property, if present, must be a IRI string."));
        }
    } else if (isRequired) {
        localErrors.push(new this.ValidationError(localTraceToString(localTrace, propertyName), propertyName + " property was required to be a IRI string but was absent."));
    }
    return localErrors;
};

function validatePropertyIsBoolean(parent, propertyName, trace, errors, isRequired) {
    var localErrors = errors || [],
        localTrace = trace || "",
        propValue = parent[propertyName];
    if (propValue !== undefined) {
        if (propValue === null || !isBoolean(propValue)) {
            localErrors.push(new this.ValidationError(localTraceToString(localTrace, propertyName), propertyName + " property, if present, must be a Boolean."));
        }
    } else if (isRequired) {
        localErrors.push(new this.ValidationError(localTraceToString(localTrace, propertyName), propertyName + " property was required to be a Boolean but was absent."));
    }
    return localErrors;
};

function validatePropertyIsNumber(parent, propertyName, trace, errors, isRequired) {
    var localErrors = errors || [],
        localTrace = trace || "",
        propValue = parent[propertyName];
    if (propValue !== undefined) {
        if (propValue === null || !isNumber(propValue)) {
            localErrors.push(new this.ValidationError(localTraceToString(localTrace, propertyName), propertyName + " property, if present, must be a Number."));
        }
    } else if (isRequired) {
        localErrors.push(new this.ValidationError(localTraceToString(localTrace, propertyName), propertyName + " property was required to be a Number but was absent."));
    }
    return localErrors;
};

function validateIFIProperties(target, trace, errors) {
    var localErrors = errors || [],
        localTrace = trace || "",
        accountTrace;
    if (target.mbox !== undefined && target.mbox !== null) {
        if (!isString(target.mbox)) {
            localErrors.push(new this.ValidationError(localTraceToString(localTrace, "mbox"), "mbox property was required to be a mailto IRI string but was not a string at all."));
        } else if (!this.mailtoIriRegex.test(target.mbox)) {
            localErrors.push(new this.ValidationError(localTraceToString(localTrace, "mbox"), "mbox property was required to be a mailto IRI string but did not match the mailto format."));
        }
    }
    this.validatePropertyIsString(target, "mbox_sha1sum", localTrace, localErrors, false);
    if (target.mbox_sha1sum !== undefined) {
        if (!this.sha1Regex.test(target.mbox_sha1sum)) {
            localErrors.push(new this.ValidationError(localTraceToString(localTrace, "mbox_sha1sum"), "mbox_sha1sum property was required to be a sha1 value."));
        }
    }
    this.validatePropertyIsIri(target, "openID", localTrace, localErrors, false);
    if (target.account !== undefined && target.account !== null) {
        accountTrace = addPropToTrace(localTrace, "account");
        this.validatePropertyIsIri(target.account, "homePage", accountTrace, localErrors, true);
        this.validatePropertyIsString(target.account, "name", accountTrace, localErrors, true);
        this.validateAbsenceOfNonWhitelistedProperties(target.account, ["homePage", "name"], accountTrace, localErrors);
    }
    return localErrors;
};

function validateExtensions(extensions, trace, errors) {
    var localErrors = errors || [],
        localTrace = trace || "extensions";
    if (extensions === undefined) {
        return localErrors;
    }
    if (!isNonNullMapObject(extensions)) {
        localErrors.push(new this.ValidationError(localTrace, "If present, the extensions property must be a non-null map object."));
    }
    var keys = Object.keys(extensions);
    for (key in keys) {
        if (!isString(key) || !this.iriRegex.test(key)) {
            localErrors.push(new this.ValidationError(localTrace, key + " key in extensions must be a valid IRI string."));
        }
    }
    return localErrors;
};

function validateLanguageMap(languageMap, trace, errors) {
    var localErrors = errors || [],
        localTrace = trace || "languageMap",
        propName,
        mappedValue;
    if (languageMap === undefined) {
        return localErrors;
    }
    if (!isNonNullMapObject(languageMap)) {
        localErrors.push(new this.ValidationError(addPropToTrace(localTrace), "Language Maps, when present, must be non-null map objects"));
        return localErrors;
    }
    for (propName in languageMap) {
        if (languageMap.hasOwnProperty(propName)) {

            if (!isValidLanguageTag(propName)) {
                localErrors.push(new this.ValidationError(addPropToTrace(localTrace, propName), "Language Map key " + propName + "does not conform to RFC 5646."));
            }
            mappedValue = languageMap[propName];
            if (mappedValue === null || mappedValue === undefined || !isString(mappedValue)) {
                localErrors.push(new this.ValidationError(addLookupToTrace(localTrace, propName), "Language Map value for key " + propName + "should be a String, but was not."));
            }
        }
    }
    return localErrors;
};

function validateActor(actor, trace, errors) {
    var localErrors = errors || [],
        localTrace = trace || "actor";
    if (actor === null || actor === undefined) {
        localErrors.push(new this.ValidationError(localTraceToString(localTrace), "Actor must be provided."));
        return localErrors;
    }
    if (this.isGroup(actor)) {
        this.validateGroup(actor, localTrace, localErrors);
    } else {
        this.validateAgent(actor, localTrace, localErrors);
    }
    return localErrors;
};

function validateVerb(verb, trace, errors) {
    var localErrors = errors || [],
        localTrace = trace || "verb";
    if (verb === undefined) {
        localErrors.push(new this.ValidationError(localTraceToString(localTrace), "verb property must be provided."));
        return localErrors;
    }
    if (!isNonNullMapObject(verb)) {
        localErrors.push(new this.ValidationError(localTraceToString(localTrace), "verb property value must a non-null map object."));
        return localErrors;
    }
    this.validatePropertyIsIri(verb, "id", localTrace, localErrors, true);
    if (verb.display !== undefined) {
        this.validateLanguageMap(verb.display, addPropToTrace(localTrace, "display"), localErrors);
    }

    this.validateAbsenceOfNonWhitelistedProperties(verb, ["id", "display"], localTrace, localErrors);

    return localErrors;
};

function validateInteractionComponentArray(components, interactionType, allowedInteractionTypes, trace, errors) {
    var localErrors = errors || [],
        localTrace = trace || "interactionComponents",
        isAllowedComponentType = allowedInteractionTypes.indexOf(interactionType) !== -1,
        ids = [],
        interactionComponent,
        perComponentTrace,
        i;
    if (isAllowedComponentType && components !== undefined) {
        if (components === null || !isArray(components)) {
            localErrors.push(new this.ValidationError(localTrace, "This interaction component collection property must be an array."));
        } else {
            for (i = 0; i < components.length; i += 1) {
                interactionComponent = components[i];
                perComponentTrace = addLookupToTrace(localTrace, i);
                if (!isNonNullMapObject(interactionComponent)) {
                    localErrors.push(new this.ValidationError(perComponentTrace, "This interaction component collection member must be a non-null map object"));
                } else {
                    this.validatePropertyIsString(interactionComponent, "id", perComponentTrace, localErrors, true);
                    if (ids.indexOf(interactionComponent.id) !== -1) {
                        localErrors.push(new this.ValidationError(addPropToTrace(perComponentTrace, "id"), "id properties must be unique within each interaction component array"));
                    } else {
                        ids.push(interactionComponent.id);
                    }
                    this.validateLanguageMap(interactionComponent.description, addPropToTrace(perComponentTrace, "description"), localErrors);

                    this.validateAbsenceOfNonWhitelistedProperties(interactionComponent, ["id", "description"], perComponentTrace, localErrors);
                }
            }
        }
    } else if (interactionType && components) {
        localErrors.push(new this.ValidationError(localTrace, "This interaction component collection property is not associated with the present interactionType of " + interactionType));
    }
    return localErrors;
};

function validateActivityDefintion(definition, trace, errors) {
    var localErrors = errors || [],
        localTrace = trace || "definition",
        correctResponsesPatternTrace = addPropToTrace(localTrace, "correctResponsesPattern"),
        crpLen,
        i,
        crpItem;

    if (!isNonNullMapObject(definition)) {
        localErrors.push(new this.ValidationError(addPropToTrace(localTrace), "definitions, when present, must be map objects"));
        return localErrors;
    }

    this.validateLanguageMap(definition.name, addPropToTrace(localTrace, "name"), localErrors);
    this.validateLanguageMap(definition.description, addPropToTrace(localTrace, "description"), localErrors);

    this.validatePropertyIsIri(definition, "type", localTrace, localErrors, false);
    this.validatePropertyIsIri(definition, "moreInfo", localTrace, localErrors, false);
    this.validateExtensions(definition.extensions, addPropToTrace(localTrace, "extensions"), localErrors);

    if (definition.interactionType !== undefined) {
        if (cmiInteractionTypes.indexOf(definition.interactionType) === -1) {
            localErrors.push(new this.ValidationError(localTraceToString(localTrace, "interactionType"), "If present, the interactionType value must be a CMI interaction type option."));
        }
    }

    if (definition.correctResponsesPattern !== undefined) {
        if (!isArray(definition.correctResponsesPattern)) {
            localErrors.push(new this.ValidationError(correctResponsesPatternTrace, "If present, the correctResponsesPattern value must be an Array of strings."));
        } else {
            crpLen = definition.correctResponsesPattern.length;
            for (i = 0; i < crpLen; i+=1) {
                crpItem = definition.correctResponsesPattern[i];
                if (crpItem === null || crpItem === undefined || !isString(crpItem)) {
                    localErrors.push(new this.ValidationError(addLookupToTrace(correctResponsesPatternTrace, i), "correctResponsesPattern items must be strings."));
                }
            }
        }
    }
    this.validateInteractionComponentArray(definition.choices, definition.interactionType, ["choice", "sequencing"], addPropToTrace(localTrace, "choices"), localErrors);
    this.validateInteractionComponentArray(definition.scale, definition.interactionType, ["likert"], addPropToTrace(localTrace, "scale"), localErrors);
    this.validateInteractionComponentArray(definition.source, definition.interactionType, ["matching"], addPropToTrace(localTrace, "source"), localErrors);
    this.validateInteractionComponentArray(definition.target, definition.interactionType, ["matching"], addPropToTrace(localTrace, "target"), localErrors);
    this.validateInteractionComponentArray(definition.steps, definition.interactionType, ["performance"], addPropToTrace(localTrace, "steps"), localErrors);

    this.validateAbsenceOfNonWhitelistedProperties(definition,
        ["name", "description", "type", "moreInfo", "extensions", "interactionType", "correctResponsesPattern", "choices", "scale", "source", "target", "steps"],
         localTrace, localErrors);
    return localErrors;
};

function validateActivity(activity, trace, errors) {
    var localErrors = errors || [],
        localTrace = trace || "activity";
    if (!isNonNullMapObject(activity)) {
        localErrors.push(new this.ValidationError(localTraceToString(localTrace), "Activities must be non-null map objects"));
        return localErrors;
    }
    this.validatePropertyIsIri(activity, "id", localTrace, localErrors, true);

    if (activity.definition !== undefined) {
        this.validateActivityDefintion(activity.definition, addPropToTrace(localTrace, "definition"), localErrors);
    }
    this.validateAbsenceOfNonWhitelistedProperties(activity, ["objectType", "id", "definition"], localTrace, localErrors);
    return localErrors;
};

function validateStatementRef(statementRef, trace, errors) {
    var localErrors = errors || [],
        localTrace = trace || "statementRef";
    if (!isNonNullMapObject(statementRef)) {
        localErrors.push(new this.ValidationError(localTraceToString(localTrace), "StatementRef instances must be non-null map objects."));
        return localErrors;
    }
    if (statementRef.objectType !== "StatementRef") {
        localErrors.push(new this.ValidationError(addPropToTrace(localTrace, "objectType"), "objectType property value must be 'StatementRef' for statement reference objects."));
    }
    if (!statementRef.id || !this.uuidRegex.test(statementRef.id)) {
        localErrors.push(new this.ValidationError(addPropToTrace(localTrace, "id"), "id property value must be a valid UUID string for statement reference objects."));
    }
    this.validateAbsenceOfNonWhitelistedProperties(statementRef, ["id", "objectType"], localTrace, localErrors);
    return localErrors;
};

function validateScore(score, trace, errors) {
    var localErrors = errors || [],
        localTrace = trace || "score";
    if (score === undefined) {
        return localErrors;
    }
    this.validatePropertyIsNumber(score, "scaled", localTrace, localErrors, false);
    if (score.scaled !== undefined) {
        if (score.scaled < -1 || score.scaled > 1) {
            localErrors.push(new this.ValidationError(addPropToTrace(localTrace, "scaled"), "If present, the scaled property value must be between -1 and 1"));
        }
    }
    if (score.min !== undefined) {
        this.validatePropertyIsNumber(score, "min", localTrace, localErrors, false);
        if (score.raw !== undefined && score.raw < score.min) {
            localErrors.push(new this.ValidationError(addPropToTrace(localTrace, "raw"), "If both 'raw' and 'min' are present, the raw property value should be greater than min"));
        }
        if (score.max !== undefined && score.max < score.min) {
            localErrors.push(new this.ValidationError(addPropToTrace(localTrace, "max"), "If both 'max' and 'min' are present, the max property value should be greater than min"));
        }
    }
    if (score.max !== undefined) {
        this.validatePropertyIsNumber(score, "max", localTrace, localErrors, false);
        if (score.raw !== undefined && score.raw > score.max) {
            localErrors.push(new this.ValidationError(addPropToTrace(localTrace, "raw"), "If both 'raw' and 'max' are present, the raw property value should be less than max"));
        }
    }
    this.validatePropertyIsNumber(score, "raw", localTrace, localErrors, false);
    this.validateAbsenceOfNonWhitelistedProperties(score, ["scaled", "raw", "min", "max"], localTrace, localErrors);
    return localErrors;
};

function validateResult(result, trace, errors) {
    var localErrors = errors || [],
        localTrace = trace || "result";
    if (result === undefined) {
        return localErrors;
    }
    if (!isNonNullMapObject(result)) {
        localErrors.push(new this.ValidationError(addPropToTrace(localTrace), "If present, the result must be a map object"));
        return localErrors;
    }
    this.validateScore(result.score, addPropToTrace(localTrace, "score"), localErrors);
    this.validatePropertyIsBoolean(result, "success", localTrace, localErrors, false);
    this.validatePropertyIsBoolean(result, "completion", localTrace, localErrors, false);
    this.validatePropertyIsString(result, "response", localTrace, localErrors, false);
    this.validateExtensions(result.extensions, addPropToTrace(localTrace, "extensions"), localErrors);
    if (result.duration !== undefined && (result.duration === null || !isString(result.duration) || !this.iso8601DurationRegex.test(result.duration))) {
        localErrors.push(new this.ValidationError(addPropToTrace(localTrace, "duration"), "If present, the duration property value must be an ISO 8601 duration"));
    }
    this.validateAbsenceOfNonWhitelistedProperties(result, ["score", "success", "completion", "response", "duration", "extensions"], localTrace, localErrors);

    return localErrors;
};

function validatePropertyIsISO8601String(parent, propertyName, trace, errors) {
    var localErrors = errors || [],
        localTrace = trace || "datetime",
        matched,
        datetime = parent[propertyName];
    if (datetime === undefined) {
        return localErrors;
    }
    if (datetime === null || !isString(datetime)) {
        localErrors.push(new this.ValidationError(localTraceToString(localTrace, propertyName), "This property must be a string value, but was null or another value type."));
        return localErrors;
    }
    matched = this.iso8601DateTimeRegex.exec(datetime);
    if (!matched) {
        localErrors.push(new this.ValidationError(localTraceToString(localTrace, propertyName), "This property's string value must be conformant to ISO 8601 for Date Times."));        
    }

    return localErrors;
};

function validateVersion(version, trace, errors) {
    var localErrors = errors || [],
        localTrace = trace || "version";
    if (version === undefined) {
        return localErrors;
    }
    if (version === null || !isString(version) || !this.semVer1p0p0Regex.test(version)) {
        localErrors.push(new this.ValidationError(localTraceToString(localTrace), "version must be a non-null string that complies with Semantic Versioning 1.0.0"));
    }
    return localErrors;
};

function validateAttachmentObject(attachment, trace, errors) {
    var localErrors = errors || [],
        localTrace = trace || "attachment";
    if (!isNonNullMapObject(attachment)) {
        localErrors.push(new this.ValidationError(localTraceToString(localTrace), "attachment instances must be non-null map objects."));
        return localErrors;
    }
    if (attachment.display === undefined) {
        localErrors.push(new this.ValidationError(localTraceToString(localTrace, "display"), "display property must be provided."));
    } else {
        this.validateLanguageMap(attachment.display, addPropToTrace(localTrace, "display"), localErrors);
    }
    this.validateLanguageMap(attachment.description, addPropToTrace(localTrace, "description"), localErrors);

    this.validatePropertyIsIri(attachment, "usageType", localTrace, localErrors, true);
    this.validatePropertyIsIri(attachment, "fileUrl", localTrace, localErrors, false);

    // TODO - more complete validation for Internet Media Type via RFC 2046
    this.validatePropertyIsString(attachment, "contentType", localTrace, localErrors, true);
    if (attachment.length === undefined || attachment.length === null || !isNumber(attachment.length) || !(attachment.length % 1 === 0)) {
        localErrors.push(new this.ValidationError(localTraceToString(localTrace, "length"), "length property must be provided with an integer value"));
    }

    if (attachment.sha2 === undefined) {
        localErrors.push(new this.ValidationError(localTraceToString(localTrace, "sha2"), "sha2 property must be provided on attachment objects"));
    } else if (attachment.sha2 === null || !isString(attachment.sha2) || !this.base64Regex.test(attachment.sha2)) {
        localErrors.push(new this.ValidationError(localTraceToString(localTrace, "sha2"), "sha2 property must contain a string with base64 contents"));
    }

    this.validateAbsenceOfNonWhitelistedProperties(attachment, ["usageType", "display", "description", "contentType", "length", "sha2", "fileUrl"], localTrace, localErrors);
    return localErrors;
};

function validateAttachments(attachments, trace, errors) {
    var localErrors = errors || [],
        localTrace = trace || "attachments",
        numAttachments,
        i;
    if (attachments === undefined) {
        return localErrors;
    }
    if (attachments === null || !isArray(attachments)) {
        localErrors.push(new this.ValidationError(localTraceToString(localTrace), "attachments must be a non-null Array."));
        return localErrors;
    }
    numAttachments = attachments.length;
    for (i = 0; i < numAttachments; i+=1) {
        this.validateAttachmentObject(attachments[i], addLookupToTrace(localTrace, i), localErrors);
    }
    return localErrors;
};

function validateAgent(agent, trace, errors) {
    var localErrors = errors || [],
        localTrace = trace || "agent",
        ifiCount;
    if (!isNonNullMapObject(agent)) {
        localErrors.push(new this.ValidationError(localTraceToString(localTrace), "Agent must be a non-null map object"));
        return localErrors;
    }

    ifiCount = getIFICount(agent);
    if (ifiCount !== 1) {
        localErrors.push(new this.ValidationError(localTraceToString(localTrace), "Exactly one Inverse Functional Identifier property must be specified."));
    }
    if (agent.objectType === "Group") {
        localErrors.push(new this.ValidationError(localTraceToString(localTrace), "Invalid object with characteristics of a Group when an Agent was expected."));
    }
    this.validateIFIProperties(agent, localTrace, localErrors);
    this.validatePropertyIsString(agent, "name", localTrace, localErrors, false);

    this.validateAbsenceOfNonWhitelistedProperties(agent, ["objectType", "name"].concat(ifiPropertyNames), localTrace, localErrors);

    return localErrors;
};

function validateGroup(group, trace, errors) {
    var localErrors = errors || [],
        localTrace = trace || "group",
        memberTrace = addPropToTrace(localTrace, "member"),
        ifiCount,
        numMembers,
        i;
    if (!isNonNullMapObject(group)) {
        localErrors.push(new this.ValidationError(localTraceToString(localTrace), "Group must be a non-null map object"));
        return localErrors;
    }

    ifiCount = getIFICount(group);
    if (ifiCount === 0) {
        if (group.objectType !== "Group") {
            localErrors.push(new this.ValidationError(memberTrace, "objectType property must be provided and set to 'Group' for Anonymous Groups."));
        }
        if (group.member === null || group.member === undefined) {
            localErrors.push(new this.ValidationError(memberTrace, "member property must be provided for Anonymous Groups."));
        }
    } else if (ifiCount > 1) {
        localErrors.push(new this.ValidationError(localTraceToString(localTrace), "Only one Inverse Functional Identifier property must be specified."));
    }
    this.validateIFIProperties(group, localTrace, localErrors);
    this.validatePropertyIsString(group, "name", localTrace, localErrors, false);

    if (group.member !== undefined) {
        if (group.member === null || !isArray(group.member)) {
            localErrors.push(new this.ValidationError(localTraceToString(localTrace, "member"), "If present, the member property of a Group must be an Array"));
        } else {
            numMembers = group.member.length;
            if (numMembers > 0) {
                for (i = 0; i < numMembers; i+=1) {
                    this.validateAgent(group.member[i], addLookupToTrace(memberTrace, i), localErrors);
                }                    
            } else {
                localErrors.push(new this.ValidationError(localTraceToString(localTrace, "member"), "If present, the member property of a Group must contain members"));
            }

        }
    }

    this.validateAbsenceOfNonWhitelistedProperties(group, ["objectType", "name", "member"].concat(ifiPropertyNames), localTrace, localErrors);

    return localErrors;
};

function validateAuthority(authority, trace, errors) {
    var localErrors = errors || [],
        localTrace = trace || "authority";
    if (authority === undefined) {
        return localErrors;
    }
    if (!isNonNullMapObject(authority)) {
        localErrors.push(new this.ValidationError(localTraceToString(localTrace), "If present, the authority property must be a non-null map object."));
        return localErrors;
    }
    if (isGroup(authority)) {
        this.validateGroup(authority, localTrace, localErrors);
        if (!authority.member || !authority.member.length || authority.member.length !== 2) {
            localErrors.push(new this.ValidationError(localTraceToString(localTrace, "member"), "If used as a Group, the authority property must contain a member property that is an array containing exactly two Agent objects."));
        }
    } else {
        this.validateAgent(authority, localTrace, localErrors);
    }
    return localErrors;
};

function validateContextActivitySubContext(subContext, trace, errors) {
    var localErrors = errors || [],
        localTrace = trace || "subContext",
        numActivities,
        i;
    if (subContext === undefined) {
        return localErrors;
    }
    if (subContext === null) {
        localErrors.push(new this.ValidationError(localTraceToString(localTrace), "Context Activities property values must not be null."));
    } else if (isArray(subContext)) {
        numActivities = subContext.length;
        for (i = 0; i < numActivities; i+=1) {
            this.validateActivity(subContext[i], addLookupToTrace(localTrace, i), localErrors);
        }
    } else if (isObject(subContext)) {
        this.validateActivity(subContext, localTrace, localErrors);
    } else {
        localErrors.push(new this.ValidationError(localTraceToString(localTrace), "Context Activities property values must be an array of Activity Objects or a single Activity Object."));
    }
    return localErrors;
};

function validateContextActivities(contextActivities, trace, errors) {
    var localErrors = errors || [],
        localTrace = trace || "contextActivities";
    if (contextActivities === undefined) {
        return localErrors;
    }
    if (!isNonNullMapObject(contextActivities)) {
        localErrors.push(new this.ValidationError(localTraceToString(localTrace), "The Context Activities instances must be a non-null map object."));
        return localErrors;
    }
    this.validateContextActivitySubContext(contextActivities.parent, addPropToTrace(localTrace, "parent"), localErrors);
    this.validateContextActivitySubContext(contextActivities.grouping, addPropToTrace(localTrace, "grouping"), localErrors);
    this.validateContextActivitySubContext(contextActivities.category, addPropToTrace(localTrace, "category"), localErrors);
    this.validateContextActivitySubContext(contextActivities.other, addPropToTrace(localTrace, "other"), localErrors);

    this.validateAbsenceOfNonWhitelistedProperties(contextActivities, ["parent", "grouping", "category", "other"], localTrace, localErrors);
    return localErrors;
};

function validateContext(context, trace, errors, statementObjectObjectType) {
    var localErrors = errors || [],
        localTrace = trace || "context";
    if (context === undefined) {
        return localErrors;
    }
    if (!isNonNullMapObject(context)) {
        localErrors.push(new this.ValidationError(localTrace, "If present, the context must be a non-null map object."));
        return localErrors;
    }
    if (context.registration !== undefined && (context.registration === null || !isString(context.registration) || !this.uuidRegex.test(context.registration))) {
        localErrors.push(new this.ValidationError(localTraceToString(localTrace, "registration"), "If present, the registration property must be a UUID string."));
    }
    if (["Activity"].indexOf(statementObjectObjectType) === -1) {
        if (context.revision !== undefined) {
            localErrors.push(new this.ValidationError(localTraceToString(localTrace, "revision"), "The revision property must only be used if the Statement Objects is an Activity"));
        }
        if (context.platform !== undefined) {
            localErrors.push(new this.ValidationError(localTraceToString(localTrace, "platform"), "The platform property must only be used if the Statement Objects is an Activity"));
        }
    }

    this.validatePropertyIsString(context, "revision", localTrace, localErrors, false);
    this.validatePropertyIsString(context, "platform", localTrace, localErrors, false);
    if (context.team !== undefined) {
        this.validateGroup(context.team, addPropToTrace(localTrace, "team"), localErrors);
    }
    if (context.contextActivities !== undefined) {
        this.validateContextActivities(context.contextActivities, addPropToTrace(localTrace, "contextActivities"), localErrors);
    }
    if (context.language !== undefined && !isValidLanguageTag(context.language)) {
        localErrors.push(new this.ValidationError(localTraceToString(localTrace, "language"), "The language property must be encoded as an RFC 5646 compliant string, but was not."));
    }
    if (context.statement !== undefined) {
        this.validateStatementRef(context.statement, addPropToTrace(localTrace, "statement"), localErrors);
    }

    if (context.instructor !== undefined) {
        if (isGroup(context.instructor)) {
            this.validateGroup(context.instructor, addPropToTrace(localTrace, "instructor"), localErrors);
        } else {
            this.validateAgent(context.instructor, addPropToTrace(localTrace, "instructor"), localErrors);
        }
    }
    this.validateExtensions(context.extensions, addPropToTrace(localTrace, "extensions"), localErrors);
    this.validateAbsenceOfNonWhitelistedProperties(context,
        ["registration", "instructor", "team", "contextActivities", "revision", "platform", "language", "statement", "extensions"],
        localTrace, localErrors);
    return localErrors;
};

function validateObject(object, trace, errors, isWithinSubStatement) {
    var localErrors = errors || [],
        localTrace = trace || "object",
        objectType;
    if (object === undefined) {
        localErrors.push(new this.ValidationError(localTraceToString(localTrace), "object property must be provided."));
        return localErrors;
    }
    if (!isNonNullMapObject(object)) {
        localErrors.push(new this.ValidationError(localTraceToString(localTrace), "object property must be a non-null map object."));
        return localErrors;
    }
    this.validatePropertyIsString(object, "objectType", localTrace, localErrors, false);
    objectType = object.objectType || "Activity";
    if (objectType === "Activity") {
        this.validateActivity(object, localTrace, localErrors);
    } else if (objectType === "Agent") {
        this.validateAgent(object, localTrace, localErrors);
    } else if (objectType === "Group") {
        this.validateGroup(object, localTrace, localErrors);
    } else if (objectType === "StatementRef") {
        this.validateStatementRef(object, localTrace, localErrors);
    } else if (objectType === "SubStatement") {
        if (isWithinSubStatement) {
            localErrors.push(new this.ValidationError(localTraceToString(localTrace, "objectType"), "A SubStatement must not contain a SubStatement"));
        }
        this.validateStatementParts(object, localTrace, localErrors, true);
    } else {
        localErrors.push(new this.ValidationError(localTraceToString(localTrace, "objectType"), "object's objectType did not match a valid option ['Activity', 'Agent', 'Group', 'StatementRef', 'SubStatement']"));
    }
    return localErrors;
};

function validateStatementParts(statement, trace, errors, isSubStatement) {
    var localErrors = errors || [],
        localTrace = trace || "statement",
        statementObjectObjectType,
        whitelistedProperties = ["id", "actor", "verb", "object", "result", "context", "timestamp", "authority", "version", "attachments"];
        
    if (!isNonNullMapObject(statement)) {
        localErrors.push(new this.ValidationError(localTraceToString(localTrace), "Statements must be non-null map objects"));
        return localErrors;
    }
    
    if (!isSubStatement) {
        if (statement.id) {
            if (!this.uuidRegex.test(statement.id)) {
                localErrors.push(new this.ValidationError(localTraceToString(localTrace, "id"), "Id was not a valid UUID"));
            }
        }
    } else {
        whitelistedProperties = ["actor", "verb", "object", "result", "context", "timestamp", "attachments", "objectType"];
    }

    this.validateActor(statement.actor, addPropToTrace(localTrace, "actor"), localErrors);
    this.validateVerb(statement.verb, addPropToTrace(localTrace, "verb"), localErrors);
    this.validateObject(statement.object, addPropToTrace(localTrace, "object"), localErrors, isSubStatement);
    this.validateResult(statement.result, addPropToTrace(localTrace, "result"), localErrors);

    statementObjectObjectType = statement.object && statement.object.objectType ? statement.object.objectType : "Activity";
    this.validateContext(statement.context, addPropToTrace(localTrace, "context"), localErrors, statementObjectObjectType);
    this.validatePropertyIsISO8601String(statement, "timestamp", localTrace, localErrors);

    this.validateAuthority(statement.authority, addPropToTrace(localTrace, "authority"), localErrors);
    this.validateVersion(statement.version, addPropToTrace(localTrace, "version"), localErrors);
    this.validateAttachments(statement.attachments, addPropToTrace(localTrace, "attachments"), localErrors);

    this.validateAbsenceOfNonWhitelistedProperties(statement, whitelistedProperties, localTrace, localErrors);

    return localErrors;
};