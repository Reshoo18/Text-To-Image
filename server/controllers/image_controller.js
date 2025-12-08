
// import userModel from "../models/userModel.js"
// import FormData from "form-data"

// export const generateImage= async (req,res)=>{
//     try{
//       const {userId,prompt}=req.body
//        const user=await userModel.findById(userId)

//        if(!user || !prompt){
//         return res.json({success:false,message:'Missing Details'})
//        }
//       if(user.creditBalance===0||userModel.creditBalance<0){
//         return res.json({success:false,message:'No Credit Balance',creditBalance:user.creditBalance})
//       }
       
//       const formData= new FormData()
//       formData.append('prompt',prompt)
//       const {data}=await axios.post('https://clipdrop-api.co/text-to-image/v1',formData,{
//         headers:{
//             'x-api-key':process.env.CLIPDROP_API
//         },
//         responseType:'arraybuffer'
//       })
//       const base64Image=Buffer.from(data,'binary').toString('base64')
//       const resultImage=`data:image/png;base64.${base64Image}`

//        await userModel.findByIdAndUpdate(user._id ,{creditBalance: user.creditBalance - 1})
//        res.json({success:true,message:"Image Generated",creditBalance:user.creditBalance - 1})
//     }catch(error){
//      console.log(error.message)
//      req.json({success:false,message:error.message})
//     }
// }
import axios from "axios";
import FormData from "form-data";
import userModel from "../models/userModel.js";

export const generateImage = async (req, res) => {
  try {
    // prefer req.user.id (set by auth middleware); fallback to req.body.userId
    const userId = req.user?.id || req.body?.userId;
    const { prompt } = req.body;

    if (!userId || !prompt) {
      return res.status(400).json({ success: false, message: "Missing details (userId or prompt)" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // If user has no credits
    if (user.creditBalance <= 0) {
      return res.status(402).json({ success: false, message: "No credit balance", creditBalance: user.creditBalance });
    }

    // Prepare form-data
    const formData = new FormData();
    formData.append("prompt", prompt);

    // include form-data headers + API key
    const headers = {
      ...formData.getHeaders(),
      "x-api-key": process.env.CLIPDROP_API
    };

    const response = await axios.post("https://clipdrop-api.co/text-to-image/v1", formData, {
      headers,
      responseType: "arraybuffer"
    });

    const base64Image = Buffer.from(response.data, "binary").toString("base64");
    const resultImage = `data:image/png;base64,${base64Image}`;

    // decrement credits and save
    user.creditBalance = user.creditBalance - 1;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Image generated",
      creditBalance: user.creditBalance,
      image: resultImage,
    });
  } catch (error) {
    console.error("generateImage error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
