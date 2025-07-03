// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Define paths to data files
const purchasePath = path.join(__dirname, 'data', 'purchase.json');
const reviewPath = path.join(__dirname, 'data', 'review.json');
const productPath = path.join(__dirname, 'data', 'product.json');

// Utility: Read JSON file safely
function readJsonFile(filePath) {
    if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath);
        return JSON.parse(raw);
    } else {
        return [];
    }
}

// Utility: Write JSON file
function writeJsonFile(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Utility: Count keyword frequency in review comments
function countKeywords(textArray, keywords) {
    const counts = {};
    keywords.forEach(k => counts[k] = 0);
    textArray.forEach(text => {
        const lower = text.toLowerCase();
        keywords.forEach(k => {
            const match = lower.match(new RegExp(`\\b${k}\\b`, 'g'));
            if (match) counts[k] += match.length;
        });
    });
    return counts;
}

// POST: Receive purchase data
app.post('/purchase', (req, res) => {
    const purchaseData = req.body;
    const purchases = readJsonFile(purchasePath);
    const products = readJsonFile(productPath);

    // Update stock based on purchase
    purchaseData.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
            product.stock -= item.quantity;
            if (product.stock < 0) product.stock = 0;
        }
    });

    purchases.push(purchaseData);
    writeJsonFile(purchasePath, purchases);
    writeJsonFile(productPath, products);

    res.status(200).json({ message: 'Purchase data recorded successfully!' });
});

// POST: Receive review data
app.post('/review', (req, res) => {
    const reviews = readJsonFile(reviewPath);
    reviews.push(req.body);
    writeJsonFile(reviewPath, reviews);
    res.status(200).json({ message: 'Review submitted successfully!' });
});

// GET: Send all review data
app.get('/review', (req, res) => {
    const reviews = readJsonFile(reviewPath);
    res.status(200).json(reviews);
});

// GET: Dashboard data for all products
app.get('/dashboard-data', (req, res) => {
    const products = readJsonFile(productPath);
    const purchases = readJsonFile(purchasePath);
    const allReviews = readJsonFile(reviewPath);

    const positiveKeywords = ['good', 'great', 'excellent', 'love', 'nice'];
    const negativeKeywords = ['bad', 'disappoint', 'broken', 'poor', 'terrible'];

    const dashboardData = products.map(product => {
        const productId = product.id;

        // Sum total purchases
        const totalPurchases = purchases.reduce((sum, p) => {
            const item = Array.isArray(p) ? p.find(i => i.productId === productId) : (p.productId === productId ? p : null);
            return item ? sum + item.quantity : sum;
        }, 0);

        // Filter relevant reviews
        const reviews = allReviews.filter(r => r.productId === productId);
        const averageRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

        const comments = reviews.map(r => r.Comment || "");
        const positiveCounts = countKeywords(comments, positiveKeywords);
        const negativeCounts = countKeywords(comments, negativeKeywords);

        return {
            productId,
            name: product.name,
            stock: product.stock,
            totalPurchases,
            averageRating,
            positiveCounts,
            negativeCounts
        };
    });

    res.json(dashboardData);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
