import React, { useState } from 'react';

const App = () => {
  const [user, setUser] = useState({ age: '', department: '', income: '', experience: '' });
  const [result, setResult] = useState(null);

  const handleChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const userData = {
      age: parseInt(user.age),
      department: user.department,
      income: parseInt(user.income),
      experience: parseInt(user.experience)
    };

    try {
      const response = await fetch('http://localhost:3000/checkEligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setResult(data.eligibility);
    } catch (error) {
      console.error('Error:', error);
      setResult('Error checking eligibility');
    }
  };

  return (
    <div>
      <h1>User Eligibility Check</h1>
      <form onSubmit={handleSubmit}>
        <input name="age" value={user.age} onChange={handleChange} placeholder="Age" type="number" required />
        <input name="department" value={user.department} onChange={handleChange} placeholder="Department" required />
        <input name="income" value={user.income} onChange={handleChange} placeholder="Income" type="number" required />
        <input name="experience" value={user.experience} onChange={handleChange} placeholder="Experience (years)" type="number" required />
        <button type="submit">Check Eligibility</button>
      </form>
      {result && <div>Eligibility: {result}</div>}
    </div>
  );
};

export default App;
