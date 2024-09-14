import { Request, Response } from 'express';
import Spam from '../models/spam';

export const reportSpam = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, reason } = req.body;
    const reportedByUserId = req.userId;

    if (!phoneNumber || !reason) {
      return res.status(400).json({status: false, message: 'Phone number and reason are required',});
    }

    // Check if the user has already reported this phone number
    const existingSpam = await Spam.findOne({
      where: {
        reportedByUserId,
        phoneNumber,
      },
    });

    if (existingSpam) {
      return res.status(409).json({status: false, message: 'You have already reported this phone number as spam',});
    }

    // Create new spam report
    const newSpam = await Spam.create({
      reportedByUserId,
      phoneNumber,
      reason,
    });

    return res.status(201).json({status: true, message: 'Spam reported successfully', result: newSpam,
    });
  } catch (error: any) {
    console.error('Error reporting spam:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ status: false, message: error.message });
    }
    return res.status(500).json({ status: false, message: 'An error occurred while reporting the spam.' });
  }
};
