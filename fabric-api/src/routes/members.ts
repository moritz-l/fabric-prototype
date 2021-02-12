import express from 'express';
import controller from '../controllers/members';

const router = express.Router();

router.get('/certificate/:memberId', controller.readMemberCertificate);
router.post('/enroll/:memberId', controller.enrollAsMember);

export = router;
