import { Request, Response } from "express";
import User from "../models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const secret = process.env.JWT_SECRET as string;

const isValid = function (value: any) {
  if (typeof value == "undefined" || value === null) {
    return false;
  }
  if (typeof value == "string" && value.trim().length === 0) {
    return false;
  }
  if (typeof value == "number" && value.toString().trim().length === 0) {
    return false;
  }

  return true;
};

export const register = async (req: Request, res: Response) => {
  try {
    const { fname, lname, phoneNumber, email, password } = req.body;

    const existingPhoneUser = await User.findOne({ where: { phoneNumber } });
    if (existingPhoneUser) {
      return res.status(400).json({ message: "User with this phone number already exists" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    if (!password) {
      return res.status(400).send({ status: false, msg: "Password is required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fname,
      lname,
      email,
      phoneNumber,
      password: hashedPassword,
    });

    return res.status(201).json({ message: "User registered successfully", newUser });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    const { phoneNumber, password } = data;

    if (!isValid(password)) {
      return res
        .status(400)
        .send({ status: false, msg: "Enter Correct password" });
    }

    const user = await User.findOne({ where: { phoneNumber } });
    if (!user) {
      return res.status(400).json({ message: "Invalid phone number or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid phone or password" });
    }

    const token = jwt.sign({ userId: user.id }, secret, { expiresIn: "1h" });

    return res.status(200).json({ message: "Login successful", token });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};



export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ status: false, message: "Unauthorized" });
    }

    const user = await User.findByPk(userId, {
      attributes: ["id", "fname", "lname", "phoneNumber", "email"],
    });

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    return res.status(200).json({user});
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};



export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ status: false, message: "Unauthorized" });
    }

    const { fname, lname, phoneNumber, email, password } = req.body;

    let hashedPassword;
    if (password) {
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }

    const [affectedCount, affectedRows] = await User.update(
      { 
        fname, 
        lname, 
        phoneNumber, 
        email, 
        ...(hashedPassword && { password: hashedPassword }) 
    },
      {
        where: { id: userId },
        returning: true,
      }
    );

    if (affectedCount === 0) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const updatedUser = affectedRows[0];
    return res.status(200).json({user:updatedUser});
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
