import express from 'express';
import {
    getProfile,
    redirectProfilePage,
    editDescription,
    addExperience,
    editExperience,
    addEducation,
    editEducation,
    deleteEducation,
    deleteExperience,
    deleteSkill,
    deleteCertification,
    addSkill,
    addCertification,
    editCertification
} from '../controllers/profileController.js';

const router = express.Router();

// Routes
router.get('/api/myProfile', getProfile);
router.get('/myProfile', redirectProfilePage);



router.put('/edit/editInfos', editDescription);
router.put('/edit/addExperience', addExperience);
router.put('/edit/editExperience', editExperience);
router.put('/edit/addEducation', addEducation);
router.put('/edit/editEducation', editEducation);
router.put('/edit/addSkill', addSkill);
router.put('/edit/addCertification', addCertification);
router.put('/edit/editCertification', editCertification);
router.delete('/edit/deleteEducation', deleteEducation);
router.delete('/edit/deleteExperience', deleteExperience);
router.delete('/edit/deleteSkill', deleteSkill);
router.delete('/edit/deleteCertification', deleteCertification);




export default router;
