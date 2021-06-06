/*
 * Undo.js - A undo/redo framework for JavaScript
 * 
 * http://jzaefferer.github.com/undo
 *
 * Copyright (c) 2011 Jörn Zaefferer
 * 
 * MIT licensed.
 */

// based on Backbone.js' inherits	
var ctor = function(){};
var inherits = function(parent, protoProps) {
	var child;

	if (protoProps && protoProps.hasOwnProperty('constructor')) {
		child = protoProps.constructor;
	} else {
		child = function(){ return parent.apply(this, arguments); };
	}

	ctor.prototype = parent.prototype;
	child.prototype = new ctor();
	
	if (protoProps) extend(child.prototype, protoProps);
	
	child.prototype.constructor = child;
	child.__super__ = parent.prototype;
	return child;
};

function extend(target, ref) {
	var name, value;
	for ( name in ref ) {
		value = ref[name];
		if (value !== undefined) {
			target[ name ] = value;
		}
	}
	return target;
};

var Undo = {
	version: '0.1.15'
};

Undo.Stack = function() {
	this.commands = [];
	this.stackPosition = -1;
	this.savePosition = -1;
};

extend(Undo.Stack.prototype, {
	execute: async function(command) {
		this._clearRedo();
		await command.execute();
		this.commands.push(command);
		this.stackPosition++;
		this.changed();
	},
	undo: async function() {
		if (this.canUndo()) {
			await this.commands[this.stackPosition].undo();
			this.stackPosition--;
			this.changed();
		}
	},
	canUndo: function() {
		return this.stackPosition >= 0;
	},
	redo: function() {
		this.stackPosition++;
		this.commands[this.stackPosition].redo();
		this.changed();
	},
	canRedo: function() {
		return this.stackPosition < this.commands.length - 1;
	},
	save: function() {
		this.savePosition = this.stackPosition;
		this.changed();
	},
	dirty: function() {
		return this.stackPosition != this.savePosition;
	},
	_clearRedo: function() {
		// TODO there's probably a more efficient way for this
		this.commands = this.commands.slice(0, this.stackPosition + 1);
	},
	changed: function() {
		// do nothing, override
	}
});

Undo.Command = function(name) {
	this.name = name;
}

var up = new Error("override me!");

extend(Undo.Command.prototype, {
	execute: function() {
		throw up;
	},
	undo: function() {
		throw up;
	},
	redo: function() {
		this.execute();
	}
});

Undo.Command.extend = function(protoProps) {
	var child = inherits(this, protoProps);
	child.extend = Undo.Command.extend;
	return child;
};
	
export default Undo;