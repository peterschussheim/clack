import express from 'express';
// require controller files
import user from './user/userController';
import message from './message/messageController';
import reaction from './reaction/reactionController';

// note that we need to either add /api to the routes below or add an app.use('/api') line on the server file
const router = new express.Router();

router.post('/user/add', user.createUser);
// createUser function needs to run when we send currentUser from the front-end

router.post('/message/create', message.createMessage);
// createMessage function will run when a new message is created on the front-end

router.post('/reaction/add', reaction.addReactions);
// addReactions will run whenever a reaction is added to the database

router.get('/message/fetch', message.fetchMessages);
// fetchMessages will fetch all messages in the database for the users that are in the channel