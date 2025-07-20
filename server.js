import express from 'express';
import fs from 'fs';
import path from 'path';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;

// Resolve __dirname and __filename in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(bodyParser.json());
app.use(express.static('public')); // Serve all HTML/CSS/JS from public folder

// Files for storing form data
const CONTACT_FILE = path.join(__dirname, 'contactForms.json');
const VOLUNTEER_FILE = path.join(__dirname, 'volunteerForms.json');
const NEWSLETTER_FILE = path.join(__dirname, 'newsletter.json');

// Utility function to save data to JSON files
function saveData(file, newEntry) {
  let data = [];
  if (fs.existsSync(file)) {
    try {
      data = JSON.parse(fs.readFileSync(file));
    } catch (err) {
      console.error(`Error reading ${file}:`, err);
    }
  }
  data.push(newEntry);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ----------------- API Routes -----------------

// Contact Form
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  saveData(CONTACT_FILE, { name, email, message, date: new Date().toISOString() });
  res.json({ message: 'Contact form submitted successfully!' });
});

// Volunteer Form
app.post('/api/volunteer', (req, res) => {
  const { name, email, phone, message } = req.body;
  if (!name || !email || !phone) {
    return res.status(400).json({ message: 'Name, email, and phone are required.' });
  }
  saveData(VOLUNTEER_FILE, { name, email, phone, message, date: new Date().toISOString() });
  res.json({ message: 'Volunteer form submitted successfully!' });
});

// Newsletter Subscription
app.post('/api/newsletter', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  let data = [];
  if (fs.existsSync(NEWSLETTER_FILE)) {
    try {
      data = JSON.parse(fs.readFileSync(NEWSLETTER_FILE));
    } catch (err) {
      console.error('Error reading newsletter file:', err);
    }
  }

  // Avoid duplicates
  if (!data.includes(email)) {
    data.push(email);
    fs.writeFileSync(NEWSLETTER_FILE, JSON.stringify(data, null, 2));
  }

  res.json({ message: 'Subscribed successfully!' });
});

// ----------------- Admin Dashboard -----------------
app.get('/admin/data', (req, res) => {
  const contact = fs.existsSync(CONTACT_FILE) ? JSON.parse(fs.readFileSync(CONTACT_FILE)) : [];
  const volunteer = fs.existsSync(VOLUNTEER_FILE) ? JSON.parse(fs.readFileSync(VOLUNTEER_FILE)) : [];
  const newsletter = fs.existsSync(NEWSLETTER_FILE) ? JSON.parse(fs.readFileSync(NEWSLETTER_FILE)) : [];

  res.json({ contact, volunteer, newsletter });
});

// ----------------- Server -----------------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});