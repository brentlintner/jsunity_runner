var exception = require('./exception'),
    _listeners = {};

function _on(eventType, listener, scope, oneTime) {
    if (!eventType) {
        throw "eventType must be truthy";
    }
    _listeners[eventType] = _listeners[eventType] || [];
    _listeners[eventType].push([listener, scope, oneTime]);
}

module.exports = {
    on: function (eventType, listener, scope) {
        _on(eventType, listener, scope, false);
    },

    once: function (eventType, listener, scope) {
        _on(eventType, listener, scope, true);
    },

    trigger: function (eventType, args, sync) {
        args = args || [];
        sync = sync || false;

        if (!_listeners || !_listeners[eventType]) {
            return;
        }

        var i, listenerList = _listeners[eventType];

        function process(i) {
            listenerList[i][0].apply(listenerList[i][1], args);
            if (listenerList[i][2] === true) {
                listenerList.splice(i, 1);
            }
        }

        for (i = 0; i < listenerList.length; i++) {
            try {
                if (sync) {
                    process(i);
                } else {
                    setTimeout((function (x) {
                        return function () {
                            try {
                                process(x);
                            } catch (e) {
                                exception.handle(e);
                            }
                        };
                    }(i)), 1);
                }
            } catch (e) {
                exception.handle(e);
            }
        }
    },

    eventHasSubscriber: function (eventType) {
        return _listeners[eventType] ? true : false;
    },

    getEventSubscribers: function (eventType) {
        return _listeners[eventType];
    },

    clear: function (eventType) {
        if (eventType) {
            delete _listeners[eventType];
        } else {
            _listeners = null;
            _listeners = {};
        }
    }
};
