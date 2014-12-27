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
            NEXT,
            PREV,
            originalGlobalValue,
            defer,
            Queue,
            parseDirection,
            parseEmitter,
            parseEvent,
            parse,
            run,
            Iterator;

        EventEmitter = require('events').EventEmitter;

        NEXT = {};
        PREV = {};

        Object.freeze(NEXT);
        Object.freeze(PREV);

        originalGlobalValue = typeof exports === 'object'
        && exports;

        defer = (typeof setImmediate === 'function' && setImmediate)
        || (typeof process === 'object' && process.nextTick)
        || function (closure) {
            setTimeout(closure, 0);
        };

        Queue = function Queue(emitter, event) {
            var queue,
                sources,
                handler;

            queue = this instanceof Queue
                ? this
                : Object.create(Queue.prototype);

            sources = [];

            handler = {
                pending: 0,
                emitter: new EventEmitter(),
                event: parseEvent(event, emitter),
                queue: queue,
                sources: sources,
                values: []
            };

            queue.iterate = function iterate(direction) {
                var values,
                    iterator;

                values = handler.values;
                iterator = Iterator(values, handler.event, queue, direction);

                if (handler.isTicked && !handler.pending) {
                    defer(values.next);
                } else {
                    handler.emitter.once('done', values.next);
                }

                return iterator;
            };

            queue.append = function append(queue, event, direction) {
                var source;

                if (!handler.isTicked || handler.pending) {
                    source = parse(handler, queue, event, direction);

                    sources.push(source);

                    if (sources.length === 1) {
                        source.run();
                    }
                }

                return queue;
            };

            queue.listen = function listen(queue, event, direction) {
                var source;

                if (!handler.isTicked || handler.pending) {
                    source = parse(handler, queue, event, direction);

                    source.run();
                }

                return queue;
            };

            queue.intercept = function intercept(callback, event, direction) {
                if (!handler.isTicked || handler.pending) {
                    handler.pending += 1;

                    return function (error, values) {
                        if (error) {
                            return handler.queue.emit('error', error);
                        }

                        if (values instanceof Queue) {
                            callback.call(handler.queue, values, event, direction);
                        } else if (values instanceof EventEmitter) {
                            callback.call(handler.queue, Queue(values, event), event, direction);
                        } else {
                            callback.call(handler.queue, Queue.from(values), parseDirection(event, direction));
                        }

                        handler.pending -= 1;
                    };
                }
            };

            if (parseEmitter(emitter)) {
                queue.listen(emitter, event);
            }

            defer(function () {
                handler.isTicked = true;

                if (!handler.pending) {
                    handler.emitter.emit('done');
                }
            });

            return queue;
        };

        Queue.prototype = Object.create(EventEmitter.prototype, {
            constructor: {
                value: Queue,
                writable: true,
                configurable: true
            }
        });

        Queue.from = function from(values, event) {
            var index,
                length,
                emitter,
                eventName,
                queue;

            index = 0;
            length = values.length;
            emitter = new EventEmitter();
            eventName = parseEvent(event);
            queue = Queue(emitter, eventName);

            for (; index < length; index += 1) {
                emitter.emit(eventName, values[index]);
            }

            emitter.emit('done');

            return queue;
        };

        parseDirection = function parseDirection(direction, extra) {
            return direction === NEXT
            || direction === PREV
                ? direction
                : extra === NEXT
                || extra === PREV
                    ? extra
                    : NEXT;
        };

        parseEmitter = function parseEmitter(emitter) {
            if (emitter instanceof EventEmitter) {
                return emitter;
            }
        };

        parseEvent = function parseEvent(event, extra) {
            return typeof event === 'string'
                ? event
                : typeof extra === 'string'
                    ? extra
                    : 'value';
        };

        parse = function parse(handler, emitter, event, direction) {
            handler.pending += 1;

            return {
                direction: parseDirection(direction, event),
                emitter: parseEmitter(emitter),
                event: parseEvent(event),
                handler: handler,
                run: run
            };
        };

        run = function run() {
            var source,
                emitter,
                event,
                handler,
                queue,
                sources,
                values,
                onvalue;

            source = this;

            emitter = source.emitter;
            event = source.event;
            handler = source.handler;

            queue = handler.queue;
            sources = handler.sources;
            values = handler.values;

            if (emitter instanceof Queue) {
                emitter = emitter.iterate(source.direction);
            }

            onvalue = function onvalue(value, next) {
                values.push(value);

                if (next) {
                    next();
                }
            };

            emitter.on(event, onvalue);

            emitter.once('done', function () {
                var sources,
                    next;

                emitter.removeListener(event, onvalue);

                handler.pending -= 1;
                sources = handler.sources;

                if (sources[0] === source) {
                    sources.shift();

                    next = handler.sources[0];

                    if (next) {
                        next.run();
                    }
                }

                defer(function () {
                    if (handler.isTicked && !handler.pending && !handler.sources.length) {
                        handler.emitter.emit('done');
                    }
                });
            });

            emitter.once('error', queue.emit.bind(queue, 'error'));
        };

        Iterator = function Iterator(values, event, queue, direction) {
            var index,
                iterator,
                getNext,
                iterationValues;

            index = 0;
            iterator = new EventEmitter();

            getNext = function getNext() {
                var next,
                    isReached;

                next = function next() {
                    var args;

                    if (!iterationValues) {
                        iterationValues = values.slice(0);

                        if (direction === PREV) {
                            iterationValues.reverse();
                        }
                    }

                    if (!isReached) {
                        args = Array.prototype.slice.call(arguments, 0);

                        defer(function () {
                            var value;

                            if (index >= iterationValues.length) {
                                iterator.emit('done', queue);
                            } else {
                                value = iterationValues[index];

                                if (typeof value === 'function') {
                                    value = (function() {
                                        return value;
                                    }());
                                }

                                args.unshift(event, value, getNext(), queue);

                                iterator.emit.apply(iterator, args);
                            }

                            index += 1;
                        });

                        isReached = true;
                    }
                };

                return next;
            };

            values.next = getNext();

            return iterator;
        };

        Object.defineProperty(Queue, 'NEXT', {
            value: NEXT,
            enumerable: true
        });

        Object.defineProperty(Queue, 'PREV', {
            value: PREV,
            enumerable: true
        });

        Queue.noConflict = function noConflict() {
            module.exports = originalGlobalValue;

            return Queue;
        };

        return Queue;
    };

    if (typeof define === 'function' && define.amd) {
        define(main);
    } else if (typeof module === 'object' && module.exports) {
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