import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { sign, signrefresh } from '../helpers/jwt.js';
import '../config/database.js';
import User from '../models/user.js';

export const getUsersAll = async() => {
    try{
        return await User.find({});
    }catch(error){
        return error;
    }
};

export const getUserById = async(id) => {
    try{
        return await User.findById({_id: id});
    }catch(error){
        return error;
    }
};

export const postUser = async(req) => {
    try{
        const { firstname, lastname, email, username, password } = req.body;

        if (await User.exists({username})) {
            return `The username ${username} is not repit`;
        }
        if (await User.exists({email})) {
            return `The email ${email} is not repit`;
        }

        const encryptedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            firstname,
            lastname,
            username,
            email: email.toLowerCase(),
            password: encryptedPassword,
        });

        const accesstoken = await sign({'_id': user._id, 'username': username});
        const refreshtoken = await signrefresh({'_id': user._id, 'username': username});

        user.accesstoken = accesstoken;
        user.refreshtoken = refreshtoken;

        return await user.save();

    }catch(error){
        return error;
    }
};

export const putUser = async(req) => {
    try{
        const { id } = req.params;
        const { firstname, lastname, email, username, password } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return `The id ${id} is not valid`;
        }
        if (await User.exists({username})) {
            return `The username ${username} is not repit`;
        }
        if (await User.exists({email})) {
            return `The email ${email} is not repit`;
        }

        const encryptedPassword = await bcrypt.hash(password, 10);

        const accesstoken = await sign({'_id': user._id, 'username': username});
        const refreshtoken = await signrefresh({'_id': user._id, 'username': username});

        const newUser = { firstname, lastname, email, username, password: encryptedPassword, accesstoken, refreshtoken, _id: id };
        const user = await User.findByIdAndUpdate(id, newUser, { new: true });

        return user;

    }catch(error){
        return error;
    }
};

export const loginUser = async (req) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });

        if (user && (await bcrypt.compare(password, user.password))) {
            const accesstoken = await sign({ '_id': user._id, 'username': username });
            const refreshtoken = await signrefresh({ '_id': user._id, 'username': username });

            user.accesstoken = accesstoken;
            user.refreshtoken = refreshtoken;

            await user.save();
            return {
                userId: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                username: user.username,
                email: user.email,
                status: user.status,
                accesstoken: user.accesstoken,
                refreshtoken: user.refreshtoken
            };
        }

        return "Invalid Credentials";

    } catch (error) {
        return error;
    }
}

export const loginRefreshUser = async (refreshtoken) => {
    try {
        const user = await User.findOne({ refreshtoken });

        if (user !== null) {
            const accesstoken = await sign({ '_id': user._id, 'username': user.username });

            user.accesstoken = accesstoken;

            await user.save();
            return { accesstoken: user.accesstoken };
        }

        return "Invalid Refresh Token";

    } catch (error) {
        return error;
    }
}

export const delUser = async(id) => {
    try{
        return await User.findByIdAndDelete({_id: id});
    }catch(error){
        return error;
    }
};