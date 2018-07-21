define([
    'backbone',
    'underscore',
    'models/Modal',
], function(Backbone, _, Modal) {
    var MessageBus = {};
    _.extend(MessageBus, Backbone.Events);
    MessageBus.on('show', function(content) {
        Modal.set('content', content);
        Modal.set('open', true);
    });
    return MessageBus;
});