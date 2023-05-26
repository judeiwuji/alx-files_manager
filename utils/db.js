import MongoClient from "mongodb/lib/mongo_client";
class DBClient {
  _isAlive = false;
  constructor() {
    const host = process.env["DB_HOST"] || "localhost";
    const port = process.env["DB_PORT"] || 27017;
    this.dbName = process.env["DB_DATABASE"] || "files_manager";
    this.client = new MongoClient(`mongodb://${host}:${port}/${this.dbName}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    this.client
      .connect()
      .then((db) => {
        this._isAlive = true;
      })
      .catch((err) => console.log(err));
  }

  isAlive() {
    return this._isAlive;
  }

  async nbUsers() {
    return this.client.db(this.dbName).collection("users").countDocuments();
  }

  async nbFiles() {
    return this.client.db(this.dbName).collection("files").countDocuments();
  }
}

const dbClient = new DBClient();
export default dbClient;
