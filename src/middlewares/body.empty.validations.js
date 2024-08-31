// src/middlewares/body.empty.validations.js

export const bodyEmptyValidations = (req, res, next) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: 'No data was transmitted.' });
    }
    next();
};