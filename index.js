import mongoose from "mongoose";
import app from "./app.js";

(async () => {
    try{
        await mongoose.connect("mongodb://localhost:27017/TVN")
        console.log("DATABASE CONNECTED!");
        const onListening = () => {
            console.log("Liestening on port 3000");
        }
        app.listen(3000, onListening)
    }catch (error){
        console.error("error: ", error);
        throw err;
    }
})()