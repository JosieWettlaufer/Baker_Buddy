const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

//express instance
const app = express();

//middleware to handle JSON data and CORS
app.use(express.json());
app.use(cors());

//Connect to mongodb
mongoose.connect('mongodb://localhost:27017/studentDB', { //CHANGE TO BB DATABASE!
    useNewUrlParser: true,
    useUnifiedTopology: true
});

//Define simple schema for db data
const studentSchema = new mongoose.Schema({
    name: String,
    age: Number
});

//Create model based on schema
const Student = mongoose.model('Student', studentSchema);

//Define GET route to get all students
app.get('/api/students', async (req, res) => {
    const students = await Student.find(); //pause fx until await code finishes
    res.json(students); //send students as JSON response
});

//define post route to add new entity
app.post('/api/students', async (req, res) => {
    const newStudent = new Student(req.body); //gets studednt info from req body, stores in var
    await newStudent.save();
    res.json(newStudent);
})

//Define delete path
app.delete('/api/students/:id', async (req, res) => {
    await Student.findByIdAndDelete(req.params.id); //access id from url
    res.json({ message: 'student deleted' });
});

app.listen(5000, () => {
    console.log('Server running on http://localhost:5000');
});