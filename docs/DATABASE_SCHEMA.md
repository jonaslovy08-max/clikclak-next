# DATABASE_SCHEMA.md — ClikClak.ch

Schéma Prisma prévu pour le backoffice (`/admin`).  
À implémenter en Phase 6.

## Modèles

### Réparation

```prisma
model Brand {
  id       Int          @id @default(autoincrement())
  name     String       @unique  // iPhone, Samsung, Huawei…
  slug     String       @unique
  models   PhoneModel[]
}

model PhoneModel {
  id       Int           @id @default(autoincrement())
  name     String                // iPhone 15 Pro, Galaxy S24…
  slug     String
  brandId  Int
  brand    Brand         @relation(fields: [brandId], references: [id])
  repairs  RepairPrice[]
}

model RepairType {
  id      Int           @id @default(autoincrement())
  name    String        @unique  // Écran, Batterie, Connecteur…
  slug    String        @unique
  prices  RepairPrice[]
}

model RepairPrice {
  id          Int        @id @default(autoincrement())
  modelId     Int
  model       PhoneModel @relation(fields: [modelId], references: [id])
  repairTypeId Int
  repairType  RepairType @relation(fields: [repairTypeId], references: [id])
  priceCHF    Decimal    @db.Decimal(8, 2)
  available   Boolean    @default(true)
  updatedAt   DateTime   @updatedAt
}
```

### Demandes

```prisma
model QuoteRequest {
  id          Int      @id @default(autoincrement())
  name        String
  email       String
  phone       String?
  device      String
  issue       String
  message     String?
  status      String   @default("new")  // new | in_progress | done
  createdAt   DateTime @default(now())
}

model DataRecoveryRequest {
  id          Int      @id @default(autoincrement())
  name        String
  email       String
  phone       String?
  deviceType  String   // disque dur | SSD | smartphone | iPhone | MacBook…
  issue       String
  message     String?
  status      String   @default("new")
  // Règle CLAUDE.md : ne jamais garantir récupération à 100 % dans l'interface
  createdAt   DateTime @default(now())
}
```

### Shop

```prisma
model ShopCategory {
  id       Int           @id @default(autoincrement())
  name     String        @unique  // Smartphones occasion | Smartphones neufs | Accessoires
  slug     String        @unique
  products ShopProduct[]
}

model ShopProduct {
  id          Int          @id @default(autoincrement())
  name        String
  slug        String       @unique
  description String?
  priceCHF    Decimal      @db.Decimal(8, 2)
  categoryId  Int
  category    ShopCategory @relation(fields: [categoryId], references: [id])
  inStock     Boolean      @default(true)
  images      String[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  // Règle CLAUDE.md : le shop ne vend PAS écrans, vitres, batteries, pièces détachées
}
```

### Contenu

```prisma
model FAQ {
  id        Int      @id @default(autoincrement())
  question  String
  answer    String
  pageSlug  String?  // rattaché à une page spécifique (optionnel)
  order     Int      @default(0)
  active    Boolean  @default(true)
}
```

## Règles métier importantes

- Le shop vend **uniquement** : smartphones d'occasion, smartphones neufs, accessoires
- Le shop ne vend **jamais** : écrans, vitres, batteries seules, pièces détachées
- Les demandes de récupération de données ne garantissent **jamais** 100 % de succès
- Les prix sont en CHF

## Prochaine étape

Implémenter le `schema.prisma` dans `/prisma/schema.prisma` en Phase 6.
