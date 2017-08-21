// Utils - utility functions used across classes
var eases = require("eases");
import { basename } from "path";

var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
    "/": "&#x2F;",
};

module.exports = {
    capitalizeFirstLetter: function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },

    isObject: function(obj) {
        return obj !== null && typeof(obj) === "object";
    },

    /**
     * returns interpolation between two numbers based on some easing function
     *
     * @param {number} a - first number
     * @param {number} b - second number
     * @param {number} [t = 0.5] - scalar [0, 1]
     * @param {string|function} [easing = "linear"] - the name of the easing function in 'eases' module, or a function that acts as a easing function on t
     * @returns {number} linearly interpolated between a and b according to scalar t
     */
    ease:function(a, b, t, easing) {
        if(typeof(b) === "string") {
            easing = b;
            t = a;
            a = 0;
            b = 1;
        }

        easing = easing || "linear";

        if(typeof(easing) === "function") {
            t = easing(t);
        }
        else {
            if(!eases[easing]) {
                throw new Error("Easing '" + easing + "' does not exist!");
            }
            t = eases[easing].call(eases, t);
        }

        return a * (1 - t) + b * t;
    },

    /**
     * Eases a number between 0 to 1 from 0, to 1, and back to 0
     * @param {number} x - number to ease, must range from [0, 1]
     * @return {number} the easing up then down, will range from [0, 1]
     */
    updown: function(x) {
        return -4*(-1+x)*x;
    },

    /**
     * Takes a string and tries to convert it to the primitive it looks like
     *
     * @param {string} str - string to try to convert
     * @returns {[type]} [description]
     */
    unstringify: function(str) {
        switch(str.toUpperCase()) { // check for bools
            case "TRUE":
                return true;
            case "FALSE":
                return false;
            case "NULL":
                return null;
        }

        // check if number
        if(!isNaN(str)) {
            return parseFloat(str);
        }

        return str; // looks like a string after all
    },

    /**
     * Validates that a string is a valid url
     *
     * @param {String} str - string to try to validate
     * @returns {Boolean} true if looks like a valid url, false otherwise
     */
    validateURL: function(str) {
        var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

        return regexp.test(str);
    },

    /**
     * Escapes a string to be displayed in HTML, but not AS HTML.
     * @param {String} str - the string to escape
     * @returns {String} str now escaped
     */
    escapeHTML: function(str) {
        return String(str).replace(/[&<>"'\/]/g, function(s) {
            return entityMap[s];
        });
    },

    /**
     * Traverses down a tree like object via list of keys
     *
     * @param  {Object} obj - tree like object with nested properties to traverse
     * @param  {Array.<string>} keys - list of keys to traverse, in order
     * @return {*} whatever value is at the end of the keys path
     */
    traverse: function(obj, keys) {
        for(var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if(Object.hasOwnProperty.call(obj, key)) {
                obj = obj[key];
            }
            else {
                throw new Error("Key '" + key + "' not found in object to traverse");
            }
        }

        return obj;
    },

    /**
     * Requires all files matching a given regex to a path and returns the paths
     * @param {string} path the string path to the file(s) to dynamically require
     * @param {RegExp} regex the regex used to match files in the path
     */
    getFilesIn: function(path, regex) {
    },
};
