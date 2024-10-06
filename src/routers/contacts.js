import { Router } from "express";
import { ctrlWrapper } from "../utils/ctrlWrapper.js";
import { getAllContactsController,
         getContactByIdController,
         createContactController,
         patchContactController,
         deleteContactController
} from "../controllers/contacts.js";
import { validateBody } from "../middlewares/validateBody.js";
import { isValidId } from "../middlewares/isValidId.js";
import { createContactSchema, updateContactSchema } from "../validation/contacts.js";
import { authenticate } from "../middlewares/authenticate.js";
import { upload } from "../middlewares/multer.js";

export const contactRouter = Router();

contactRouter.use(authenticate);

contactRouter.get('/contacts', ctrlWrapper(getAllContactsController));
contactRouter.get('/contacts/:contactId', isValidId, ctrlWrapper(getContactByIdController));
contactRouter.post('/contacts', upload.single('photo'), validateBody(createContactSchema), ctrlWrapper(createContactController));
contactRouter.patch('/contacts/:contactId', upload.single('photo'), isValidId, validateBody(updateContactSchema), ctrlWrapper(patchContactController));
contactRouter.delete('/contacts/:contactId', isValidId, ctrlWrapper(deleteContactController));
