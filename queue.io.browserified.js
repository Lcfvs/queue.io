var require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};
void function () {
process.nextTick = (function () {
var canSetImmediate = typeof window !== 'undefined'
&& window.setImmediate;
var canMutationObserver = typeof window !== 'undefined'
&& window.MutationObserver;
var canPost = typeof window !== 'undefined'
&& window.postMessage && window.addEventListener
;
if (canSetImmediate) {
return function (f) { return window.setImmediate(f) };
}
var queue = [];
if (canMutationObserver) {
var hiddenDiv = document.createElement("div");
var observer = new MutationObserver(function () {
var queueList = queue.slice();
queue.length = 0;
queueList.forEach(function (fn) {
fn();
});
});
observer.observe(hiddenDiv, { attributes: true });
return function nextTick(fn) {
if (!queue.length) {
hiddenDiv.setAttribute('yes', 'no');
}
queue.push(fn);
};
}
if (canPost) {
window.addEventListener('message', function (ev) {
var source = ev.source;
if ((source === window || source === null) && ev.data === 'process-tick') {
ev.stopPropagation();
if (queue.length > 0) {
var fn = queue.shift();
fn();
}
}
}, true);
return function nextTick(fn) {
queue.push(fn);
window.postMessage('process-tick', '*');
};
}
return function nextTick(fn) {
setTimeout(fn, 0);
};
})();
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
function noop() {}
process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.binding = function (name) {
throw new Error('process.binding is not supported');
};
// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
throw new Error('process.chdir is not supported');
};
}
},{}],
"events":[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
function EventEmitter() {
this._events = this._events || {};
this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;
// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;
EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;
// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;
// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
if (!isNumber(n) || n < 0 || isNaN(n))
throw TypeError('n must be a positive number');
this._maxListeners = n;
return this;
};
EventEmitter.prototype.emit = function(type) {
var er, handler, len, args, i, listeners;
if (!this._events)
this._events = {};
// If there is no 'error' event listener then throw.
if (type === 'error') {
if (!this._events.error ||
(isObject(this._events.error) && !this._events.error.length)) {
er = arguments[1];
if (er instanceof Error) {
throw er; // Unhandled 'error' event
}
throw TypeError('Uncaught, unspecified "error" event.');
}
}
handler = this._events[type];
if (isUndefined(handler))
return false;
if (isFunction(handler)) {
switch (arguments.length) {
// fast cases
case 1:
handler.call(this);
break;
case 2:
handler.call(this, arguments[1]);
break;
case 3:
handler.call(this, arguments[1], arguments[2]);
break;
// slower
default:
len = arguments.length;
args = new Array(len - 1);
for (i = 1; i < len; i++)
args[i - 1] = arguments[i];
handler.apply(this, args);
}
} else if (isObject(handler)) {
len = arguments.length;
args = new Array(len - 1);
for (i = 1; i < len; i++)
args[i - 1] = arguments[i];
listeners = handler.slice();
len = listeners.length;
for (i = 0; i < len; i++)
listeners[i].apply(this, args);
}
return true;
};
EventEmitter.prototype.addListener = function(type, listener) {
var m;
if (!isFunction(listener))
throw TypeError('listener must be a function');
if (!this._events)
this._events = {};
// To avoid recursion in the case that type === "newListener"! Before
// adding it to the listeners, first emit "newListener".
if (this._events.newListener)
this.emit('newListener', type,
isFunction(listener.listener) ?
listener.listener : listener);
if (!this._events[type])
// Optimize the case of one listener. Don't need the extra array object.
this._events[type] = listener;
else if (isObject(this._events[type]))
// If we've already got an array, just append.
this._events[type].push(listener);
else
// Adding the second element, need to change to array.
this._events[type] = [this._events[type], listener];
// Check for listener leak
if (isObject(this._events[type]) && !this._events[type].warned) {
var m;
if (!isUndefined(this._maxListeners)) {
m = this._maxListeners;
} else {
m = EventEmitter.defaultMaxListeners;
}
if (m && m > 0 && this._events[type].length > m) {
this._events[type].warned = true;
console.error('(node) warning: possible EventEmitter memory ' +
'leak detected. %d listeners added. ' +
'Use emitter.setMaxListeners() to increase limit.',
this._events[type].length);
if (typeof console.trace === 'function') {
// not supported in IE 10
console.trace();
}
}
}
return this;
};
EventEmitter.prototype.on = EventEmitter.prototype.addListener;
EventEmitter.prototype.once = function(type, listener) {
if (!isFunction(listener))
throw TypeError('listener must be a function');
var fired = false;
function g() {
this.removeListener(type, g);
if (!fired) {
fired = true;
listener.apply(this, arguments);
}
}
g.listener = listener;
this.on(type, g);
return this;
};
// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
var list, position, length, i;
if (!isFunction(listener))
throw TypeError('listener must be a function');
if (!this._events || !this._events[type])
return this;
list = this._events[type];
length = list.length;
position = -1;
if (list === listener ||
(isFunction(list.listener) && list.listener === listener)) {
delete this._events[type];
if (this._events.removeListener)
this.emit('removeListener', type, listener);
} else if (isObject(list)) {
for (i = length; i-- > 0;) {
if (list[i] === listener ||
(list[i].listener && list[i].listener === listener)) {
position = i;
break;
}
}
if (position < 0)
return this;
if (list.length === 1) {
list.length = 0;
delete this._events[type];
} else {
list.splice(position, 1);
}
if (this._events.removeListener)
this.emit('removeListener', type, listener);
}
return this;
};
EventEmitter.prototype.removeAllListeners = function(type) {
var key, listeners;
if (!this._events)
return this;
// not listening for removeListener, no need to emit
if (!this._events.removeListener) {
if (arguments.length === 0)
this._events = {};
else if (this._events[type])
delete this._events[type];
return this;
}
// emit removeListener for all listeners on all events
if (arguments.length === 0) {
for (key in this._events) {
if (key === 'removeListener') continue;
this.removeAllListeners(key);
}
this.removeAllListeners('removeListener');
this._events = {};
return this;
}
listeners = this._events[type];
if (isFunction(listeners)) {
this.removeListener(type, listeners);
} else {
// LIFO order
while (listeners.length)
this.removeListener(type, listeners[listeners.length - 1]);
}
delete this._events[type];
return this;
};
EventEmitter.prototype.listeners = function(type) {
var ret;
if (!this._events || !this._events[type])
ret = [];
else if (isFunction(this._events[type]))
ret = [this._events[type]];
else
ret = this._events[type].slice();
return ret;
};
EventEmitter.listenerCount = function(emitter, type) {
var ret;
if (!emitter._events || !emitter._events[type])
ret = 0;
else if (isFunction(emitter._events[type]))
ret = 1;
else
ret = emitter._events[type].length;
return ret;
};
function isFunction(arg) {
return typeof arg === 'function';
}
function isNumber(arg) {
return typeof arg === 'number';
}
function isObject(arg) {
return typeof arg === 'object' && arg !== null;
}
function isUndefined(arg) {
return arg === void 0;
}
},{}],
"queue.io":[function(require,module,exports){(function (process){
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
}).call(this,require('_process'))
},{"_process":1,"events":"events"}]},{},[]);