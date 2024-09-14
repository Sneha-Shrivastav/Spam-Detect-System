import { Request, Response } from "express";
import Contact from "../models/contact";

export const getContacts = async (req: Request, res: Response) => {
  try {
    const contacts = await Contact.findAll({
      where: { userId: req.userId },
      attributes: ["id", "name", "phoneNumber", "createdAt", "updatedAt"],
    });

    return res.status(200).json({ status: true, contacts });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const addContact = async (req: Request, res: Response) => {
  try {
    const { name, phoneNumber } = req.body;

    if (!name || !phoneNumber) {
      return res.status(400).json({ status: false, message: "Name and phone number are required" });
    }

    if (!req.userId) {
      return res.status(401).json({ status: false, message: "Unauthorized: User ID is missing" });
    }
    
    const contact = await Contact.create({
      userId: req.userId!,
      name,
      phoneNumber,
    });

    return res.status(201).json({ status: true, contact });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateContact = async (req: Request, res: Response) => {
  try {
    const { name, phoneNumber } = req.body;
    const contactId = req.params.id;

    const [affectedCount] = await Contact.update(
      { name, phoneNumber },
      { where: { id: contactId, userId: req.userId } }
    );

    if (affectedCount === 0) {
      return res.status(404).json({ status: false, message: "Contact not found" });
    }

    return res.status(200).json({ status: true, message: "Contact updated successfully" });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteContact = async (req: Request, res: Response) => {
  try {
    const contactId = req.params.id;

    const affectedCount = await Contact.destroy({
      where: { id: contactId, userId: req.userId },
    });

    if (affectedCount === 0) {
      return res.status(404).json({ status: false, message: "Contact not found" });
    }

    return res.status(200).json({ status: true, message: "Contact deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
