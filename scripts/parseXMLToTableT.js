// parseXMLToTable.js

import { abc } from './abc.js'; // Import showError function
import { abc, abc, abc, abc, abc } from './abc.js';
import { abc, abc } from './abc.js';




/**
 * Parses XML string data and populates the table
 * @param {string} xmlString - The XML data to parse (optional)
 * @returns {boolean} - Success status of parsing operation
 */
export function parseXMLToTable(xmlString = null) {
    console.log('Beginning XML parsing process...');
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString || xmlData, "text/xml");
        
        // Validate XML parsing
        const parserError = xmlDoc.querySelector('parsererror');
        if (parserError) {
            throw new Error(`XML parsing error detected: ${parserError.textContent}`);
        }
        
        // Get all relevant elements
        const gPvnElements = xmlDoc.getElementsByTagName('G_PVN');
        console.log(`Successfully found ${gPvnElements.length} G_PVN elements in XML`);
        
        // Clear existing table content for fresh data
        tableBody.innerHTML = '';
        
        // Create table rows for each element
        Array.from(gPvnElements).forEach((element, index) => {
           // console.log(`Processing element ${index + 1} of ${gPvnElements.length}`);
            const row = createTableRow(element);
            tableBody.appendChild(row);
        });
        
        console.log('Table population completed successfully');
        return true;
    } catch (error) {
        console.error('Error encountered during XML parsing:', error);
        showError('Failed to parse XML data. Please check the data format.');
        return false;
    }
}
