const express = require("express");
const app = express()
const port = process.env.PORT || 3001

app.use(express.json());
app.use(express.urlencoded({extended: true}));


//Routes Controllers
const auth_routes = require("./routers/v1/auth");
const driverUp_routes = require("./routers/v1/driverPicUpload");


//AUTH ROUTES
app.use("/api/v1/auth", auth_routes);

//DRIVER UPLOAD ROUTES
app.use("/api/v1/driverUp", driverUp_routes);

app.listen(port, () => {
    console.log(`Server started on port: ${port}`)
})