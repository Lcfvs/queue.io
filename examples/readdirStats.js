void function () {
    'use strict';
    
    var EventEmitter,
        fs,
        Queue,
        enqueue,
        readdir,
        stat,
        eventEmitter,
        readdirCallback,
        onfile,
        statCallback;
    
    EventEmitter = require('events').EventEmitter;
    fs = require('fs');
    Queue = require('queue.io');
    
    readdir = fs.readdir;
    stat = fs.stat;
    
    eventEmitter = new EventEmitter();
    
    readdirCallback = function readdirCallback(error, files) {
        var fileIterator;
        
        if (error) {
            console.log(error);
            
            process.exit();
        }
        
        // Queue.from demo
        fileIterator = Queue.from(files, 'file').iterate();
        fileIterator.on('file', onfile);
        fileIterator.on('done', eventEmitter.emit.bind(eventEmitter, 'done'));
    };
    
    onfile = function onfile(filename, next) {
        stat(filename, statCallback.bind(null, next));
    };
    
    statCallback = function statCallback(next, error, fileStats) {
        if (error) {
            console.log(error);
            
            process.exit(1);
        }
        
        eventEmitter.emit('stats', fileStats);
        
        next();
    };
    
    void function () { // the queue demo
        var onstats,
            queue,
            statIterator;
        
        onstats = function onstats(stats, next) {
            console.log(stats);
            
            next();
        };
            
        queue = Queue(eventEmitter, 'stats');
        statIterator = queue.iterate();// try me with a Queue.PREV argument
        
        statIterator.on('stats', onstats);
        statIterator.on('done', console.log.bind(console, 'statIterator is done'));
        
        readdir(__dirname, readdirCallback);
    }();
}();