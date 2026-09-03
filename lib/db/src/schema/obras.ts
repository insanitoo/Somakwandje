import { pgTable, text, serial, timestamp, pgEnum, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const obraStatusEnum = pgEnum("obra_status", ["disponivel", "vendido"]);
export const obraTamanhoEnum = pgEnum("obra_tamanho", ["grande", "media", "pequena"]);

export const obrasTable = pgTable("obras", {
  id: serial("id").primaryKey(),
  titulo: text("titulo").notNull(),
  descricao: text("descricao"),
  tecnica: text("tecnica"),
  dimensoes: text("dimensoes"),
  preco: text("preco"),
  status: obraStatusEnum("status").notNull().default("disponivel"),
  tamanho: obraTamanhoEnum("tamanho"),
  imagemUrl: text("imagem_url"),
  imagemUrl2: text("imagem_url2"),
  imagemUrl3: text("imagem_url3"),
  imagemUrl4: text("imagem_url4"),
  imagemUrl5: text("imagem_url5"),
  imagemUrl6: text("imagem_url6"),
  imagemUrl7: text("imagem_url7"),
  imagemUrl8: text("imagem_url8"),
  imagemUrl9: text("imagem_url9"),
  imagemUrl10: text("imagem_url10"),
  destaque: boolean("destaque").notNull().default(false),
  ordem: integer("ordem"),
  desconto: integer("desconto"),
  dataCriacao: timestamp("data_criacao", { withTimezone: true }).notNull().defaultNow(),
});

export const insertObraSchema = createInsertSchema(obrasTable).omit({ id: true, dataCriacao: true });
export type InsertObra = z.infer<typeof insertObraSchema>;
export type Obra = typeof obrasTable.$inferSelect;
