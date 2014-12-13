void function () {
    'use strict';
    
    var EventEmitter,
        fs,
        queue,
        enqueue,
        readdir,
        stat,
        eventEmitter,
        readdirCallback,
        onfile,
        statCallback;
    
    EventEmitter = require('events').EventEmitter;
    fs = require('fs');
    queue = require('queue.io');
    
    enqueue = queue.enqueue;
    readdir = fs.readdir;
    stat = fs.stat;
    
    eventEmitter = new EventEmitter();
    
    readdirCallback = function readdirCallback(error, files) {
        var fileIterator;
        
        if (error) {
            console.log(error);
            
            process.exit();
        }
        
        // queue.enqueue demo
        fileIterator = enqueue(files, 'file').iterate();
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
    
    void function () { // the real demo
        var onstats,
            dirStats,
            statIterator;
        
        onstats = function onstats(stats, next) {
            console.log(stats);
            
            next();
        };
            
        dirStats = queue(eventEmitter, 'stats');
        statIterator = dirStats.iterate();// try me with a queue.PREV argument
        
        statIterator.on('stats', onstats);
        statIterator.on('done', console.log.bind(console, 'statIterator is done'));
        
        readdir(__dirname, readdirCallback);
    }();
}();