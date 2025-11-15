const express = require('express');
const {initializeDatabase} = require('./db/db.connect');
initializeDatabase();
const app = express();
const cors = require("cors");
const NewAgents = require('./models/salesAgent.model');
const NewLead = require('./models/lead.model')
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());
require("dotenv").config();


//  Create a New Lead

async function addLeads(newLead) {
    try{
        const NewLeads = NewLead(newLead);
        const saveLeads = await NewLeads.save();
        console.log(saveLeads);

        return saveLeads;

    }catch(error){
        throw error;
    }
}

app.post("/leads",async(req,res)=>{
    try{

        const { name, source, salesAgent, status, tags, timeToClose, priority } = req.body;

        if (!name){
            return res.status(400).json({error: "Invalid input:Name is required."});
        }

    let salesAgentData = null;

    if (salesAgent) {

      salesAgentData = await NewAgents.findById(salesAgent);

      if (!salesAgentData) {
        return res.status(404).json({
          error: `Sales agent with ID '${salesAgent}' not found.`,
        });
      }
    }

    const savedLead = await addLeads(req.body);

    res.status(201).json({message:"Leads created successully!", savedLead})

    }catch(error){
        res.status(500).json({message:"Internal server Error",error:error.message});
    }
})



// create a new agent

async function addAgents(newAgent) {
    try{
        const agents = NewAgents(newAgent);
        const saveAgent = await agents.save();
        console.log(saveAgent);
        return saveAgent;

    }catch(error){
        throw error;
    }

}

app.post("/agents",async(req,res)=>{
    try{
        const addNewAgent = await addAgents(req.body);

        if(!req.body){
            res.status(400).json({message:"Invalid input: Name is required.",error:error.message});
        }

       res.status(200).json({message:"Successfully added the new sales agent.",addNewAgent});


    }
    catch(error){
        res.status(500).json({message:"Failed to add new sales agent", error:error.message});
    }
})



//  Get All Leads

app.get("/leads", async (req, res) => {
  try {
    const { salesAgent, status, tags, source } = req.query;

    // Build dynamic filter object
    let filter = {};

    // Validate & Add Filters

    // Validate salesAgent
    if (salesAgent) {
      // Check if is valid Mongo ID
      if (!salesAgent.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          error: "Invalid salesAgent ID format.",
        });
      }
      filter.salesAgent = salesAgent;
    }

    // Validate status
    const validStatus = ["New", "Contacted", "Qualified", "Proposal Sent", "Closed"];
    if (status) {
      if (!validStatus.includes(status)) {
        return res.status(400).json({
          error: "Invalid status value.",
        });
      }
      filter.status = status;
    }

    // Validate source
    const validSources = ["Referral", "Website", "Cold Call", "Social Media"];
    if (source) {
      if (!validSources.includes(source)) {
        return res.status(400).json({
          error: "Invalid source value.",
        });
      }
      filter.source = source;
    }

    // Filter by tags
    if (tags) {
      const tagArray =
        typeof tags === "string" ? tags.split(",") : tags;

      filter.tags = { $in: tagArray };
    }

    // Fetch Leads with Filter

    const leads = await NewLead.find(filter).populate("salesAgent", "name email");

    res.status(200).json({
      message: "Successfully fetched leads",
      count: leads.length,
      leads,
    });

  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});




const PORT = 3000;
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})