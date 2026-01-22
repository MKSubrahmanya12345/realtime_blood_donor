-- User Table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT DEFAULT "pending",
    fullName TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    phone TEXT,
    location TEXT,
    bloodGroup TEXT CHECK(bloodGroup IN ("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-")),
    lastDonationDate DATETIME,
    isAvailable BOOLEAN DEFAULT 1,
    collegeId TEXT,
    collegeName TEXT,
    hospitalLicense TEXT,
    isProfileComplete BOOLEAN DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Donation Data Table
CREATE TABLE donationData (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    donationDate DATETIME,
    bloodGroupNeeded TEXT CHECK(bloodGroupNeeded IN ("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-")),
    quantity INTEGER,
    location TEXT,
    urgency TEXT,
    status TEXT DEFAULT "pending",
    reason TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
);
