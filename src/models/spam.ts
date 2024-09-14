import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface SpamAttributes {
  id: number;
  reportedByUserId: number;
  phoneNumber: string;
  reason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SpamCreationAttributes extends Optional<SpamAttributes, 'id'> {}

class Spam extends Model<SpamAttributes, SpamCreationAttributes> implements SpamAttributes {
  public id!: number;
  public reportedByUserId!: number;
  public phoneNumber!: string;
  public reason?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Spam.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  reportedByUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  sequelize,
  tableName: 'spams',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['reportedByUserId', 'phoneNumber'],
      name: 'unique_user_phone_number_constraint'
    }
  ]
});

export default Spam;
