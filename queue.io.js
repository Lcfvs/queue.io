/*
Copyright 2014 Lcf.vs
Released under the MIT license
https://github.com/Lcfvs/queue.io
*/

var queue;

queue = (function (global) {
    'use strict';

    var main;

    main = function main(require, exports, module) {
        var EventEmitter,
            originalGlobalValue,
            defer,
            queue,
            onqueuevalue,
            onqueuedone,
            Iterator;

        EventEmitter = require('events').EventEmitter;

        originalGlobalValue = typeof exports === 'object'
        && exports.queue;

        defer = (typeof setImmediate === 'function' && setImmediate)
        || (typeof process === 'object' && process.nextTick)
        || function (closure) {
            setTimeout(closure, 0);
        };

        queue = function queue(emitter, event) {
            var iterable,
                values,
                eventName,
                handler,
                onvalue,
                ondone;

            iterable = Object.create(queue.prototype);

            values = [];

            eventName = event
            || 'value';

            handler = {
                done: false
            };

            onvalue = onqueuevalue.bind(values);
            ondone = onqueuedone.bind(emitter, handler, eventName, onvalue);

            emitter.on(eventName, onvalue);
            emitter.once('done', ondone);

            iterable.iterate = function iterate(direction) {
                var iterator;

                if (direction === queue.PREV) {
                    values.reverse();
                }

                iterator = Iterator(values, eventName, iterable);

                if (handler.done) {
                    defer(values.next);
                } else {
                    emitter.once('done', values.next);
                }

                return iterator;
            };

            return iterable;
        };

        queue.prototype = Object.create(EventEmitter.prototype, {
            constructor: {
                value: queue,
                writable: true,
                enumerable: false,
                configurable: true
            }
        });

        queue.enqueue = function enqueue(values, eventName) {
            var index,
                length,
                valueEmitter,
                iterable,
                value;

            index = 0;
            length = values.length;
            valueEmitter = new EventEmitter();
            iterable = queue(valueEmitter, eventName);

            for (; index < length; index += 1) {
                value = values[index];

                valueEmitter.emit(eventName || 'value', value);
            }

            valueEmitter.emit('done');

            return iterable;
        };

        onqueuevalue = function onqueuevalue(value) {
            this.push(value);
        };

        onqueuedone = function onqueuedone(handler, event, listener) {
            this.removeListener(event, listener);

            handler.done = true;
        };

        Iterator = function Iterator(values, event, iterable) {
            var index,
                iterator,
                next;

            index = 0;
            iterator = new EventEmitter();

            next = function next() {
                defer(function () {
                    if (index >= values.length) {
                        iterator.emit('done', iterable);
                    } else {
                        iterator.emit(event, values[index], next, iterable);
                    }

                    index += 1;
                });
            };

            values.next = next;

            return iterator;
        };

        Object.defineProperty(queue, 'NEXT', {
            value: 1,
            iterable: true
        });

        Object.defineProperty(queue, 'PREV', {
            value: -1,
            iterable: true
        });

        queue.noConflict = function noConflict() {
            exports.queue = originalGlobalValue;

            return queue;
        };

        return queue;
    };

    if (typeof define == 'function' && typeof define.amd == 'object') {
        define(main);
    } else if (typeof module === 'object' && typeof module.exports === 'object') {
        return module.exports = main(require);
    }

    return main(function () {
        var EventEmitter;

        EventEmitter = global.events
            ? global.events.EventEmitter
            : global.EventEmitter;

        if (!EventEmitter) {
            throw new Error('Unable to find EventEmitter');
        }

        return {
            EventEmitter: EventEmitter
        };
    });
}(this));