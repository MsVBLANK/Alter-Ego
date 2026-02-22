import { Collection } from 'discord.js';
import StackQueue from './StackQueue.ts';

/**
 * @class PriorityQueue
 * @classdesc Five-priority queue system for use by the message handler.
 * @constructor
 */
export default class PriorityQueue {
	/** Order of queues given as an array of strings. */
	priorityOrder: ['mod', 'tell', 'mechanic', 'log', 'spectator'];
	/** Separate StackQueues to represent each different priority level. */
	queues: Collection<PriorityQueuePriority, StackQueue<MessageQueueEntry>>;
	/** Separate StackQueues to represent each different destination. */
	channelQueues: Collection<string, StackQueue<MessageQueueEntry>>;
	/** Whether or not the PriorityQueue is "Firing", that is, whether or not it is being fully dequeued by the Message Handler. */
	firing: boolean;

	constructor() {
		this.priorityOrder = ['mod', 'tell', 'mechanic', 'log', 'spectator'];
		this.channelQueues = new Collection();
		this.queues = new Collection();
		for (let i = 0; i < this.priorityOrder.length; i++) {
			this.queues.set(this.priorityOrder[i], new StackQueue());
		}
		this.firing = false;
	}

	/**
	 * Enqueues a given MessageQueueEntry on a StackQueue of the given priority.
	 * If the given priority doesn't exist, this function will silently swallow MessageQueueEntry.
	 * O(1) operation.
	 */
	enqueue(message: MessageQueueEntry, priority: PriorityQueuePriority) {
		if (this.queues.has(priority)) {
			this.queues.get(priority).enqueue(message);
			if (!this.firing) {
				this.firing = true;
				this.process();
			}
		}
	}

	/**
	 * Dequeues a MessageQueueEntry in order of priority. Operation is O(n) relative to the number of priorities to find a queue with a non-zero length,
	 * as well as O(n) relative to the number of messages in a given queue if the queue's outStack length is 0, and O(1) otherwise.
	 */
	dequeue(): MessageQueueEntry | undefined {
		if (this.size() > 0) {
			for (const priority of this.priorityOrder) {
				if (this.queues.get(priority).size() > 0) {
					return this.queues.get(priority).dequeue();
				}
			}
		}
	}

	/**
	 * Fully dequeues and fires every entry in the PriorityQueue.
	 */
	async process() {
		try {
			while (this.size() > 0) {
				const message = this.dequeue();
				if (!this.channelQueues.has(message.destination)) {
					this.channelQueues.set(message.destination, new StackQueue());
				}
				this.channelQueues.get(message.destination).enqueue(message);
			}
			for (const queue of this.channelQueues.values()) {
				setTimeout(async () => {
					while (queue.size() > 0) {
						const message = queue.dequeue();
						try {
							await message.fire();
						} catch (error) {
							console.error('Message Handler encountered exception sending message:', error);
						}
					}
				}, 0);
			}
		} finally {
			this.firing = false;
		}
	}

	/**
	 * Reports the size of the PriorityQueue. O(n) operation relative to the number of priorities.
	 */
	size(): number {
		let size = 0;
		for (let i = 0; i < this.priorityOrder.length; i++) size += this.queues.get(this.priorityOrder[i]).size();
		return size;
	}

	/**
	 * Clears the inStack and outStack of each StackQueue managed by the PriorityQueue.
	 */
	clear() {
		for (let i = 0; i < this.priorityOrder.length; i++) {
			this.queues.get(this.priorityOrder[i]).clear();
		}
	}
}
