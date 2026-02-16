
import { db } from "./db";
import {
  items,
  type Item,
  type InsertItem,
  type UpdateItemRequest
} from "@shared/schema";
import { eq, desc, ilike, or } from "drizzle-orm";

export interface IStorage {
  getItems(search?: string): Promise<Item[]>;
  getItem(id: number): Promise<Item | undefined>;
  createItem(item: InsertItem): Promise<Item>;
  updateItem(id: number, updates: UpdateItemRequest): Promise<Item>;
  deleteItem(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getItems(search?: string): Promise<Item[]> {
    if (!search) {
      return await db.select().from(items).orderBy(desc(items.id));
    }
    
    const searchLower = `%${search.toLowerCase()}%`;
    return await db
      .select()
      .from(items)
      .where(
        or(
          ilike(items.name, searchLower),
          ilike(items.code, searchLower),
          ilike(items.location, searchLower)
        )
      )
      .orderBy(desc(items.id));
  }

  async getItem(id: number): Promise<Item | undefined> {
    const [item] = await db.select().from(items).where(eq(items.id, id));
    return item;
  }

  async createItem(insertItem: InsertItem): Promise<Item> {
    const [item] = await db.insert(items).values(insertItem).returning();
    return item;
  }

  async updateItem(id: number, updates: UpdateItemRequest): Promise<Item> {
    const [updated] = await db
      .update(items)
      .set(updates)
      .where(eq(items.id, id))
      .returning();
    return updated;
  }

  async deleteItem(id: number): Promise<void> {
    await db.delete(items).where(eq(items.id, id));
  }
}

export const storage = new DatabaseStorage();
