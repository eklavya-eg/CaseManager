import { MongoClient, Db } from "mongodb";


class MongoDBClient {
    client: MongoClient | undefined;
    db: Db | undefined;
    
    constructor(dbName: string) {
        this.connect(dbName);
    }
    
    connect = async (dbName: string): Promise<void> => {
        try {
            const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
            this.client = new MongoClient(uri);
            await this.client.connect();
            this.db = this.client.db(dbName);
            console.log("✅ MongoDB connected to database:", dbName);
        } catch (error) {
            console.error("❌ MongoDB connection failed", error);
            process.exit(1);
        }
    }
    
    collectionExists = async (collectionName: string): Promise<boolean> => {
        if (!this.db) return false;
        const collections = await this.db.listCollections({ name: collectionName }).toArray();
        return collections.length > 0;
    }
    
    listCollections = async (): Promise<string[]> => {
        if (!this.db) return [];
        const collections = await this.db.listCollections().toArray();
        return collections.map((collection: any) => collection.name);
    }
}

export default MongoDBClient;