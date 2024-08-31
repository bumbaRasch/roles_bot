// src/controllers/bot.controller.js

import botService from "../services/bot.service.js";

const botController = {
    /**
     * Controller method to find role and permissions
     * @param {Object} req - The request object
     * @param {Object} res - The response object
     */
    findRole: async (req, res) => {
        try {
            const { query } = req.body;
            if (!query) {
                return res.status(400).json({ message: 'Query parameter is required' });
            }
            const roleData = await botService.findRole(query);
            if (roleData) {
                res.status(200).json(roleData);
            } else {
                res.status(404).json({ message: 'Role or permission not found' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
};

export default botController;