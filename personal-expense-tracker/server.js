const express = require('express');
const bodyParser = require('body-parser');
const db = require('./database');

const app = express();
app.use(bodyParser.json());



// Adds a new transaction (income or expense).
app.post('/transactions', (req, res) => {
    const { type, category, amount, date, description } = req.body;
    db.run(`INSERT INTO transactions (type, category, amount, date, description) VALUES (?, ?, ?, ?, ?)`,
        [type, category, amount, date, description], function (err) {
            if (err) return res.status(400).json({ error: err.message });
            res.status(201).json({ id: this.lastID });
        });
});

// Retrieves all transactions.
app.get('/transactions', (req, res) => {
    db.all(`SELECT * FROM transactions`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Retrieves a transaction by ID.
app.get('/transactions/:id', (req, res) => {
    db.get(`SELECT * FROM transactions WHERE id = ?`, [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Transaction not found' });
        res.json(row);
    });
});

//  Updates a transaction by ID.
app.put('/transactions/:id', (req, res) => {
    const { type, category, amount, date, description } = req.body;
    db.run(`UPDATE transactions SET type = ?, category = ?, amount = ?, date = ?, description = ? WHERE id = ?`,
        [type, category, amount, date, description, req.params.id], function (err) {
            if (err) return res.status(400).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Transaction not found' });
            res.json({ message: 'Transaction updated' });
        });
});

//  Deletes a transaction by ID.
app.delete('/transactions/:id', (req, res) => {
    db.run(`DELETE FROM transactions WHERE id = ?`, [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Transaction not found' });
        res.status(204).send();
    });
});

// Retrieves a summary of transactions, such as total income, total expenses, and balance. Optionally, this can be filtered by date range or category.
app.get('/summary', (req, res) => {
    db.all(`SELECT type, SUM(amount) as total FROM transactions GROUP BY type`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const summary = {
            totalIncome: rows.find(row => row.type === 'income')?.total || 0,
            totalExpenses: rows.find(row => row.type === 'expense')?.total || 0,
            balance: (rows.find(row => row.type === 'income')?.total || 0) - (rows.find(row => row.type === 'expense')?.total || 0),
        };
        res.json(summary);
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
