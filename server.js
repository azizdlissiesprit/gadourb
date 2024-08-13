const mongoose = require('mongoose');
const express = require('express');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

// MongoDB connection string
const mongoURI = "mongodb://localhost:27017/luxmardb";

// Connect to MongoDB
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB!');
    app.listen(PORT, () => {
        console.log(`Server started on port ${PORT}`);
    });
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});

// Define the stock schema and model
const stockSchema = new mongoose.Schema({
    idproduit: String,
    nom: String,
    prixunit: Number,
    largeur: Number,
    longeur: Number,
    epaisseur: Number,
    nbpieces: Number
});

const Stock = mongoose.model('Stock', stockSchema);

// API endpoint to fetch stock data
app.get('/api/stock', async (req, res) => {
    try {
        const stockData = await Stock.find();
        res.json(stockData);
        console.log(stockData);
    } catch (error) {
        console.error('Error fetching stock data:', error);
        res.status(500).send('Server Error');
    }
});
app.put('/api/stock/:id', async (req, res) => {
    try {
        const stockItem = await Stock.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!stockItem) {
            return res.status(404).send('Stock item not found');
        }
        res.json(stockItem);
    } catch (error) {
        console.error('Error updating stock data:', error);
        res.status(500).send('Server Error');
    }
});
app.get('/api/getstock', async (req, res) => {
    try {
        const { idproduit, nom } = req.query;
        console.log('Received query:', req.query); // Log query parameters to debug

        if (!idproduit && !nom) {
            return res.status(400).json({ message: 'ID or name is required' });
        }

        // Construct query object based on provided parameters
        const query = {};
        if (idproduit) query.idproduit = idproduit;
        if (nom) query.nom = nom;

        // Ensure you use the correct field names for your schema
        const product = await Stock.findOne(query);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// API endpoint to add a new stock item
app.post('/api/addstock', async (req, res) => {
    const { idproduit, nomproduit, largeur, longeur, epaisseur, prix, nbpieces } = req.body;
    
    try {
        // Create a new stock item
        const newStockItem = new Stock({
            idproduit,
            nom: nomproduit, 
            prixunit: prix,// Adjusted to match your schema
            largeur,
            longeur,
            epaisseur,
            nbpieces
            
            // Included in the request body
        });

        // Save the new stock item to the database
        await newStockItem.save();

        res.status(201).json(newStockItem); // Respond with the newly created item
    } catch (error) {
        console.error('Error adding stock item:', error);
        res.status(500).send('Server Error');
    }
});
