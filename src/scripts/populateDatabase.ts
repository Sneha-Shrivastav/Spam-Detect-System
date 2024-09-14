import { Sequelize } from 'sequelize';
import faker from 'faker';
import bcrypt from 'bcrypt';
import User from '../models/user';
import Contact from '../models/contact';
import Spam from '../models/spam';


const sequelize = new Sequelize('Spamdb', 'postgres', 'sneha123', {
  host: 'localhost',
  dialect: 'postgres',
});

const populateDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    await sequelize.sync({ force: true });
    console.log('Database synced.');

    // Populate Users
    const hashedPassword = await bcrypt.hash(faker.internet.password(), 10);
    for (let i = 0; i < 10; i++) {
      await User.create({
        fname: faker.name.firstName(),
        lname: faker.name.lastName(),
        phoneNumber: faker.phone.phoneNumber(),
        email: faker.internet.email(),
        password: hashedPassword,
      });
    }
    console.log('Users populated.');

    // Populate Contacts
    const users = await User.findAll();
    for (const user of users) {
      for (let i = 0; i < 5; i++) {
        await Contact.create({
          userId: user.id,
          name: faker.name.findName(),
          phoneNumber: faker.phone.phoneNumber(),
        });
      }
    }
    console.log('Contacts populated.');

    // Populate Spam Reports
    const phones = ['1234567890', '0987654321', '1122334455'];
    const spamData = [
      { phoneNumber: '1234567890', reason: 'Sample reason 1' },
      { phoneNumber: '0987654321', reason: 'Sample reason 2' },
      { phoneNumber: '1122334455', reason: 'Sample reason 3' }
    ];

    for (const data of spamData) {
      const reportedByUserId = users[Math.floor(Math.random() * users.length)].id;

      const existingSpam = await Spam.findOne({
        where: {
          reportedByUserId,
          phoneNumber: data.phoneNumber,
        },
      });

      if (!existingSpam) {
        await Spam.create({
          reportedByUserId,
          phoneNumber: data.phoneNumber,
          reason: data.reason,
        });
      }
    }

    console.log('Spam reports populated.');
  } catch (error) {
    console.error('Error populating database:', error);
  } finally {
    await sequelize.close();
    console.log('Database connection closed.');
  }
};

populateDatabase();
