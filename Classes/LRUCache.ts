/**
 * @class
 * Naïve LRU doubly-linked node, storing the key, value, and next and previous nodes.
 */
class LRUNode<K, V> {
    /** LRU node key */
    key: K;
    /** LRU node value */
    value: V;
    /** Previous LRU node */
    prev: LRUNode<K, V> | null;
    /** Next LRU node */
    next: LRUNode<K, V> | null;

    /**
     * @constructor
     * @param key - LRU node key.
     * @param value - LRU node value.
     */
    constructor(key: K, value: V) {
        this.key = key;
        this.value = value;
        this.prev = null;
        this.next = null;
    }
}

/**
 * @class
 * Naïve LRU cache implementation using a backing map of doubly linked list nodes.
 */
export default class LRUCache<K, V> {
    /** Maximum capacity of LRUCache */
    capacity: number;
    /** Internal key -> node map */
    private map: Map<K, LRUNode<K, V>>;
    /** Most recent LRU node */
    private head: LRUNode<K, V> | null;
    /** Least recent LRU node */
    private tail: LRUNode<K, V> | null;

    /**
     * @constructor
     * @param capacity - Maximum capacity of LRUCache
     */
    constructor(capacity: number) {
        this.capacity = capacity;
        this.map = new Map();
        this.head = null;
        this.tail = null;
    }

    /**
     * Move an LRUNode to the head of the LRUCache.
     * @param node - The LRUNode to move to the head.
     */
    _moveToHead(node: LRUNode<K, V>) {
        if (node === this.head) return;

        const prev = node.prev;
        const next = node.next;

        if (prev) prev.next = next;
        if (next) next.prev = prev;

        if (node === this.tail) this.tail = prev || node;

        node.prev = null;
        node.next = this.head;
        if (this.head) this.head.prev = node;
        this.head = node;

        if (!this.tail) this.tail = node;
    }

    /**
     * Evict an LRUNode at the tail of the LRUCache.
     */
    _evictTail() {
        if (!this.tail) return;
        const key = this.tail.key;
        this.map.delete(key);

        if (this.tail.prev) {
            this.tail = this.tail.prev;
            this.tail.next = null;
        } else {
            this.head = null;
            this.tail = null;
        }
    }

    /**
     * Get a value assigned to the key. Returns undefined if no value exists for that key.
     * @param key - The key to get.
     */
    get(key: K): V {
        if (!this.map.has(key)) return undefined;

        const node = this.map.get(key);
        this._moveToHead(node);
        return node.value;
    }

    /**
     * Put a value assigned to the key into the LRUCache. If the key already exists, then updates the value.
     * @param key - The key to set.
     * @param value - The value to set.
     */
    put(key: K, value: V) {
        if (this.capacity <= 0) return;

        if (this.map.has(key)) {
            const node = this.map.get(key);
            node.value = value;
            this._moveToHead(node);
        } else {
            const newNode = new LRUNode(key, value);
            this.map.set(key, newNode);
            this._moveToHead(newNode);

            if (this.map.size > this.capacity) {
                this._evictTail();
            }
        }
    }
}
