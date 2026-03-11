/**
 * @class StackQueue
 * @classdesc Double-stack queue system for use in the priority queue, used by the message handler.
 */
export default class StackQueue<T> {
	/** Incoming stack for queued message entries. When messages are dequeued and the outStack is empty, this stack is flipped and emptied into the outStack. */
	inStack: Array<T>;
	/** Outgoing stack for queued message entries. Messages are dequeued from this outgoing stack, drawing from inStack if necessary. */
	outStack: Array<T>;

	/** @constructor */
	constructor() {
		this.inStack = [];
		this.outStack = [];
	}

	/** Pushes an object into the queue. O(1) operation. */
	enqueue(value: T) {
		this.inStack.push(value);
	}

	/** Pops an object from the queue. O(1) operation if outStack.length > 0, otherwise O(n). */
	dequeue(): T {
		if (this.size() !== 0) {
			if (this.outStack.length === 0) {
				while (this.inStack.length > 0) {
					this.outStack.push(this.inStack.pop());
				}
			}
			const out = this.outStack.pop();
			if (out) {
				return out;
			}
		}
	}

	/** Clears the inStack and outStack of the StackQueue. */
	clear() {
		this.inStack.length = 0;
		this.outStack.length = 0;
	}

	/** Size of the queue. */
	size(): number {
		return this.inStack.length + this.outStack.length;
	}
}
