# queue.io

[![Actual version published on NPM](https://badge.fury.io/js/queue.io.png)](https://www.npmjs.org/package/queue.io)
[![npm module downloads per month](http://img.shields.io/npm/dm/queue.io.svg)](https://www.npmjs.org/package/queue.io)
[![npm module dependencies](https://david-dm.org/Lcfvs/queue.io.png)](https://www.npmjs.org/package/queue.io)

An events based queue iteration JavaScript module, under the MIT license.

This tool is useful when in combination of your asynchronous operations, when you need to wait the entire queue to create some iterators on it.

<b>queue.io</b> offers a way to make it simply, to create some iterators after and/or before the queue is entire and you can invert the iteration direction, before/after too (separately, for each iterator, for a same queue)


## Install :

`npm install queue.io`


## Reference :

### Create an queue :

```JavaScript
var queue;

queue = Queue(eventEmitter, [eventName = 'value']);
// or
queue = Queue.from(arrayLike, [eventName = 'value']);
```

#### Notes :
* The eventEmitter, first argument of `Queue(eventEmitter, [eventName = 'value'])`, awaits 2 event types :
  * `eventName` to fill the queue
  * `done` (once) to indicate a done state to all the queue iterators
* When eventEmitter receives the done event, it removes the value listeners and starts the iterations, on each iterator, if any
* `Queue.from(arrayLike)` creates an auto-done queue, it must be an array-like object<br />
  (Array, DOM NodeList, ...)
* An error event sent to the eventEmitter is relayed on the queue itself

### Directions :

* `Queue.NEXT` : used to indicate the direction to the current iterator, first -> last
* `Queue.PREV` : used to indicate the direction to the current iterator, last -> first

### Create an iterator :

```JavaScript
var iterator;

iterator = queue.iterate([direction = queue.NEXT]);
```

### Iterator events :

* `eventName` :
  * `value'    : the current value
  * `next`     : a method to jump to the next iteration
  * `queue` : the current queue

* `done` :
  * `queue` : the current queue

#### Note :
* `eventName` is related to the `eventName` passed at the queue creation (default : 'value')

### Fill a queue :

```JavaScript
var EventEmitter,
    Queue,
    eventName,
    eventEmitter,
    queue;

EventEmitter = require('events').EventEmitter;
Queue = require('queue.io');

eventName = 'value'; // the default event name
eventEmitter = new EventEmitter();
queue = Queue(eventEmitter, eventName);

eventEmitter.emit(eventName, 1);
eventEmitter.emit(eventName, 2);
eventEmitter.emit(eventName, 3);

eventEmitter.emit('done');
```

### Listen an iterator :

```JavaScript
var iterator;

iterator = queue.iterate();

iterator.on(eventName, function onvalue(value, next, queue) {
    console.log('Iteration value = %d on :', value, queue);

    next();
});

iterator.on('done', function (queue) {
    console.log('Iterator done on :', queue);
});
```

#### Note :
* The iterator creation isn't dependent to the queue state, then you can create them before and/or after the queue done state


## Requirements :

* ES5 support


## Browser-side :

Simply use the browserified version

```HTML
<script src="https://raw.githubusercontent.com/Lcfvs/queue.io/master/queue.io.browserified.js"></script>
<script>
var EventEmitter,
    Queue;

EventEmitter = require('events').EventEmitter;
Queue = require('queue.io');

// ...
</script>
```