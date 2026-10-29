CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('OWNER', 'TRAINER')),
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trainers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  phone TEXT,
  specialization TEXT,
  experience_years INTEGER DEFAULT 1,
  joining_date TEXT,
  status TEXT DEFAULT 'Active',
  bio TEXT,
  photo_url TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_code TEXT UNIQUE,
  full_name TEXT NOT NULL,
  photo_url TEXT,
  dob TEXT,
  gender TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  emergency_contact TEXT,
  membership_type TEXT NOT NULL,
  start_date TEXT NOT NULL,
  expiry_date TEXT NOT NULL,
  payment_status TEXT DEFAULT 'Paid',
  assigned_trainer_id INTEGER,
  registration_date TEXT NOT NULL,
  notes TEXT,
  FOREIGN KEY (assigned_trainer_id) REFERENCES trainers(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  check_in_time TEXT NOT NULL,
  status TEXT DEFAULT 'Present' CHECK(status IN ('Present', 'Absent')),
  marked_by_user_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
  ,
  FOREIGN KEY (marked_by_user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  payment_date TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK(
    payment_method IN (
      'Cash',
      'UPI',
      'Card',
      'Bank Transfer'
    )
  ),
  membership_plan TEXT NOT NULL,
  status TEXT DEFAULT 'Completed' CHECK(
    status IN (
      'Completed',
      'Pending',
      'Failed'
    )
  ),
  transaction_id TEXT UNIQUE NOT NULL,
  notes TEXT,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS equipment (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  purchase_date TEXT,
  condition TEXT DEFAULT 'Good' CHECK(
    condition IN (
      'New',
      'Good',
      'Fair',
      'Poor'
    )
  ),
  maintenance_date TEXT,
  status TEXT DEFAULT 'Working' CHECK(
    status IN (
      'Working',
      'Needs Maintenance',
      'Under Repair'
    )
  ),
  notes TEXT
);

CREATE TABLE IF NOT EXISTS fitness_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id INTEGER NOT NULL,
  trainer_id INTEGER NOT NULL,
  record_date TEXT NOT NULL,
  weight_kg REAL NOT NULL,
  height_cm REAL NOT NULL,
  bmi REAL NOT NULL,
  body_fat_pct REAL,
  chest_in REAL,
  waist_in REAL,
  biceps_in REAL,
  notes TEXT,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  FOREIGN KEY (trainer_id) REFERENCES trainers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  recipient_role TEXT DEFAULT 'ALL' CHECK(
    recipient_role IN (
      'OWNER',
      'TRAINER',
      'ALL'
    )
  ),
  is_read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gym_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);