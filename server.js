const express = require('express');
const app = express();
const fs = require('fs');
const path =require('path');
const PORT = 3000;
const cors = require('cors');

app.use(cors());

app.use(express.json());

//recieve the purchase request data
app.post('/purchase', (req,res)=>{
    const purchaseData = req.body;

    const filePath = path.join(__dirname, 'data', 'purchase.json');
    let purchases = [];

    if(fs.existsSync(filePath)){
        const fileData = fs.readFileSync(filePath);
        purchases = JSON.parse(fileData);
    }
    purchases.push(purchaseData);
    fs.writeFileSync(filePath, JSON.stringify(purchases, null, 2));
    
    res.status(200).json({message:'Purchase data has requested successfully!'});
});

app.listen(PORT, ()=>{
    console.log(`Server running on http://localhost:${PORT}`);
})