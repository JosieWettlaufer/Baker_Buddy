const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
//const dotenv = require('dotenv');
//const studentRoutes = require('./routes/studentRoutes'); UPDATE

//dotenv.config(); //load environment variables

//express instance
const app = express();

const PORT = process.env.PORT || 5000;  // Make sure this is NOT 3000

//middleware to handle JSON data and CORS
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' }));

//Define simple schema for recipe
const recipeSchema = new mongoose.Schema({
    userId: Number, //FK
    title: String,
    timerList: String, //will probably make some kind of object w/ timer attrs
    unitConversions: String //ditto.
});

//Create model based on schema
const RecipePage = mongoose.model('Recipepage', recipeSchema);

//Define simple schema for timer
const TimerSchema = new mongoose.Schema({
    pageId: Number, //FK
    timerLabel: String,
    duration: Number, //will need to convert to time
    status: String //running/paused/stopped, may convert to boolean
});

//Create model based on schema
const Timer = mongoose.model('Timer', TimerSchema); 

//Define simple schema for unitc
const UnitConversionSchema = new mongoose.Schema({
    pageId: Number, //FK, same as timer fk
    fromUnit: String,
    toUnit: String,
    value: Number, //from value (left)
    convertedValue: Number, //to value (right)
});

//Create model based on schema
const UnitConversion = mongoose.model('unitConversion', UnitConversionSchema); 

//Connect to mongodb
mongoose.connect('mongodb://localhost:27017/BakerBuddyDB', {})
//test connection
.then(() => {
    console.log("Connected to MongoDB");
    
    return Timer.create({ pageId: 1, timerLabel: "Test Timer", duration: 15, status: "paused" });
})
.then(() => {
    console.log("Test data inserted successfully");
    
    return UnitConversion.create({ pageId: 1, fromUnit: "Cup", toUnit: "MEGACUP", value: 2, convertedValue: 1 });
});



//Define GET route to get all recipePages
app.get('/api/recipepages', async (req, res) => {
    try {
        const [recipePages, timers, unitConversions] = await Promise.all([
            RecipePage.find(),
            Timer.find(),
            UnitConversion.find()
        ]);

        res.json({ recipePages, timers, unitConversions }); // Send all data as JSON response
    } catch (err) {
        res.status(500).json({ error: "Error fetching data", details: err.message });
    }
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