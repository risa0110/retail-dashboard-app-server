const express = require('express');
const app = express();
const cors = require('cors'); 
const path =require('path');
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.post('/register', (req,res)=>{
    const userData = req.body;

    const filePath = path.join(__dirname, 'data', 'users.json');
    let users = [];

    if(fs.existsSync(filePath)){
        const fileData = fs.readFileSync(filePath);
        users = JSON.parse(fileData);
    }
    users.push(userData);
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
    
    res.status(200).json({message:'User registered successfully!'});
});

app.listen(PORT, ()=>{
    console.log(`Server running on http://localhost:${PORT}`);
})