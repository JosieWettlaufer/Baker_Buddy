const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

//express instance
const app = express();

const PORT = process.env.PORT || 5000;  // Make sure this is NOT 3000

//middleware to handle JSON data and CORS
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' }));

//Define simple schema for recipe
const recipeSchema = new mongoose.Schema({
    userId: Number,
    title: String,
    timerList: String, //will probably make some kind of object w/ timer attrs
    unitConversions: String //ditto.
});

//Create model based on schema
const RecipePage = mongoose.model('Recipepage', recipeSchema);

//Connect to mongodb
mongoose.connect('mongodb://localhost:27017/BakerBuddyDB', {})
//test connection
.then(() => {
    console.log("Connected to MongoDB");
    
    return RecipePage.create({ userId: 1, title: "Chocolate Cake", timerList: "testtimer", unitConversions: "testUnit" });
});



//Define GET route to get all recipePages
app.get('/api/recipepages', async (req, res) => {
    const recipePages = await RecipePage.find(); //pause fx until await code finishes
    res.json(recipePages); //send recipePages as JSON response
});

//define post route to add new entity
app.post('/api/recipepages', async (req, res) => {
    const newRecipePage = new RecipePage(req.body); //gets studednt info from req body, stores in var
    await newRecipePage.save();
    res.json(newRecipePage);
})

//Define delete path
app.delete('/api/recipepages/:id', async (req, res) => {
    await RecipePage.findByIdAndDelete(req.params.id); //access id from url
    res.json({ message: 'recipePage deleted' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});