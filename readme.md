queue.io
========

An events based queue iteration JavaScript module, under the MIT license.


Install :
---------

`npm install queue.io`


Usage :
-------

```JavaScript
void function () {
    'use strict';

    var EventEmitter,
        queue,
        valueEmitter,
        iterable,
        iterator;

    EventEmitter = require('events').EventEmitter;
    queue = require('queue.io');

    // an emitter that receives the values
    valueEmitter = new EventEmitter();
    // an iterable instance
    iterable = queue(valueEmitter);
    // a values iterator (it awaits the 'done' event on the valueEmitter)
    iterator = iterable.iterate();

    // listening the iteration's values
    iterator.on('value', function onvalue(value, next) {
        console.log('iteration value = %d', value);

        next();
    });

    // listening the iteration's end
    iterator.on('done', function ondone() {
        console.log('iteration done');
    });

    // adding values
    valueEmitter.emit('value', 1);
    valueEmitter.emit('value', 2);
    valueEmitter.emit('value', 3);
    
    // sends the values list end
    valueEmitter.emit('done');
}();
```


Iterate on an array-like object :
---------------------------------

```JavaScript
void function () {
    'use strict';

    var iterate,
        iterator;

    iterate = require('queue.io').iterate;

    iterator = iterate([1, 2, 3]);

    iterator.on('value', function onvalue(value, next) {
        console.log('iteration value = %d', value);

        next();
    });

    iterator.on('done', function ondone() {
        console.log('iteration done');
    });
}();
```


Requirements :
--------------

- <b>ES5</b> support
- <b>events.EventEmitter</b>
