
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get(api.items.list.path, async (req, res) => {
    const search = req.query.search as string | undefined;
    const items = await storage.getItems(search);
    res.json(items);
  });

  app.get(api.items.get.path, async (req, res) => {
    const item = await storage.getItem(Number(req.params.id));
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  });

  app.post(api.items.create.path, async (req, res) => {
    try {
      const input = api.items.create.input.parse(req.body);
      const item = await storage.createItem(input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.items.update.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const input = api.items.update.input.parse(req.body);
      
      const existing = await storage.getItem(id);
      if (!existing) {
        return res.status(404).json({ message: 'Item not found' });
      }

      const updated = await storage.updateItem(id, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.items.delete.path, async (req, res) => {
    const id = Number(req.params.id);
    const existing = await storage.getItem(id);
    if (!existing) {
      return res.status(404).json({ message: 'Item not found' });
    }
    await storage.deleteItem(id);
    res.status(204).send();
  });

  // Seed the database
  await seedDatabase();

  return httpServer;
}

// Seed function to populate database with sample Arabic data
export async function seedDatabase() {
  const existingItems = await storage.getItems();
  if (existingItems.length === 0) {
    await storage.createItem({
      code: "A100",
      name: "مروحة سقف",
      location: "الرف الأول - يمين",
      notes: "موديل 2024، لون أبيض"
    });
    await storage.createItem({
      code: "B200",
      name: "مصباح LED",
      location: "الممر الرئيسي",
      notes: "إضاءة قوية، 15 واط"
    });
    await storage.createItem({
      code: "C300",
      name: "كابل تمديد",
      location: "صندوق الأدوات",
      notes: "طول 5 متر"
    });
    console.log("Database seeded with Arabic sample data");
  }
}
