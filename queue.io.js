/*
Copyright 2014 Lcf.vs
Released under the MIT license
https://github.com/Lcfvs/Queue.io
*/
var Queue;

Queue = (function (global) {
    'use strict';

    var main;

    main = function main(require, exports, module) {
        var EventEmitter,
            originalGlobalValue,
            defer,
            Queue,
            onQueuevalue,
            onQueuedone,
            Iterator;

        EventEmitter = require('events').EventEmitter;

        originalGlobalValue = typeof exports === 'object'
        && exports;

        defer = (typeof setImmediate === 'function' && setImmediate)
        || (typeof process === 'object' && process.nextTick)
        || function (closure) {
            setTimeout(closure, 0);
        };

        Queue = function Queue(emitter, event) {
            var queue,
                values,
                eventName,
                handler,
                onvalue,
                ondone,
                onerror;

            queue = this instanceof Queue
                ? this
                : Object.create(Queue.prototype);

            values = [];

            eventName = event
            || 'value';

            handler = {
                done: false
            };

            onvalue = onQueuevalue.bind(values);
            ondone = onQueuedone.bind(emitter, handler, eventName, onvalue);
            onerror = queue.emit.bind(queue, 'error');

            emitter.on(eventName, onvalue);
            emitter.once('done', ondone);
            emitter.once('error', onerror);

            queue.iterate = function iterate(direction) {
                var iterator;

                iterator = Iterator(values, eventName, queue, direction);

                if (handler.done) {
                    defer(values.next);
                } else {
                    emitter.once('done', values.next);
                }

                return iterator;
            };

            return queue;
        };

        Queue.prototype = Object.create(EventEmitter.prototype, {
            constructor: {
                value: Queue,
                writable: true,
                configurable: true
            }
        });

        Queue.from = function from(values, eventName) {
            var index,
                length,
                valueEmitter,
                queue,
                value;

            index = 0;
            length = values.length;
            valueEmitter = new EventEmitter();
            queue = Queue(valueEmitter, eventName);

            for (; index < length; index += 1) {
                value = values[index];

                valueEmitter.emit(eventName || 'value', value);
            }

            valueEmitter.emit('done');

            return queue;
        };

        onQueuevalue = function onQueuevalue(value) {
            this.push(value);
        };

        onQueuedone = function onQueuedone(handler, event, listener) {
            this.removeListener(event, listener);

            handler.done = true;
        };

        Iterator = function Iterator(values, event, queue, direction) {
            var index,
                iterator,
                next,
                iterationValues;

            index = 0;
            iterator = new EventEmitter();

            next = function next() {
                if (!iterationValues) {
                    iterationValues = values.slice(0);

                    if (direction === Queue.PREV) {
                        iterationValues.reverse();
                    }
                }
                
                defer(function () {
                    if (index >= iterationValues.length) {
                        iterator.emit('done', queue);
                    } else {
                        iterator.emit(event, iterationValues[index], next, queue);
                    }

                    index += 1;
                });
            };

            values.next = next;

            return iterator;
        };

        Object.defineProperty(Queue, 'NEXT', {
            value: {},
            enumerable: true
        });

        Object.defineProperty(Queue, 'PREV', {
            value: {},
            enumerable: true
        });

        Queue.noConflict = function noConflict() {
            module.exports = originalGlobalValue;

            return Queue;
        };

        return Queue;
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