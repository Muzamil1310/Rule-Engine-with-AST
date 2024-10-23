const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/eligibilityDB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

const userSchema = new mongoose.Schema({
  age: Number,
  department: String,
  income: Number,
  experience: Number
});

const User = mongoose.model('User', userSchema);

// Function to evaluate rules
const evaluateRule = (user, rule) => {
  try {
    // Replace SQL-like syntax with JavaScript syntax
    const jsRule = rule
      .replace(/AND/g, '&&')
      .replace(/OR/g, '||')
      .replace(/department\s*=\s*'([^']+)'/g, `department === '$1'`)
      .replace(/salary/g, 'income'); // Assuming 'salary' is equivalent to 'income'
    
    const result = eval(jsRule.replace(/age|department|income|experience/g, (match) => `user.${match}`));
    console.log(`Evaluating rule: ${jsRule}, Result: ${result}`);
    return result;
  } catch (error) {
    console.error('Error evaluating rule:', error);
    return false;
  }
};

const rules = [
  "((age > 30 AND department = 'Sales') OR (age < 25 AND department = 'Marketing')) AND (salary > 50000 OR experience > 5)",
  "((age > 30 AND department = 'Marketing')) AND (salary > 20000 OR experience > 5)"
];

app.post('/addUser', async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    res.status(201).send('User added successfully!');
  } catch (error) {
    res.status(400).send('Error adding user');
  }
});

app.post('/checkEligibility', (req, res) => {
  const user = req.body;
  console.log('User data received:', user);
  if (user && typeof user === 'object' && 'age' in user && 'department' in user && 'income' in user && 'experience' in user) {
    let eligibility = rules.some(rule => evaluateRule(user, rule)) ? 'Eligible' : 'Not Eligible';
    res.json({ eligibility });
  } else {
    res.status(400).send('Invalid user data');
  }
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
