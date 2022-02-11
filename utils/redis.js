/* eslint-disable class-methods-use-this */
import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
  /**
   * RedisClient - creates redis client and functions to CRUD data
   */
  constructor() {
    this.client = createClient();

    // set handler functions for error/ready callbacks
    this.client.on('error', this.handleClientError);
    this.client.on('ready', this.handleClientReady);
    // create async get/set/del against client using promisify
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);

    this.isAlive = this.isAlive.bind(this);

    // bind functions that use `this.client` class prop
    this.get = this.get.bind(this);
    this.set = this.set.bind(this);
    this.del = this.del.bind(this);
  }

  // handler functions
  handleClientError(err) {
    console.log(err);
  }

  handleClientReady() {
    console.log('Redis client connected to the server');
  }

  isAlive() {
    // ???
    return this.client.connected;
  }

  // CRUD functions
  async get(key) {
    //  takes a string key as argument and returns the Redis value stored for this key
    return this.getAsync(key);
  }

  async set(key, value, duration) {
    // takes a string key, a value and a duration in second as arguments to store it in Redis
    await this.setAsync(key, value);
    this.client.expire(key, duration);
  }

  async del(key) {
    await this.delAsync(key);
  }
}

const redisClient = new RedisClient();

export default redisClient;
