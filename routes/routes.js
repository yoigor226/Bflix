const express = require("express");
const router = express.Router();

router.get("/users", (req, res)=>{
    res.render('index', {});
});

module.exports = router;