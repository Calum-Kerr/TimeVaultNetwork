import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(bodyParser.json()); 
app.use(express.static('public')); 

/*
i connect to mongodb inside codespace as i can't get the connection
to work on the live website, so everything is within codespace.
 */
mongoose.connect('mongodb://localhost:27017/tvn',{
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('it connected to the database in mongodb'))
  .catch(err => console.error('the connection faled!', err));

/*
what goes inside user and capsule documents
 */
const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});
const User = mongoose.model('User', UserSchema);

const CapsuleSchema = new mongoose.Schema({
  title: String,
  yearBuried: String,
  contentDescription: String,
  category: String,
  condition: String,
  userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});
const Capsule = mongoose.model('Capsule', CapsuleSchema);

/* 
serves the home.html file when users visit the root url
  */
app.get('/', (_req, res) => {res.sendFile(path.join(__dirname, 'home.html'));});

/* 
handles requests to explore the collection of time capsules stored in the database. 
it retrieves all capsules from the database using the asynchronous function Capsule.find() and passes them to the explore.ejs template for rendering. 
embedded javaScript is chosen as the templating engine for its dynamic html generation capabilities. 
if an error occurs during database retrieval, it's caught using a try catch block.
*/
app.get('/explore.ejs', async (_req, res) =>{
  try{
    const capsules = await Capsule.find();
    res.render(path.join(__dirname, 'explore.ejs'), { capsules });
  } catch (error){
    console.error('error retrieving capsules:', error);
    res.status(500).send('internal Server Error');
  }
});

/* 
serves the create.html file, allowing users to create new capsules.
 */
app.get('/create.html', (_req, res) => {res.sendFile(path.join(__dirname, 'create.html'));});

/* 
registers new users by creating a new user object with provided data and saving it to the database. 
if an error occurs during registration, it sends an error response.
*/
app.post('/register', async (req, res) =>{
  try{
    const { username, email, password } = req.body;
    const newUser = new User({ username, email, password });
    await newUser.save();
    res.status(201).send('user registered successfully');
  }catch (error){
    res.status(500).send(error.message);
  }
});

/* 
verifies user credentials by checking if the provided email and password match a user in the database. 
if login is successful, it sends a success response.
*/
app.post('/login', async (req, res) =>{
  try{
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.password !== password){
    return res.status(401).send('invalid email or password');
    }
    res.status(200).send('user logged in successfully');
  }catch (error){
    res.status(500).send(error.message);
  }
});

/* 
allows users to create new capsules by saving the provided data to the database. 
if capsule creation is successful, it sends a success response.
*/
app.post('/create-capsule', async (req, res) =>{
  try{
    const { title, yearBuried, contentDescription, category, condition, userId } = req.body;
    const newCapsule = new Capsule({ title, yearBuried, contentDescription, category, condition, userId });
    await newCapsule.save();
    res.status(201).send('capsule created successfully');
  } catch (error){
    res.status(500).send(error.message);
  }
});

/* 
starts the server and listens for incoming requests on the specified port. 
*/
app.listen(PORT, () => {console.log(`server is running on port ${PORT}`);});