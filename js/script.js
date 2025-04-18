// Variablen für die Sortierung und Filterung
let sortColumn = "name";
let sortDirection = "asc";
let filterValue = "all";
let searchText = "";
let data = []; // Leeres Array für die Daten

// Warte, bis die Seite geladen ist
document.addEventListener('DOMContentLoaded', function() {
    // Daten aus der JSON-Datei laden
    loadEmissionsData();
    
    // Prüfen, ob RTL-Darstellung verwendet werden soll
    checkRTL();
    
    // Navigation-Tabs einrichten
    setupNavigation();
    
    // Lokale Navigation einrichten
    setupLocalNavigation();
    
    // Suche einrichten
    setupSearch();
    
    // Sortierungen einrichten
    setupSorting();
});

// Funktion zum Laden der CO2-Emissionsdaten aus der JSON-Datei
function loadEmissionsData() {
    fetch('data/data.json')
        .then(response => {
            if (!response.ok) {               
                
                // Bei Fehler eine Nachricht in der Tabelle anzeigen
                const tbody = document.querySelector("#data-table tbody");
                tbody.innerHTML = '<tr><td colspan="4" class="text-center">Netzwerkantwort war nicht ok.<br>Error: '+response.statusText+'.</td></tr>';
                throw new Error('Netzwerkantwort war nicht ok: ' + response.statusText);
            }
            return response.json();
        })
        .then(jsonData => {
            data = jsonData; // Daten im globalen Array speichern
            updateTable(); // Tabelle mit den geladenen Daten aktualisieren
        })
        .catch(error => {
            // Bei Fehler eine Nachricht in der Tabelle anzeigen
            const tbody = document.querySelector("#data-table tbody");
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">Fehler beim Laden der Daten.<br>Error: '+error+'.</td></tr>';
        });
}

// Tabelle mit gefilterten und sortierten Daten aktualisieren
function updateTable() {
    // Tabellenkörper auswählen
    const tbody = document.querySelector("#data-table tbody");
    tbody.innerHTML = "";
    
    // Wenn keine Daten vorhanden sind, Ladehinweis anzeigen
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">Daten werden geladen...</td></tr>';
        return;
    }
    
    // Daten filtern
    let filteredData = data.filter(function(item) {
        // Nach Typ filtern
        if (filterValue !== "all" && item.type !== filterValue) {
            return false;
        }
        
        // Nach Text suchen
        if (searchText !== "") {
            return item.name.toLowerCase().includes(searchText.toLowerCase());
        }
        
        return true;
    });
    
    // Daten sortieren
    filteredData.sort(function(a, b) {
        // Werte für die Sortierung
        let valueA = a[sortColumn];
        let valueB = b[sortColumn];
        
        // Textwerte in Kleinbuchstaben umwandeln für besseren Vergleich
        if (typeof valueA === "string") {
            valueA = valueA.toLowerCase();
            valueB = valueB.toLowerCase();
        }
        
        // Aufsteigend oder absteigend sortieren
        if (sortDirection === "asc") {
            return valueA > valueB ? 1 : -1;
        } else {
            return valueA < valueB ? 1 : -1;
        }
    });
    
    // Wenn keine Daten gefunden wurden
    if (filteredData.length === 0) {
        const row = document.createElement("tr");
        row.innerHTML = '<td colspan="4" class="text-center">Keine Daten gefunden</td>';
        tbody.appendChild(row);
        return;
    }
    
    // Daten in Tabelle einfügen
    filteredData.forEach(function(item) {
        const row = document.createElement("tr");
        
        // Sicher vor XSS-Angriffen (Escape HTML)
        row.innerHTML = `
            <td>${safeText(item.name)}</td>
            <td>${safeText(item.type)}</td>
            <td>${item.emissions}</td>
            <td>${item.year}</td>
        `;
        
        tbody.appendChild(row);
    });
}

// Navigation-Tabs einrichten
function setupNavigation() {
    // Tab-Links auswählen
    const navEmissions = document.getElementById("nav-emissions");
    const navAbout = document.getElementById("nav-about");
    const navContact = document.getElementById("nav-contact");
    
    // Tab-Inhalte auswählen
    const contentEmissions = document.getElementById("content-emissions");
    const contentAbout = document.getElementById("content-about");
    const contentContact = document.getElementById("content-contact");
    
    // Event-Listener für Tab-Wechsel
    navEmissions.addEventListener("click", function(e) {
        e.preventDefault();
        
        // Aktiven Status setzen
        navEmissions.classList.add("active");
        navAbout.classList.remove("active");
        navContact.classList.remove("active");
        
        // Inhalt anzeigen
        contentEmissions.classList.add("active");
        contentEmissions.classList.remove("d-none");
        contentAbout.classList.remove("active");
        contentAbout.classList.add("d-none");
        contentContact.classList.remove("active");
        contentContact.classList.add("d-none");
    });
    
    navAbout.addEventListener("click", function(e) {
        e.preventDefault();
        
        // Aktiven Status setzen
        navEmissions.classList.remove("active");
        navAbout.classList.add("active");
        navContact.classList.remove("active");
        
        // Inhalt anzeigen
        contentEmissions.classList.remove("active");
        contentEmissions.classList.add("d-none");
        contentAbout.classList.add("active");
        contentAbout.classList.remove("d-none");
        contentContact.classList.remove("active");
        contentContact.classList.add("d-none");
    });
    
    navContact.addEventListener("click", function(e) {
        e.preventDefault();
        
        // Aktiven Status setzen
        navEmissions.classList.remove("active");
        navAbout.classList.remove("active");
        navContact.classList.add("active");
        
        // Inhalt anzeigen
        contentEmissions.classList.remove("active");
        contentEmissions.classList.add("d-none");
        contentAbout.classList.remove("active");
        contentAbout.classList.add("d-none");
        contentContact.classList.add("active");
        contentContact.classList.remove("d-none");
    });
}

// Lokale Navigation einrichten
function setupLocalNavigation() {
    // Links in der Seitenleiste auswählen
    const navAll = document.getElementById("nav-all");
    const navCountries = document.getElementById("nav-countries");
    const navCompanies = document.getElementById("nav-companies");
    
    // Event-Listener für "Alle Emittenten"
    navAll.addEventListener("click", function(e) {
        e.preventDefault();
        
        // Filter aktualisieren
        filterValue = "all";
        
        // Aktiven Status setzen
        navAll.classList.add("active");
        navCountries.classList.remove("active");
        navCompanies.classList.remove("active");
        
        // Tabelle aktualisieren
        updateTable();
    });
    
    // Event-Listener für "Nur Länder"
    navCountries.addEventListener("click", function(e) {
        e.preventDefault();
        
        // Filter aktualisieren
        filterValue = "Land";
        
        // Aktiven Status setzen
        navAll.classList.remove("active");
        navCountries.classList.add("active");
        navCompanies.classList.remove("active");
        
        // Tabelle aktualisieren
        updateTable();
    });
    
    // Event-Listener für "Nur Unternehmen"
    navCompanies.addEventListener("click", function(e) {
        e.preventDefault();
        
        // Filter aktualisieren
        filterValue = "Unternehmen";
        
        // Aktiven Status setzen
        navAll.classList.remove("active");
        navCountries.classList.remove("active");
        navCompanies.classList.add("active");
        
        // Tabelle aktualisieren
        updateTable();
    });
}

// Suche einrichten
function setupSearch() {
    const searchInput = document.getElementById("search");
    
    // Event-Listener für Suche
    searchInput.addEventListener("input", function() {
        // Eingabe bereinigen und gegen XSS absichern
        searchText = sanitizeInput(this.value.trim());
        updateTable();
    });
}

// Funktion zum Bereinigen von Eingaben (gegen XSS)
function sanitizeInput(input) {
    // HTML-Tags entfernen und Sonderzeichen escapen
    return input.replace(/</g, "&lt;").replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// Sortierung einrichten
function setupSorting() {
    // Spaltenköpfe auswählen
    const sortName = document.getElementById("sort-name");
    const sortType = document.getElementById("sort-type");
    const sortEmissions = document.getElementById("sort-emissions");
    const sortYear = document.getElementById("sort-year");
    
    // Event-Listener für Spalten
    sortName.addEventListener("click", function() {
        updateSort("name");
    });
    
    sortType.addEventListener("click", function() {
        updateSort("type");
    });
    
    sortEmissions.addEventListener("click", function() {
        updateSort("emissions");
    });
    
    sortYear.addEventListener("click", function() {
        updateSort("year");
    });
}

// Sortierung aktualisieren
function updateSort(column) {
    // Richtung umkehren, wenn gleiche Spalte
    if (sortColumn === column) {
        sortDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
        sortColumn = column;
        sortDirection = "asc";
    }
    
    // Tabelle aktualisieren
    updateTable();
}

// Schriftrichtung prüfen (RTL/LTR)
function checkRTL() {
    const urlParams = new URLSearchParams(window.location.search);
    const rtl = urlParams.get('rtl');
    
    if (rtl === "true") {
        document.documentElement.setAttribute("dir", "rtl");
    }
}

// HTML sicher machen (gegen XSS-Angriffe)
function safeText(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}