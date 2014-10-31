CREATE TABLE "files" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "guid" TEXT,
    "filename" TEXT,
    "extension" TEXT,
    "last_modified" REAL,
    "size" INTEGER,
    "type" TEXT,
    "path" TEXT,
    "id3" TEXT,
    "album" TEXT,
    "artist" TEXT,
    "genre" TEXT,
    "title" TEXT,
    "year" INTEGER,
    "track" INTEGER,
    "length" INTEGER
);
