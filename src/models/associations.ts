import User from './user';
import Contact from './contact';
import Spam from './spam';

User.hasMany(Contact, { foreignKey: 'userId' });
Contact.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Spam, { foreignKey: 'reportedByUserId' });
Spam.belongsTo(User, { foreignKey: 'reportedByUserId' });

export { User, Contact, Spam };
