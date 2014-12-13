# queue.io

[![Actual version published on NPM](https://badge.fury.io/js/queue.io.png)](https://www.npmjs.org/package/queue.io)
[![npm module downloads per month](http://img.shields.io/npm/dm/queue.io.svg)](https://www.npmjs.org/package/queue.io)
[![npm module dependencies](https://david-dm.org/Lcfvs/queue.io.png)](https://www.npmjs.org/package/queue.io)

An events based queue iteration JavaScript module, under the MIT license.


## Install :

`npm install queue.io`


## Reference :

### Create an iterable :

```JavaScript
var iterable;

iterable = queue(eventEmitter, [eventName = 'value']);
// or
iterable = queue.enqueue(arrayLike, [eventName = 'value']);
```

#### Notes :
* An iterable is an object that awaits 2 event types :
  * eventName to fill the iterable
  * `done` (once) to indicate a done state to all the iterable iterators
* `queue.enqueue(arrayLike)` creates an auto-done iterable, it must be an array-like object<br />
  (Array, DOM NodeList, ...)

### Directions :

* `queue.NEXT` : used to indicate the direction to the current iterator, first -> last
* `queue.PREV` : used to indicate the direction to the current iterator, last -> first

### Create an iterator :

```JavaScript
var iterator;

iterator = iterable.iterate([direction = queue.NEXT]);
```

### Iterator events :

* `eventName` :
  * `value'    : the current value
  * `next`     : a method to jump to the next iteration
  * `iterable` : the current iterable

* `done` :
  * `iterable` : the current iterable

#### Note :
* `eventName` is related to the `eventName` passed at the iterable creation (default : 'value')

### Fill a queue :

```JavaScript
var EventEmitter,
    queue,
    eventEmitter,
    iterable;

EventEmitter = require('events').EventEmitter;
queue = require('queue.io');

eventEmitter = new EventEmitter();
iterable = queue(eventEmitter);

eventEmitter.emit('value', 1);
eventEmitter.emit('value', 2);
eventEmitter.emit('value', 3);

eventEmitter.emit('done');
```

### Listen an iterator :

```JavaScript
var iterator;

iterator = iterable.iterate();

iterator.on('value', function onvalue(value, next, iterable) {
    console.log('Iteration value = %d on :', value, iterable);

    next();
});

iterator.on('done', function (iterable) {
    console.log('Iterator done on :', iterable);
});
```

#### Note :
* The iterator creation isn't dependent to the iterable state, then you can create them before and/or after the iterable done state


## Requirements :

* ES5 support
* [EventEmitter](https://github.com/Wolfy87/EventEmitter)


## Browser-side, without module loader :

You need to have a scoped property that contains EventEmitter, like `window.events.EventEmitter` or `window.EventEmitter`

```HTML
<script src="https://raw.githubusercontent.com/Wolfy87/EventEmitter/master/EventEmitter.min.js"></script>
<script src="https://raw.githubusercontent.com/Lcfvs/queue.io/master/queue.io.min.js"></script>
<script src="your-script-path.js"></script>
```