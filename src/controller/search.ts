import { Request, Response } from "express";
import { Op } from "sequelize";
import User from "../models/user";
import Contact from "../models/contact";
import Spam from "../models/spam";
import sequelize from "../config/database";

export const searchByName = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    const searchingUserId = req.userId; 

    if (!q) {
      return res.status(400).json({ status: false, message: "Query is required" });
    }

    const userResults = await User.findAll({
      where: {
        [Op.or]: [
          { fname: { [Op.iLike]: `${q}%` } },
          { lname: { [Op.iLike]: `${q}%` } },
          { fname: { [Op.iLike]: `%${q}%` } },
          { lname: { [Op.iLike]: `%${q}%` } },
        ],
      },
      attributes: ["id", "fname", "lname", "phoneNumber", "email"],
      order: [
        [
          sequelize.literal(`CASE WHEN fname LIKE '${q}%' THEN 0 ELSE 1 END`),
          "ASC",
        ],
        ["fname", "ASC"],
        ["lname", "ASC"],
      ],
    });

    const contactResults = await Contact.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `${q}%` } },
          { name: { [Op.iLike]: `%${q}%` } },
        ],
      },
      attributes: ["id", "name", "phoneNumber", "userId"],
      order: [
        [
          sequelize.literal(`CASE WHEN name LIKE '${q}%' THEN 0 ELSE 1 END`),
          "ASC",
        ],
        ["name", "ASC"],
      ],
    });

    const results = [
      ...userResults.map((user) => user.toJSON()),
      ...contactResults.map((contact) => contact.toJSON()),
    ];

    const resultsWithSpamLikelihoodAndEmail = await Promise.all(
      results.map(async (result) => {
        const spamReport = await Spam.findOne({
          where: { phoneNumber: result.phoneNumber },
        });

        let emailVisible = false;
        let email: string | undefined;

        if ("email" in result) {
          const isInContactList = await Contact.findOne({
            where: {
              userId: searchingUserId,
              phoneNumber: result.phoneNumber,
            },
          });

          emailVisible = !!isInContactList;
          email = emailVisible ? result.email : undefined;
        }

        return {
          ...result,
          email, 
          spamLikelihood: spamReport ? "High" : "Low",
        };
      })
    );

    return res.status(200).json({ status: true, results: resultsWithSpamLikelihoodAndEmail });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};



export const searchByPhoneNumber = async (req: Request, res: Response) => {
  try {
    const phoneNumber = req.query.phoneNumber as string | string[] | undefined;
    const searchingUserId = req.userId; 

    if (!phoneNumber) {
      return res.status(400).json({ status: false, message: "Phone number is required" });
    }

    const phoneNumberString = Array.isArray(phoneNumber)
      ? phoneNumber[0]
      : phoneNumber;

    const users = await User.findAll({
      where: {
        phoneNumber: phoneNumberString,
      },
      attributes: ["id", "fname", "lname", "phoneNumber", "email"],
    });

    const contacts = await Contact.findAll({
      where: {
        phoneNumber: phoneNumberString,
      },
      attributes: ["name", "phoneNumber"],
    });

    const spamReport = await Spam.findOne({
      where: {
        phoneNumber: phoneNumberString,
      },
    });

    const spamLikelihood = spamReport ? "High" : "Low";

    const allResults = [
      ...users.map((user) => user.toJSON()),
      ...contacts.map((contact) => contact.toJSON()),
    ];

    if (allResults.length === 0) {
      return res.status(404).json({ status: false, message: "No results found" });
    }

    const resultsWithSpamLikelihoodAndEmail = await Promise.all(
      allResults.map(async (result) => {
        let email: string | undefined;

        if ("email" in result) {
          const isInContactList = await Contact.findOne({
            where: {
              userId: searchingUserId,
              phoneNumber: result.phoneNumber,
            },
          });

          email = isInContactList ? result.email : undefined;
        }

        return {
          ...result,
          email, 
          spamLikelihood,
        };
      })
    );

    return res.status(200).json({ status: true, results: resultsWithSpamLikelihoodAndEmail });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
