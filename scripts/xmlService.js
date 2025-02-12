import { store } from './store.js';

export class XMLService {
    constructor(domManager) {
        this.domManager = domManager;
    }

    async fetchXMLData() {
        try {
            const filesResponse = await fetch('/accounts.office.cheque.inquiry/public/data/files.json');
            if (!filesResponse.ok) throw new Error(`HTTP error: ${filesResponse.status}`);
            
            const xmlFiles = await filesResponse.json();
            const combinedXMLData = await this.combineXMLFiles(xmlFiles);
            
            this.storeXMLData(combinedXMLData);
            store.xmlData = combinedXMLData;
            
            return true;
        } catch (error) {
            console.error('XML fetch error:', error);
            return this.fallbackToStoredXML();
        }
    }

    async combineXMLFiles(files) {
        let combinedData = '<root>';
        
        for (const file of files) {
            const response = await fetch(`/accounts.office.cheque.inquiry/public/data/${file}`);
            if (!response.ok) throw new Error(`Failed to fetch ${file}`);
            
            const data = await response.text();
            combinedData += data.replace(/<\?xml.*?\?>/g, '');
        }
        
        return combinedData + '</root>';
    }

    storeXMLData(data) {
        try {
            localStorage.setItem('xmlData', data);
        } catch (error) {
            console.warn('localStorage storage failed:', error);
        }
    }

    fallbackToStoredXML() {
        try {
            const storedXML = localStorage.getItem('xmlData');
            if (storedXML) {
                store.xmlData = storedXML;
                return true;
            }
        } catch (error) {
            console.error('localStorage retrieval failed:', error);
        }
        return false;
    }
}
