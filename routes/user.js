
const router = require('express').Router();
const Hospital = require('../models/Hospital');
const {authenticateToken} = require('../middleware/auth');

require('dotenv').config()

router.get('/hospitals', async(req, res)=>{
    try{
        const hospital = await Hospital.find();
        return res.status(200).json(hospital);
                
    }catch(err){
        return res.status(500).json(err)
    }
})

module.exports = router;