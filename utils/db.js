/* eslint-disable class-methods-use-this */
import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    /**
     * creates a client to MongoDB:
     * host: from the environment variable DB_HOST or default: localhost
     * port: from the environment variable DB_PORT or default: 27017
     * database: from the environment variable DB_DATABASE or default: files_manager
     */
    this.is_alive = false;
    this.host = process.env.DB_HOST || 'localhost';
    this.port = process.env.DB_PORT || 27017;
    this.database = process.env.DB_DATABASE || 'files_manager';
    this.client = new MongoClient(`mongodb://${this.host}:${this.port}`);

    this.client.connect().then(() => {
      this.is_alive = true;
    });

    this.nbUsers = this.nbUsers.bind(this);
    this.nbFiles = this.nbFiles.bind(this);
  }

  isAlive() {
    return this.is_alive;
  }

  async nbUsers() {
    // returns the number of documents in the collection users
    return this.client.db(this.database).collection('users').countDocuments();
  }

  async nbFiles() {
    // returns the number of documents in the collection files
    return this.client.db(this.database).collection('files').countDocuments();
  }
}

const dbClient = new DBClient();

export default dbClient;
