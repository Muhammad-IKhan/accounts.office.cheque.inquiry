// xmlHandling.js

import { xmlData } from './domElements.js';
import { parseXMLToTable } from './tableFunctions.js';

/**
 * Fetches XML data from server and processes it
 * @returns {Promise<boolean>} - Success status of fetch operation
 */
export async function fetchXMLData() {
    console.log('Starting XML data fetch process...');
    try {
        const filesResponse = await fetch('/accounts.office.cheque.inquiry/public/data/files.json');
        
        if (!filesResponse.ok) {
            throw new Error(`HTTP error during files fetch: ${filesResponse.status}`);
        }
        
        const xmlFiles = await filesResponse.json();
        console.log(`Found ${xmlFiles.length} XML files to process`);
        
        let combinedXMLData = '<root>';
        
        for (const file of xmlFiles) {
            console.log(`Fetching file: ${file}`);
            const fileUrl = `/accounts.office.cheque.inquiry/public/data/${file}`;
            const fileResponse = await fetch(fileUrl);
            
            if (!fileResponse.ok) {
                throw new Error(`Failed to fetch file ${file}: ${fileResponse.status}`);
            }
            
            const data = await fileResponse.text();
            combinedXMLData += data;
            console.log(`Successfully appended data from ${file}`);
        }
        
        combinedXMLData += '</root>';
        
        localStorage.setItem('xmlData', combinedXMLData);
        xmlData = combinedXMLData;
        
        console.log('XML data fetch and combination complete');
        return parseXMLToTable(combinedXMLData);
    } catch (error) {
        console.error('Error in XML data fetch:', error);
        
        const storedXML = localStorage.getItem('xmlData');
        if (storedXML) {
            console.log('Falling back to stored XML data from localStorage');
            return parseXMLToTable(storedXML);
        }
        
        showError('Failed to load XML data. Please check your connection.');
        return false;
    }
}
