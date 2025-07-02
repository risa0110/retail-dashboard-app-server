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
    
    res.status(200).json({message:'Purchase data has been requested successfully!'});

    //
    const productPath = path.join(__dirname, 'data', 'product.json');
    let productList = [];

    if(fs.existsSync(productPath)){
        const rawProducts = fs.readFileSync(productPath);
        productList = JSON.parse(rawProducts);
    }
    purchaseData.forEach(purchaseItem=>{
        const product = productList.find(p=>p.id===purchaseItem.productId);
        if(product){
            product.stock -= purchaseItem.quantity;
            if(product.stock<0) product.stock=0;
        }
    });
    fs.writeFileSync(productPath, JSON.stringify(productList, null, 2));
});

//recieve the review data
app.post('/review',(req,res)=>{
    const reviewData = req.body;

    const reviewfile = path.join(__dirname, 'data', 'review.json');
    let reviews = [];

    if(fs.existsSync(reviewfile)){
        const reviewdataFile = fs.readFileSync(reviewfile);
        reviews = JSON.parse(reviewdataFile);
    }
    reviews.push(reviewData);
    fs.writeFileSync(reviewfile, JSON.stringify(reviews, null, 2));

    res.status(200).json({message:'Review data has been sent successfully!'});

});

//send the data to the client side
app.get('/review', (req, res)=>{
    const reviewfile = path.join(__dirname, 'data', 'review.json');
    let reviews = [];

    if(fs.existsSync(reviewfile)){
        const reviewdataFile = fs.readFileSync(reviewfile);
        reviews = JSON.parse(reviewdataFile);
    }

    res.status(200).json(reviews);
})


app.listen(PORT, ()=>{
    console.log(`Server running on http://localhost:${PORT}`);
})