import imagekit from "../configs/imageKit.js"
import Chat  from "../models/Chat.js"
import User from "../models/User.js"
import openai from "../configs/openai.js"
import axios from "axios"


//text-based ai chat message controller
export const textMessageController = async (req, res) => {
    try {
        const userId = req.user._id;

        if (req.user.credits < 1) {
            return res.json({ success: false, message: "You don't have enough credits." });
        }

        const { chatId, prompt } = req.body;
        const chat = await Chat.findOne({ userId: userId.toString(), 
                            _id: chatId.toString() });

        if (!chat) {
            return res.status(404).json({ success: false, message: "Chat not found" });
        }

        // 1. Push user message to DB first to ensure it's saved
        chat.messages.push({ role: "user", content: prompt, timestamp: Date.now(), isImage: false });
        await chat.save();

        // 2. Wrap the AI call in its own try-catch for better error reporting
        try {
            const { choices } = await openai.chat.completions.create({
                model: "gemini-1.5-flash-latest", // Use 1.5-flash for stability
                messages: [{ role: "user", content: prompt }],
            });

            const reply = { ...choices[0].message, timestamp: Date.now(), isImage: false };
            chat.messages.push(reply);
            
            await chat.save();
            await User.updateOne({ _id: userId }, { $inc: { credits: -1 } });

            return res.json({ success: true, reply });

        } catch (aiError) {
            console.error("Gemini API Error:", aiError.message);
            // Handle the 429 specifically
            return res.status(aiError.status || 500).json({ 
                success: false, 
                message: aiError.status === 429 ? "Rate limit reached. Please wait a minute." : "AI Service Error" 
            });
        }

    } catch (error) {
        console.error("Controller Error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}








//Image Generation Message Controller

export const imageMessageController = async (req , res)=>{
    try {
        const userId = req.user._id ;

        if(req.user.credits<2){
            return res.json({success:false , message: "you dont have enough credits to use this feature "})
        }

        const {prompt , chatId , isPublished} = req.body

        const chat = await Chat.findOne({userId , _id: chatId})

        //push user message
        chat.messages.push({role:"user" , content: prompt , timestamp: Date.now() , isImage:false})

        // encode the prompt 
        const encodedPrompt = encodeURIComponent(prompt) 

        //Construct ImageKit AI generation URL
        const generatedImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/quickgpt/${Date.now()}.png?tr=w-800,h-800` ; 

        // Trigger generation by fetching from ImageKit
        const aiImageResponse = await axios.get(generatedImageUrl , {responseType:"arraybuffer"}) 


        // Convert to Base64
        const base64Image = `data:image/png;base64,${Buffer.from(aiImageResponse.data,"binary").toString('base64')}` ;


        //upload to imagekit media library
        const uploadResponse = await imagekit.upload({
            file: base64Image ,
            fileName: `${Date.now()}.png` ,
            folder: "QUICKGPT"
        })

        const reply = {
            role:'assistant',
             timestamp : Date.now() ,
              isImage : true ,
            isPublished ,
            content : uploadResponse.url ,
        }

        res.json({success:true , reply})

        chat.messages.push(reply)
        await chat.save()

        await User.updateOne({_id : userId } , {$inc: {credits: -2}})




    } catch (error) {
        res.json({success:false , message: error.message}) ;
    }
}


















