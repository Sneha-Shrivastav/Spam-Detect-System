import express from 'express';
import { register, login, getProfile, updateProfile} from '../controller/user';
import { getContacts, addContact, updateContact, deleteContact } from '../controller/contact';
import { reportSpam } from '../controller/spam';
import { searchByName, searchByPhoneNumber } from '../controller/search';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);


router.get('/contacts', authenticate, getContacts);
router.post('/contacts', authenticate, addContact);
router.put('/contacts/:id', authenticate, updateContact);
router.delete('/contacts/:id', authenticate, deleteContact);


router.post('/spam', authenticate, reportSpam);


router.get('/search/name', authenticate, searchByName);
router.get('/search/phone', authenticate, searchByPhoneNumber);

export default router;
