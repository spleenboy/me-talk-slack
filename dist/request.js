"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _ = require('lodash');
var EventEmitter = require('events');

module.exports = function (_EventEmitter) {
    _inherits(Request, _EventEmitter);

    function Request() {
        var id = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

        _classCallCheck(this, Request);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Request).call(this));

        _this.id = id || _.uniqueId();

        // The number of times this request has been asked.
        _this.asked = 0;

        // The questions to ask
        _this.questions = [];

        // The responses of successful reads
        _this.responses = [];

        // The parsers used to process a response's input
        _this.processors = [];
        return _this;
    }

    _createClass(Request, [{
        key: 'getQuestions',
        value: function getQuestions(exchange) {
            var _this2 = this;

            return new Promise(function (resolve, reject) {
                resolve(_this2.questions);
            });
        }
    }, {
        key: 'getResponses',
        value: function getResponses(exchange) {
            var _this3 = this;

            return new Promise(function (resolve, reject) {
                resolve(exchange.valid ? _this3.responses : []);
            });
        }

        // Returns an array of string statements, pulled randomly from
        // the available questions. This is usually step #1 in processing a request.

    }, {
        key: 'ask',
        value: function ask(exchange) {
            var _this4 = this;

            return this.getQuestions(exchange).then(function (questions) {
                exchange.write(questions);
                _this4.asked++;
                return exchange;
            });
        }

        // Reads and processes input. Returns a Response object.
        // Typically step #2, after a request has been asked.
        // This part of the request involves parsing and validating
        // the input through one or more processors.

    }, {
        key: 'read',
        value: function read(exchange) {
            var _this5 = this;

            this.processors.forEach(function (process) {
                try {
                    process.apply(exchange);
                } catch (e) {
                    console.error("Processor error", e, process);
                }
            });

            this.emit(exchange.valid ? 'valid' : 'invalid', exchange);

            return this.getResponses(exchange).then(function (responses) {
                if (responses) {
                    exchange.write(responses);
                }

                if (!exchange.valid) {
                    _this5.ask(exchange);
                }

                return exchange;
            });
        }
    }], [{
        key: 'emits',
        get: function get() {
            return ['valid', 'invalid'];
        }
    }]);

    return Request;
}(EventEmitter);