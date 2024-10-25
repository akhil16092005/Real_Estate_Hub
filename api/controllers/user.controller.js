import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";
export const getUsers=async(req,res)=>{
    console.log("it works");
    try{
        const users=await prisma.user.findMany();
        res.status(200).json(users);
    }
    catch(error){
        console.log(error);
        res.status(500).json({message: "Failed to get users"})
    }
}

export const getUser=async(req,res)=>{
    const id=req.params.id;
    try{
        const user=await prisma.user.findUnique({
            where:{id}
        })
        res.status(200).json(user);
    }
    catch(error){
        console.log(error);
        res.status(500).json({message: "Failed to get users"})
    }
}

export const updateUser=async(req,res)=>{
    const id=req.params.id;
    const tokenUserId=req.userId;
    const {password,avatar,...inputs}=req.body;

    if(id!==tokenUserId){
        return res.status(403).json({message:"Not authorized to update this user"})
    }
    let updatedPassword=null;
    try{
        if(password){
            updatedPassword=await bcrypt.hash(password,10);
        }
        const updateUser=await prisma.user.update({
            where:{id},
            data:{
                ...inputs,
                ...(updatedPassword&&{password:updatedPassword}),
                ...(avatar&&{avatar}),
            }
        })
        const {password:userPassoword,...rest}=updateUser;
        res.status(200).json(rest);
    }
    catch(error){
        console.log(error);
        res.status(500).json({message: "Failed to get users"})
    }
}

export const deleteUser=async(req,res)=>{
    const id=req.params.id;
    const tokenUserId=req.userId;

    if(id!==tokenUserId){
        return res.status(403).json({message:"Not authorized to update this user"})
    }

    try{
        await prisma.user.delete({
            where:{id},
        })
        res.status(200).json({message: "User deleted successfully"})
    }
    catch(error){
        console.log(error);
        res.status(500).json({message: "Failed to get users"})
    }
}
export const savePost=async(req,res)=>{
    const postId=req.body.postId;
    const tokenUserId=req.userId;
    try{
        const savedPost=await prisma.savedPost.findUnique({
            where:{
                userId_postId:{
                    userId:tokenUserId,
                    postId
                }
            }
        })

        if(savedPost){
            await prisma.savedPost.delete({
                where:{
                    id:savedPost.id,
                }
            })
            res.status(200).json({message: "Post removed from saved List"})
        }
        else{
            await prisma.savedPost.create({
                data:{
                    userId:tokenUserId,
                    postId,
                }
            })
            res.status(200).json({message: "Post saved"})
        }
       
    }
    catch(error){
        console.log(error);
        res.status(500).json({message: "Failed to get users"})
    }
}
