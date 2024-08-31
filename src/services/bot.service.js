// src/services/bot.service.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Fuse from 'fuse.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const botService = {
    /**
     * Find role and permissions based on the role name or permission description
     * @param {string} query - The role name or permission description to search for
     * @returns {Promise<Object|null>} - The role and permissions found, or null if not found
     * @throws {Error} - If there is an error reading the file
     */
    findRole: async (query) => {
        if (!query) {
            return { error: 'Query parameter is required' };
        }

        try {
            // Read the JSON file
            const filePath = path.resolve(__dirname, '../../permission.example.json');
            const data = await fs.readFile(filePath, 'utf8');
            const permissions = JSON.parse(data);

            // Prepare data for Fuse.js
            const roles = permissions.roles.map(role => ({
                role_name: role.role_name,
                permissions: role.permissions,
                combined: `${role.role_name} ${role.permissions.map(p => `${p.permission} ${p.description}`).join(' ')}`
            }));

            // Initialize Fuse.js
            const fuse = new Fuse(roles, {
                keys: [
                    'role_name',
                    'permissions.permission',
                    'permissions.description'
                ],
                threshold: 0.3,
                distance: 100,
                minMatchCharLength: 2,
                // isCaseSensitive: false,
                // includeScore: false,
                // shouldSort: true,
                // includeMatches: false,
                // findAllMatches: false,
                // location: 0,
                // threshold: 0.6,
                // useExtendedSearch: false,
                // ignoreLocation: false,
                // ignoreFieldNorm: false,
                // fieldNormWeight: 1,
            });

            // Perform the search
            const result = fuse.search(query);

            // Debugging output
            console.log('Search query:', query);
            console.log('Search result:', result);

            if (result.length > 0) {
                const bestMatch = result[0].item;
                return { role: bestMatch.role_name, permissions: bestMatch.permissions };
            }

            // If role or permission not found, return null
            return null;
        } catch (error) {
            console.error('Error reading permissions file:', error);
            return { error: 'Internal server error' };
        }
    },
};

export default botService;