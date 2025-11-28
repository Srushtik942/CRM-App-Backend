const express = require('express');
const {initializeDatabase} = require('./db/db.connect');
initializeDatabase();
const app = express();
const cors = require("cors");
const NewAgents = require('./models/salesAgent.model');
const NewLead = require('./models/lead.model');
const Comments = require('./models/comment.model');
const salesAgentModel = require('./models/salesAgent.model');
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
        const NewLeads = new NewLead(newLead);
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

    const leads = await NewLead.find(filter).populate("salesAgent", "name , email");

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


// get leads by id

app.get("/leads/:newId",async(req,res)=>{
  try{
    const {newId} = req.params;
    const response = await NewLead.findById(newId).populate("salesAgent", "name email");;
    console.log(response);

    // const salesAgnetId = response.data

    if(!response){
      res.status(404).json({error:`No Lead found with this ${id}`});
    }

    res.status(201).json({message:"Lead fetched successfully!",response});

  }catch(error){
    res.status(500).json({message:"Internal Server Error",error:error.message});
  }
})


// edit leads data

app.put("/leads/:id",async(req,res)=>{
  try{

    const { id } = req.params;
    const data = req.body;
    console.log(data);


    const findId = await NewLead.findByIdAndUpdate(id,data,{ new: true } );
    console.log(findId);

    if(!findId){
      res.status(404).json({message:`Lead with this ${id} not found!`});
    }

    res.status(200).json({message:"Data updated successfully!",findId});

  }catch(error){
    res.status(500).json({message:"Internal Server Error",error:error.message});
  }
})

//  Delete a Lead

app.delete("/leads/:id",async(req,res)=>{
  try{
    const {id} = req.params;
    const findId = await NewLead.findByIdAndDelete({_id:id});
    console.log(findId);

    if(!findId){
      res.status(404).json(`Lead with this ${id} id not found!`);
    }

    if(findId){
      res.status(200).json({message:"Lead deleted successfully!",findId});
    }

  }catch(error){
    res.status(500).json({message:"Internal Server Error",error:error.message});
  }
})

// Sales Agents API

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
        const {name, email} = req.body;
        const strictEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;

        // name validation
        if(typeof name !== "string" ){
          res.status(400).json({message:"Name should be in a string"});
        }

        // email validation
        if (!strictEmailRegex.test(email)) {
               console.log("Invalid email");
        }

        if(!name || !email){
            res.status(400).json({message:"Invalid input: Name is required.",error:error.message});
        }

        // finding duplicate email
        const duplicateEmail = await NewAgents.findOne({email});
        console.log(duplicateEmail);

        if(duplicateEmail){
          res.status(409).json({message:`Sales agent with email ${email} already exists.`})
        }

        // save after validations

        const newAgent = await addAgents({name,email});
        console.log(newAgent);

       res.status(200).json({message:"Successfully added the new sales agent.",newAgent});

    }
    catch(error){
        res.status(500).json({message:"Failed to add new sales agent", error:error.message});
    }
})

//  Get All Sales Agents

app.get("/agents",async(req,res)=>{
  try{
    const allAgents = await NewAgents.find();
    console.log(allAgents);

    res.status(200).json({message:"All Agents fetched successfully!", allAgents});

  }catch(error){
    res.status(500).json({message:"Internal Server Error",error:error.message});
  }
})

// 3. Comments API

// Add a Comment to a Lead
app.post("/leads/:id/comments", async (req, res) => {
  try {
    const { id } = req.params;
    const { commentText } = req.body;

    // Validate input
    if (!commentText || typeof commentText !== "string") {
      return res.status(400).json({ error: "commentText is required and must be a string" });
    }

    //Find Lead and get assignedAgent
    const lead = await NewLead.findById(id).populate("salesAgent");
    if (!lead) {
      return res.status(404).json({ error: `Lead with ID ${id} not found.` });
    }

    const authorId = lead.salesAgent._id;

    const comment = await Comments.create({
      lead: id,
      author: authorId,
      commentText
    });

    const populated = await comment.populate("author", "name");

    res.status(201).json({
      id: comment._id,
      commentText: comment.commentText,
      author: populated.author.name,
      createdAt: comment.createdAt
    });

  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});


// . Get All Comments for a Lead

app.get("/leads/:id/comments",async(req,res)=>{
  try{
    const {id} = req.params;
    const findId = await Comments.find({lead: id});

    console.log(findId);

    if(findId){
      const resultData = await Comments.find({lead:id}).populate('author',"name");
      console.log(resultData);



    if(resultData.length === 0){
      res.status(404).json({error:"Comments are not found!"});
    }

    res.status(200).json({message:"Comments fetched successfully!",resultData});
    }

  }catch(error){
    res.status(500).json({message:"Internal Server Error!",error:error.message});
  }
})

// . Get Leads Closed Last Week

app.get("/report/last-week",async(req,res)=>{
  try{
    const now = new Date();
    const lastweek = new Date();
    lastweek.setDate(now.getDate()- 7);

    const closedLeads = await NewLead.find({
      status:"Closed",
      updatedAt: {$gte: lastweek, $lte: now}
    }).select("name salesAgent updatedAt status");

    res.status(200).json(closedLeads);

  }catch(error){
    res.status(500).json({message:"Internal Server Error",error:error.message});
  }
})


// total leads in pipeline

app.get("/report/pipeline",async(req,res)=>{
  try{
    const totalLeads = await NewLead.find({ status: { $ne: "Closed" } });
    console.log(totalLeads);

    if(totalLeads.length === 0){
      res.status(404).json({error:"Leads not found!"});
    }

     res.status(200).json({totalLeadsInPipeline: totalLeads.length});


  }catch(error){
    res.status(500).json({message:"Internal Server Error!",error:error.message});
  }
})

// total closed leads
app.get("/report/pipeline/closed",async(req,res)=>{
  try{
    const closedResponse = await NewLead.find({status: {$eq: "Closed"}});
    console.log(closedResponse);

    if(closedResponse.length === 0){
      res.status(404).json({error:"closed leads not found!"});
    }

    res.status(200).json({closedResponse: closedResponse.length})

  }catch(error){
    res.status(500).json({message:"Internal Server Error!",error: error.message});
  }
})


// leads by status

app.get("/report/closed-by-agent", async (req, res) => {
  try {
    const leads = await NewLead.find({ status: "Closed" })
      .populate("salesAgent", "name");

    const agentMap = {};

    leads.forEach(lead => {
      if (!lead.salesAgent) return;

      const agentName = lead.salesAgent.name;

      if (!agentMap[agentName]) {
        agentMap[agentName] = 0;
      }

      agentMap[agentName] += 1;
    });

    res.status(200).json({ closedByAgent: agentMap });

  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message
    });
  }
});



const PORT = 3000;
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})