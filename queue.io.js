/*
Copyright 2014 Lcf.vs
Released under the MIT license
https://github.com/Lcfvs/queue.io
*/
var queue;

queue = (function () {
    'use strict';

    var EventEmitter,
        defer,
        queue,
        iterate,
        Iterator;

    EventEmitter = require('events').EventEmitter;

    defer = (typeof setImmediate === 'function' && setImmediate)
    || (typeof process === 'object' && process.nextTick)
    || function (closure) {
        setTimeout(closure, 0);
    };

    queue = (function () {
        var queue,
            iterate,
            onhandlerdone,
            next;

        queue = function queue(valueEmitter) {
            var instance,
                values,
                handler,
                onevent;

            instance = Object.create(queue.prototype);

            values = [];

            handler = {
                done: false,
                emitter: valueEmitter
            };

            onevent = values.push.bind(values);

            valueEmitter.on('value', onevent);

            instance.iterate = iterate.bind(instance, handler, values);

            return instance;
        };

        queue.prototype = Object.create(EventEmitter.prototype, {
            constructor: {
                value: queue,
                writable: true,
                enumerable: false,
                configurable: true
            }
        });

        iterate = function iterate(handler, iterable) {
            var emitter,
                handlerEmitter,
                ondone,
                onerror;

            emitter = new EventEmitter();

            if (handler.done) {
                ondone.call(handler, emitter, iterable);
            } else {
                handlerEmitter = handler.emitter;

                ondone = onhandlerdone.bind(handler, emitter, iterable);
                onerror = this.emit.bind(this, 'error');

                handlerEmitter.once('done', ondone);
                handlerEmitter.once('error', onerror);
            }

            return emitter;
        };

        onhandlerdone = function onhandlerdone(emitter, iterable) {
            var iterator,
                nextValue;

            this.done = true;

            iterator = Iterator(iterable);

            nextValue = next.bind(emitter, iterator);

            iterator.nextValue = nextValue;

            defer(nextValue);
        };

        next = function next(iterator) {
            var iteration,
                eventName,
                value;

            iteration = iterator.next();

            eventName = iteration.done
                ? 'done'
                : 'value';

            value = iteration.value;

            this.emit(eventName, value, iterator.nextValue);
        };

        return queue;
    }());

    iterate = (function () {
        var iterate,
            append;

        iterate = function iterate(values) {
            var valueEmitter,
                iterable,
                array,
                iterator;

            valueEmitter = new EventEmitter();
            iterable = queue(valueEmitter);
            array = Array.prototype.slice.call(values, 0);

            iterator = iterable.iterate();

            defer(append, valueEmitter, array);

            return iterator;
        };

        append = function append(valueEmitter, values) {
            var index,
                length,
                value;

            index = 0;
            length = values.length;

            for (; index < length; index += 1) {
                value = values[index];

                valueEmitter.emit('value', value);
            }

            valueEmitter.emit('done');
        };

        return iterate;
    }());

    Iterator = (function () {
        var Iterator,
            next;

        Iterator = function Iterator(iterable) {
            var instance,
                isIterator,
                iterator,
                iteration;

            instance = Object.create(Iterator.prototype);

            iteration = {
                index: 0
            };

            instance.next = next.bind(iteration, iterable);

            return instance;
        };

        next = function next(iterable) {
            var index,
                entry;

            index = this.index;
            this.index += 1;

            entry = iterable[index];

            return {
                value: entry,
                done: index >= iterable.length
            };
        };

        return Iterator;
    }());

    queue.iterate = iterate;

    if (typeof module === 'object' && module.exports !== undefined) {
        module.exports = queue;
    } else if (typeof define == 'function' && typeof define.amd == 'object') {
        define(function (require, exports, module) {
            module.exports = queue;
        });
    } else {
        this.queue = queue;
    }

    return queue;
}).call(this || {});
