-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "industry" TEXT,
    "size" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "website" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Company_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "jobTitle" TEXT,
    "department" TEXT,
    "status" TEXT NOT NULL DEFAULT 'LEAD',
    "source" TEXT,
    "avatar" TEXT,
    "linkedIn" TEXT,
    "twitter" TEXT,
    "birthday" DATETIME,
    "timezone" TEXT,
    "rating" INTEGER NOT NULL DEFAULT 3,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT,
    CONSTRAINT "Contact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Contact_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6366f1',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ContactTag" (
    "contactId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    PRIMARY KEY ("contactId", "tagId"),
    CONSTRAINT "ContactTag_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContactTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Interaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER,
    "outcome" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contactId" TEXT NOT NULL,
    "companyId" TEXT,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Interaction_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Interaction_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Interaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "contactId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Note_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Note_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CustomField" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "fieldType" TEXT NOT NULL,
    "options" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "CustomFieldValue" (
    "value" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,

    PRIMARY KEY ("contactId", "fieldId"),
    CONSTRAINT "CustomFieldValue_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CustomFieldValue_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "CustomField" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DataEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "value" REAL NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DistributionEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serialNumber" INTEGER NOT NULL,
    "subCity" TEXT NOT NULL,
    "woreda" TEXT NOT NULL,
    "numberOfCustomers" INTEGER NOT NULL,
    "communitiesReceived" INTEGER NOT NULL,
    "institutionCustomers" INTEGER NOT NULL DEFAULT 0,
    "nursingMothersQuintals" REAL NOT NULL DEFAULT 0,
    "communityQuintals" REAL NOT NULL DEFAULT 0,
    "institutionQuintals" REAL NOT NULL DEFAULT 0,
    "totalQuintals" REAL NOT NULL,
    "importedFrom" TEXT,
    "fileName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
